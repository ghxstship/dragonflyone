import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const incidentSchema = z.object({
  event_id: z.string().uuid(),
  incident_type: z.enum(['medical', 'security', 'technical', 'weather', 'crowd', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  photos: z.array(z.string()).optional(),
  witnesses: z.array(z.string()).optional(),
});

// GET /api/incidents - List event incidents
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');
    const incidentType = searchParams.get('incident_type');
    const severity = searchParams.get('severity');

    let query = supabase
      .from('event_incidents')
      .select(`
        *,
        event:events(id, name),
        reported_by_user:platform_users!reported_by(id, full_name),
        assigned_to_user:platform_users!assigned_to(id, full_name),
        resolved_by_user:platform_users!resolved_by(id, full_name)
      `)
      .order('reported_at', { ascending: false });

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (incidentType) {
      query = query.eq('incident_type', incidentType);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching incidents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch incidents', details: error.message },
        { status: 500 }
      );
    }

    interface IncidentRecord {
      id: string;
      status: string;
      severity: string;
      incident_type: string;
      [key: string]: unknown;
    }
    const incidents = (data || []) as unknown as IncidentRecord[];

    const summary = {
      total: incidents.length,
      by_status: {
        open: incidents.filter(i => i.status === 'open').length,
        in_progress: incidents.filter(i => i.status === 'in_progress').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        escalated: incidents.filter(i => i.status === 'escalated').length,
      },
      by_severity: {
        critical: incidents.filter(i => i.severity === 'critical').length,
        high: incidents.filter(i => i.severity === 'high').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        low: incidents.filter(i => i.severity === 'low').length,
      },
      by_type: incidents.reduce((acc, i) => {
        acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ incidents: data, summary });
  } catch (error) {
    console.error('Error in GET /api/incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/incidents - Report new incident
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = incidentSchema.parse(body);

    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: incident, error } = await supabase
      .from('event_incidents')
      .insert({
        ...validated,
        reported_by: userId,
        status: 'open',
      })
      .select(`
        *,
        event:events(id, name),
        reported_by_user:platform_users!reported_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating incident:', error);
      return NextResponse.json(
        { error: 'Failed to create incident', details: error.message },
        { status: 500 }
      );
    }

    // Send notification for critical/high severity incidents
    if (['critical', 'high'].includes(validated.severity)) {
      await supabase.from('notifications').insert({
        type: 'incident_alert',
        title: `${validated.severity.toUpperCase()} Incident Reported`,
        message: `${validated.title} at ${validated.location || 'Unknown location'}`,
        data: { incident_id: incident.id, event_id: validated.event_id },
        priority: validated.severity === 'critical' ? 'urgent' : 'high',
      });
    }

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/incidents - Update incident status
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { incident_id, action, resolution, assigned_to } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!incident_id) {
      return NextResponse.json({ error: 'incident_id is required' }, { status: 400 });
    }

    let updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'assign':
        if (!assigned_to) {
          return NextResponse.json({ error: 'assigned_to is required' }, { status: 400 });
        }
        updates.assigned_to = assigned_to;
        updates.status = 'in_progress';
        break;
      case 'escalate':
        updates.status = 'escalated';
        break;
      case 'resolve':
        if (!resolution) {
          return NextResponse.json({ error: 'resolution is required' }, { status: 400 });
        }
        updates.status = 'resolved';
        updates.resolution = resolution;
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = userId;
        break;
      case 'reopen':
        updates.status = 'open';
        updates.resolution = null;
        updates.resolved_at = null;
        updates.resolved_by = null;
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('event_incidents')
      .update(updates)
      .eq('id', incident_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update incident', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, incident: data });
  } catch (error) {
    console.error('Error in PATCH /api/incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
