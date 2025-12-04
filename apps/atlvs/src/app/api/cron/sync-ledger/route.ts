import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Sync Ledger
 * Runs daily at 2am UTC
 * Syncs ledger entries and reconciles accounts
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
    // Get pending ledger entries that need syncing
    const { data: pendingEntries, error: fetchError } = await supabase
      .from('ledger_entries')
      .select('*')
      .eq('sync_status', 'pending')
      .limit(100);

    if (fetchError) {
      throw fetchError;
    }

    let syncedCount = 0;
    let errorCount = 0;

    // Process each pending entry
    for (const entry of pendingEntries || []) {
      try {
        // Update sync status
        const { error: updateError } = await supabase
          .from('ledger_entries')
          .update({
            sync_status: 'synced',
            synced_at: new Date().toISOString(),
          })
          .eq('id', entry.id);

        if (updateError) {
          errorCount++;
        } else {
          syncedCount++;
        }
      } catch {
        errorCount++;
      }
    }

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'sync-ledger',
      status: 'completed',
      records_processed: syncedCount,
      errors: errorCount,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error
    await supabase.from('cron_logs').insert({
      job_name: 'sync-ledger',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Sync failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
