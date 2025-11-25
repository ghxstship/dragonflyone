import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SearchFiltersSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['events', 'artists', 'venues', 'all']).default('all'),
  categories: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  price_min: z.number().optional(),
  price_max: z.number().optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    radius_miles: z.number().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }).optional(),
  sort_by: z.enum(['relevance', 'date', 'price_low', 'price_high', 'popularity', 'distance']).default('relevance'),
  page: z.number().default(1),
  limit: z.number().default(20),
});

// GET /api/advanced-search - Search events, artists, venues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'filters') {
      // Get available filter options
      const { data: genres } = await supabase
        .from('events')
        .select('genres')
        .not('genres', 'is', null);

      const { data: categories } = await supabase
        .from('event_categories')
        .select('id, name, slug')
        .eq('is_active', true);

      const { data: cities } = await supabase
        .from('events')
        .select('venue_city')
        .not('venue_city', 'is', null)
        .gte('event_date', new Date().toISOString());

      const uniqueGenres = new Set<string>();
      genres?.forEach(e => {
        if (Array.isArray(e.genres)) {
          e.genres.forEach((g: string) => uniqueGenres.add(g));
        }
      });

      const uniqueCities = Array.from(new Set(cities?.map(c => c.venue_city) || []));

      return NextResponse.json({
        filters: {
          genres: Array.from(uniqueGenres).sort(),
          categories: categories || [],
          cities: uniqueCities.sort(),
          price_ranges: [
            { label: 'Free', min: 0, max: 0 },
            { label: 'Under $25', min: 0, max: 25 },
            { label: '$25 - $50', min: 25, max: 50 },
            { label: '$50 - $100', min: 50, max: 100 },
            { label: '$100 - $200', min: 100, max: 200 },
            { label: '$200+', min: 200, max: null },
          ],
        },
      });
    }

    if (action === 'suggestions') {
      const query = searchParams.get('q');
      if (!query || query.length < 2) {
        return NextResponse.json({ suggestions: [] });
      }

      // Get event suggestions
      const { data: events } = await supabase
        .from('events')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .gte('event_date', new Date().toISOString())
        .limit(5);

      // Get artist suggestions
      const { data: artists } = await supabase
        .from('artists')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      // Get venue suggestions
      const { data: venues } = await supabase
        .from('venues')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(5);

      return NextResponse.json({
        suggestions: [
          ...(events?.map(e => ({ type: 'event', id: e.id, name: e.name })) || []),
          ...(artists?.map(a => ({ type: 'artist', id: a.id, name: a.name })) || []),
          ...(venues?.map(v => ({ type: 'venue', id: v.id, name: v.name })) || []),
        ],
      });
    }

    if (action === 'trending') {
      // Get trending searches
      const { data: trending } = await supabase
        .from('search_analytics')
        .select('query, count')
        .order('count', { ascending: false })
        .limit(10);

      return NextResponse.json({ trending: trending || [] });
    }

    // Default search
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const category = searchParams.get('category');
    const genre = searchParams.get('genre');
    const city = searchParams.get('city');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    const sortBy = searchParams.get('sort_by') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const results: any = {};

    if (type === 'all' || type === 'events') {
      let eventQuery = supabase
        .from('events')
        .select('id, name, event_date, venue_name, venue_city, image_url, min_price, max_price, genres', { count: 'exact' })
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString());

      if (query) {
        eventQuery = eventQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,venue_name.ilike.%${query}%`);
      }
      if (category) {
        eventQuery = eventQuery.eq('category_id', category);
      }
      if (genre) {
        eventQuery = eventQuery.contains('genres', [genre]);
      }
      if (city) {
        eventQuery = eventQuery.eq('venue_city', city);
      }
      if (dateFrom) {
        eventQuery = eventQuery.gte('event_date', dateFrom);
      }
      if (dateTo) {
        eventQuery = eventQuery.lte('event_date', dateTo);
      }
      if (priceMin) {
        eventQuery = eventQuery.gte('min_price', parseFloat(priceMin));
      }
      if (priceMax) {
        eventQuery = eventQuery.lte('max_price', parseFloat(priceMax));
      }

      // Apply sorting
      switch (sortBy) {
        case 'date':
          eventQuery = eventQuery.order('event_date');
          break;
        case 'price_low':
          eventQuery = eventQuery.order('min_price');
          break;
        case 'price_high':
          eventQuery = eventQuery.order('max_price', { ascending: false });
          break;
        case 'popularity':
          eventQuery = eventQuery.order('tickets_sold', { ascending: false });
          break;
        default:
          eventQuery = eventQuery.order('event_date');
      }

      if (type === 'events') {
        eventQuery = eventQuery.range(offset, offset + limit - 1);
      } else {
        eventQuery = eventQuery.limit(5);
      }

      const { data: events, count: eventCount } = await eventQuery;
      results.events = {
        items: events || [],
        total: eventCount || 0,
      };
    }

    if (type === 'all' || type === 'artists') {
      let artistQuery = supabase
        .from('artists')
        .select('id, name, image_url, genres, bio', { count: 'exact' })
        .eq('is_active', true);

      if (query) {
        artistQuery = artistQuery.or(`name.ilike.%${query}%,bio.ilike.%${query}%`);
      }
      if (genre) {
        artistQuery = artistQuery.contains('genres', [genre]);
      }

      if (type === 'artists') {
        artistQuery = artistQuery.range(offset, offset + limit - 1);
      } else {
        artistQuery = artistQuery.limit(5);
      }

      const { data: artists, count: artistCount } = await artistQuery;
      results.artists = {
        items: artists || [],
        total: artistCount || 0,
      };
    }

    if (type === 'all' || type === 'venues') {
      let venueQuery = supabase
        .from('venues')
        .select('id, name, city, state, image_url, capacity', { count: 'exact' })
        .eq('is_active', true);

      if (query) {
        venueQuery = venueQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%`);
      }
      if (city) {
        venueQuery = venueQuery.eq('city', city);
      }

      if (type === 'venues') {
        venueQuery = venueQuery.range(offset, offset + limit - 1);
      } else {
        venueQuery = venueQuery.limit(5);
      }

      const { data: venues, count: venueCount } = await venueQuery;
      results.venues = {
        items: venues || [],
        total: venueCount || 0,
      };
    }

    // Log search for analytics (async, don't await)
    if (query) {
      supabase.from('search_analytics').upsert({
        query: query.toLowerCase(),
        count: 1,
        last_searched_at: new Date().toISOString(),
      }, { onConflict: 'query' }).then(() => {});
    }

    return NextResponse.json({
      query,
      results,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// POST /api/advanced-search - Advanced search with filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = SearchFiltersSchema.parse(body);

    const offset = (filters.page - 1) * filters.limit;
    const results: any = {};

    if (filters.type === 'all' || filters.type === 'events') {
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString());

      if (filters.query) {
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      if (filters.categories?.length) {
        query = query.in('category_id', filters.categories);
      }
      if (filters.genres?.length) {
        query = query.overlaps('genres', filters.genres);
      }
      if (filters.date_from) {
        query = query.gte('event_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('event_date', filters.date_to);
      }
      if (filters.price_min !== undefined) {
        query = query.gte('min_price', filters.price_min);
      }
      if (filters.price_max !== undefined) {
        query = query.lte('max_price', filters.price_max);
      }
      if (filters.location?.city) {
        query = query.eq('venue_city', filters.location.city);
      }
      if (filters.location?.state) {
        query = query.eq('venue_state', filters.location.state);
      }

      // Sorting
      switch (filters.sort_by) {
        case 'date':
          query = query.order('event_date');
          break;
        case 'price_low':
          query = query.order('min_price');
          break;
        case 'price_high':
          query = query.order('max_price', { ascending: false });
          break;
        case 'popularity':
          query = query.order('tickets_sold', { ascending: false });
          break;
        default:
          query = query.order('event_date');
      }

      query = query.range(offset, offset + filters.limit - 1);

      const { data: events, count } = await query;
      results.events = {
        items: events || [],
        total: count || 0,
        page: filters.page,
        total_pages: Math.ceil((count || 0) / filters.limit),
      };
    }

    return NextResponse.json({
      filters,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid filters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
