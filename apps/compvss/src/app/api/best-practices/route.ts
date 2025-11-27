import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Best practices library by discipline
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const discipline = searchParams.get('discipline');
    const search = searchParams.get('search');

    let query = supabase.from('best_practices').select('*').eq('published', true);

    if (discipline) query = query.eq('discipline', discipline);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Group by discipline
    const byDiscipline: Record<string, any[]> = {};
    data?.forEach(bp => {
      if (!byDiscipline[bp.discipline]) byDiscipline[bp.discipline] = [];
      byDiscipline[bp.discipline].push(bp);
    });

    return NextResponse.json({ best_practices: data, by_discipline: byDiscipline });
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
    const { title, discipline, content, tips, common_mistakes, resources } = body;

    const { data, error } = await supabase.from('best_practices').insert({
      title, discipline, content, tips: tips || [], common_mistakes: common_mistakes || [],
      resources: resources || [], published: false, created_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ best_practice: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
