import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

/**
 * Drone Integration API for Production Documentation
 * Manages drone flights, captures, and documentation for venues and events
 */
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const projectId = searchParams.get('project_id');
    const venueId = searchParams.get('venue_id');
    const flightId = searchParams.get('flight_id');

    if (type === 'drone_types') {
      const droneTypes = [
        { id: 'dji_mavic_3', name: 'DJI Mavic 3', category: 'prosumer', features: ['4k_video', 'photos', 'waypoints', 'obstacle_avoidance'] },
        { id: 'dji_inspire_3', name: 'DJI Inspire 3', category: 'professional', features: ['8k_video', 'raw_photos', 'dual_operator', 'interchangeable_lens'] },
        { id: 'dji_matrice_350', name: 'DJI Matrice 350 RTK', category: 'enterprise', features: ['thermal', 'lidar', 'rtk_positioning', 'payload_options'] },
        { id: 'skydio_2', name: 'Skydio 2+', category: 'autonomous', features: ['ai_tracking', 'obstacle_avoidance', '4k_video'] },
        { id: 'autel_evo_2', name: 'Autel EVO II Pro', category: 'prosumer', features: ['6k_video', 'photos', 'waypoints'] }
      ];
      return NextResponse.json({ drone_types: droneTypes });
    }

    if (type === 'drones') {
      const { data, error } = await supabase
        .from('drones')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ drones: data });
    }

    if (type === 'flights') {
      let query = supabase
        .from('drone_flights')
        .select(`
          *,
          drone:drones(id, name, drone_type),
          pilot:profiles(id, full_name),
          captures:drone_captures(id, type, file_url, thumbnail_url)
        `)
        .order('scheduled_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ flights: data });
    }

    if (type === 'flight' && flightId) {
      const { data, error } = await supabase
        .from('drone_flights')
        .select(`
          *,
          drone:drones(*),
          pilot:profiles(id, full_name, email),
          captures:drone_captures(*),
          flight_path:drone_flight_paths(*)
        `)
        .eq('id', flightId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ flight: data });
    }

    if (type === 'captures') {
      let query = supabase
        .from('drone_captures')
        .select(`
          *,
          flight:drone_flights(id, project_id, venue_id)
        `)
        .order('captured_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ captures: data });
    }

    if (type === 'flight_zones') {
      // Get restricted/authorized flight zones
      let query = supabase
        .from('drone_flight_zones')
        .select('*');

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ zones: data });
    }

    if (type === 'pilots') {
      const { data, error } = await supabase
        .from('drone_pilots')
        .select(`
          *,
          user:profiles(id, full_name, email)
        `)
        .eq('status', 'active');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ pilots: data });
    }

    // Default summary
    const [droneCount, flightCount, captureCount] = await Promise.all([
      supabase.from('drones').select('id', { count: 'exact', head: true }),
      supabase.from('drone_flights').select('id', { count: 'exact', head: true }),
      supabase.from('drone_captures').select('id', { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      summary: {
        total_drones: droneCount.count || 0,
        total_flights: flightCount.count || 0,
        total_captures: captureCount.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch drone data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'register_drone') {
      const { name, drone_type, serial_number, registration_number, max_flight_time, camera_specs } = body;

      const { data, error } = await supabase
        .from('drones')
        .insert({
          name,
          drone_type,
          serial_number,
          registration_number,
          max_flight_time,
          camera_specs: camera_specs || {},
          status: 'available',
          registered_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ drone: data }, { status: 201 });
    }

    if (action === 'schedule_flight') {
      const { drone_id, pilot_id, project_id, venue_id, scheduled_at, purpose, flight_plan, estimated_duration } = body;

      // Check drone availability
      const { data: conflicts } = await supabase
        .from('drone_flights')
        .select('id')
        .eq('drone_id', drone_id)
        .in('status', ['scheduled', 'in_progress'])
        .gte('scheduled_at', new Date(new Date(scheduled_at).getTime() - 2 * 60 * 60 * 1000).toISOString())
        .lte('scheduled_at', new Date(new Date(scheduled_at).getTime() + 2 * 60 * 60 * 1000).toISOString());

      if (conflicts && conflicts.length > 0) {
        return NextResponse.json({ error: 'Drone not available at scheduled time' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('drone_flights')
        .insert({
          drone_id,
          pilot_id,
          project_id,
          venue_id,
          scheduled_at,
          purpose,
          flight_plan: flight_plan || {},
          estimated_duration,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ flight: data }, { status: 201 });
    }

    if (action === 'start_flight') {
      const { flight_id, takeoff_location } = body;

      const { data, error } = await supabase
        .from('drone_flights')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
          takeoff_location
        })
        .eq('id', flight_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update drone status
      await supabase
        .from('drones')
        .update({ status: 'in_flight', current_flight_id: flight_id })
        .eq('id', data.drone_id);

      return NextResponse.json({ flight: data });
    }

    if (action === 'end_flight') {
      const { flight_id, landing_location, flight_notes } = body;

      const { data: flight } = await supabase
        .from('drone_flights')
        .select('drone_id, started_at')
        .eq('id', flight_id)
        .single();

      const duration = flight?.started_at
        ? Math.round((Date.now() - new Date(flight.started_at).getTime()) / 60000)
        : 0;

      const { data, error } = await supabase
        .from('drone_flights')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          landing_location,
          actual_duration: duration,
          flight_notes
        })
        .eq('id', flight_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update drone status
      await supabase
        .from('drones')
        .update({ status: 'available', current_flight_id: null })
        .eq('id', flight?.drone_id);

      return NextResponse.json({ flight: data });
    }

    if (action === 'upload_capture') {
      const { flight_id, project_id, venue_id, type, file_url, thumbnail_url, metadata, location, captured_at } = body;

      const { data, error } = await supabase
        .from('drone_captures')
        .insert({
          flight_id,
          project_id,
          venue_id,
          type, // 'photo', 'video', 'panorama', 'orthomosaic', 'thermal'
          file_url,
          thumbnail_url,
          metadata: metadata || {},
          location,
          captured_at: captured_at || new Date().toISOString(),
          status: 'uploaded'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ capture: data }, { status: 201 });
    }

    if (action === 'process_capture') {
      const { capture_id, processing_type } = body;

      // Update status to processing
      await supabase
        .from('drone_captures')
        .update({ status: 'processing' })
        .eq('id', capture_id);

      // In production, would trigger processing pipeline
      // For now, simulate completion
      const { data, error } = await supabase
        .from('drone_captures')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString(),
          processing_type
        })
        .eq('id', capture_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ capture: data });
    }

    if (action === 'create_flight_zone') {
      const { venue_id, name, zone_type, boundary, max_altitude, restrictions, notes } = body;

      const { data, error } = await supabase
        .from('drone_flight_zones')
        .insert({
          venue_id,
          name,
          zone_type, // 'authorized', 'restricted', 'no_fly'
          boundary, // GeoJSON polygon
          max_altitude,
          restrictions: restrictions || [],
          notes
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ zone: data }, { status: 201 });
    }

    if (action === 'register_pilot') {
      const { user_id, license_number, license_type, license_expiry, certifications } = body;

      const { data, error } = await supabase
        .from('drone_pilots')
        .insert({
          user_id,
          license_number,
          license_type, // 'part_107', 'recreational', 'commercial'
          license_expiry,
          certifications: certifications || [],
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ pilot: data }, { status: 201 });
    }

    if (action === 'record_telemetry') {
      const { flight_id, telemetry } = body;

      // Append to flight path
      const { data, error } = await supabase
        .from('drone_flight_paths')
        .insert({
          flight_id,
          latitude: telemetry.latitude,
          longitude: telemetry.longitude,
          altitude: telemetry.altitude,
          speed: telemetry.speed,
          heading: telemetry.heading,
          battery_level: telemetry.battery_level,
          recorded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ telemetry: data });
    }

    if (action === 'generate_documentation') {
      const { project_id, venue_id, captures, title, description } = body;

      // Create documentation package
      const { data, error } = await supabase
        .from('drone_documentation')
        .insert({
          project_id,
          venue_id,
          title,
          description,
          captures: captures || [],
          status: 'draft',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ documentation: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process drone request' }, { status: 500 });
  }
}
