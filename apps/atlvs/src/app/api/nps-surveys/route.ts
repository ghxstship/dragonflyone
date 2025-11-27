import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// NPS/satisfaction surveys with trend analysis
export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const period = searchParams.get('period') || '12'; // months

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(period));

    let query = supabase.from('nps_responses').select(`
      *, client:contacts(id, name, company), project:projects(id, name)
    `).gte('submitted_at', startDate.toISOString());

    if (clientId) query = query.eq('client_id', clientId);

    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Calculate NPS
    const promoters = data?.filter(r => r.score >= 9).length || 0;
    const detractors = data?.filter(r => r.score <= 6).length || 0;
    const total = data?.length || 1;
    const nps = Math.round(((promoters - detractors) / total) * 100);

    // Monthly trend
    const monthlyTrend: Record<string, { scores: number[], count: number }> = {};
    data?.forEach(r => {
      const month = r.submitted_at.substring(0, 7);
      if (!monthlyTrend[month]) monthlyTrend[month] = { scores: [], count: 0 };
      monthlyTrend[month].scores.push(r.score);
      monthlyTrend[month].count++;
    });

    const trend = Object.entries(monthlyTrend).map(([month, data]) => ({
      month,
      avg_score: Math.round((data.scores.reduce((s, n) => s + n, 0) / data.count) * 10) / 10,
      responses: data.count,
      nps: calculateNPS(data.scores)
    })).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({
      responses: data,
      nps,
      breakdown: {
        promoters,
        passives: data?.filter(r => r.score >= 7 && r.score <= 8).length || 0,
        detractors,
        total
      },
      trend,
      avg_score: Math.round((data?.reduce((s, r) => s + r.score, 0) || 0) / total * 10) / 10
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    if (action === 'send_survey') {
      const { client_id, project_id, survey_type } = body;

      const surveyToken = Math.random().toString(36).substr(2, 12);

      const { data, error } = await supabase.from('nps_surveys').insert({
        client_id, project_id, survey_type: survey_type || 'project_completion',
        token: surveyToken, status: 'sent', sent_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Queue email
      await supabase.from('email_queue').insert({
        recipient_id: client_id, template: 'nps_survey',
        data: { survey_id: data.id, token: surveyToken }
      });

      return NextResponse.json({ survey: data }, { status: 201 });
    }

    if (action === 'submit_response') {
      const { survey_token, score, feedback, would_recommend } = body;

      const { data: survey } = await supabase.from('nps_surveys').select('*')
        .eq('token', survey_token).single();

      if (!survey) return NextResponse.json({ error: 'Invalid survey' }, { status: 400 });

      const { data, error } = await supabase.from('nps_responses').insert({
        survey_id: survey.id, client_id: survey.client_id, project_id: survey.project_id,
        score, feedback, would_recommend, submitted_at: new Date().toISOString()
      }).select().single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await supabase.from('nps_surveys').update({ status: 'completed' }).eq('id', survey.id);

      return NextResponse.json({ response: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}

function calculateNPS(scores: number[]): number {
  if (scores.length === 0) return 0;
  const promoters = scores.filter(s => s >= 9).length;
  const detractors = scores.filter(s => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}
