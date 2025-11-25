import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Load-out coordination with truck assignments
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('load_out_schedules').select(`
      *, trucks:load_out_trucks(id, truck_number, driver, departure_time, destination, status),
      tasks:load_out_tasks(id, description, assigned_to, sequence, status)
    `).eq('project_id', projectId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ load_out: data });
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
    const { action, project_id } = body;

    if (action === 'create_schedule') {
      const { start_time, trucks, tasks } = body;

      const { data: schedule, error } = await supabase.from('load_out_schedules').insert({
        project_id, start_time, status: 'planned', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add trucks
      if (trucks?.length) {
        const truckRecords = trucks.map((t: any, i: number) => ({
          schedule_id: schedule.id, truck_number: t.truck_number,
          driver: t.driver, departure_time: t.departure_time,
          destination: t.destination, sequence: i + 1, status: 'pending'
        }));
        await supabase.from('load_out_trucks').insert(truckRecords);
      }

      // Add tasks
      if (tasks?.length) {
        const taskRecords = tasks.map((t: any, i: number) => ({
          schedule_id: schedule.id, description: t.description,
          assigned_to: t.assigned_to, sequence: i + 1, status: 'pending'
        }));
        await supabase.from('load_out_tasks').insert(taskRecords);
      }

      return NextResponse.json({ schedule }, { status: 201 });
    }

    if (action === 'assign_truck') {
      const { schedule_id, truck_number, driver, departure_time, destination } = body;
      const { data, error } = await supabase.from('load_out_trucks').insert({
        schedule_id, truck_number, driver, departure_time, destination, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ truck: data }, { status: 201 });
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
    const { id, type, status } = body;

    if (type === 'truck') {
      await supabase.from('load_out_trucks').update({ status }).eq('id', id);
    } else if (type === 'task') {
      await supabase.from('load_out_tasks').update({ status }).eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
