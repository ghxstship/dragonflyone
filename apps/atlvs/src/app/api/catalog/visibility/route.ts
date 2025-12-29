import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createVisibilitySchema = z.object({
  organization_id: z.string().uuid(),
  scope_type: z.string(),
  scope_id: z.string().uuid().optional(),
  target_type: z.string(),
  target_value: z.string(),
  is_visible: z.boolean().optional(),
  is_requestable: z.boolean().optional(),
  requires_approval: z.boolean().optional(),
  approval_role: z.string().optional(),
  max_quantity_per_request: z.number().optional(),
  max_value_per_request: z.number().optional(),
  budget_period: z.string().optional(),
  budget_limit: z.number().optional(),
  notes: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

export const dynamic = 'force-dynamic';

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

    const searchParams = request.nextUrl.searchParams;
    const scopeType = searchParams.get('scope_type');
    const scopeId = searchParams.get('scope_id');
    const targetType = searchParams.get('target_type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('catalog_visibility_settings')
      .select('*', { count: 'exact' })
      .order('scope_type')
      .order('target_type')
      .range(offset, offset + limit - 1);

    if (scopeType) {
      query = query.eq('scope_type', scopeType);
    }

    if (scopeId) {
      query = query.eq('scope_id', scopeId);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch catalog visibility settings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (error) {
    log.error('Unexpected error fetching catalog visibility settings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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

    const payload = await request.json();
    const validatedData = createVisibilitySchema.parse(payload);

    const { data, error } = await supabase
      .from('catalog_visibility_settings')
      .insert({
        organization_id: validatedData.organization_id,
        scope_type: validatedData.scope_type,
        scope_id: validatedData.scope_id,
        target_type: validatedData.target_type,
        target_value: validatedData.target_value,
        is_visible: validatedData.is_visible ?? true,
        is_requestable: validatedData.is_requestable ?? true,
        requires_approval: validatedData.requires_approval ?? false,
        approval_role: validatedData.approval_role,
        max_quantity_per_request: validatedData.max_quantity_per_request,
        max_value_per_request: validatedData.max_value_per_request,
        budget_period: validatedData.budget_period,
        budget_limit: validatedData.budget_limit,
        notes: validatedData.notes,
        created_by: validatedData.created_by,
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to create catalog visibility setting:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ setting: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating catalog visibility setting:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
