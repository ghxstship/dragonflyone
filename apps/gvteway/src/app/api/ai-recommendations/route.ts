import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// AI-powered personalized recommendations and "Because you liked..." suggestions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'personalized', 'because_you_liked', 'trending_for_you'

    // Get user's history and preferences
    const { data: purchaseHistory } = await supabase.from('orders').select(`
      event:events(id, genre, artist_ids, venue_id, category)
    `).eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);

    const { data: preferences } = await supabase.from('user_preferences').select('*')
      .eq('user_id', user.id).single();

    const { data: following } = await supabase.from('user_follows').select('artist_id, venue_id')
      .eq('user_id', user.id);

    // Build user profile
    const userProfile = buildUserProfile(purchaseHistory || [], preferences, following || []);

    let recommendations: any[] = [];

    if (!type || type === 'personalized') {
      recommendations = await getPersonalizedRecommendations(userProfile);
    }

    if (type === 'because_you_liked') {
      const eventId = searchParams.get('event_id');
      if (eventId) {
        recommendations = await getBecauseYouLiked(eventId, userProfile);
      }
    }

    if (type === 'trending_for_you') {
      recommendations = await getTrendingForYou(userProfile);
    }

    return NextResponse.json({
      recommendations,
      user_profile: {
        top_genres: userProfile.genres.slice(0, 5),
        favorite_venues: userProfile.venues.slice(0, 3)
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}

function buildUserProfile(history: any[], preferences: any, following: any[]): any {
  const genres: Record<string, number> = {};
  const venues: Record<string, number> = {};
  const artists: Record<string, number> = {};

  history?.forEach(h => {
    if (h.event?.genre) {
      genres[h.event.genre] = (genres[h.event.genre] || 0) + 1;
    }
    if (h.event?.venue_id) {
      venues[h.event.venue_id] = (venues[h.event.venue_id] || 0) + 1;
    }
    h.event?.artist_ids?.forEach((aid: string) => {
      artists[aid] = (artists[aid] || 0) + 1;
    });
  });

  // Add followed items with weight
  following?.forEach(f => {
    if (f.artist_id) artists[f.artist_id] = (artists[f.artist_id] || 0) + 3;
    if (f.venue_id) venues[f.venue_id] = (venues[f.venue_id] || 0) + 3;
  });

  // Add explicit preferences
  preferences?.favorite_genres?.forEach((g: string) => {
    genres[g] = (genres[g] || 0) + 5;
  });

  return {
    genres: Object.entries(genres).sort((a, b) => b[1] - a[1]).map(([k]) => k),
    venues: Object.entries(venues).sort((a, b) => b[1] - a[1]).map(([k]) => k),
    artists: Object.entries(artists).sort((a, b) => b[1] - a[1]).map(([k]) => k)
  };
}

async function getPersonalizedRecommendations(profile: any) {
  const { data: events } = await supabase.from('events').select('*')
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .limit(50);

  // Score events based on user profile
  const scored = events?.map(event => {
    let score = 0;
    
    // Genre match
    const genreIndex = profile.genres.indexOf(event.genre);
    if (genreIndex !== -1) score += (10 - genreIndex) * 10;
    
    // Venue match
    if (profile.venues.includes(event.venue_id)) score += 30;
    
    // Artist match
    event.artist_ids?.forEach((aid: string) => {
      if (profile.artists.includes(aid)) score += 50;
    });

    return { ...event, recommendation_score: score, reason: getRecommendationReason(event, profile) };
  }).sort((a, b) => b.recommendation_score - a.recommendation_score);

  return scored?.slice(0, 20) || [];
}

async function getBecauseYouLiked(eventId: string, profile: any) {
  const { data: sourceEvent } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!sourceEvent) return [];

  const { data: similar } = await supabase.from('events').select('*')
    .neq('id', eventId)
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .or(`genre.eq.${sourceEvent.genre},venue_id.eq.${sourceEvent.venue_id}`)
    .limit(20);

  return similar?.map(e => ({
    ...e,
    reason: `Because you liked ${sourceEvent.name}`,
    similarity: e.genre === sourceEvent.genre ? 'Same genre' : 'Same venue'
  })) || [];
}

async function getTrendingForYou(profile: any) {
  const { data: trending } = await supabase.from('events').select('*')
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .order('ticket_sales_count', { ascending: false })
    .limit(30);

  // Filter to user's interests
  return trending?.filter(e => 
    profile.genres.includes(e.genre) || profile.venues.includes(e.venue_id)
  ).slice(0, 10).map(e => ({
    ...e,
    reason: 'Trending in your interests'
  })) || [];
}

function getRecommendationReason(event: any, profile: any): string {
  if (profile.artists.some((a: string) => event.artist_ids?.includes(a))) {
    return 'Artist you follow';
  }
  if (profile.venues.includes(event.venue_id)) {
    return 'At a venue you love';
  }
  if (profile.genres.indexOf(event.genre) < 3) {
    return `Popular in ${event.genre}`;
  }
  return 'Recommended for you';
}
