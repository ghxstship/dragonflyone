export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const VisualSearchSchema = z.object({
  search_type: z.enum(['artist', 'venue', 'event', 'general']),
  query: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  artist_name: z.string().optional(),
  venue_name: z.string().optional(),
  event_name: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    radius_km: z.number().default(50),
  }).optional(),
  limit: z.number().min(1).max(50).default(20),
});

// GET - Return search capabilities
export async function GET() {
  return NextResponse.json({
    search_types: ['artist', 'venue', 'event', 'general'],
    capabilities: [
      'text_search',
      'tag_based_search',
      'location_based_search',
      'date_range_filtering',
    ],
    usage: {
      description: 'Search for events, artists, and venues using text queries, tags, or location',
      required_fields: ['search_type'],
      optional_fields: ['query', 'tags', 'artist_name', 'venue_name', 'event_name', 'date_from', 'date_to', 'location', 'limit'],
    },
  });
}

// POST - Perform search based on provided criteria
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  try {
    const body = await request.json();
    const parsed = VisualSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { search_type, query, tags, artist_name, venue_name, event_name, date_from, date_to, location, limit } = parsed.data;

    let results: unknown[] = [];

    if (search_type === 'artist') {
      // Search for artists and their events
      let artistQuery = supabase
        .from('artists')
        .select(`
          id, name, bio, image_url, genres,
          events (id, name, date, venue_id, image_url)
        `)
        .limit(limit);

      if (artist_name) {
        artistQuery = artistQuery.ilike('name', `%${artist_name}%`);
      }
      if (query) {
        artistQuery = artistQuery.or(`name.ilike.%${query}%,bio.ilike.%${query}%`);
      }

      const { data, error } = await artistQuery;
      
      if (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }
      
      results = data || [];
    }

    if (search_type === 'venue') {
      // Search for venues and their events
      let venueQuery = supabase
        .from('venues')
        .select(`
          id, name, address, city, state, latitude, longitude, capacity,
          events (id, name, date, image_url)
        `)
        .limit(limit);

      if (venue_name) {
        venueQuery = venueQuery.ilike('name', `%${venue_name}%`);
      }
      if (query) {
        venueQuery = venueQuery.or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`);
      }

      const { data, error } = await venueQuery;
      
      if (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }
      
      results = data || [];
    }

    if (search_type === 'event' || search_type === 'general') {
      // Search for events
      let eventQuery = supabase
        .from('events')
        .select(`
          id, name, description, date, image_url, status, tags,
          venues (id, name, address, city),
          artists (id, name)
        `)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(limit);

      if (event_name) {
        eventQuery = eventQuery.ilike('name', `%${event_name}%`);
      }
      if (query) {
        eventQuery = eventQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }
      if (date_from) {
        eventQuery = eventQuery.gte('date', date_from);
      }
      if (date_to) {
        eventQuery = eventQuery.lte('date', date_to);
      }
      if (tags && tags.length > 0) {
        eventQuery = eventQuery.overlaps('tags', tags);
      }

      const { data, error } = await eventQuery;
      
      if (error) {
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }
      
      results = data || [];

      // If location provided, filter by distance
      if (location && results.length > 0) {
        results = (results as Array<{ venues?: { latitude?: number; longitude?: number } }>).filter(event => {
          const venue = event.venues;
          if (!venue?.latitude || !venue?.longitude) return true;
          
          const distance = calculateDistance(
            location.lat, location.lng,
            venue.latitude, venue.longitude
          );
          return distance <= location.radius_km;
        });
      }
    }

    // Log the search for analytics
    await supabase.from('search_logs').insert({
      search_type,
      query: query || null,
      tags: tags || null,
      results_count: results.length,
      created_at: new Date().toISOString(),
    }).select().single();

    return NextResponse.json({
      search_type,
      query: query || null,
      filters_applied: {
        artist_name: artist_name || null,
        venue_name: venue_name || null,
        event_name: event_name || null,
        date_range: date_from || date_to ? { from: date_from, to: date_to } : null,
        location: location || null,
        tags: tags || null,
      },
      results_count: results.length,
      results,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
