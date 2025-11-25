import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schema
const timeEntrySchema = z.object({
  crew_member_id: z.string().uuid().optional(),
  employee_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  event_id: z.string().optional(),
  task_description: z.string().optional(),
  role: z.string().optional(),
  clock_in_time: z.string(), // ISO timestamp
  clock_out_time: z.string().optional(),
  break_duration_minutes: z.number().default(0),
  hourly_rate: z.number().optional(),
  notes: z.string().optional(),
}).refine((data) => data.crew_member_id || data.employee_id, {
  message: "Either crew_member_id or employee_id must be provided",
});

// GET /api/timekeeping - List time entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const crewMemberId = searchParams.get('crew_member_id');
    const projectId = searchParams.get('project_id');
    const periodStart = searchParams.get('period_start');
    const periodEnd = searchParams.get('period_end');

    let query = supabase
      .from('time_entries')
      .select(`
        *,
        crew_member:crew_members(id, full_name),
        employee:employees(id, full_name),
        project:projects(id, name),
        approved_by_user:platform_users!approved_by(id, full_name)
      `)
      .order('clock_in_time', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (crewMemberId) {
      query = query.eq('crew_member_id', crewMemberId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (periodStart && periodEnd) {
      query = query
        .gte('clock_in_time', periodStart)
        .lte('clock_in_time', periodEnd);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time entries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch time entries', details: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const summary = {
      total_entries: data.length,
      total_hours: data.reduce((sum, entry) => sum + Number(entry.total_hours || 0), 0),
      total_cost: data.reduce((sum, entry) => sum + Number(entry.total_cost || 0), 0),
      by_status: {
        pending: data.filter(e => e.status === 'pending').length,
        approved: data.filter(e => e.status === 'approved').length,
        rejected: data.filter(e => e.status === 'rejected').length,
        paid: data.filter(e => e.status === 'paid').length,
      },
      overtime_hours: data.reduce((sum, entry) => sum + Number(entry.overtime_hours || 0), 0),
      regular_hours: data.reduce((sum, entry) => sum + Number(entry.regular_hours || 0), 0),
    };

    return NextResponse.json({
      entries: data,
      summary,
    });
  } catch (error) {
    console.error('Error in GET /api/timekeeping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/timekeeping - Clock in/create time entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = timeEntrySchema.parse(body);

    // TODO: Get organization_id from auth session
    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    // Calculate hours if clock_out_time is provided
    let calculatedHours = {};
    if (validated.clock_out_time) {
      const clockIn = new Date(validated.clock_in_time);
      const clockOut = new Date(validated.clock_out_time);
      const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) - validated.break_duration_minutes;
      const workHours = totalMinutes / 60;

      // Simple calculation (can be enhanced with labor rules)
      if (workHours <= 8) {
        calculatedHours = {
          regular_hours: workHours.toFixed(2),
          overtime_hours: 0,
          double_time_hours: 0,
        };
      } else if (workHours <= 12) {
        calculatedHours = {
          regular_hours: 8,
          overtime_hours: (workHours - 8).toFixed(2),
          double_time_hours: 0,
        };
      } else {
        calculatedHours = {
          regular_hours: 8,
          overtime_hours: 4,
          double_time_hours: (workHours - 12).toFixed(2),
        };
      }

      // Calculate rates if hourly_rate is provided
      if (validated.hourly_rate) {
        calculatedHours = {
          ...calculatedHours,
          overtime_rate: validated.hourly_rate * 1.5,
          double_time_rate: validated.hourly_rate * 2,
        };
      }
    }

    const { data, error } = await supabase
      .from('time_entries')
      .insert([
        {
          ...validated,
          ...calculatedHours,
          organization_id: organizationId,
          created_by: userId,
          status: validated.clock_out_time ? 'pending' : 'pending', // Can be submitted immediately if clocked out
        },
      ])
      .select(`
        *,
        crew_member:crew_members(id, full_name),
        employee:employees(id, full_name),
        project:projects(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating time entry:', error);
      return NextResponse.json(
        { error: 'Failed to create time entry', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/timekeeping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/timekeeping - Bulk approve/reject time entries
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_ids, action, notes } = body;

    if (!entry_ids || !Array.isArray(entry_ids) || entry_ids.length === 0) {
      return NextResponse.json(
        { error: 'entry_ids array is required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be approve or reject' },
        { status: 400 }
      );
    }

    // TODO: Get user from auth session
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const updates: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = userId;
    }

    if (notes) {
      updates.approval_notes = notes;
    }

    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .in('id', entry_ids)
      .eq('status', 'pending') // Only update pending entries
      .select();

    if (error) {
      console.error('Error updating time entries:', error);
      return NextResponse.json(
        { error: 'Failed to update time entries', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action,
      updated: data.length,
      entries: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/timekeeping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
