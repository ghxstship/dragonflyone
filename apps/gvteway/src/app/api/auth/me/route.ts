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

    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select(`
        id, email, full_name, avatar_url, phone, location, bio,
        platform_roles, organization_id, status,
        organization:organizations(id, name, logo_url)
      `)
      .eq('auth_user_id', user.id)
      .single();

    if (platformError || !platformUser) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Filter for GVTEWAY-relevant roles
    const gvtewayRoles = (platformUser.platform_roles || []).filter((role: string) =>
      role.startsWith('GVTEWAY_') || role.startsWith('LEGEND_')
    );

    // Get guest profile if exists
    const { data: guestProfile } = await supabase
      .from('guest_profiles')
      .select('*')
      .eq('user_id', platformUser.id)
      .single();

    return NextResponse.json({
      user: {
        auth_user_id: user.id,
        auth_email: user.email,
        ...platformUser,
        gvteway_roles: gvtewayRoles,
        guest_profile: guestProfile,
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
