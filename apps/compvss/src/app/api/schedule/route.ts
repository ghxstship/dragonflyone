import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ScheduleItemSchema = z.object({
  project_id: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string().optional(),
  venue_id: z.string().uuid().optional(),
  type: z.enum(['load_in', 'setup', 'soundcheck', 'rehearsal', 'show', 'intermission', 'load_out', 'strike', 'meeting', 'break', 'other']),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  crew_roles_required: z.array(z.string()).optional(),
  equipment_required: z.array(z.string()).optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/schedule - List schedule items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const eventId = searchParams.get('event_id');
    const date = searchParams.get('date');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const type = searchParams.get('type');

    let query = supabase
      .from('schedule_items')
      .select(`
        *,
        project:projects(id, name, project_code),
        event:events(id, name),
        venue:venues(id, name),
        assignments:schedule_assignments(
          id,
          crew_member:crew_members(id, full_name, role),
          status
        )
      `)
      .order('start_time', { ascending: true });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (date) {
      query = query
        .gte('start_time', `${date}T00:00:00`)
        .lt('start_time', `${date}T23:59:59`);
    }
    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('end_time', endDate);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching schedule:', error);
      return NextResponse.json(
        { error: 'Failed to fetch schedule', details: error.message },
        { status: 500 }
      );
    }

    interface ScheduleRecord {
      id: string;
      type: string;
      status: string;
      start_time: string;
      [key: string]: unknown;
    }
    const items = (data || []) as unknown as ScheduleRecord[];

    const summary = {
      total: items.length,
      by_type: items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      by_status: {
        scheduled: items.filter(i => i.status === 'scheduled').length,
        in_progress: items.filter(i => i.status === 'in_progress').length,
        completed: items.filter(i => i.status === 'completed').length,
        cancelled: items.filter(i => i.status === 'cancelled').length,
      },
    };

    return NextResponse.json({ schedule: data, summary });
  } catch (error) {
    console.error('Error in GET /api/schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/schedule - Create schedule item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ScheduleItemSchema.parse(body);

    const organizationId = body.organization_id || '00000000-0000-0000-0000-000000000000';
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    const { data: scheduleItem, error } = await supabase
      .from('schedule_items')
      .insert({
        organization_id: organizationId,
        ...validated,
        status: 'scheduled',
        created_by: userId,
      })
      .select(`
        *,
        project:projects(id, name),
        event:events(id, name),
        venue:venues(id, name)
      `)
      .single();

    if (error) {
      console.error('Error creating schedule item:', error);
      return NextResponse.json(
        { error: 'Failed to create schedule item', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(scheduleItem, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/schedule - Bulk update schedule items
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { schedule_ids, action, updates } = body;
    const userId = body.user_id || '00000000-0000-0000-0000-000000000000';

    if (!schedule_ids || !Array.isArray(schedule_ids) || schedule_ids.length === 0) {
      return NextResponse.json(
        { error: 'schedule_ids array is required' },
        { status: 400 }
      );
    }

    let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === 'start') {
      updateData.status = 'in_progress';
      updateData.actual_start_time = new Date().toISOString();
    } else if (action === 'complete') {
      updateData.status = 'completed';
      updateData.actual_end_time = new Date().toISOString();
    } else if (action === 'cancel') {
      updateData.status = 'cancelled';
    } else if (updates) {
      updateData = { ...updateData, ...updates };
    }

    const { data, error } = await supabase
      .from('schedule_items')
      .update(updateData)
      .in('id', schedule_ids)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update schedule items', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
      schedule: data,
    });
  } catch (error) {
    console.error('Error in PATCH /api/schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
