import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rigging calculations and documentation
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    const { data, error } = await supabase.from('rigging_plans').select(`
      *, points:rigging_points(id, point_id, x, y, z, load_kg, hardware, notes),
      calculations:rigging_calculations(id, type, input_values, result, safety_factor)
    `).eq('project_id', projectId);

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
    const { action, project_id } = body;

    if (action === 'create_plan') {
      const { name, venue_capacity_kg, safety_factor } = body;

      const { data, error } = await supabase.from('rigging_plans').insert({
        project_id, name, venue_capacity_kg, safety_factor: safety_factor || 5,
        status: 'draft', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'add_point') {
      const { plan_id, point_id, x, y, z, load_kg, hardware, notes } = body;

      const { data, error } = await supabase.from('rigging_points').insert({
        plan_id, point_id, x, y, z, load_kg, hardware, notes
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ point: data }, { status: 201 });
    }

    if (action === 'calculate') {
      const { plan_id, type, input_values } = body;

      // Perform calculation based on type
      let result: any = {};
      const safetyFactor = 5;

      if (type === 'point_load') {
        const { load_kg, angle_deg } = input_values;
        const angleRad = (angle_deg || 0) * Math.PI / 180;
        result = {
          vertical_force: load_kg * Math.cos(angleRad),
          horizontal_force: load_kg * Math.sin(angleRad),
          wll_required: load_kg * safetyFactor
        };
      } else if (type === 'bridle') {
        const { load_kg, angle_deg } = input_values;
        const angleRad = (angle_deg || 30) * Math.PI / 180;
        result = {
          leg_load: load_kg / (2 * Math.cos(angleRad)),
          wll_per_leg: (load_kg / (2 * Math.cos(angleRad))) * safetyFactor
        };
      }

      const { data, error } = await supabase.from('rigging_calculations').insert({
        plan_id, type, input_values, result, safety_factor: safetyFactor
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ calculation: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
