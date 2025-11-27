import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@ghxstship/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = getServerSupabase();
  try {
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
    console.error('Error processing share click:', error);
    return NextResponse.redirect(new URL('/opportunities', request.url));
  }
}
