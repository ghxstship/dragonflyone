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

    const { data: platformUser } = await supabase
      .from('platform_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Collect all user data
    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_profile: {
        id: platformUser.id,
        email: platformUser.email,
        full_name: platformUser.full_name,
        phone: platformUser.phone,
        avatar_url: platformUser.avatar_url,
        platform_roles: platformUser.platform_roles,
        created_at: platformUser.created_at,
        updated_at: platformUser.updated_at,
      },
    };

    // Get consent records
    const { data: consentRecords } = await supabase
      .from('consent_records')
      .select('consent_type, is_granted, granted_at, revoked_at, source, policy_version')
      .eq('user_id', platformUser.id);
    exportData.consent_records = consentRecords || [];

    // Get audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('action, entity_type, entity_id, metadata, created_at')
      .eq('user_id', platformUser.id)
      .order('created_at', { ascending: false })
      .limit(1000);
    exportData.audit_logs = auditLogs || [];

    // Get orders (if GVTEWAY user)
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, currency, created_at')
      .eq('user_id', platformUser.id);
    exportData.orders = orders || [];

    // Get tickets
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id, ticket_type, status, event_id, created_at')
      .eq('user_id', platformUser.id);
    exportData.tickets = tickets || [];

    // Get notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, type, title, message, read_at, created_at')
      .eq('user_id', platformUser.id)
      .order('created_at', { ascending: false })
      .limit(500);
    exportData.notifications = notifications || [];

    // Get user sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id, ip_address, user_agent, created_at, last_active_at')
      .eq('user_id', platformUser.id);
    exportData.sessions = sessions || [];

    // Get login attempts
    const { data: loginAttempts } = await supabase
      .from('login_attempts')
      .select('id, success, ip_address, user_agent, created_at')
      .eq('user_id', platformUser.id)
      .order('created_at', { ascending: false })
      .limit(100);
    exportData.login_attempts = loginAttempts || [];

    // Log the export action
    await supabase.rpc('log_privacy_action', {
      p_organization_id: platformUser.organization_id,
      p_user_id: platformUser.id,
      p_action_type: 'data_exported',
      p_entity_type: 'platform_users',
      p_entity_id: platformUser.id,
      p_details: { format: 'json', tables_included: Object.keys(exportData).length },
    });

    // Return as downloadable JSON
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'download') {
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="data-export-${platformUser.id}-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    return NextResponse.json({ data: exportData });
  } catch (error) {
    console.error('Export data error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
