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

const DirectionsRequestSchema = z.object({
  origin: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  venue_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  mode: z.enum(['driving', 'walking', 'transit', 'cycling']).default('driving'),
});

// GET - Get directions info or cached venue directions
export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  
  const venueId = searchParams.get('venue_id');
  const eventId = searchParams.get('event_id');
  const originLat = parseFloat(searchParams.get('origin_lat') || '0');
  const originLng = parseFloat(searchParams.get('origin_lng') || '0');
  const mode = searchParams.get('mode') || 'driving';

  // If no coordinates provided, return API info
  if (!originLat && !originLng && !venueId && !eventId) {
    return NextResponse.json({
      supported_modes: ['driving', 'walking', 'transit', 'cycling'],
      features: ['distance_calculation', 'time_estimation', 'venue_directions'],
      note: 'Provide origin coordinates and venue_id/event_id for directions',
    });
  }

  try {
    // Get venue/event location from database
    let destinationLat = parseFloat(searchParams.get('dest_lat') || '0');
    let destinationLng = parseFloat(searchParams.get('dest_lng') || '0');
    let venueName = '';
    let venueAddress = '';

    if (venueId) {
      const { data: venue, error } = await supabase
        .from('venues')
        .select('id, name, address, latitude, longitude, directions_notes')
        .eq('id', venueId)
        .single();

      if (error || !venue) {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      }

      destinationLat = venue.latitude || destinationLat;
      destinationLng = venue.longitude || destinationLng;
      venueName = venue.name;
      venueAddress = venue.address;
    }

    if (eventId) {
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          id, name, venue_id,
          venues (id, name, address, latitude, longitude, directions_notes)
        `)
        .eq('id', eventId)
        .single();

      if (error || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const venue = event.venues as { latitude?: number; longitude?: number; name?: string; address?: string } | null;
      if (venue) {
        destinationLat = venue.latitude || destinationLat;
        destinationLng = venue.longitude || destinationLng;
        venueName = venue.name || '';
        venueAddress = venue.address || '';
      }
    }

    if (!destinationLat || !destinationLng) {
      return NextResponse.json({ error: 'Destination coordinates not available' }, { status: 400 });
    }

    // Calculate real distance and time estimates
    const distanceKm = calculateDistance(originLat, originLng, destinationLat, destinationLng);
    const timeEstimate = calculateTravelTime(distanceKm, mode);

    // Check for cached/stored directions from this origin area
    const { data: cachedDirections } = await supabase
      .from('venue_directions')
      .select('*')
      .eq('venue_id', venueId || '')
      .eq('travel_mode', mode)
      .gte('origin_lat', originLat - 0.01)
      .lte('origin_lat', originLat + 0.01)
      .gte('origin_lng', originLng - 0.01)
      .lte('origin_lng', originLng + 0.01)
      .single();

    return NextResponse.json({
      origin: { lat: originLat, lng: originLng },
      destination: {
        lat: destinationLat,
        lng: destinationLng,
        name: venueName,
        address: venueAddress,
      },
      mode,
      distance: {
        value: distanceKm,
        text: formatDistance(distanceKm),
      },
      duration: {
        value: timeEstimate,
        text: formatDuration(timeEstimate),
      },
      directions: cachedDirections?.steps || null,
      directions_notes: cachedDirections?.notes || null,
      source: cachedDirections ? 'cached' : 'calculated',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get directions' }, { status: 500 });
  }
}

// POST - Calculate directions or save custom venue directions
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  
  try {
    const body = await request.json();
    const parsed = DirectionsRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { origin, destination, venue_id, event_id, mode } = parsed.data;

    // Get venue info if venue_id provided
    let destinationInfo = { ...destination, name: '', address: '' };
    
    if (venue_id) {
      const { data: venue } = await supabase
        .from('venues')
        .select('name, address, latitude, longitude')
        .eq('id', venue_id)
        .single();

      if (venue) {
        destinationInfo = {
          lat: venue.latitude || destination.lat,
          lng: venue.longitude || destination.lng,
          name: venue.name,
          address: venue.address,
        };
      }
    }

    if (event_id) {
      const { data: event } = await supabase
        .from('events')
        .select('venues (name, address, latitude, longitude)')
        .eq('id', event_id)
        .single();

      const venue = event?.venues as { name?: string; address?: string; latitude?: number; longitude?: number } | null;
      if (venue) {
        destinationInfo = {
          lat: venue.latitude || destination.lat,
          lng: venue.longitude || destination.lng,
          name: venue.name || '',
          address: venue.address || '',
        };
      }
    }

    // Calculate real distance and time
    const distanceKm = calculateDistance(
      origin.lat, origin.lng,
      destinationInfo.lat, destinationInfo.lng
    );
    const timeEstimate = calculateTravelTime(distanceKm, mode);

    // Log the directions request for analytics
    await supabase.from('directions_requests').insert({
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      destination_lat: destinationInfo.lat,
      destination_lng: destinationInfo.lng,
      venue_id: venue_id || null,
      event_id: event_id || null,
      travel_mode: mode,
      distance_km: distanceKm,
      estimated_minutes: timeEstimate,
      created_at: new Date().toISOString(),
    }).select().single();

    return NextResponse.json({
      origin,
      destination: destinationInfo,
      mode,
      distance: {
        value: distanceKm,
        text: formatDistance(distanceKm),
      },
      duration: {
        value: timeEstimate,
        text: formatDuration(timeEstimate),
      },
      route_summary: generateRouteSummary(distanceKm, mode),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to calculate directions' }, { status: 500 });
  }
}

// Generate a basic route summary based on distance and mode
function generateRouteSummary(distanceKm: number, mode: string): string {
  const timeMinutes = calculateTravelTime(distanceKm, mode);
  
  if (mode === 'walking') {
    if (distanceKm < 1) return `A short ${formatDuration(timeMinutes)} walk`;
    if (distanceKm < 3) return `A ${formatDuration(timeMinutes)} walk`;
    return `A longer walk of ${formatDistance(distanceKm)} (${formatDuration(timeMinutes)})`;
  }
  
  if (mode === 'cycling') {
    if (distanceKm < 5) return `A quick ${formatDuration(timeMinutes)} bike ride`;
    return `${formatDistance(distanceKm)} by bike (${formatDuration(timeMinutes)})`;
  }
  
  if (mode === 'transit') {
    return `${formatDistance(distanceKm)} via public transit (approx. ${formatDuration(timeMinutes)})`;
  }
  
  // Driving
  if (distanceKm < 5) return `A short ${formatDuration(timeMinutes)} drive`;
  if (distanceKm < 20) return `${formatDistance(distanceKm)} drive (${formatDuration(timeMinutes)})`;
  return `${formatDistance(distanceKm)} drive, approximately ${formatDuration(timeMinutes)}`;
}

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

// Calculate travel time based on distance and mode (returns minutes)
function calculateTravelTime(distanceKm: number, mode: string): number {
  // Average speeds in km/h for different modes
  const speeds: Record<string, number> = {
    driving: 40, // Average urban driving speed accounting for traffic
    walking: 5,
    cycling: 15,
    transit: 25, // Average including wait times and stops
  };
  
  const speedKmh = speeds[mode] || speeds.driving;
  return Math.round((distanceKm / speedKmh) * 60);
}

// Format distance for display
function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes < 1) {
    return '< 1 min';
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
