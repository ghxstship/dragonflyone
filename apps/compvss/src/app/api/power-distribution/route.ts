import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Power distribution planning
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('power_plans').select(`
      *, circuits:power_circuits(id, name, amperage, voltage, phase, location, loads)
    `).eq('project_id', projectId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate totals
    const plan = data?.[0];
    const totalAmps = plan?.circuits?.reduce((s: number, c: any) => s + (c.amperage || 0), 0) || 0;

    return NextResponse.json({
      plan,
      totals: {
        circuits: plan?.circuits?.length || 0,
        total_amps: totalAmps,
        available_amps: (plan?.venue_capacity_amps || 0) - totalAmps
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const { action, project_id } = body;

    if (action === 'create_plan') {
      const { venue_capacity_amps, voltage, phases } = body;

      const { data, error } = await supabase.from('power_plans').insert({
        project_id, venue_capacity_amps, voltage, phases, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'add_circuit') {
      const { plan_id, name, amperage, voltage, phase, location, loads } = body;

      const { data, error } = await supabase.from('power_circuits').insert({
        plan_id, name, amperage, voltage, phase, location, loads: loads || []
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ circuit: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
