import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey) as any;

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const limit = parseInt(searchParams.get('limit') || '50');

    let queryBuilder = supabase
      .from('events')
      .select(`
        *,
        venue:venues(name, city, state),
        ticket_types(price_min, price_max)
      `)
      .eq('status', 'published')
      .limit(limit);

    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,artist_name.ilike.%${query}%`
      );
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (location) {
      queryBuilder = queryBuilder.ilike('venues.city', `%${location}%`);
    }

    if (dateFrom) {
      queryBuilder = queryBuilder.gte('event_date', dateFrom);
    }

    if (dateTo) {
      queryBuilder = queryBuilder.lte('event_date', dateTo);
    }

    const { data: events, error } = await queryBuilder;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let filteredEvents = events || [];

    if (minPrice || maxPrice) {
      filteredEvents = filteredEvents.filter((event: any) => {
        const prices = event.ticket_types || [];
        const eventMinPrice = Math.min(...prices.map((t: any) => t.price_min || 0));
        const eventMaxPrice = Math.max(...prices.map((t: any) => t.price_max || 0));

        if (minPrice && eventMinPrice < parseFloat(minPrice)) return false;
        if (maxPrice && eventMaxPrice > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    const facets = {
      categories: [...new Set(events?.map((e: any) => e.category))],
      cities: [...new Set(events?.map((e: any) => e.venue?.city).filter(Boolean))],
      dateRange: {
        earliest: events?.[0]?.event_date,
        latest: events?.[events.length - 1]?.event_date,
      },
    };

    return NextResponse.json({
      query,
      totalResults: filteredEvents.length,
      events: filteredEvents,
      facets,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
