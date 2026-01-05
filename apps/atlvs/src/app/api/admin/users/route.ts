export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, withAuth, PlatformRole } from '@ghxstship/config';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ATLVS_ADMIN_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
];

const userUpdateSchema = z.object({
  user_id: z.string().uuid(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  roles: z.array(z.string()).optional() });

export async function GET(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('platform_users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        status,
        created_at,
        last_sign_in_at,
        roles:user_roles(role_code)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return NextResponse.json({ users: [], total: 0, limit, offset });
      }
      logger.error('Error fetching users:', error);
      return NextResponse.json({ users: [], total: 0, limit, offset });
    }

    return NextResponse.json({ users: data || [], total: count, limit, offset });
  } catch (error) {
    logger.error('Error in GET /api/admin/users:', error instanceof Error ? error : undefined);
    return NextResponse.json({ users: [], total: 0, limit: 50, offset: 0 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ADMIN_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const body = await request.json();
    const validated = userUpdateSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString() };

    if (validated.status) {
      updateData.status = validated.status;
    }

    const { data, error } = await supabase
      .from('platform_users')
      .update(updateData)
      .eq('id', validated.user_id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    if (validated.roles) {
      await supabase
        .from('user_roles')
        .delete()
        .eq('platform_user_id', validated.user_id);

      if (validated.roles.length > 0) {
        await supabase
          .from('user_roles')
          .insert(validated.roles.map(role => ({
            platform_user_id: validated.user_id,
            role_code: role })));
      }
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    logger.error('Error in PATCH /api/admin/users:', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
