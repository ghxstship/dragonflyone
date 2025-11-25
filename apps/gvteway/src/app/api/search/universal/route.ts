import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query}%`;
    const results: any[] = [];

    // Search events
    if (!type || type === 'event') {
      const { data: events } = await supabase
        .from('events')
        .select('id, title, date, venue, category, image')
        .or(`title.ilike.${searchTerm},venue.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .eq('status', 'published')
        .limit(limit);

      if (events) {
        results.push(...events.map(e => ({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: e.venue,
          metadata: e.date,
          image: e.image,
          tags: e.category ? [e.category] : [],
        })));
      }
    }

    // Search artists
    if (!type || type === 'artist') {
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name, genre, image, followers_count')
        .or(`name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .limit(limit);

      if (artists) {
        results.push(...artists.map(a => ({
          id: a.id,
          type: 'artist',
          title: a.name,
          subtitle: a.genre,
          metadata: `${a.followers_count || 0} followers`,
          image: a.image,
          tags: a.genre ? [a.genre] : [],
        })));
      }
    }

    // Search venues
    if (!type || type === 'venue') {
      const { data: venues } = await supabase
        .from('venues')
        .select('id, name, city, state, capacity, image')
        .or(`name.ilike.${searchTerm},city.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .limit(limit);

      if (venues) {
        results.push(...venues.map(v => ({
          id: v.id,
          type: 'venue',
          title: v.name,
          subtitle: `${v.city}, ${v.state}`,
          metadata: v.capacity ? `Capacity: ${v.capacity}` : undefined,
          image: v.image,
        })));
      }
    }

    // Search genres/categories (from a predefined list or categories table)
    if (!type || type === 'genre') {
      const genres = [
        { id: 'concert', name: 'Concerts', description: 'Live music performances' },
        { id: 'festival', name: 'Festivals', description: 'Multi-day music events' },
        { id: 'theater', name: 'Theater', description: 'Plays, musicals, and performances' },
        { id: 'sports', name: 'Sports', description: 'Athletic events and games' },
        { id: 'comedy', name: 'Comedy', description: 'Stand-up and comedy shows' },
        { id: 'nightlife', name: 'Nightlife', description: 'Clubs and late-night events' },
        { id: 'family', name: 'Family', description: 'Family-friendly events' },
        { id: 'arts', name: 'Arts & Culture', description: 'Museums, galleries, and cultural events' },
      ];

      const matchingGenres = genres.filter(g =>
        g.name.toLowerCase().includes(query.toLowerCase()) ||
        g.description.toLowerCase().includes(query.toLowerCase())
      );

      results.push(...matchingGenres.map(g => ({
        id: g.id,
        type: 'genre',
        title: g.name,
        subtitle: g.description,
      })));
    }

    // Sort results by relevance (exact matches first)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === query.toLowerCase();
      const bExact = b.title.toLowerCase() === query.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    return NextResponse.json({ results: results.slice(0, limit) });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
