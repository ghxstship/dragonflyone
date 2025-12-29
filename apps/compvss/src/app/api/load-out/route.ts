export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createScheduleSchema = z.object({
  action: z.literal('create_schedule'),
  project_id: z.string().uuid(),
  start_time: z.string(),
  trucks: z.array(z.object({
    truck_number: z.string(),
    driver: z.string().optional(),
    departure_time: z.string().optional(),
    destination: z.string().optional(),
  })).optional(),
  tasks: z.array(z.object({
    description: z.string(),
    assigned_to: z.string().optional(),
  })).optional(),
});

const assignTruckSchema = z.object({
  action: z.literal('assign_truck'),
  project_id: z.string().uuid().optional(),
  schedule_id: z.string().uuid(),
  truck_number: z.string(),
  driver: z.string().optional(),
  departure_time: z.string().optional(),
  destination: z.string().optional(),
});

const loadOutActionSchema = z.union([createScheduleSchema, assignTruckSchema]);

const patchLoadOutSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['truck', 'task']),
  status: z.string(),
});

// Load-out coordination with truck assignments
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

    const { data, error } = await supabase.from('load_out_schedules').select(`
      *, trucks:load_out_trucks(id, truck_number, driver, departure_time, destination, status),
      tasks:load_out_tasks(id, description, assigned_to, sequence, status)
    `).eq('project_id', projectId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ load_out: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = loadOutActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create_schedule') {
      const { project_id, start_time, trucks, tasks } = validatedData as z.infer<typeof createScheduleSchema>;

      const { data: schedule, error } = await supabase.from('load_out_schedules').insert({
        project_id, start_time, status: 'planned', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Add trucks
      interface TruckEntry { truck_number: string; driver?: string; departure_time?: string; destination?: string }
      if (trucks?.length) {
        const truckRecords = trucks.map((t: TruckEntry, i: number) => ({
          schedule_id: schedule.id, truck_number: t.truck_number,
          driver: t.driver, departure_time: t.departure_time,
          destination: t.destination, sequence: i + 1, status: 'pending'
        }));
        await supabase.from('load_out_trucks').insert(truckRecords);
      }

      // Add tasks
      interface TaskEntry { description: string; assigned_to?: string }
      if (tasks?.length) {
        const taskRecords = tasks.map((t: TaskEntry, i: number) => ({
          schedule_id: schedule.id, description: t.description,
          assigned_to: t.assigned_to, sequence: i + 1, status: 'pending'
        }));
        await supabase.from('load_out_tasks').insert(taskRecords);
      }

      return NextResponse.json({ schedule }, { status: 201 });
    }

    if (action === 'assign_truck') {
      const { schedule_id, truck_number, driver, departure_time, destination } = validatedData as z.infer<typeof assignTruckSchema>;
      const { data, error } = await supabase.from('load_out_trucks').insert({
        schedule_id, truck_number, driver, departure_time, destination, status: 'pending'
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ truck: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const validatedData = patchLoadOutSchema.parse(body);
    const { id, type, status } = validatedData;

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
