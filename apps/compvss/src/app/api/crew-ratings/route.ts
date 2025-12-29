export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createCrewRatingSchema = z.object({
  crew_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  overall_score: z.number().min(1).max(5),
  punctuality: z.number().min(1).max(5).optional(),
  professionalism: z.number().min(1).max(5).optional(),
  skill_level: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  would_rehire: z.boolean().optional(),
  strengths: z.array(z.string()).optional(),
  areas_for_improvement: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

// Crew performance ratings and reviews
const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const crewId = searchParams.get('crew_id');

    let query = supabase.from('crew_ratings').select(`
      *, project:projects(id, name), rated_by:platform_users!rated_by(id, first_name, last_name)
    `);

    if (crewId) query = query.eq('crew_id', crewId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate aggregate scores
    const aggregates = new Map();
    data?.forEach(r => {
      if (!aggregates.has(r.crew_id)) {
        aggregates.set(r.crew_id, { ratings: [], total: 0 });
      }
      const agg = aggregates.get(r.crew_id);
      agg.ratings.push(r);
      agg.total += r.overall_score;
    });

    const crewScores = Array.from(aggregates.entries()).map(([id, data]) => ({
      crew_id: id,
      average_score: Math.round((data.total / data.ratings.length) * 10) / 10,
      total_reviews: data.ratings.length,
      would_rehire_percent: Math.round((data.ratings.filter((r: Record<string, unknown>) => r.would_rehire).length / data.ratings.length) * 100)
    }));

    return NextResponse.json({ ratings: data, crew_scores: crewScores });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createCrewRatingSchema.parse(body);
    const { crew_id, project_id, overall_score, punctuality, professionalism, skill_level, teamwork, communication, would_rehire, strengths, areas_for_improvement, notes } = validatedData;

    const { data, error } = await supabase.from('crew_ratings').insert({
      crew_id, project_id, overall_score, punctuality, professionalism, skill_level,
      teamwork, communication, would_rehire: would_rehire || false,
      strengths: strengths || [], areas_for_improvement: areas_for_improvement || [],
      notes, rated_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Update crew's average rating
    const { data: allRatings } = await supabase.from('crew_ratings').select('overall_score').eq('crew_id', crew_id);
    if (allRatings && allRatings.length > 0) {
      const avgScore = allRatings.reduce((sum, r) => sum + r.overall_score, 0) / allRatings.length;
      await supabase.from('platform_users').update({ average_rating: Math.round(avgScore * 10) / 10 }).eq('id', crew_id);
    }

    return NextResponse.json({ rating: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
  }
}
