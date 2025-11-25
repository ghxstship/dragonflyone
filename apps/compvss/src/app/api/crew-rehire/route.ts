import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rehire recommendations and notes
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const crewMemberId = searchParams.get('crew_member_id');

    let query = supabase.from('rehire_notes').select(`
      *, crew_member:crew_members(id, first_name, last_name),
      project:projects(id, name), noted_by:platform_users(first_name, last_name)
    `);

    if (crewMemberId) query = query.eq('crew_member_id', crewMemberId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const recommended = data?.filter(n => n.recommendation === 'yes') || [];
    const notRecommended = data?.filter(n => n.recommendation === 'no') || [];

    return NextResponse.json({
      notes: data,
      summary: {
        recommended: recommended.length,
        not_recommended: notRecommended.length,
        conditional: data?.filter(n => n.recommendation === 'conditional').length || 0
      }
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
    const { crew_member_id, project_id, recommendation, notes, strengths, areas_for_improvement } = body;

    const { data, error } = await supabase.from('rehire_notes').insert({
      crew_member_id, project_id, recommendation, notes,
      strengths: strengths || [], areas_for_improvement: areas_for_improvement || [],
      noted_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
