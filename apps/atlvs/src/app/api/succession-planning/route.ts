import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Succession planning tools
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('position_id');
    const employeeId = searchParams.get('employee_id');

    if (positionId) {
      const { data } = await supabase.from('succession_plans').select(`
        *, candidates:succession_candidates(
          employee:employees(id, first_name, last_name, title),
          readiness, development_areas, timeline
        )
      `).eq('position_id', positionId).single();

      return NextResponse.json({ plan: data });
    }

    if (employeeId) {
      // Get positions this employee is a candidate for
      const { data } = await supabase.from('succession_candidates').select(`
        *, plan:succession_plans(position:positions(id, title, department))
      `).eq('employee_id', employeeId);

      return NextResponse.json({ candidacies: data });
    }

    const { data, error } = await supabase.from('succession_plans').select(`
      *, position:positions(id, title, department),
      incumbent:employees(id, first_name, last_name),
      candidate_count:succession_candidates(count)
    `).order('risk_level', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ plans: data });
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
    const { action } = body;

    if (action === 'create_plan') {
      const { position_id, incumbent_id, risk_level, target_date, notes } = body;

      const { data, error } = await supabase.from('succession_plans').insert({
        position_id, incumbent_id, risk_level, target_date, notes,
        status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'add_candidate') {
      const { plan_id, employee_id, readiness, development_areas, timeline, notes } = body;

      const { data, error } = await supabase.from('succession_candidates').insert({
        plan_id, employee_id, readiness, development_areas: development_areas || [],
        timeline, notes, added_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ candidate: data }, { status: 201 });
    }

    if (action === 'update_readiness') {
      const { candidate_id, readiness, development_progress, notes } = body;

      await supabase.from('succession_candidates').update({
        readiness, development_progress, notes, updated_at: new Date().toISOString()
      }).eq('id', candidate_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'create_development_plan') {
      const { candidate_id, goals, activities, timeline } = body;

      const { data, error } = await supabase.from('development_plans').insert({
        succession_candidate_id: candidate_id, goals: goals || [],
        activities: activities || [], timeline, status: 'active', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ development_plan: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
