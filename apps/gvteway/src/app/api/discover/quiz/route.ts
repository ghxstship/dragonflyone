export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const questions = [
    {
      id: 'event_type',
      question: 'What type of events are you interested in?',
      type: 'multiple',
      options: [
        { value: 'concert', label: 'Concerts' },
        { value: 'festival', label: 'Festivals' },
        { value: 'sports', label: 'Sports' },
        { value: 'theater', label: 'Theater' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'family', label: 'Family Events' },
      ],
    },
    {
      id: 'music_genre',
      question: 'What music genres do you enjoy?',
      type: 'multiple',
      options: [
        { value: 'rock', label: 'Rock' },
        { value: 'pop', label: 'Pop' },
        { value: 'hip-hop', label: 'Hip-Hop' },
        { value: 'electronic', label: 'Electronic' },
        { value: 'country', label: 'Country' },
        { value: 'jazz', label: 'Jazz' },
        { value: 'classical', label: 'Classical' },
      ],
    },
    {
      id: 'crowd_size',
      question: 'What crowd size do you prefer?',
      type: 'single',
      options: [
        { value: 'intimate', label: 'Intimate (under 500)' },
        { value: 'medium', label: 'Medium (500-5000)' },
        { value: 'large', label: 'Large (5000+)' },
      ],
    },
    {
      id: 'budget',
      question: 'What is your typical budget per event?',
      type: 'single',
      options: [
        { value: 'budget', label: 'Under $50' },
        { value: 'moderate', label: '$50 - $150' },
        { value: 'premium', label: '$150 - $300' },
        { value: 'vip', label: '$300+' },
      ],
    },
    {
      id: 'vibe',
      question: 'What vibe are you looking for?',
      type: 'single',
      options: [
        { value: 'energetic', label: 'High Energy' },
        { value: 'chill', label: 'Relaxed' },
        { value: 'social', label: 'Social' },
        { value: 'immersive', label: 'Immersive' },
      ],
    },
  ];

  return NextResponse.json({ questions });
}

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
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ results: { categories: [], genres: [], price_range: '', vibe: '', recommended_events: [] } });
      }
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
        interface TicketType { price: number }
        interface VenueData { name?: string }
        const ticketTypes = (event.ticket_types || []) as TicketType[];
        const prices = ticketTypes.map((t: TicketType) => t.price);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

        if (minPrice >= priceRange.min && minPrice <= priceRange.max) {
          score += 15;
        }

        // Random variation for variety
        score += Math.floor(Math.random() * 15);

        const venue = event.venues as VenueData | null;
        return {
          id: event.id,
          title: event.title,
          date: event.date,
          venue: venue?.name || 'TBA',
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
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ results: { categories: [], genres: [], price_range: '', vibe: '', recommended_events: [] } });
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
