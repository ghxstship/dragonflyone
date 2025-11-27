import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

// Subcontractor management and performance tracking
export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase.from('subcontractors').select(`
      *, projects:project_subcontractors(project:projects(id, name)),
      ratings:subcontractor_ratings(rating, feedback)
    `);

    if (projectId) {
      query = supabase.from('project_subcontractors').select(`
        *, subcontractor:subcontractors(*)
      `).eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate average ratings
    const withRatings = data?.map((s: any) => ({
      ...s,
      avg_rating: s.ratings?.length ? s.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / s.ratings.length : null
    }));

    return NextResponse.json({ subcontractors: withRatings });
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
    const { action } = body;

    if (action === 'assign') {
      const { project_id, subcontractor_id, scope, contract_value } = body;
      const { data, error } = await supabase.from('project_subcontractors').insert({
        project_id, subcontractor_id, scope, contract_value, status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ assignment: data }, { status: 201 });
    }

    if (action === 'rate') {
      const { subcontractor_id, project_id, rating, feedback } = body;
      await supabase.from('subcontractor_ratings').insert({
        subcontractor_id, project_id, rating, feedback, rated_by: user.id
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
