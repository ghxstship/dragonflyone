import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get platform user with full details
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select(`
        id, email, full_name, avatar_url, phone, location, bio,
        platform_roles, organization_id, status, hire_date, department_id,
        organization:organizations(id, name, logo_url),
        department:departments(id, name, code)
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get user permissions based on roles
    const permissions = await getUserPermissions(platformUser.platform_roles || []);

    return NextResponse.json({
      user: {
        auth_user_id: user.id,
        auth_email: user.email,
        ...platformUser,
        permissions,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

async function getUserPermissions(roles: string[]): Promise<string[]> {
  const permissionMap: Record<string, string[]> = {
    'LEGEND_SUPER_ADMIN': ['*'],
    'LEGEND_ADMIN': ['admin:read', 'admin:write', 'users:manage', 'settings:manage'],
    'ATLVS_ADMIN': ['atlvs:*', 'users:read', 'reports:read'],
    'ATLVS_TEAM_MEMBER': ['atlvs:read', 'atlvs:write', 'reports:read'],
    'ATLVS_VIEWER': ['atlvs:read'],
    'COMPVSS_ADMIN': ['compvss:*', 'users:read', 'reports:read'],
    'COMPVSS_TEAM_MEMBER': ['compvss:read', 'compvss:write', 'reports:read'],
    'COMPVSS_VIEWER': ['compvss:read'],
    'GVTEWAY_ADMIN': ['gvteway:*', 'users:read', 'reports:read'],
    'GVTEWAY_TEAM_MEMBER': ['gvteway:read', 'gvteway:write', 'reports:read'],
    'GVTEWAY_VIEWER': ['gvteway:read'],
  };

  const permissions = new Set<string>();
  
  for (const role of roles) {
    const rolePermissions = permissionMap[role] || [];
    rolePermissions.forEach(p => permissions.add(p));
  }

  return Array.from(permissions);
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ['full_name', 'phone', 'location', 'bio', 'avatar_url'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: platformUser, error: updateError } = await supabase
      .from('platform_users')
      .update(updateData)
      .eq('auth_user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ user: platformUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
