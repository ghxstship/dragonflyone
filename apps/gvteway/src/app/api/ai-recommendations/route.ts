export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR, PlatformRole.GVTEWAY_VENUE_MANAGER,
  PlatformRole.GVTEWAY_MEMBER_EXTRA, PlatformRole.GVTEWAY_MEMBER_PLUS, PlatformRole.GVTEWAY_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];



// AI-powered personalized recommendations and "Because you liked..." suggestions
export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const user = authResult.user;

    const supabase = getSupabaseClient();
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

    let recommendations: unknown[] = [];

    if (!type || type === 'personalized') {
      recommendations = await getPersonalizedRecommendations(supabase, userProfile);
    }

    if (type === 'because_you_liked') {
      const eventId = searchParams.get('event_id');
      if (eventId) {
        recommendations = await getBecauseYouLiked(supabase, eventId, userProfile);
      }
    }

    if (type === 'trending_for_you') {
      recommendations = await getTrendingForYou(supabase, userProfile);
    }

    return NextResponse.json({
      recommendations,
      user_profile: {
        top_genres: userProfile.genres.slice(0, 5),
        favorite_venues: userProfile.venues.slice(0, 3)
      }
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ recommendations: [], user_profile: { top_genres: [], favorite_venues: [] } });
    }
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}

interface UserProfile { genres: string[]; venues: string[]; artists: string[] }
interface FollowEntry { artist_id?: string; venue_id?: string }
interface UserPreferences { favorite_genres?: string[] }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildUserProfile(history: any[], preferences: UserPreferences | null, following: FollowEntry[]): UserProfile {
  const genres: Record<string, number> = {};
  const venues: Record<string, number> = {};
  const artists: Record<string, number> = {};

  history?.forEach(h => {
    const event = Array.isArray(h.event) ? h.event[0] : h.event;
    if (event?.genre) {
      genres[event.genre] = (genres[event.genre] || 0) + 1;
    }
    if (event?.venue_id) {
      venues[event.venue_id] = (venues[event.venue_id] || 0) + 1;
    }
    event?.artist_ids?.forEach((aid: string) => {
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

async function getPersonalizedRecommendations(supabase: ReturnType<typeof getSupabaseClient>, profile: UserProfile) {
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

async function getBecauseYouLiked(supabase: ReturnType<typeof getSupabaseClient>, eventId: string, profile: { genres: string[]; venues: string[]; artists: string[] }) {
  const { data: sourceEvent } = await supabase.from('events').select('*').eq('id', eventId).single();
  if (!sourceEvent) return [];

  const { data: similar } = await supabase.from('events').select('*')
    .neq('id', eventId)
    .gte('date', new Date().toISOString())
    .eq('status', 'published')
    .or(`genre.eq.${sourceEvent.genre},venue_id.eq.${sourceEvent.venue_id}`)
    .limit(20);

  // Score results based on user profile preferences
  const scored = similar?.map(e => {
    let score = 0;
    if (profile.genres.includes(e.genre)) score += 2;
    if (profile.venues.includes(e.venue_id)) score += 1;
    return { ...e, profileScore: score };
  }).sort((a, b) => b.profileScore - a.profileScore);

  return scored?.map(e => ({
    ...e,
    reason: `Because you liked ${sourceEvent.name}`,
    similarity: e.genre === sourceEvent.genre ? 'Same genre' : 'Same venue'
  })) || [];
}

async function getTrendingForYou(supabase: ReturnType<typeof getSupabaseClient>, profile: UserProfile) {
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

interface EventData { artist_ids?: string[]; venue_id?: string; genre?: string }
function getRecommendationReason(event: EventData, profile: UserProfile): string {
  if (profile.artists.some((a: string) => event.artist_ids?.includes(a))) {
    return 'Artist you follow';
  }
  if (event.venue_id && profile.venues.includes(event.venue_id)) {
    return 'At a venue you love';
  }
  if (event.genre && profile.genres.indexOf(event.genre) < 3) {
    return `Popular in ${event.genre}`;
  }
  return 'Recommended for you';
}
