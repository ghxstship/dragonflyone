import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}


// Lazy getter for supabase client - only accessed at runtime
const supabase = new Proxy({} as ReturnType<typeof getSupabaseClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

// Multi-stage approval workflows
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase.from('approval_workflows').select(`
      *, stages:approval_stages(id, name, order, status, approver:platform_users(first_name, last_name), approved_at)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ workflows: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { event_id, workflow_type, stages } = body;

      const { data, error } = await supabase.from('approval_workflows').insert({
        event_id, workflow_type, status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      if (stages?.length) {
        await supabase.from('approval_stages').insert(
          stages.map((s: any, i: number) => ({
            workflow_id: data.id, name: s.name, order: i + 1,
            approver_id: s.approver_id, status: i === 0 ? 'pending' : 'waiting'
          }))
        );
      }

      return NextResponse.json({ workflow: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { stage_id, comment } = body;

      // Update stage
      await supabase.from('approval_stages').update({
        status: 'approved', approved_at: new Date().toISOString(),
        approver_id: user.id, comment
      }).eq('id', stage_id);

      // Get workflow and check if all stages approved
      const { data: stage } = await supabase.from('approval_stages').select('workflow_id, order').eq('id', stage_id).single();
      const { data: stages } = await supabase.from('approval_stages').select('id, status, order')
        .eq('workflow_id', stage?.workflow_id).order('order', { ascending: true });

      // Activate next stage
      const nextStage = stages?.find(s => s.order === (stage?.order || 0) + 1);
      if (nextStage) {
        await supabase.from('approval_stages').update({ status: 'pending' }).eq('id', nextStage.id);
      } else {
        // All stages complete
        await supabase.from('approval_workflows').update({ status: 'approved' }).eq('id', stage?.workflow_id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reject') {
      const { stage_id, reason } = body;

      await supabase.from('approval_stages').update({
        status: 'rejected', approver_id: user.id, comment: reason
      }).eq('id', stage_id);

      const { data: stage } = await supabase.from('approval_stages').select('workflow_id').eq('id', stage_id).single();
      await supabase.from('approval_workflows').update({ status: 'rejected' }).eq('id', stage?.workflow_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
