import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Medical staff coordination and incident logging
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    // Get medical staff assignments
    const { data: staff } = await supabase.from('medical_staff').select(`
      *, user:platform_users(first_name, last_name, phone)
    `).eq('event_id', eventId);

    // Get medical incidents
    const { data: incidents } = await supabase.from('medical_incidents').select(`
      *, responder:platform_users(first_name, last_name)
    `).eq('event_id', eventId).order('reported_at', { ascending: false });

    // Get medical stations
    const { data: stations } = await supabase.from('medical_stations').select('*').eq('event_id', eventId);

    return NextResponse.json({
      staff,
      incidents,
      stations,
      summary: {
        total_staff: staff?.length || 0,
        total_incidents: incidents?.length || 0,
        active_incidents: incidents?.filter(i => i.status === 'active').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action, event_id } = body;

    if (action === 'log_incident') {
      const { location, description, severity, patient_info, treatment } = body;

      const { data, error } = await supabase.from('medical_incidents').insert({
        event_id, location, description, severity,
        patient_info, treatment, status: 'active',
        reported_by: user.id, reported_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Notify medical coordinator for severe incidents
      if (severity === 'critical' || severity === 'severe') {
        const { data: coordinator } = await supabase.from('medical_staff').select('user_id')
          .eq('event_id', event_id).eq('role', 'coordinator').single();

        if (coordinator) {
          await supabase.from('notifications').insert({
            user_id: coordinator.user_id, type: 'medical_emergency',
            title: `${severity.toUpperCase()} Medical Incident`,
            message: `Location: ${location}`, reference_id: data.id, priority: 'urgent'
          });
        }
      }

      return NextResponse.json({ incident: data }, { status: 201 });
    }

    if (action === 'assign_staff') {
      const { user_id, role, station_id, shift_start, shift_end } = body;

      const { data, error } = await supabase.from('medical_staff').insert({
        event_id, user_id, role, station_id, shift_start, shift_end, status: 'assigned'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ assignment: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status, resolution, transport_required } = body;

    await supabase.from('medical_incidents').update({
      status, resolution, transport_required,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
