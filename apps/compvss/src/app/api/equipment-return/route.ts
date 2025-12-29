export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const equipmentReturnSchema = z.object({
  project_id: z.string().uuid(),
  equipment_id: z.string().uuid(),
  condition: z.enum(['good', 'damaged', 'missing', 'needs_repair']),
  notes: z.string().optional(),
  photo_urls: z.array(z.string().url()).optional(),
});

// Equipment return verification and condition reporting
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

    const { data, error } = await supabase.from('equipment_returns').select(`
      *, equipment:equipment(id, name, asset_tag),
      checked_by:platform_users(first_name, last_name)
    `).eq('project_id', projectId).order('returned_at', { ascending: false });

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    return NextResponse.json({
      returns: data,
      summary: {
        total: data?.length || 0,
        good: data?.filter(r => r.condition === 'good').length || 0,
        damaged: data?.filter(r => r.condition === 'damaged').length || 0,
        missing: data?.filter(r => r.condition === 'missing').length || 0
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
    const validatedData = equipmentReturnSchema.parse(body);
    const { project_id, equipment_id, condition, notes, photo_urls } = validatedData;

    const { data, error } = await supabase.from('equipment_returns').insert({
      project_id, equipment_id, condition, notes,
      photo_urls: photo_urls || [], checked_by: user.id,
      returned_at: new Date().toISOString()
    }).select().single();

    if (error) return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });

    // Update equipment status
    await supabase.from('equipment').update({
      status: 'available', condition, last_checked: new Date().toISOString()
    }).eq('id', equipment_id);

    // Create damage report if needed
    if (condition === 'damaged') {
      await supabase.from('damage_assessments').insert({
        project_id, equipment_id, description: notes,
        severity: 'medium', status: 'pending', reported_by: user.id
      });
    }

    return NextResponse.json({ return: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 });
  }
}
