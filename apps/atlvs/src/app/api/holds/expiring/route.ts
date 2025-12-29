export const dynamic = 'force-dynamic';

import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    const orgId = searchParams.get('organization_id');
    const hoursAhead = parseInt(searchParams.get('hours') || '24');

    if (!orgId) {
      return NextResponse.json({ error: 'organization_id required' }, { status: 400 });
    }

    const expiresBy = new Date();
    expiresBy.setHours(expiresBy.getHours() + hoursAhead);

    const { data, error } = await supabase
      .from('space_holds')
      .select(`
        *,
        space:venue_spaces(id, name),
        contact:contacts(id, first_name, last_name, email),
        lead:leads(id, first_name, last_name, email)
      `)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .lte('expires_at', expiresBy.toISOString())
      .order('expires_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const expiring = (data || []).map(hold => ({
      ...hold,
      hours_until_expiry: Math.max(0, (new Date(hold.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60)),
      is_expired: new Date(hold.expires_at) < now,
    }));

    return NextResponse.json({
      holds: expiring,
      total: expiring.length,
      expired_count: expiring.filter(h => h.is_expired).length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
