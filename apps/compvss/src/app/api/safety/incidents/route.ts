import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const IncidentSchema = z.object({
  incident_type: z.enum(['near_miss', 'equipment_malfunction', 'injury', 'property_damage', 'environmental', 'security', 'fire', 'other']),
  title: z.string().min(5),
  description: z.string().min(10),
  location: z.string().min(1),
  event_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  venue_id: z.string().uuid().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  injuries_count: z.number().int().nonnegative().default(0),
  witnesses: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  immediate_actions: z.string().optional(),
  root_cause: z.string().optional(),
  corrective_actions: z.string().optional(),
});

// GET /api/safety/incidents - List safety incidents
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const incidentType = searchParams.get('incident_type');
    const eventId = searchParams.get('event_id');
    const projectId = searchParams.get('project_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    let query = supabase
      .from('safety_incidents')
      .select(`
        *,
        event:events(id, name),
        project:projects(id, name),
        venue:venues(id, name),
        reported_by_user:platform_users!reported_by(id, full_name),
        assigned_to_user:platform_users!assigned_to(id, full_name),
        investigations:safety_investigations(id, status, findings)
      `)
      .order('incident_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }
    if (incidentType && incidentType !== 'all') {
      query = query.eq('incident_type', incidentType);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (dateFrom) {
      query = query.gte('incident_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('incident_date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching safety incidents:', error);
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
      injuries_count: number;
      [key: string]: unknown;
    }
    const incidents = (data || []) as unknown as IncidentRecord[];

    const summary = {
      total: incidents.length,
      by_status: {
        reported: incidents.filter(i => i.status === 'reported').length,
        investigating: incidents.filter(i => i.status === 'investigating').length,
        resolved: incidents.filter(i => i.status === 'resolved').length,
        closed: incidents.filter(i => i.status === 'closed').length,
      },
      by_severity: {
        low: incidents.filter(i => i.severity === 'low').length,
        medium: incidents.filter(i => i.severity === 'medium').length,
        high: incidents.filter(i => i.severity === 'high').length,
        critical: incidents.filter(i => i.severity === 'critical').length,
      },
      by_type: incidents.reduce((acc, i) => {
        acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_injuries: incidents.reduce((sum, i) => sum + (i.injuries_count || 0), 0),
    };

    return NextResponse.json({ incidents: data, summary });
  } catch (error) {
    console.error('Error in GET /api/safety/incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/safety/incidents - Report new incident
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const validated = IncidentSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate incident number
    const { count } = await supabase
      .from('safety_incidents')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    const incidentNumber = `INC-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data: incident, error } = await supabase
      .from('safety_incidents')
      .insert({
        organization_id: organizationId,
        incident_number: incidentNumber,
        ...validated,
        incident_date: new Date().toISOString(),
        status: 'reported',
        reported_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating safety incident:', error);
      return NextResponse.json(
        { error: 'Failed to report incident', details: error.message },
        { status: 500 }
      );
    }

    // Create notification for safety team
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'safety_incident',
      title: `New Safety Incident: ${incidentNumber}`,
      message: `${validated.incident_type} incident reported at ${validated.location}`,
      data: { incident_id: incident.id, severity: validated.severity },
      priority: validated.severity === 'critical' ? 'high' : 'medium',
    });

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/safety/incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/safety/incidents - Update incident or start investigation
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const body = await request.json();
    const { incident_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!incident_id) {
      return NextResponse.json({ error: 'incident_id is required' }, { status: 400 });
    }

    if (action === 'start_investigation') {
      // Update incident status
      await supabase
        .from('safety_incidents')
        .update({
          status: 'investigating',
          assigned_to: userId,
          investigation_started_at: new Date().toISOString(),
        })
        .eq('id', incident_id);

      // Create investigation record
      const { data: investigation, error } = await supabase
        .from('safety_investigations')
        .insert({
          incident_id,
          investigator_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to start investigation', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, investigation });
    }

    if (action === 'resolve') {
      const { error } = await supabase
        .from('safety_incidents')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          resolution_notes: updates?.resolution_notes,
          corrective_actions: updates?.corrective_actions,
        })
        .eq('id', incident_id);

      if (error) {
        return NextResponse.json(
          { error: 'Failed to resolve incident', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, message: 'Incident resolved' });
    }

    // Regular update
    if (updates) {
      const { data, error } = await supabase
        .from('safety_incidents')
        .update({ ...updates, updated_at: new Date().toISOString() })
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
    }

    return NextResponse.json({ error: 'No action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/safety/incidents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
