export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
];

const timesheetSchema = z.object({
  person_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  date: z.string().datetime(),
  hours_worked: z.number().positive().max(24),
  hourly_rate: z.number().positive().optional(),
  description: z.string().optional(),
  task_type: z.string().optional(),
  billable: z.boolean().default(true),
});

// GET /api/timesheets - List timesheets
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const personId = searchParams.get('person_id');
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const statusFilter = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('chronicle_profile_timesheet')
      .select(`
        *,
        person:legend_people(id, first_name, last_name, email),
        project:projects(id, name, code),
        event:legend_events(id, name)
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (personId) {
      query = query.eq('person_id', personId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ 
          timesheets: [], 
          total: 0, 
          limit, 
          offset,
          summary: { total: 0, total_hours: 0, billable_hours: 0, total_amount: 0 }
        });
      }
      logger.error('Error fetching timesheets:', error);
      return NextResponse.json({ error: 'Failed to fetch timesheets' }, { status: 500 });
    }

    const timesheets = data || [];
    const summary = {
      total: count || 0,
      total_hours: timesheets.reduce((sum, t) => sum + (t.hours_worked || 0), 0),
      billable_hours: timesheets
        .filter(t => t.billable)
        .reduce((sum, t) => sum + (t.hours_worked || 0), 0),
      non_billable_hours: timesheets
        .filter(t => !t.billable)
        .reduce((sum, t) => sum + (t.hours_worked || 0), 0),
      total_amount: timesheets.reduce((sum, t) => 
        sum + ((t.hours_worked || 0) * (t.hourly_rate || 0)), 0),
      by_status: timesheets.reduce((acc, t) => {
        const status = t.status || 'draft';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ timesheets, total: count, limit, offset, summary });
  } catch (error) {
    logger.error('Error in GET /api/timesheets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/timesheets - Create timesheet entry
export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = timesheetSchema.parse(body);

    const { data: timesheet, error } = await supabase
      .from('chronicle_profile_timesheet')
      .insert({
        organization_id: body.organization_id || '00000000-0000-0000-0000-000000000001',
        person_id: validated.person_id,
        project_id: validated.project_id,
        event_id: validated.event_id,
        date: validated.date,
        hours_worked: validated.hours_worked,
        hourly_rate: validated.hourly_rate,
        description: validated.description,
        task_type: validated.task_type,
        billable: validated.billable,
        status: 'draft',
        created_by: authResult.user?.id,
      })
      .select(`
        *,
        person:legend_people(id, first_name, last_name)
      `)
      .single();

    if (error) {
      logger.error('Error creating timesheet:', error);
      return NextResponse.json({ error: 'Failed to create timesheet', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ timesheet }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in POST /api/timesheets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/timesheets - Update timesheet or change status
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { timesheet_id, updates, action } = body;

    if (!timesheet_id) {
      return NextResponse.json({ error: 'timesheet_id is required' }, { status: 400 });
    }

    const userRoles = authResult.user?.platformRoles || [];

    if (action === 'submit') {
      updates.status = 'submitted';
      updates.submitted_at = new Date().toISOString();
    } else if (action === 'approve') {
      if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
      updates.status = 'approved';
      updates.approved_by = authResult.user?.id;
      updates.approved_at = new Date().toISOString();
    } else if (action === 'reject') {
      if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
      updates.status = 'rejected';
      updates.rejection_reason = body.rejection_reason;
    }

    const { data: timesheet, error } = await supabase
      .from('chronicle_profile_timesheet')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', timesheet_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update timesheet' }, { status: 500 });
    }

    return NextResponse.json({ success: true, timesheet });
  } catch (error) {
    logger.error('Error in PATCH /api/timesheets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/timesheets - Delete timesheet entry
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const timesheetId = searchParams.get('id');

    if (!timesheetId) {
      return NextResponse.json({ error: 'Timesheet ID required' }, { status: 400 });
    }

    // Check if timesheet is in draft status
    const { data: timesheet } = await supabase
      .from('chronicle_profile_timesheet')
      .select('status, created_by')
      .eq('id', timesheetId)
      .single();

    if (!timesheet) {
      return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 });
    }

    if (timesheet.status !== 'draft') {
      return NextResponse.json({ error: 'Can only delete draft timesheets' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chronicle_profile_timesheet')
      .delete()
      .eq('id', timesheetId);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete timesheet' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Timesheet deleted' });
  } catch (error) {
    logger.error('Error in DELETE /api/timesheets:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
