export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const loadTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  department: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
  start_time: z.string().optional(),
  duration_minutes: z.number().min(0).optional(),
  dependencies: z.array(z.string()).optional(),
});

const truckAssignmentSchema = z.object({
  truck_id: z.string().uuid(),
  driver_id: z.string().uuid().optional(),
  arrival_time: z.string().optional(),
  departure_time: z.string().optional(),
  dock_assignment: z.string().optional(),
  contents: z.array(z.string()).optional(),
});

const createScheduleSchema = z.object({
  project_id: z.string().uuid(),
  event_id: z.string().uuid().optional(),
  schedule_type: z.enum(['load_in', 'load_out']),
  scheduled_date: z.string(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  venue_access_time: z.string().optional(),
  tasks: z.array(loadTaskSchema).optional(),
  truck_assignments: z.array(truckAssignmentSchema).optional(),
  staging_areas: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateScheduleSchema = z.object({
  schedule_id: z.string().uuid(),
  task_id: z.string().uuid().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  scheduled_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().optional(),
});

// GET - Fetch load-in/load-out schedules
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const type = searchParams.get('type'); // 'load_in', 'load_out', 'all'

    let query = supabase
      .from('load_schedules')
      .select(`
        *,
        project:projects(id, name),
        event:events(id, name, date),
        tasks:load_schedule_tasks(
          *,
          assigned_crew:platform_users(id, email, first_name, last_name)
        ),
        trucks:truck_assignments(*)
      `);

    if (projectId) query = query.eq('project_id', projectId);
    if (eventId) query = query.eq('event_id', eventId);
    if (type && type !== 'all') query = query.eq('schedule_type', type);

    const { data, error } = await query.order('scheduled_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ schedules: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

// POST - Create load-in/load-out schedule
export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createScheduleSchema.parse(body);
    const {
      project_id,
      event_id,
      schedule_type, // 'load_in', 'load_out'
      scheduled_date,
      start_time,
      end_time,
      venue_access_time,
      tasks,
      truck_assignments,
      staging_areas,
      notes,
    } = validatedData;

    // Create schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('load_schedules')
      .insert({
        project_id,
        event_id,
        schedule_type,
        scheduled_date,
        start_time,
        end_time,
        venue_access_time,
        staging_areas: staging_areas || [],
        notes,
        status: 'scheduled',
        created_by: userId,
      })
      .select()
      .single();

    if (scheduleError) {
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    // Add tasks
    interface LoadTask { title: string; description?: string; department?: string; assigned_to?: string; start_time?: string; duration_minutes?: number; dependencies?: string[] }
    if (tasks && tasks.length > 0) {
      const taskRecords = tasks.map((task: LoadTask, index: number) => ({
        schedule_id: schedule.id,
        title: task.title,
        description: task.description,
        department: task.department,
        assigned_to: task.assigned_to,
        start_time: task.start_time,
        duration_minutes: task.duration_minutes,
        dependencies: task.dependencies || [],
        order_index: index,
        status: 'pending',
      }));

      await supabase.from('load_schedule_tasks').insert(taskRecords);
    }

    // Add truck assignments
    if (truck_assignments && truck_assignments.length > 0) {
      const truckRecords = truck_assignments.map((truck: Record<string, unknown>) => ({
        schedule_id: schedule.id,
        truck_id: truck.truck_id,
        driver_id: truck.driver_id,
        arrival_time: truck.arrival_time,
        departure_time: truck.departure_time,
        dock_assignment: truck.dock_assignment,
        contents: truck.contents || [],
      }));

      await supabase.from('truck_assignments').insert(truckRecords);
    }

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// PATCH - Update schedule or task status
export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateScheduleSchema.parse(body);
    const { schedule_id, task_id, ...updateData } = validatedData;

    if (task_id) {
      // Update task
      const { error } = await supabase
        .from('load_schedule_tasks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', task_id);

      if (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      }

      // Check if all tasks complete
      if (updateData.status === 'completed') {
        const { data: tasks } = await supabase
          .from('load_schedule_tasks')
          .select('status')
          .eq('schedule_id', schedule_id);

        const allComplete = tasks?.every(t => t.status === 'completed');
        if (allComplete) {
          await supabase
            .from('load_schedules')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', schedule_id);
        }
      }

      return NextResponse.json({ success: true });
    }

    // Update schedule
    const { error } = await supabase
      .from('load_schedules')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', schedule_id);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}
