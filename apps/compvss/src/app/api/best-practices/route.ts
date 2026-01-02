export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createBestPracticeSchema = z.object({
  title: z.string(),
  discipline: z.string(),
  content: z.string().optional(),
  tips: z.array(z.string()).optional(),
  common_mistakes: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
});

// Best practices library by discipline
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
    const discipline = searchParams.get('discipline');
    const search = searchParams.get('search');

    let query = supabase.from('best_practices').select('*').eq('published', true);

    if (discipline) query = query.eq('discipline', discipline);
    if (search) query = query.ilike('title', `%${search}%`);

    const { data, error } = await query.order('title', { ascending: true });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Group by discipline
    interface BestPractice { id: string; title: string; discipline: string }
    const byDiscipline: Record<string, BestPractice[]> = {};
    data?.forEach((bp: BestPractice) => {
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
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = authResult.user?.id;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = createBestPracticeSchema.parse(body);
    const { title, discipline, content, tips, common_mistakes, resources } = validatedData;

    const { data, error } = await supabase.from('best_practices').insert({
      title, discipline, content, tips: tips || [], common_mistakes: common_mistakes || [],
      resources: resources || [], published: false, created_by: userId
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ best_practice: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
