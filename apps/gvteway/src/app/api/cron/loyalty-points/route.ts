import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Loyalty Points
 * Runs daily at 5am UTC
 * Processes pending loyalty point awards and expirations
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
    let pointsAwarded = 0;
    let pointsExpired = 0;

    // Process pending point awards
    const { data: pendingAwards, error: awardError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('status', 'pending')
      .eq('type', 'award');

    if (awardError) {
      throw awardError;
    }

    for (const award of pendingAwards || []) {
      // Update user's point balance
      const { error: updateError } = await supabase.rpc('add_loyalty_points', {
        p_user_id: award.user_id,
        p_points: award.points,
      });

      if (!updateError) {
        await supabase
          .from('loyalty_transactions')
          .update({ status: 'completed', processed_at: now.toISOString() })
          .eq('id', award.id);
        pointsAwarded += award.points;
      }
    }

    // Expire old points (older than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: expiringPoints, error: expireError } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('status', 'completed')
      .eq('type', 'award')
      .lt('created_at', oneYearAgo.toISOString())
      .is('expired_at', null);

    if (!expireError) {
      for (const expiring of expiringPoints || []) {
        await supabase
          .from('loyalty_transactions')
          .update({ expired_at: now.toISOString() })
          .eq('id', expiring.id);
        pointsExpired += expiring.points;
      }
    }

    // Log the cron execution
    await supabase.from('cron_logs').insert({
      job_name: 'loyalty-points',
      status: 'completed',
      records_processed: (pendingAwards?.length || 0) + (expiringPoints?.length || 0),
      executed_at: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      pointsAwarded,
      pointsExpired,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    await supabase.from('cron_logs').insert({
      job_name: 'loyalty-points',
      status: 'failed',
      error_message: message,
      executed_at: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Loyalty points processing failed', message },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
