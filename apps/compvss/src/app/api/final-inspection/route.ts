export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createInspectionSchema = z.object({
  action: z.literal('create'),
  project_id: z.string().uuid(),
  areas: z.array(z.string()).optional(),
});

const signInspectionSchema = z.object({
  action: z.literal('sign'),
  project_id: z.string().uuid().optional(),
  inspection_id: z.string().uuid(),
  role: z.string(),
  name: z.string(),
  signature_url: z.string().url(),
});

const inspectionActionSchema = z.union([createInspectionSchema, signInspectionSchema]);

// Final site inspection and sign-off
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

    const { data, error } = await supabase.from('final_inspections').select(`
      *, items:inspection_items(id, area, status, notes, inspector),
      signatures:inspection_signatures(id, role, name, signature_url, signed_at)
    `).eq('project_id', projectId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ inspection: data });
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
    const validatedData = inspectionActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'create') {
      const { project_id, areas } = validatedData as z.infer<typeof createInspectionSchema>;

      const { data, error } = await supabase.from('final_inspections').insert({
        project_id, status: 'in_progress', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      if (areas?.length) {
        await supabase.from('inspection_items').insert(
          areas.map((a: string) => ({ inspection_id: data.id, area: a, status: 'pending' }))
        );
      }

      return NextResponse.json({ inspection: data }, { status: 201 });
    }

    if (action === 'sign') {
      const { inspection_id, role, name, signature_url } = validatedData as z.infer<typeof signInspectionSchema>;

      await supabase.from('inspection_signatures').insert({
        inspection_id, role, name, signature_url, signed_at: new Date().toISOString()
      });

      // Check if all required signatures are present
      const { data: sigs } = await supabase.from('inspection_signatures').select('role')
        .eq('inspection_id', inspection_id);

      const roles = new Set(sigs?.map(s => s.role));
      if (roles.has('venue') && roles.has('production')) {
        await supabase.from('final_inspections').update({
          status: 'completed', completed_at: new Date().toISOString()
        }).eq('id', inspection_id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
