export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole, logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

const COMPVSS_ROLES = [
  PlatformRole.COMPVSS_ADMIN, PlatformRole.COMPVSS_TEAM_MEMBER, PlatformRole.COMPVSS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = getServerSupabase();
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!COMPVSS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find the share by tracking code
    const { data: share, error } = await supabase
      .from('opportunity_shares')
      .select('id, opportunity_id, share_url')
      .eq('tracking_code', params.code)
      .single();

    if (error || !share) {
      // Redirect to opportunities page if not found
      return NextResponse.redirect(new URL('/opportunities', request.url));
    }

    // Track the click
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');

    // Determine device type from user agent
    let deviceType = 'desktop';
    if (userAgent) {
      if (/mobile/i.test(userAgent)) deviceType = 'mobile';
      else if (/tablet/i.test(userAgent)) deviceType = 'tablet';
    }

    await supabase
      .from('opportunity_share_clicks')
      .insert({
        share_id: share.id,
        referrer,
        user_agent: userAgent,
        ip_address: ip,
        device_type: deviceType,
      });

    // Redirect to the opportunity
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://compvss.ghxstship.com';
    return NextResponse.redirect(new URL(`/opportunities/${share.opportunity_id}?ref=${params.code}`, baseUrl));
  } catch (error) {
    logger.error('Error processing share click:', error);
    return NextResponse.redirect(new URL('/opportunities', request.url));
  }
}
