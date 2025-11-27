import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// GET - Fetch load-in/load-out schedules
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
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
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    } = body;

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
        created_by: user.id,
      })
      .select()
      .single();

    if (scheduleError) {
      return NextResponse.json({ error: scheduleError.message }, { status: 500 });
    }

    // Add tasks
    if (tasks && tasks.length > 0) {
      const taskRecords = tasks.map((task: any, index: number) => ({
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
      const truckRecords = truck_assignments.map((truck: any) => ({
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schedule_id, task_id, action, ...updateData } = body;

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
        return NextResponse.json({ error: error.message }, { status: 500 });
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}
