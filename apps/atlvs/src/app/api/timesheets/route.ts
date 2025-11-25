import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const timesheetSchema = z.object({
  employee_id: z.string().uuid(),
  work_date: z.string(),
  project_id: z.string().uuid().optional(),
  department_id: z.string().uuid().optional(),
  clock_in: z.string(),
  clock_out: z.string().optional(),
  break_minutes: z.number().default(0),
  task_description: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/timesheets - List timesheets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employee_id');
    const projectId = searchParams.get('project_id');
    const departmentId = searchParams.get('department_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const payPeriod = searchParams.get('pay_period');

    let query = supabase
      .from('timesheets')
      .select(`
        *,
        employee:employees(id, first_name, last_name, employee_number, department_id, pay_rate),
        project:projects(id, name, project_code),
        department:departments(id, name),
        approved_by_user:platform_users!approved_by(id, full_name)
      `)
      .order('work_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }
    if (startDate) {
      query = query.gte('work_date', startDate);
    }
    if (endDate) {
      query = query.lte('work_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching timesheets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch timesheets', details: error.message },
        { status: 500 }
      );
    }

    interface TimesheetRecord {
      id: string;
      status: string;
      regular_hours: number;
      overtime_hours: number;
      total_hours: number;
      [key: string]: unknown;
    }
    const timesheets = (data || []) as unknown as TimesheetRecord[];

    const summary = {
      total_entries: timesheets.length,
      by_status: {
        draft: timesheets.filter(t => t.status === 'draft').length,
        submitted: timesheets.filter(t => t.status === 'submitted').length,
        approved: timesheets.filter(t => t.status === 'approved').length,
        rejected: timesheets.filter(t => t.status === 'rejected').length,
      },
      total_regular_hours: timesheets.reduce((sum, t) => sum + (t.regular_hours || 0), 0),
      total_overtime_hours: timesheets.reduce((sum, t) => sum + (t.overtime_hours || 0), 0),
      total_hours: timesheets.reduce((sum, t) => sum + (t.total_hours || 0), 0),
    };

    return NextResponse.json({ timesheets: data, summary });
  } catch (error) {
    console.error('Error in GET /api/timesheets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/timesheets - Create timesheet entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = timesheetSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Calculate hours
    let regularHours = 0;
    let overtimeHours = 0;
    let totalHours = 0;

    if (validated.clock_out) {
      const clockIn = new Date(`${validated.work_date}T${validated.clock_in}`);
      const clockOut = new Date(`${validated.work_date}T${validated.clock_out}`);
      const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) - validated.break_minutes;
      totalHours = Math.max(0, totalMinutes / 60);

      if (totalHours <= 8) {
        regularHours = totalHours;
        overtimeHours = 0;
      } else {
        regularHours = 8;
        overtimeHours = totalHours - 8;
      }
    }

    const { data: timesheet, error } = await supabase
      .from('timesheets')
      .insert({
        organization_id: organizationId,
        employee_id: validated.employee_id,
        work_date: validated.work_date,
        project_id: validated.project_id,
        department_id: validated.department_id,
        clock_in: validated.clock_in,
        clock_out: validated.clock_out,
        break_minutes: validated.break_minutes,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        total_hours: totalHours,
        task_description: validated.task_description,
        notes: validated.notes,
        status: 'draft',
        created_by: userId,
      })
      .select(`
        *,
        employee:employees(id, first_name, last_name),
        project:projects(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating timesheet:', error);
      return NextResponse.json(
        { error: 'Failed to create timesheet', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(timesheet, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/timesheets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/timesheets - Bulk submit/approve/reject
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { timesheet_ids, action, notes } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!timesheet_ids || !Array.isArray(timesheet_ids) || timesheet_ids.length === 0) {
      return NextResponse.json(
        { error: 'timesheet_ids array is required' },
        { status: 400 }
      );
    }

    let updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    let fromStatus: string[] = [];

    switch (action) {
      case 'submit':
        updates.status = 'submitted';
        updates.submitted_at = new Date().toISOString();
        fromStatus = ['draft', 'rejected'];
        break;
      case 'approve':
        updates.status = 'approved';
        updates.approved_at = new Date().toISOString();
        updates.approved_by = userId;
        if (notes) updates.approval_notes = notes;
        fromStatus = ['submitted'];
        break;
      case 'reject':
        updates.status = 'rejected';
        updates.rejected_at = new Date().toISOString();
        updates.rejected_by = userId;
        if (notes) updates.rejection_reason = notes;
        fromStatus = ['submitted'];
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('timesheets')
      .update(updates)
      .in('id', timesheet_ids)
      .in('status', fromStatus)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update timesheets', details: error.message },
        { status: 500 }
      );
    }

    // Log activity
    for (const id of timesheet_ids) {
      await supabase.from('timesheet_activity_log').insert({
        timesheet_id: id,
        activity_type: action,
        user_id: userId,
        description: `Timesheet ${action}${notes ? `: ${notes}` : ''}`,
      });
    }

    return NextResponse.json({
      success: true,
      action,
      updated: data?.length || 0,
      timesheets: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/timesheets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
