import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const SafetyChecklistSchema = z.object({
  project_id: z.string().uuid(),
  checklist_type: z.enum(['pre_event', 'daily', 'load_in', 'load_out', 'rigging', 'pyro', 'crowd', 'weather', 'custom']),
  items: z.array(z.object({
    item: z.string(),
    category: z.string().optional(),
    is_required: z.boolean().default(true),
  })),
  due_date: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

const IncidentReportSchema = z.object({
  project_id: z.string().uuid(),
  incident_type: z.enum(['injury', 'near_miss', 'property_damage', 'equipment_failure', 'weather', 'crowd', 'other']),
  severity: z.enum(['minor', 'moderate', 'major', 'critical']),
  description: z.string(),
  location: z.string(),
  occurred_at: z.string(),
  witnesses: z.array(z.string()).optional(),
  immediate_actions: z.string().optional(),
  attachments: z.array(z.string()).optional(),
});

// GET /api/safety-compliance - Get safety data
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const action = searchParams.get('action');

    if (action === 'dashboard') {
      // Get safety dashboard
      const { data: openChecklists } = await supabase
        .from('safety_checklists')
        .select('id')
        .eq('status', 'pending');

      const { data: recentIncidents } = await supabase
        .from('incident_reports')
        .select('*')
        .gte('occurred_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('occurred_at', { ascending: false })
        .limit(10);

      const { data: expiringCerts } = await supabase
        .from('crew_certifications')
        .select(`
          *,
          user:platform_users(first_name, last_name)
        `)
        .lte('expiration_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
        .gte('expiration_date', new Date().toISOString())
        .order('expiration_date');

      const { data: expiredCerts } = await supabase
        .from('crew_certifications')
        .select('id')
        .lt('expiration_date', new Date().toISOString());

      // Incident stats by severity
      const severityCounts: Record<string, number> = {
        minor: 0,
        moderate: 0,
        major: 0,
        critical: 0,
      };
      recentIncidents?.forEach(i => {
        severityCounts[i.severity] = (severityCounts[i.severity] || 0) + 1;
      });

      return NextResponse.json({
        dashboard: {
          pending_checklists: openChecklists?.length || 0,
          recent_incidents: recentIncidents?.length || 0,
          expiring_certifications: expiringCerts?.length || 0,
          expired_certifications: expiredCerts?.length || 0,
          incident_severity: severityCounts,
        },
        recent_incidents: recentIncidents || [],
        expiring_certifications: expiringCerts || [],
      });
    }

    if (action === 'checklists' && projectId) {
      const { data: checklists } = await supabase
        .from('safety_checklists')
        .select(`
          *,
          assigned_user:platform_users!assigned_to(first_name, last_name),
          completed_by_user:platform_users!completed_by(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      return NextResponse.json({ checklists: checklists || [] });
    }

    if (action === 'incidents' && projectId) {
      const { data: incidents } = await supabase
        .from('incident_reports')
        .select(`
          *,
          reported_by_user:platform_users!reported_by(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('occurred_at', { ascending: false });

      return NextResponse.json({ incidents: incidents || [] });
    }

    if (action === 'certifications') {
      const crewId = searchParams.get('crew_id');

      let query = supabase
        .from('crew_certifications')
        .select(`
          *,
          user:platform_users(first_name, last_name, email)
        `)
        .order('expiration_date');

      if (crewId) {
        query = query.eq('user_id', crewId);
      }

      const { data: certifications } = await query;

      return NextResponse.json({ certifications: certifications || [] });
    }

    if (action === 'safety_briefings' && projectId) {
      const { data: briefings } = await supabase
        .from('safety_briefings')
        .select(`
          *,
          attendees:safety_briefing_attendees(
            user:platform_users(first_name, last_name)
          )
        `)
        .eq('project_id', projectId)
        .order('scheduled_at', { ascending: false });

      return NextResponse.json({ briefings: briefings || [] });
    }

    // Default: Get project safety overview
    if (projectId) {
      const { data: checklists } = await supabase
        .from('safety_checklists')
        .select('status')
        .eq('project_id', projectId);

      const { data: incidents } = await supabase
        .from('incident_reports')
        .select('severity')
        .eq('project_id', projectId);

      const completedChecklists = checklists?.filter(c => c.status === 'completed').length || 0;
      const totalChecklists = checklists?.length || 0;

      return NextResponse.json({
        project_safety: {
          checklists_completed: completedChecklists,
          checklists_total: totalChecklists,
          completion_rate: totalChecklists > 0 ? (completedChecklists / totalChecklists * 100).toFixed(1) : 0,
          incidents: incidents?.length || 0,
          critical_incidents: incidents?.filter(i => i.severity === 'critical').length || 0,
        },
      });
    }

    return NextResponse.json({ error: 'Project ID or action required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch safety data' }, { status: 500 });
  }
}

// POST /api/safety-compliance - Create checklist, incident, or briefing
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
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
    const action = body.action || 'create_checklist';

    if (action === 'create_checklist') {
      const validated = SafetyChecklistSchema.parse(body);

      const { data: checklist, error } = await supabase
        .from('safety_checklists')
        .insert({
          ...validated,
          status: 'pending',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ checklist }, { status: 201 });
    } else if (action === 'complete_checklist') {
      const { checklist_id, responses, notes } = body;

      const { data: checklist, error } = await supabase
        .from('safety_checklists')
        .update({
          status: 'completed',
          responses,
          notes,
          completed_by: user.id,
          completed_at: new Date().toISOString(),
        })
        .eq('id', checklist_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Check for any failed items
      const failedItems = responses?.filter((r: any) => r.passed === false) || [];
      if (failedItems.length > 0) {
        // Create notification for safety manager
        await supabase.from('unified_notifications').insert({
          user_id: user.id,
          title: 'Safety Checklist Issues',
          message: `${failedItems.length} items failed in safety checklist`,
          type: 'warning',
          priority: 'high',
          source_platform: 'compvss',
          source_entity_type: 'safety_checklist',
          source_entity_id: checklist_id,
        });
      }

      return NextResponse.json({ checklist });
    } else if (action === 'report_incident') {
      const validated = IncidentReportSchema.parse(body);

      const { data: incident, error } = await supabase
        .from('incident_reports')
        .insert({
          ...validated,
          status: 'reported',
          reported_by: user.id,
          reported_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Send notifications based on severity
      if (validated.severity === 'critical' || validated.severity === 'major') {
        // Get safety managers
        const { data: safetyManagers } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'safety_manager');

        for (const manager of safetyManagers || []) {
          await supabase.from('unified_notifications').insert({
            user_id: manager.user_id,
            title: `${validated.severity.toUpperCase()} Incident Reported`,
            message: `${validated.incident_type}: ${validated.description.slice(0, 100)}...`,
            type: 'error',
            priority: 'urgent',
            source_platform: 'compvss',
            source_entity_type: 'incident_report',
            source_entity_id: incident.id,
            link: `/safety/incidents/${incident.id}`,
          });
        }
      }

      return NextResponse.json({ incident }, { status: 201 });
    } else if (action === 'schedule_briefing') {
      const { project_id, title, scheduled_at, location, agenda, required_attendees } = body;

      const { data: briefing, error } = await supabase
        .from('safety_briefings')
        .insert({
          project_id,
          title,
          scheduled_at,
          location,
          agenda,
          status: 'scheduled',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Add required attendees
      if (required_attendees?.length > 0) {
        const attendeeRecords = required_attendees.map((userId: string) => ({
          briefing_id: briefing.id,
          user_id: userId,
          is_required: true,
        }));

        await supabase.from('safety_briefing_attendees').insert(attendeeRecords);

        // Notify attendees
        for (const userId of required_attendees) {
          await supabase.from('unified_notifications').insert({
            user_id: userId,
            title: 'Safety Briefing Scheduled',
            message: `You are required to attend: ${title}`,
            type: 'action_required',
            priority: 'high',
            source_platform: 'compvss',
            source_entity_type: 'safety_briefing',
            source_entity_id: briefing.id,
          });
        }
      }

      return NextResponse.json({ briefing }, { status: 201 });
    } else if (action === 'record_attendance') {
      const { briefing_id, attendee_ids, notes } = body;

      // Update briefing status
      await supabase
        .from('safety_briefings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq('id', briefing_id);

      // Record attendance
      for (const userId of attendee_ids) {
        await supabase
          .from('safety_briefing_attendees')
          .upsert({
            briefing_id,
            user_id: userId,
            attended: true,
            attended_at: new Date().toISOString(),
          }, { onConflict: 'briefing_id,user_id' });
      }

      return NextResponse.json({ success: true, attendees_recorded: attendee_ids.length });
    } else if (action === 'add_certification') {
      const { user_id, certification_type, certification_number, issued_date, expiration_date, issuing_authority } = body;

      const { data: cert, error } = await supabase
        .from('crew_certifications')
        .insert({
          user_id,
          certification_type,
          certification_number,
          issued_date,
          expiration_date,
          issuing_authority,
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ certification: cert }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// PATCH /api/safety-compliance - Update incident or checklist
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const incidentId = searchParams.get('incident_id');
    const checklistId = searchParams.get('checklist_id');

    const body = await request.json();

    if (incidentId) {
      const { data: incident, error } = await supabase
        .from('incident_reports')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', incidentId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ incident });
    }

    if (checklistId) {
      const { data: checklist, error } = await supabase
        .from('safety_checklists')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', checklistId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ checklist });
    }

    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
