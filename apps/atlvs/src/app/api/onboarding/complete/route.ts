export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

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
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mark onboarding as complete
    const { error: profileError } = await supabase
      .from('platform_users')
      .update({
        onboarding_completed: true,
        onboarding_step: 5,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      logger.error('Profile update error:', profileError);
      return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
    }

    // Log onboarding completion
    await supabase.from('audit_logs').insert({
      action: 'onboarding_completed',
      resource_type: 'user',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      user_agent: request.headers.get('user-agent'),
      metadata: { 
        platform: 'atlvs',
        user_id: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Onboarding completed successfully',
      redirectTo: '/dashboard'
    });
  } catch (error) {
    logger.error('Complete onboarding error:', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
