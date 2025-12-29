export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createChecklistSchema = z.object({
  action: z.literal('create_checklist'),
  project_id: z.string().uuid(),
  items: z.array(z.object({ area: z.string(), task: z.string() })).optional(),
});

const completeItemSchema = z.object({
  action: z.literal('complete_item'),
  project_id: z.string().uuid(),
  item_id: z.string().uuid(),
  photos: z.array(z.string()).optional(),
});

const finalSignoffSchema = z.object({
  action: z.literal('final_signoff'),
  project_id: z.string().uuid(),
  restoration_id: z.string().uuid(),
  signature_url: z.string().optional(),
  notes: z.string().optional(),
});

const restorationActionSchema = z.union([createChecklistSchema, completeItemSchema, finalSignoffSchema]);

// Site restoration checklist and final inspection
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

    const { data, error } = await supabase.from('site_restorations').select(`
      *, items:restoration_items(id, area, task, status, completed_by, completed_at, photos)
    `).eq('project_id', projectId).single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    const completedItems = data?.items?.filter((i: Record<string, unknown>) => i.status === 'completed').length || 0;
    const totalItems = data?.items?.length || 0;

    return NextResponse.json({
      restoration: data,
      progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
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
    const validatedData = restorationActionSchema.parse(body);
    const { action, project_id } = validatedData;

    if (action === 'create_checklist') {
      const { items } = validatedData as z.infer<typeof createChecklistSchema>;

      const { data, error } = await supabase.from('site_restorations').insert({
        project_id, status: 'in_progress', created_by: user.id
      }).select().single();

      if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

      if (items?.length) {
        await supabase.from('restoration_items').insert(
          items.map((i: Record<string, unknown>) => ({ restoration_id: data.id, area: i.area, task: i.task, status: 'pending' }))
        );
      }

      return NextResponse.json({ restoration: data }, { status: 201 });
    }

    if (action === 'complete_item') {
      const { item_id, photos } = validatedData as z.infer<typeof completeItemSchema>;

      await supabase.from('restoration_items').update({
        status: 'completed', completed_by: user.id,
        completed_at: new Date().toISOString(), photos: photos || []
      }).eq('id', item_id);

      return NextResponse.json({ success: true });
    }

    if (action === 'final_signoff') {
      const { restoration_id, signature_url, notes } = validatedData as z.infer<typeof finalSignoffSchema>;

      await supabase.from('site_restorations').update({
        status: 'completed', signed_off_by: user.id,
        signed_off_at: new Date().toISOString(), signature_url, notes
      }).eq('id', restoration_id);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
