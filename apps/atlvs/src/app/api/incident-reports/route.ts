import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const incidentReportSchema = z.object({
  incident_type: z.enum(['workplace_injury', 'property_damage', 'near_miss', 'security_breach', 'data_breach', 'environmental', 'vehicle_accident', 'theft', 'harassment', 'other']),
  severity: z.enum(['minor', 'moderate', 'serious', 'critical']),
  title: z.string().min(1),
  description: z.string().min(1),
  incident_date: z.string(),
  location: z.string().optional(),
  witnesses: z.array(z.string()).optional(),
  injured_parties: z.array(z.object({
    name: z.string(),
    role: z.string().optional(),
    injury_description: z.string().optional(),
    medical_attention: z.boolean().optional(),
  })).optional(),
  property_damage_estimate: z.number().nonnegative().optional(),
  photos: z.array(z.string()).optional(),
});

// GET /api/incident-reports - List incident reports
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const incidentType = searchParams.get('incident_type');
    const severity = searchParams.get('severity');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('incident_reports')
      .select(`
        *,
        reported_by_user:platform_users!reported_by(id, full_name),
        investigated_by_user:platform_users!investigated_by(id, full_name)
      `)
      .order('incident_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (incidentType) {
      query = query.eq('incident_type', incidentType);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }
    if (startDate) {
      query = query.gte('incident_date', startDate);
    }
    if (endDate) {
      query = query.lte('incident_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching incident reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch incident reports', details: error.message },
        { status: 500 }
      );
    }

    interface IncidentRecord {
      id: string;
      status: string;
      severity: string;
      incident_type: string;
      osha_recordable: boolean;
      property_damage_estimate: number;
      [key: string]: unknown;
    }
    const incidents = (data || []) as unknown as IncidentRecord[];

    const summary = {
      total: incidents.length,
      by_status: {
        reported: incidents.filter(i => i.status === 'reported').length,
        investigating: incidents.filter(i => i.status === 'investigating').length,
        pending_review: incidents.filter(i => i.status === 'pending_review').length,
        closed: incidents.filter(i => i.status === 'closed').length,
      },
      by_severity: {
        critical: incidents.filter(i => i.severity === 'critical').length,
        serious: incidents.filter(i => i.severity === 'serious').length,
        moderate: incidents.filter(i => i.severity === 'moderate').length,
        minor: incidents.filter(i => i.severity === 'minor').length,
      },
      by_type: incidents.reduce((acc, i) => {
        acc[i.incident_type] = (acc[i.incident_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      osha_recordable: incidents.filter(i => i.osha_recordable).length,
      total_property_damage: incidents.reduce((sum, i) => sum + (i.property_damage_estimate || 0), 0),
    };

    return NextResponse.json({ incidents: data, summary });
  } catch (error) {
    console.error('Error in GET /api/incident-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/incident-reports - Create incident report
export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const validated = incidentReportSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Generate incident number
    const { data: incidentNumber } = await supabase.rpc('generate_incident_number', {
      org_id: organizationId,
    });

    const { data: incident, error } = await supabase
      .from('incident_reports')
      .insert({
        organization_id: organizationId,
        incident_number: incidentNumber || `INC-${Date.now()}`,
        ...validated,
        reported_by: userId,
        status: 'reported',
      })
      .select(`
        *,
        reported_by_user:platform_users!reported_by(id, full_name)
      `)
      .single();

    if (error) {
      console.error('Error creating incident report:', error);
      return NextResponse.json(
        { error: 'Failed to create incident report', details: error.message },
        { status: 500 }
      );
    }

    // Send notification for serious/critical incidents
    if (['serious', 'critical'].includes(validated.severity)) {
      await supabase.from('notifications').insert({
        type: 'incident_alert',
        title: `${validated.severity.toUpperCase()} Incident Reported`,
        message: `${validated.title} - ${validated.incident_type}`,
        data: { incident_id: incident.id },
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
    console.error('Error in POST /api/incident-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/incident-reports - Update incident report
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const body = await request.json();
    const { incident_id, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!incident_id) {
      return NextResponse.json({ error: 'incident_id is required' }, { status: 400 });
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'start_investigation':
        updateData.status = 'investigating';
        updateData.investigated_by = userId;
        updateData.investigation_date = new Date().toISOString();
        break;
      case 'submit_for_review':
        updateData.status = 'pending_review';
        break;
      case 'close':
        updateData.status = 'closed';
        updateData.closed_by = userId;
        updateData.closed_at = new Date().toISOString();
        break;
      case 'reopen':
        updateData.status = 'investigating';
        updateData.closed_by = null;
        updateData.closed_at = null;
        break;
      case 'file_insurance_claim':
        updateData.insurance_claim_filed = true;
        updateData.insurance_claim_number = updates?.insurance_claim_number;
        break;
      case 'mark_osha_recordable':
        updateData.osha_recordable = true;
        break;
      default:
        if (updates) {
          updateData = { ...updateData, ...updates };
        }
    }

    const { data, error } = await supabase
      .from('incident_reports')
      .update(updateData)
      .eq('id', incident_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update incident report', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, incident: data });
  } catch (error) {
    console.error('Error in PATCH /api/incident-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
