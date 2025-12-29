import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { log, withAuth, PlatformRole } from '@ghxstship/config';
import { z } from 'zod';

const createPermissionSchema = z.object({
  organization_id: z.string().uuid(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  allowed_roles: z.array(z.string()).optional(),
  allowed_user_ids: z.array(z.string().uuid()).optional(),
  denied_user_ids: z.array(z.string().uuid()).optional(),
  max_quantity: z.number().optional(),
  max_value: z.number().optional(),
  requires_justification: z.boolean().optional(),
  justification_min_length: z.number().optional(),
  auto_approve_below_value: z.number().optional(),
  approval_chain: z.array(z.string()).optional(),
  escalation_after_hours: z.number().optional(),
  request_window_start: z.string().optional(),
  request_window_end: z.string().optional(),
  blackout_dates: z.array(z.string()).optional(),
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
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('asset_request_permissions')
      .select('*', { count: 'exact' })
      .order('category')
      .order('subcategory')
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      query = query.eq('is_active', true);
    }

    const { data, error, count } = await query;

    if (error) {
      log.error('Failed to fetch asset request permissions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count, limit, offset });
  } catch (error) {
    log.error('Unexpected error fetching asset request permissions:', error);
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
    const validatedData = createPermissionSchema.parse(payload);

    const { data, error } = await supabase
      .from('asset_request_permissions')
      .insert({
        organization_id: validatedData.organization_id,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        allowed_roles: validatedData.allowed_roles || ['COMPVSS_TEAM_MEMBER'],
        allowed_user_ids: validatedData.allowed_user_ids || [],
        denied_user_ids: validatedData.denied_user_ids || [],
        max_quantity: validatedData.max_quantity,
        max_value: validatedData.max_value,
        requires_justification: validatedData.requires_justification ?? false,
        justification_min_length: validatedData.justification_min_length ?? 0,
        auto_approve_below_value: validatedData.auto_approve_below_value,
        approval_chain: validatedData.approval_chain || [],
        escalation_after_hours: validatedData.escalation_after_hours ?? 48,
        request_window_start: validatedData.request_window_start,
        request_window_end: validatedData.request_window_end,
        blackout_dates: validatedData.blackout_dates || [],
        notes: validatedData.notes,
        created_by: validatedData.created_by,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Permission already exists for this category/subcategory' },
          { status: 409 }
        );
      }
      log.error('Failed to create asset request permission:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ permission: data }, { status: 201 });
  } catch (error) {
    log.error('Unexpected error creating asset request permission:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
