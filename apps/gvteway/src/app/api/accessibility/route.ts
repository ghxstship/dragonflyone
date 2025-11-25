import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch accessibility services for an event or user requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const authHeader = request.headers.get('authorization');

    if (eventId) {
      // Fetch event accessibility info
      const { data: event, error } = await supabase
        .from('events')
        .select(`
          id,
          name,
          venue,
          accessibility_info:event_accessibility(*)
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Fetch venue accessibility features
      const { data: venueInfo } = await supabase
        .from('venue_accessibility')
        .select('*')
        .eq('venue_id', event.venue)
        .single();

      return NextResponse.json({
        event_accessibility: event.accessibility_info,
        venue_accessibility: venueInfo,
        services_available: [
          'wheelchair_seating',
          'asl_interpretation',
          'audio_description',
          'assistive_listening',
          'service_animal_relief',
          'accessible_parking',
          'companion_seating',
          'sensory_friendly',
        ],
      });
    }

    // Fetch user's accessibility requests
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      if (user) {
        const { data: requests, error } = await supabase
          .from('accessibility_requests')
          .select(`
            *,
            event:events(id, name, date, venue)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ requests });
      }
    }

    return NextResponse.json({ error: 'Event ID or authentication required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accessibility info' },
      { status: 500 }
    );
  }
}

// POST - Request accessibility services
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      event_id,
      order_id,
      services_requested, // Array of service types
      wheelchair_type, // 'manual', 'electric', 'scooter'
      companion_needed,
      companion_count,
      service_animal,
      service_animal_type,
      additional_needs,
      contact_phone,
      emergency_contact,
    } = body;

    const { data: requestData, error } = await supabase
      .from('accessibility_requests')
      .insert({
        user_id: user.id,
        event_id,
        order_id,
        services_requested,
        wheelchair_type,
        companion_needed: companion_needed || false,
        companion_count: companion_count || 0,
        service_animal: service_animal || false,
        service_animal_type,
        additional_needs,
        contact_phone,
        emergency_contact,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create notification for venue staff
    await supabase.from('staff_notifications').insert({
      event_id,
      type: 'accessibility_request',
      priority: 'high',
      message: `New accessibility request: ${services_requested.join(', ')}`,
      reference_id: requestData.id,
      reference_type: 'accessibility_request',
    });

    return NextResponse.json({
      request: requestData,
      message: 'Your accessibility request has been submitted. Our team will contact you within 24 hours.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    );
  }
}

// PATCH - Update request status (admin) or user preferences
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { request_id, status, notes, assigned_to } = body;

    const { error } = await supabase
      .from('accessibility_requests')
      .update({
        status,
        staff_notes: notes,
        assigned_to,
        updated_at: new Date().toISOString(),
      })
      .eq('id', request_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify user of status change
    if (status === 'confirmed') {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'accessibility_confirmed',
        title: 'Accessibility Request Confirmed',
        message: 'Your accessibility services have been confirmed for your upcoming event.',
        reference_id: request_id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
