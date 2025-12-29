export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const scheduleSchema = z.object({
  action: z.literal('schedule'),
  project_id: z.string().uuid(),
  scheduled_at: z.string(),
  client_contacts: z.array(z.string()).optional(),
  areas: z.array(z.string()).optional(),
});

const approveSchema = z.object({
  action: z.literal('approve'),
  project_id: z.string().uuid().optional(),
  walkthrough_id: z.string().uuid(),
  signature_url: z.string().url().optional(),
  notes: z.string().optional(),
});

const walkthroughActionSchema = z.union([scheduleSchema, approveSchema]);

// Client walk-through and approval process
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

    const { data, error } = await supabase.from('client_walkthroughs').select(`
      *, items:walkthrough_items(id, area, status, notes, photos),
      approvals:walkthrough_approvals(id, approved_by, approved_at, signature_url)
    `).eq('project_id', projectId).order('scheduled_at', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    return NextResponse.json({ walkthroughs: data });
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
    const validatedData = walkthroughActionSchema.parse(body);
    const { action } = validatedData;

    if (action === 'schedule') {
      const { project_id, scheduled_at, client_contacts, areas } = validatedData as z.infer<typeof scheduleSchema>;

      const { data, error } = await supabase.from('client_walkthroughs').insert({
        project_id, scheduled_at, client_contacts: client_contacts || [],
        status: 'scheduled', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      // Add areas to check
      if (areas?.length) {
        await supabase.from('walkthrough_items').insert(
          areas.map((a: string) => ({ walkthrough_id: data.id, area: a, status: 'pending' }))
        );
      }

      return NextResponse.json({ walkthrough: data }, { status: 201 });
    }

    if (action === 'approve') {
      const { walkthrough_id, signature_url, notes } = validatedData as z.infer<typeof approveSchema>;

      await supabase.from('walkthrough_approvals').insert({
        walkthrough_id, approved_by: user.id, signature_url,
        notes, approved_at: new Date().toISOString()
      });

      await supabase.from('client_walkthroughs').update({ status: 'approved' }).eq('id', walkthrough_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
