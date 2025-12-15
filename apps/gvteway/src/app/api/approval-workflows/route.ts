export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, PlatformRole } from '@ghxstship/config';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const GVTEWAY_ADMIN_ROLES = [
  PlatformRole.GVTEWAY_ADMIN, PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];



// Multi-stage approval workflows
export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const status = searchParams.get('status');

    let query = supabase.from('approval_workflows').select(`
      *, stages:approval_stages(id, name, order, status, approver:platform_users(first_name, last_name), approved_at)
    `);

    if (eventId) query = query.eq('event_id', eventId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return NextResponse.json({ workflows: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workflows: data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('does not exist') || msg.includes('42P01')) {
      return NextResponse.json({ workflows: [] });
    }
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const userRoles = authResult.user?.platformRoles || [];
    if (!GVTEWAY_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    const user = authResult.user;

    const supabase = getSupabaseClient();
    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { event_id, workflow_type, stages } = body;

      const { data, error } = await supabase.from('approval_workflows').insert({
        event_id, workflow_type, status: 'pending', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      interface StageInput { name: string; approver_id: string }
      if (stages?.length) {
        await supabase.from('approval_stages').insert(
          stages.map((s: StageInput, i: number) => ({
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
