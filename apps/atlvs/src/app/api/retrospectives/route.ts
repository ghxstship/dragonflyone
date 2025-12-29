export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createRetrospectiveSchema = z.object({
  project_id: z.string().uuid(),
  category: z.string().optional(),
  what_went_well: z.array(z.string()).optional(),
  what_could_improve: z.array(z.string()).optional(),
  action_items: z.array(z.string()).optional(),
  lessons_learned: z.array(z.string()).optional(),
  participants: z.array(z.string().uuid()).optional(),
});

// Project retrospectives and lessons learned
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
    const projectId = searchParams.get('project_id');
    const category = searchParams.get('category');

    let query = supabase.from('retrospectives').select(`
      *, project:projects(id, name), facilitator:platform_users(id, first_name, last_name)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (category) query = query.eq('category', category);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Aggregate lessons learned
    const lessons = data?.flatMap(r => r.lessons_learned || []) || [];

    return NextResponse.json({
      retrospectives: data,
      lessons_learned: lessons,
      categories: [...new Set(data?.map(r => r.category) || [])]
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch retrospectives' }, { status: 500 });
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
    const validatedData = createRetrospectiveSchema.parse(body);
    const { project_id, category, what_went_well, what_could_improve, action_items, lessons_learned, participants } = validatedData;

    const { data, error } = await supabase.from('retrospectives').insert({
      project_id, category, what_went_well: what_went_well || [],
      what_could_improve: what_could_improve || [], action_items: action_items || [],
      lessons_learned: lessons_learned || [], participants: participants || [],
      facilitator_id: user.id, conducted_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ retrospective: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create retrospective' }, { status: 500 });
  }
}
