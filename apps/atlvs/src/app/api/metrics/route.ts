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

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin access
    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('platform_roles')
      .eq('auth_user_id', user.id)
      .single();

    const isAdmin = platformUser?.platform_roles?.some((role: string) =>
      ['ATLVS_ADMIN', 'LEGEND_ADMIN', 'LEGEND_SUPER_ADMIN'].includes(role)
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    
    // Calculate time range
    let hoursBack = 24;
    if (period === '1h') hoursBack = 1;
    else if (period === '6h') hoursBack = 6;
    else if (period === '7d') hoursBack = 168;
    else if (period === '30d') hoursBack = 720;
    
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    // Get audit log metrics
    const { data: auditMetrics } = await supabase
      .from('audit_logs')
      .select('action, created_at')
      .gte('created_at', since);

    // Aggregate by action
    const actionCounts: Record<string, number> = {};
    (auditMetrics || []).forEach((log: { action: string }) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });

    // Get login attempt metrics
    const { data: loginMetrics } = await supabase
      .from('login_attempts')
      .select('success, created_at')
      .gte('created_at', since);

    const loginStats = {
      total: loginMetrics?.length || 0,
      successful: loginMetrics?.filter((l: { success: boolean }) => l.success).length || 0,
      failed: loginMetrics?.filter((l: { success: boolean }) => !l.success).length || 0,
    };

    // Get active sessions count
    const { count: activeSessions } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString());

    // Get user counts
    const { count: totalUsers } = await supabase
      .from('platform_users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('platform_users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get pending invitations
    const { count: pendingInvitations } = await supabase
      .from('user_invitations')
      .select('*', { count: 'exact', head: true })
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString());

    return NextResponse.json({
      period,
      since,
      metrics: {
        users: {
          total: totalUsers || 0,
          active: activeUsers || 0,
          activeSessions: activeSessions || 0,
          pendingInvitations: pendingInvitations || 0,
        },
        authentication: {
          ...loginStats,
          successRate: loginStats.total > 0 
            ? (loginStats.successful / loginStats.total * 100).toFixed(2) + '%'
            : 'N/A',
        },
        activity: {
          totalActions: auditMetrics?.length || 0,
          byAction: actionCounts,
        },
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
