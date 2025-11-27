import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { answers } = body;

    // Extract preferences from answers
    const eventTypes = answers.event_type || [];
    const musicGenres = answers.music_genre || [];
    const crowdSize = answers.crowd_size?.[0] || 'medium';
    const budget = answers.budget?.[0] || 'moderate';
    const vibe = answers.vibe?.[0] || 'energetic';

    // Map budget to price range
    const priceRanges: Record<string, { min: number; max: number; label: string }> = {
      budget: { min: 0, max: 50, label: 'Under $50' },
      moderate: { min: 50, max: 150, label: '$50 - $150' },
      premium: { min: 150, max: 300, label: '$150 - $300' },
      vip: { min: 300, max: 10000, label: '$300+' },
    };

    const vibeLabels: Record<string, string> = {
      energetic: 'High Energy',
      chill: 'Relaxed',
      social: 'Social',
      immersive: 'Immersive',
    };

    // Query events matching preferences
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        date,
        category,
        image,
        venues (
          name
        ),
        ticket_types (
          price
        )
      `)
      .eq('status', 'published')
      .gte('date', new Date().toISOString())
      .limit(20);

    // Filter by event types if specified
    if (eventTypes.length > 0) {
      query = query.in('category', eventTypes);
    }

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Score and filter events
    const priceRange = priceRanges[budget];
    const scoredEvents = events
      ?.map(event => {
        let score = 50; // Base score

        // Category match
        if (eventTypes.includes(event.category)) {
          score += 20;
        }

        // Price match
        const prices = (event.ticket_types as any[])?.map(t => t.price) || [];
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        if (minPrice >= priceRange.min && minPrice <= priceRange.max) {
          score += 15;
        }

        // Random variation for variety
        score += Math.floor(Math.random() * 15);

        return {
          id: event.id,
          title: event.title,
          date: event.date,
          venue: (event.venues as any)?.name || 'TBA',
          image: event.image,
          match_score: Math.min(score, 99),
        };
      })
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10) || [];

    // Save preferences if user is authenticated
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            event_types: eventTypes,
            music_genres: musicGenres,
            crowd_size: crowdSize,
            budget,
            vibe,
            updated_at: new Date().toISOString(),
          });
      }
    }

    return NextResponse.json({
      results: {
        categories: eventTypes.map((t: string) => t.charAt(0).toUpperCase() + t.slice(1)),
        genres: musicGenres.map((g: string) => g.charAt(0).toUpperCase() + g.slice(1)),
        price_range: priceRange.label,
        vibe: vibeLabels[vibe] || vibe,
        recommended_events: scoredEvents,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
