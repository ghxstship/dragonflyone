import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, fromDynamic } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const duplicateCatalogItemSchema = z.object({
  source_item_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  custom_item_id: z.string().optional(),
  custom_name: z.string().optional(),
  is_locked: z.boolean().optional(),
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
    const validatedData = duplicateCatalogItemSchema.parse(payload);

    const { data, error } = await (supabase.rpc as (fn: string, params: Record<string, unknown>) => ReturnType<typeof supabase.rpc>)('duplicate_catalog_item_to_org', {
      p_source_item_id: validatedData.source_item_id,
      p_organization_id: validatedData.organization_id,
      p_custom_item_id: validatedData.custom_item_id,
      p_custom_name: validatedData.custom_name,
      p_is_locked: validatedData.is_locked || false,
      p_created_by: validatedData.created_by,
    });

    if (error) {
      log.error('Failed to duplicate catalog item:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: newItem, error: fetchError } = await fromDynamic(supabase, 'organization_catalog_items')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      log.error('Failed to fetch duplicated item:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error duplicating catalog item:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
