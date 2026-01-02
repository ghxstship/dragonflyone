export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional().nullable(),
  group_type: z.enum(['team', 'committee', 'working_group', 'task_force', 'project_team', 'leadership']).optional(),
  parent_group_id: z.string().uuid().optional().nullable(),
  lead_user_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional(),
  visibility: z.enum(['public', 'department', 'private']).optional(),
  settings: z.record(z.any()).optional(),
});

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('department_groups')
      .select(`
        *,
        department:departments(id, name, code, description),
        lead:platform_users!lead_user_id(id, email, full_name, avatar_url),
        parent_group:department_groups!parent_group_id(id, name),
        child_groups:department_groups!department_groups_parent_group_id_fkey(id, name, group_type),
        members:group_memberships(
          id, role, responsibilities, joined_at,
          user:platform_users(id, email, full_name, avatar_url, platform_roles)
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Error fetching department group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department group' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const { data, error } = await supabase
      .from('department_groups')
      .update(validated)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error updating department group:', error);
    return NextResponse.json(
      { error: 'Failed to update department group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('department_groups')
      .update({ is_active: false })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting department group:', error);
    return NextResponse.json(
      { error: 'Failed to delete department group' },
      { status: 500 }
    );
  }
}
