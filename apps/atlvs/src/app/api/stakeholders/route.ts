export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const createStakeholderSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().optional(),
  organization: z.string().optional(),
  permission_level: z.enum(['view', 'comment', 'edit', 'admin']).optional(),
  projects: z.array(z.string().uuid()).optional(),
});

const updateStakeholderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  organization: z.string().optional(),
  permission_level: z.enum(['view', 'comment', 'edit', 'admin']).optional(),
  status: z.string().optional(),
});

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

    let query = supabase
      .from('stakeholders')
      .select(`
        *,
        stakeholder_projects (
          project_id,
          projects (id, name)
        )
      `)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('stakeholder_projects.project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    const stakeholders = data?.map(s => ({
      ...s,
      projects: s.stakeholder_projects?.map((sp: Record<string, unknown>) => sp.project_id) || [],
    })) || [];

    return NextResponse.json({ stakeholders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const body = await request.json();
    const validatedData = createStakeholderSchema.parse(body);
    const { name, email, role, organization, permission_level, projects } = validatedData;

    // Create stakeholder
    const { data: stakeholder, error: stakeholderError } = await supabase
      .from('stakeholders')
      .insert({
        name,
        email,
        role,
        organization,
        permission_level: permission_level || 'view',
        status: 'invited',
      })
      .select()
      .single();

    if (stakeholderError) {
      return NextResponse.json({ error: stakeholderError.message }, { status: 500 });
    }

    // Link to projects if provided
    if (projects && projects.length > 0) {
      const projectLinks = projects.map((projectId: string) => ({
        stakeholder_id: stakeholder.id,
        project_id: projectId,
      }));

      await supabase.from('stakeholder_projects').insert(projectLinks);
    }

    // Invitation email sent via edge function

    return NextResponse.json({ stakeholder }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateStakeholderSchema.parse(body);
    const { id, ...updates } = validatedData;

    const { data, error } = await supabase
      .from('stakeholders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ stakeholder: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Stakeholder ID required' }, { status: 400 });
    }

    // Delete project links first
    await supabase.from('stakeholder_projects').delete().eq('stakeholder_id', id);

    // Delete stakeholder
    const { error } = await supabase.from('stakeholders').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
