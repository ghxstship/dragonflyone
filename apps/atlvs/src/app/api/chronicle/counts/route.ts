import { withAuth, PlatformRole } from '@ghxstship/config';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const ATLVS_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN, PlatformRole.ATLVS_ADMIN, PlatformRole.ATLVS_TEAM_MEMBER, PlatformRole.ATLVS_VIEWER,
  PlatformRole.LEGEND_SUPER_ADMIN, PlatformRole.LEGEND_ADMIN, PlatformRole.LEGEND_DEVELOPER,
];

export async function GET() {
  try {
    // Authenticate and authorize
    const authResult = await withAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const userRoles = authResult.user?.platformRoles || [];
    if (!ATLVS_ROLES.some(role => userRoles.includes(role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    const orgId = userOrg.organization_id;

    // Get counts by type
    const { data: byType } = await supabase
      .from('chronicle_entries')
      .select('chronicle_type')
      .eq('organization_id', orgId);

    // Get counts by action category
    const { data: byAction } = await supabase
      .from('chronicle_entries')
      .select('action_category')
      .eq('organization_id', orgId);

    // Get today's count
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    const { count: todayCount } = await supabase
      .from('chronicle_entries')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('occurred_at', startOfDay);

    // Get this week's count
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: weekCount } = await supabase
      .from('chronicle_entries')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('occurred_at', startOfWeek.toISOString());

    // Get this month's count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthCount } = await supabase
      .from('chronicle_entries')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('occurred_at', startOfMonth.toISOString());

    // Aggregate counts
    const typeCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};

    byType?.forEach(row => {
      typeCounts[row.chronicle_type] = (typeCounts[row.chronicle_type] || 0) + 1;
    });

    byAction?.forEach(row => {
      actionCounts[row.action_category] = (actionCounts[row.action_category] || 0) + 1;
    });

    return NextResponse.json({
      total: byType?.length || 0,
      by_type: typeCounts,
      by_action_category: actionCounts,
      today: todayCount || 0,
      this_week: weekCount || 0,
      this_month: monthCount || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
