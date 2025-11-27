import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// Client satisfaction and NPS tracking
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let query = supabase.from('nps_surveys').select(`
      *, client:contacts(id, name, company), project:projects(id, name)
    `);

    if (clientId) query = query.eq('client_id', clientId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const scores = data?.map(d => d.score) || [];
    const promoters = scores.filter(s => s >= 9).length;
    const detractors = scores.filter(s => s <= 6).length;
    const total = scores.length;
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    return NextResponse.json({
      surveys: data,
      nps_score: npsScore,
      breakdown: { promoters, passives: total - promoters - detractors, detractors },
      trend: calculateTrend(data || [])
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch NPS data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { client_id, project_id, score, feedback, survey_type } = body;

    const { data, error } = await supabase
      .from('nps_surveys')
      .insert({
        client_id, project_id, score, feedback,
        survey_type: survey_type || 'project_completion',
        created_by: user.id
      })
      .select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ survey: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}

function calculateTrend(surveys: any[]) {
  const byMonth: Record<string, number[]> = {};
  surveys.forEach(s => {
    const month = s.created_at?.substring(0, 7);
    if (month) {
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(s.score);
    }
  });
  return Object.entries(byMonth).map(([month, scores]) => ({
    month,
    avg_score: scores.reduce((a, b) => a + b, 0) / scores.length
  })).sort((a, b) => a.month.localeCompare(b.month));
}
