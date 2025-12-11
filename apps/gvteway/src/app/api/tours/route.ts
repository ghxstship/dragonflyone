export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TourDate {
  date: string;
  city?: string;
  state?: string;
  venue?: string;
}

interface Artist {
  id?: string;
  name?: string;
  image?: string;
  image_url?: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
}

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
    const artistFilter = searchParams.get('artist');
    const city = searchParams.get('city');

    // Get events with artists as tours (tours table doesn't exist, use events with event_artists)
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        name,
        start_date,
        end_date,
        status,
        venue:venues(id, name, city, state),
        event_artists(
          artist:artists(id, name, image_url)
        )
      `)
      .eq('status', 'published')
      .order('start_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform events into tour-like structure grouped by artist
    const artistTours = new Map<string, { artist: Artist; dates: TourDate[] }>();
    
    for (const event of data || []) {
      const eventArtists = event.event_artists as Array<{ artist: Artist }> || [];
      const venueData = event.venue as unknown;
      const venue = Array.isArray(venueData) ? venueData[0] as Venue : venueData as Venue | null;
      
      for (const ea of eventArtists) {
        if (!ea.artist) continue;
        const artistId = ea.artist.id || 'unknown';
        
        if (!artistTours.has(artistId)) {
          artistTours.set(artistId, { artist: ea.artist, dates: [] });
        }
        
        const tourDate: TourDate = {
          date: event.start_date,
          city: venue?.city,
          state: venue?.state,
          venue: venue?.name,
        };
        
        // Apply city filter
        if (city && `${tourDate.city}, ${tourDate.state}` !== city) continue;
        
        artistTours.get(artistId)!.dates.push(tourDate);
      }
    }

    let tours = Array.from(artistTours.entries()).map(([artistId, data]) => ({
      id: artistId,
      artist_id: artistId,
      artist_name: data.artist.name,
      artist_image: data.artist.image,
      tour_name: `${data.artist.name} Tour`,
      dates: data.dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      total_dates: data.dates.length,
    })).filter(tour => tour.dates.length > 0);

    // Filter by artist name if provided
    if (artistFilter) {
      tours = tours.filter(tour =>
        tour.artist_name?.toLowerCase().includes(artistFilter.toLowerCase())
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
