export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@ghxstship/config';

interface TourDate {
  date: string;
  city?: string;
  state?: string;
  venue?: string;
  venue_id?: string;
}

interface PersonData {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar_url?: string;
}

interface PlaceData {
  id: string;
  name: string;
  metadata?: {
    city?: string;
    state?: string;
  };
}

interface EventPersonData {
  person_id: string;
  role_type: string;
  is_headliner: boolean;
  person: PersonData;
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

    // Query legend_events with legend_event_people (artists) and legend_places (venues) - 3NF tables
    const { data, error } = await supabase
      .from('legend_events')
      .select(`
        id,
        name,
        start_datetime,
        end_datetime,
        status,
        place:legend_places!place_id(id, name, metadata),
        event_people:legend_event_people(
          person_id,
          role_type,
          is_headliner,
          person:legend_people!person_id(id, first_name, last_name, display_name, avatar_url)
        )
      `)
      .eq('status', 'active')
      .in('event_type', ['event', 'show', 'tour', 'festival'])
      .order('start_datetime', { ascending: true });

    if (error) {
      logger.error('Error fetching tours from legend_events:', error);
      return NextResponse.json({ tours: [], total: 0 });
    }

    // Transform events into tour-like structure grouped by artist
    const artistTours = new Map<string, { artist: { id: string; name: string; image?: string }; dates: TourDate[] }>();
    
    for (const event of data || []) {
      const eventPeople = (event.event_people as unknown as EventPersonData[]) || [];
      const placeArray = event.place as unknown as PlaceData[] | null;
      const placeData = Array.isArray(placeArray) ? placeArray[0] : placeArray as PlaceData | null;
      
      // Filter to only artists/performers
      const artists = eventPeople.filter(ep => 
        ['artist', 'headliner', 'opener', 'dj', 'performer'].includes(ep.role_type)
      );
      
      for (const ep of artists) {
        if (!ep.person) continue;
        const artistId = ep.person.id;
        const artistName = ep.person.display_name || `${ep.person.first_name} ${ep.person.last_name}`;
        
        if (!artistTours.has(artistId)) {
          artistTours.set(artistId, { 
            artist: { 
              id: artistId, 
              name: artistName, 
              image: ep.person.avatar_url 
            }, 
            dates: [] 
          });
        }
        
        const venueCity = placeData?.metadata?.city;
        const venueState = placeData?.metadata?.state;
        
        const tourDate: TourDate = {
          date: event.start_datetime,
          city: venueCity,
          state: venueState,
          venue: placeData?.name,
          venue_id: placeData?.id,
        };
        
        // Apply city filter
        if (city && `${tourDate.city}, ${tourDate.state}` !== city) continue;
        
        artistTours.get(artistId)!.dates.push(tourDate);
      }
    }

    let tours = Array.from(artistTours.entries()).map(([artistId, tourData]) => ({
      id: artistId,
      artist_id: artistId,
      artist_name: tourData.artist.name,
      artist_image: tourData.artist.image,
      tour_name: `${tourData.artist.name} Tour`,
      dates: tourData.dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      total_dates: tourData.dates.length,
    })).filter(tour => tour.dates.length > 0);

    // Filter by artist name if provided
    if (artistFilter) {
      tours = tours.filter(tour =>
        tour.artist_name?.toLowerCase().includes(artistFilter.toLowerCase())
      );
    }

    return NextResponse.json({ tours, total: tours.length });
  } catch (error) {
    logger.error('Error in GET /api/tours:', error instanceof Error ? error : undefined);
    return NextResponse.json({ tours: [], total: 0 });
  }
}
