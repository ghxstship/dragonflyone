import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Set change coordination and timing
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('set_changes').select(`
      *, tasks:set_change_tasks(id, task, assigned_to, sequence, status)
    `).eq('event_id', eventId).order('sequence', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ set_changes: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { event_id, sequence, from_set, to_set, duration_minutes, tasks } = body;

    const { data, error } = await supabase.from('set_changes').insert({
      event_id, sequence, from_set, to_set, duration_minutes, status: 'planned'
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (tasks?.length) {
      await supabase.from('set_change_tasks').insert(
        tasks.map((t: any, i: number) => ({
          set_change_id: data.id, task: t.task, assigned_to: t.assigned_to, sequence: i + 1, status: 'pending'
        }))
      );
    }

    return NextResponse.json({ set_change: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, status, actual_start, actual_end } = body;

    await supabase.from('set_changes').update({
      status, actual_start, actual_end,
      actual_duration: actual_start && actual_end ? 
        Math.round((new Date(actual_end).getTime() - new Date(actual_start).getTime()) / 60000) : null
    }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
