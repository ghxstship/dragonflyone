import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createFromTemplateSchema = z.object({
  template_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  team_workspace: z.string().optional(),
  activation_name: z.string().optional(),
  submitter_id: z.string().uuid().optional(),
});

export const dynamic = 'force-dynamic';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

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

    const payload = await request.json();
    const validatedData = createFromTemplateSchema.parse(payload);

    const { data, error } = await supabase.rpc('create_advance_from_template', {
      p_template_id: validatedData.template_id,
      p_organization_id: validatedData.organization_id,
      p_project_id: validatedData.project_id || undefined,
      p_team_workspace: validatedData.team_workspace || undefined,
      p_activation_name: validatedData.activation_name || undefined,
      p_submitter_id: validatedData.submitter_id || undefined,
    });

    if (error) {
      log.error('Failed to create advance from template:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ advance_id: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating advance from template:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
