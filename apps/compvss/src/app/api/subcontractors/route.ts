export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const assignSchema = z.object({
  action: z.literal('assign'),
  project_id: z.string().uuid(),
  subcontractor_id: z.string().uuid(),
  scope: z.string().optional(),
  contract_value: z.number().optional(),
});

const rateSchema = z.object({
  action: z.literal('rate'),
  subcontractor_id: z.string().uuid(),
  project_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

const subcontractorActionSchema = z.union([assignSchema, rateSchema]);

// Subcontractor management and performance tracking
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
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Calculate average ratings
    interface RatingEntry { rating: number }
    interface SubcontractorData { ratings?: RatingEntry[] }
    const withRatings = data?.map((s: SubcontractorData) => ({
      ...s,
      avg_rating: s.ratings?.length ? s.ratings.reduce((sum: number, r: RatingEntry) => sum + r.rating, 0) / s.ratings.length : null
    }));

    return NextResponse.json({ subcontractors: withRatings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
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
    const validatedData = subcontractorActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'assign') {
      const { project_id, subcontractor_id, scope, contract_value } = validatedData as z.infer<typeof assignSchema>;
      const { data, error } = await supabase.from('project_subcontractors').insert({
        project_id, subcontractor_id, scope, contract_value, status: 'active'
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ assignment: data }, { status: 201 });
    }

    if (action === 'rate') {
      const { subcontractor_id, project_id, rating, feedback } = validatedData as z.infer<typeof rateSchema>;
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
