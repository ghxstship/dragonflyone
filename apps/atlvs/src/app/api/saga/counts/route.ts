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
      .from('saga_instances')
      .select('saga_type')
      .eq('organization_id', orgId);

    // Get counts by state
    const { data: byState } = await supabase
      .from('saga_instances')
      .select('current_state')
      .eq('organization_id', orgId);

    // Get counts by priority
    const { data: byPriority } = await supabase
      .from('saga_instances')
      .select('priority')
      .eq('organization_id', orgId);

    // Get overdue count
    const { count: overdue } = await supabase
      .from('saga_instances')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .lt('due_date', new Date().toISOString())
      .not('current_state', 'in', '("completed","cancelled","failed")');

    // Get due today count
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    const { count: dueToday } = await supabase
      .from('saga_instances')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .gte('due_date', startOfDay)
      .lte('due_date', endOfDay);

    // Get my pending actions
    const { data: person } = await supabase
      .from('legend_people')
      .select('id')
      .eq('organization_id', orgId)
      .eq('email', user.email)
      .single();

    let myPendingActions = 0;
    if (person) {
      const { count } = await supabase
        .from('saga_participants')
        .select('*', { count: 'exact', head: true })
        .eq('person_id', person.id)
        .eq('action_required', true)
        .eq('status', 'active');
      myPendingActions = count || 0;
    }

    // Aggregate counts
    const typeCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    byType?.forEach(row => {
      typeCounts[row.saga_type] = (typeCounts[row.saga_type] || 0) + 1;
    });

    byState?.forEach(row => {
      stateCounts[row.current_state] = (stateCounts[row.current_state] || 0) + 1;
    });

    byPriority?.forEach(row => {
      priorityCounts[row.priority] = (priorityCounts[row.priority] || 0) + 1;
    });

    return NextResponse.json({
      total: byType?.length || 0,
      by_type: typeCounts,
      by_state: stateCounts,
      by_priority: priorityCounts,
      overdue: overdue || 0,
      due_today: dueToday || 0,
      my_pending_actions: myPendingActions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
