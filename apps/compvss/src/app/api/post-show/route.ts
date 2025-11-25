import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Post-show reset/strike initiation
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');

    const { data, error } = await supabase.from('post_show_plans').select(`
      *, tasks:post_show_tasks(id, task, department, assigned_to, sequence, status)
    `).eq('event_id', eventId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const completed = data?.tasks?.filter((t: any) => t.status === 'completed').length || 0;
    const total = data?.tasks?.length || 0;

    return NextResponse.json({
      plan: data,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    });
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
    const { action, event_id } = body;

    if (action === 'create_plan') {
      const { plan_type, tasks } = body;

      const { data, error } = await supabase.from('post_show_plans').insert({
        event_id, plan_type: plan_type || 'strike', status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (tasks?.length) {
        await supabase.from('post_show_tasks').insert(
          tasks.map((t: any, i: number) => ({
            plan_id: data.id, task: t.task, department: t.department,
            assigned_to: t.assigned_to, sequence: i + 1, status: 'pending'
          }))
        );
      }

      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'initiate') {
      const { plan_id } = body;

      await supabase.from('post_show_plans').update({
        status: 'in_progress', initiated_at: new Date().toISOString(), initiated_by: user.id
      }).eq('id', plan_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'complete_task') {
      const { task_id } = body;

      await supabase.from('post_show_tasks').update({
        status: 'completed', completed_at: new Date().toISOString(), completed_by: user.id
      }).eq('id', task_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
