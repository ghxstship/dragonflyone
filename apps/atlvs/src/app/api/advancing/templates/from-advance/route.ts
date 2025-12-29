import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createTemplateFromAdvanceSchema = z.object({
  advance_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  is_global: z.boolean().optional(),
  created_by: z.string().uuid().optional(),
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
    const validatedData = createTemplateFromAdvanceSchema.parse(payload);

    const { data, error } = await supabase.rpc('create_template_from_advance', {
      p_advance_id: validatedData.advance_id,
      p_template_name: validatedData.name,
      p_description: validatedData.description || undefined,
      p_category: validatedData.category || undefined,
      p_is_global: validatedData.is_global || false,
      p_created_by: validatedData.created_by || undefined,
    });

    if (error) {
      log.error('Failed to create template from advance:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: template } = await supabase
      .from('advance_templates')
      .select('*')
      .eq('id', data)
      .single();

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating template from advance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
