import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Emergency response procedures
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const emergencyType = searchParams.get('type');
    const venueId = searchParams.get('venue_id');

    let query = supabase.from('emergency_procedures').select(`
      *, steps:procedure_steps(id, step_number, action, responsible_party)
    `);

    if (emergencyType) query = query.eq('emergency_type', emergencyType);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query.order('emergency_type', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ procedures: data });
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
    const { venue_id, emergency_type, title, description, contact_tree, evacuation_routes, steps } = body;

    const { data, error } = await supabase.from('emergency_procedures').insert({
      venue_id, emergency_type, title, description,
      contact_tree: contact_tree || [], evacuation_routes: evacuation_routes || [],
      created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (steps?.length) {
      await supabase.from('procedure_steps').insert(
        steps.map((s: any, i: number) => ({
          procedure_id: data.id, step_number: i + 1,
          action: s.action, responsible_party: s.responsible_party
        }))
      );
    }

    return NextResponse.json({ procedure: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
