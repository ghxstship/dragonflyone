export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createNpsSurveySchema = z.object({
  client_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  score: z.number().min(0).max(10),
  feedback: z.string().optional(),
  survey_type: z.string().optional(),
});

// Client satisfaction and NPS tracking
const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    let query = supabase.from('nps_surveys').select(`
      *, client:contacts(id, name, company), project:projects(id, name)
    `);

    if (clientId) query = query.eq('client_id', clientId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createNpsSurveySchema.parse(body);

    const { data, error } = await supabase
      .from('nps_surveys')
      .insert({
        client_id: validatedData.client_id,
        project_id: validatedData.project_id,
        score: validatedData.score,
        feedback: validatedData.feedback,
        survey_type: validatedData.survey_type || 'project_completion',
        created_by: user.id
      })
      .select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ survey: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 });
  }
}

function calculateTrend(surveys: unknown[]) {
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
