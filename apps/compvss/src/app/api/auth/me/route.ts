import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(request: NextRequest) {
  const supabase = getServerSupabase();
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

    // Filter for COMPVSS-relevant roles
    const compvssRoles = (platformUser.platform_roles || []).filter((role: string) =>
      role.startsWith('COMPVSS_') || role.startsWith('LEGEND_')
    );

    return NextResponse.json({
      user: {
        auth_user_id: user.id,
        auth_email: user.email,
        ...platformUser,
        compvss_roles: compvssRoles,
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
