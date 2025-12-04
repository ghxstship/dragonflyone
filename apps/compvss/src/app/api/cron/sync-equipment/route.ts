import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Sync Equipment
 * Runs daily at 4am UTC
 * Syncs equipment status and maintenance schedules
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
    const now = new Date();
    let updatedCount = 0;

    // Check for equipment due for maintenance
    const { data: equipmentDue, error: fetchError } = await supabase
      .from('equipment')
      .select('id, name, next_maintenance_date')
      .lte('next_maintenance_date', now.toISOString())
      .eq('status', 'available');

    if (fetchError) {
      throw fetchError;
    }

    // Update equipment status to needs_maintenance
    for (const item of equipmentDue || []) {
      const { error: updateError } = await supabase
        .from('equipment')
        .update({
          status: 'needs_maintenance',
          updated_at: now.toISOString(),
        })
        .eq('id', item.id);

      if (!updateError) {
        updatedCount++;

        // Create maintenance notification
        await supabase.from('notifications').insert({
          type: 'equipment_maintenance',
          title: `Maintenance Due: ${item.name}`,
          message: `Equipment ${item.name} is due for scheduled maintenance.`,
          priority: 'medium',
          created_at: now.toISOString(),
        });
      }
    }

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'sync-equipment',
      status: 'completed',
      records_processed: updatedCount,
      executed_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      equipmentChecked: equipmentDue?.length || 0,
      maintenanceTriggered: updatedCount,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase.from('cron_logs').insert({
      job_name: 'sync-equipment',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Equipment sync failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
