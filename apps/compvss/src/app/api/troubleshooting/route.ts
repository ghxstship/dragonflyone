import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Troubleshooting guides with decision trees
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const equipment = searchParams.get('equipment');
    const symptom = searchParams.get('symptom');

    let query = supabase.from('troubleshooting_guides').select(`
      *, steps:troubleshooting_steps(id, step_number, question, yes_action, no_action, solution)
    `);

    if (category) query = query.eq('category', category);
    if (equipment) query = query.ilike('equipment_type', `%${equipment}%`);
    if (symptom) query = query.ilike('symptom', `%${symptom}%`);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ guides: data });
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
    const { title, category, equipment_type, symptom, description, steps } = body;

    const { data, error } = await supabase.from('troubleshooting_guides').insert({
      title, category, equipment_type, symptom, description
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (steps?.length) {
      await supabase.from('troubleshooting_steps').insert(
        steps.map((s: any, i: number) => ({
          guide_id: data.id, step_number: i + 1,
          question: s.question, yes_action: s.yes_action,
          no_action: s.no_action, solution: s.solution
        }))
      );
    }

    return NextResponse.json({ guide: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
