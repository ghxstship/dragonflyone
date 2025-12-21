export const dynamic = 'force-dynamic';

import { logger } from '@ghxstship/config';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
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
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (!platformUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    // Get consent history from audit logs
    const { data: history, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', platformUser.id)
      .in('action', ['consent_granted', 'consent_revoked', 'consent_updated', 'privacy_settings_updated'])
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Also get current consent records for context
    const { data: currentConsents } = await supabase
      .from('consent_records')
      .select('consent_type, is_granted, granted_at, revoked_at, source, policy_version')
      .eq('user_id', platformUser.id);

    // Format the history entries
    const formattedHistory = (history || []).map((entry) => {
      const metadata = entry.metadata as Record<string, unknown> | null;
      return {
        id: entry.id,
        action: entry.action,
        consentType: metadata?.consent_type || 'unknown',
        previousValue: metadata?.previous_value,
        newValue: metadata?.new_value,
        source: metadata?.source || 'user_action',
        ipAddress: entry.ip_address,
        userAgent: entry.user_agent,
        timestamp: entry.created_at,
      };
    });

    return NextResponse.json({
      data: {
        history: formattedHistory,
        currentConsents: currentConsents || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get consent history error:', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to get consent history' },
      { status: 500 }
    );
  }
}
