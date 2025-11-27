import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');

    let query = supabase.from('change_orders').select(`
      *, project:projects(id, name),
      requested_by:platform_users!requested_by(id, email, first_name, last_name),
      approved_by:platform_users!approved_by(id, email, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const totalImpact = data?.reduce((sum, co) => sum + (co.cost_impact || 0), 0) || 0;

    return NextResponse.json({
      change_orders: data,
      pending_approval: data?.filter(co => co.status === 'pending') || [],
      total_cost_impact: totalImpact,
      stats: {
        total: data?.length || 0,
        approved: data?.filter(co => co.status === 'approved').length || 0,
        rejected: data?.filter(co => co.status === 'rejected').length || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch change orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, title, description, reason, cost_impact, schedule_impact_days, priority, affected_areas } = body;

    // Generate CO number
    const { count } = await supabase.from('change_orders')
      .select('*', { count: 'exact', head: true }).eq('project_id', project_id);
    const coNumber = `CO-${String((count || 0) + 1).padStart(4, '0')}`;

    const { data, error } = await supabase.from('change_orders').insert({
      project_id, co_number: coNumber, title, description, reason,
      cost_impact, schedule_impact_days, priority: priority || 'medium',
      affected_areas: affected_areas || [], status: 'pending',
      requested_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ change_order: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create change order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, action, rejection_reason, ...updateData } = body;

    if (action === 'approve') {
      const { data: co } = await supabase.from('change_orders').select('project_id, cost_impact').eq('id', id).single();
      
      await supabase.from('change_orders').update({
        status: 'approved', approved_by: user.id, approved_at: new Date().toISOString()
      }).eq('id', id);

      // Update project budget if cost impact
      if (co?.cost_impact) {
        const { data: project } = await supabase.from('projects').select('budget').eq('id', co.project_id).single();
        await supabase.from('projects').update({
          budget: (project?.budget || 0) + co.cost_impact
        }).eq('id', co.project_id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'reject') {
      await supabase.from('change_orders').update({
        status: 'rejected', rejection_reason
      }).eq('id', id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from('change_orders').update(updateData).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update change order' }, { status: 500 });
  }
}
