export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const uploadSchema = z.object({
  action: z.literal('upload'),
  project_id: z.string().uuid(),
  venue_id: z.string().uuid().optional(),
  name: z.string().min(1),
  file_url: z.string().url(),
  file_type: z.string().optional(),
  scale: z.number().optional(),
});

const annotateSchema = z.object({
  action: z.literal('annotate'),
  plan_id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  label: z.string(),
  type: z.string().optional(),
});

const groundPlanActionSchema = z.union([uploadSchema, annotateSchema]);

// Ground plan uploads and reference
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
    const venueId = searchParams.get('venue_id');

    let query = supabase.from('ground_plans').select(`
      *, uploaded_by:platform_users(first_name, last_name),
      annotations:plan_annotations(id, x, y, label, type)
    `);

    if (projectId) query = query.eq('project_id', projectId);
    if (venueId) query = query.eq('venue_id', venueId);

    const { data, error } = await query.order('version', { ascending: false });
    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({ plans: data });
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
    const validatedData = groundPlanActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'upload') {
      const { project_id, venue_id, name, file_url, file_type, scale } = validatedData as z.infer<typeof uploadSchema>;

      // Get latest version
      const { data: existing } = await supabase.from('ground_plans').select('version')
        .eq('project_id', project_id).order('version', { ascending: false }).limit(1);

      const version = (existing?.[0]?.version || 0) + 1;

      const { data, error } = await supabase.from('ground_plans').insert({
        project_id, venue_id, name, file_url, file_type, scale,
        version, uploaded_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ plan: data }, { status: 201 });
    }

    if (action === 'annotate') {
      const { plan_id, x, y, label, type } = validatedData as z.infer<typeof annotateSchema>;

      const { data, error } = await supabase.from('plan_annotations').insert({
        plan_id, x, y, label, type, created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
      return NextResponse.json({ annotation: data }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
