export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const UserRoleSchema = z.object({
  platform_user_id: z.string().uuid(),
  organization_id: z.string().uuid(),
  role_code: z.string().min(1),
});

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { searchParams } = new URL(request.url);
    
    const platform = searchParams.get('platform');
    const organizationId = searchParams.get('organization_id');
    const userId = searchParams.get('user_id');
    const includeDefinitions = searchParams.get('include_definitions') === 'true';

    if (includeDefinitions || (!organizationId && !userId)) {
      let query = supabase
        .from('role_definitions')
        .select('*')
        .order('hierarchy_rank', { ascending: false });

      if (platform && platform !== 'all') {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ roles: data || [] });
    }

    let query = supabase
      .from('user_roles')
      .select(`
        *,
        role:role_definitions(code, platform, description, level, hierarchy_rank),
        user:platform_users(id, full_name, email),
        organization:organizations(id, name)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }
    if (userId) {
      query = query.eq('platform_user_id', userId);
    }

    const { data: roleData, error: roleError } = await query;

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    const fetchedRoles = roleData || [];
    const summary = {
      total: fetchedRoles.length,
      by_role: fetchedRoles.reduce((acc, ur) => {
        const code = ur.role_code;
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({ user_roles: fetchedRoles, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const validatedData = UserRoleSchema.parse(body);

    const { data: existingRole } = await supabase
      .from('role_definitions')
      .select('code')
      .eq('code', validatedData.role_code)
      .single();

    if (!existingRole) {
      return NextResponse.json({ error: 'Invalid role code' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_roles')
      .insert(validatedData)
      .select(`
        *,
        role:role_definitions(code, platform, description, level, hierarchy_rank),
        user:platform_users(id, full_name, email)
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'User already has this role' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user_role: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
  }
}
