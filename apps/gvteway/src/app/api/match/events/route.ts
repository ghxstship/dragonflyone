import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ events: [] });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ events: [] });
    }

    // Get user's interests
    const { data: userInterests } = await supabase
      .from('user_interests')
      .select('interest:interests(name, category)')
      .eq('user_id', user.id);

    const interestNames = userInterests?.map(ui => (ui.interest as any)?.name).filter(Boolean) || [];
    const categories = [...new Set(userInterests?.map(ui => (ui.interest as any)?.category).filter(Boolean) || [])];

    if (interestNames.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Get user's favorite genres
    const { data: userProfile } = await supabase
      .from('platform_users')
      .select('favorite_genres')
      .eq('id', user.id)
      .single();

    const favoriteGenres = userProfile?.favorite_genres || [];

    // Get upcoming events
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(name)
      `)
      .gte('date', new Date().toISOString())
      .eq('status', 'published')
      .order('date')
      .limit(20);

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }

    // Score events based on user interests
    const scoredEvents = events.map(event => {
      let score = 0;
      let matchReason = '';

      // Check genre match
      const eventGenres = event.genres || [];
      const genreMatches = eventGenres.filter((g: string) => favoriteGenres.includes(g));
      if (genreMatches.length > 0) {
        score += genreMatches.length * 20;
        matchReason = `Matches your ${genreMatches[0]} interest`;
      }

      // Check category/tag match
      const eventTags = event.tags || [];
      const tagMatches = eventTags.filter((t: string) => 
        interestNames.some(i => t.toLowerCase().includes(i.toLowerCase()))
      );
      if (tagMatches.length > 0) {
        score += tagMatches.length * 15;
        if (!matchReason) {
          matchReason = `Related to ${tagMatches[0]}`;
        }
      }

      // Check category match
      if (categories.includes(event.category)) {
        score += 10;
        if (!matchReason) {
          matchReason = `In your favorite category`;
        }
      }

      // Boost popular events
      if (event.tickets_sold > 100) {
        score += 5;
      }

      // Default reason
      if (!matchReason) {
        matchReason = 'Recommended for you';
      }

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        venue_name: (event.venue as any)?.name || 'TBA',
        image_url: event.image_url,
        match_reason: matchReason,
        match_score: Math.min(100, score),
      };
    });

    // Sort by score and return top matches
    const topEvents = scoredEvents
      .filter(e => e.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10);

    return NextResponse.json({ events: topEvents });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
