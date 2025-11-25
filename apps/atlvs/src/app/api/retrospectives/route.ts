import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Project retrospectives and lessons learned
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const category = searchParams.get('category');

    let query = supabase.from('retrospectives').select(`
      *, project:projects(id, name), facilitator:platform_users(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Aggregate lessons learned
    const lessons = data?.flatMap(r => r.lessons_learned || []) || [];

    return NextResponse.json({
      retrospectives: data,
      lessons_learned: lessons,
      categories: [...new Set(data?.map(r => r.category) || [])]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch retrospectives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { project_id, category, what_went_well, what_could_improve, action_items, lessons_learned, participants } = body;

    const { data, error } = await supabase.from('retrospectives').insert({
      project_id, category, what_went_well: what_went_well || [],
      what_could_improve: what_could_improve || [], action_items: action_items || [],
      lessons_learned: lessons_learned || [], participants: participants || [],
      facilitator_id: user.id, conducted_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ retrospective: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create retrospective' }, { status: 500 });
  }
}
