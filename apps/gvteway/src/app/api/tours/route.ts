import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get('artist');
    const city = searchParams.get('city');

    // Get tours with their dates
    let query = supabase
      .from('tours')
      .select(`
        id,
        tour_name,
        artist_id,
        artists (
          id,
          name,
          image
        ),
        tour_dates (
          id,
          event_id,
          date,
          city,
          state,
          venue,
          price_min,
          tickets_available,
          status
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (artist) {
      query = query.ilike('artists.name', `%${artist}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform and filter data
    let tours = data?.map(tour => ({
      id: tour.id,
      artist_id: tour.artist_id,
      artist_name: (tour.artists as any)?.name,
      artist_image: (tour.artists as any)?.image,
      tour_name: tour.tour_name,
      dates: ((tour.tour_dates as any[]) || [])
        .filter((date: any) => {
          if (city) {
            return `${date.city}, ${date.state}` === city;
          }
          return true;
        })
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      total_dates: ((tour.tour_dates as any[]) || []).length,
    })).filter(tour => tour.dates.length > 0) || [];

    // Filter by artist name if provided
    if (artist) {
      tours = tours.filter(tour =>
        tour.artist_name?.toLowerCase().includes(artist.toLowerCase()) ||
        tour.tour_name?.toLowerCase().includes(artist.toLowerCase())
      );
    }

    return NextResponse.json({ tours });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
