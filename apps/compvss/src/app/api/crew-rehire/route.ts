export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createRehireNoteSchema = z.object({
  crew_member_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  recommendation: z.string(),
  notes: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  areas_for_improvement: z.array(z.string()).optional(),
});

// Rehire recommendations and notes
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
    const crewMemberId = searchParams.get('crew_member_id');

    let query = supabase.from('rehire_notes').select(`
      *, crew_member:crew_members(id, first_name, last_name),
      project:projects(id, name), noted_by:platform_users(first_name, last_name)
    `);

    if (crewMemberId) query = query.eq('crew_member_id', crewMemberId);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

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
    const validatedData = createRehireNoteSchema.parse(body);
    const { crew_member_id, project_id, recommendation, notes, strengths, areas_for_improvement } = validatedData;

    const { data, error } = await supabase.from('rehire_notes').insert({
      crew_member_id, project_id, recommendation, notes,
      strengths: strengths || [], areas_for_improvement: areas_for_improvement || [],
      noted_by: user.id
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ note: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
