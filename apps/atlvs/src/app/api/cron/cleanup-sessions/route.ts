import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Cleanup Sessions
 * Runs daily at 3am UTC
 * Removes expired sessions and cleans up stale data
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const now = new Date().toISOString();
    let totalCleaned = 0;

    // Clean up expired SSO sessions
    const { data: ssoData } = await supabase
      .from('sso_sessions')
      .update({ status: 'expired' })
      .lt('expires_at', now)
      .eq('status', 'active')
      .select('id');

    const ssoCount = ssoData?.length || 0;
    totalCleaned += ssoCount;

    // Clean up old audit logs (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: auditData } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString())
      .select('id');

    const auditCount = auditData?.length || 0;
    totalCleaned += auditCount;

    // Clean up old notification reads (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: notifData } = await supabase
      .from('notification_reads')
      .delete()
      .lt('read_at', thirtyDaysAgo.toISOString())
      .select('id');

    const notifCount = notifData?.length || 0;
    totalCleaned += notifCount;

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'cleanup-sessions',
      status: 'completed',
      records_processed: totalCleaned,
      executed_at: now,
    });

    return NextResponse.json({
      success: true,
      cleaned: {
        ssoSessions: ssoCount || 0,
        auditLogs: auditCount || 0,
        notificationReads: notifCount || 0,
        total: totalCleaned,
      },
      timestamp: now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase.from('cron_logs').insert({
      job_name: 'cleanup-sessions',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Cleanup failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
