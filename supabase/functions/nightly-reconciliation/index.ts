import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@13.10.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconciliationResult {
  period: { start: string; end: string };
  stripe: { grossRevenue: number; fees: number; netRevenue: number; transactionCount: number };
  database: { totalOrders: number; totalRevenue: number; recordedFees: number };
  discrepancies: Array<{ type: string; stripeId?: string; amount?: number; description: string }>;
  resolved: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    // Calculate date range (last 24 hours)
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    console.log(`Running reconciliation for ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch Stripe balance transactions
    const transactions: any[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const response = await stripe.balanceTransactions.list({
        created: { gte: startTimestamp, lte: endTimestamp },
        limit: 100,
        starting_after: startingAfter,
      });

      transactions.push(...response.data);
      hasMore = response.has_more;
      if (hasMore && response.data.length > 0) {
        startingAfter = response.data[response.data.length - 1].id;
      }
    }

    // Calculate Stripe totals
    const stripeTotals = transactions.reduce(
      (acc, txn) => {
        if (txn.type === 'charge' || txn.type === 'payment') {
          acc.grossRevenue += txn.amount;
          acc.fees += txn.fee;
          acc.transactionCount++;
        } else if (txn.type === 'refund') {
          acc.grossRevenue -= Math.abs(txn.amount);
          acc.fees -= Math.abs(txn.fee);
        }
        return acc;
      },
      { grossRevenue: 0, fees: 0, transactionCount: 0 }
    );

    // Fetch database orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, fees, payment_intent_id, status, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .in('status', ['succeeded', 'refunded']);

    if (ordersError) {
      throw new Error(`Failed to fetch orders: ${ordersError.message}`);
    }

    // Calculate database totals
    const dbTotals = (orders || []).reduce(
      (acc, order) => {
        if (order.status === 'succeeded') {
          acc.totalRevenue += order.total || 0;
          acc.recordedFees += order.fees || 0;
          acc.totalOrders++;
        }
        return acc;
      },
      { totalRevenue: 0, recordedFees: 0, totalOrders: 0 }
    );

    // Find discrepancies
    const discrepancies: ReconciliationResult['discrepancies'] = [];

    // Revenue variance check (1% tolerance)
    const revenueVariance = Math.abs(stripeTotals.grossRevenue - dbTotals.totalRevenue);
    const variancePercentage = stripeTotals.grossRevenue > 0 
      ? (revenueVariance / stripeTotals.grossRevenue) * 100 
      : 0;

    if (variancePercentage > 1) {
      discrepancies.push({
        type: 'revenue_mismatch',
        amount: revenueVariance,
        description: `Revenue variance of ${variancePercentage.toFixed(2)}%. Stripe: $${(stripeTotals.grossRevenue / 100).toFixed(2)}, DB: $${(dbTotals.totalRevenue / 100).toFixed(2)}`,
      });
    }

    // Fee variance check
    const feeVariance = Math.abs(stripeTotals.fees - dbTotals.recordedFees);
    if (feeVariance > stripeTotals.fees * 0.01) {
      discrepancies.push({
        type: 'fee_mismatch',
        amount: feeVariance,
        description: `Fee variance. Stripe: $${(stripeTotals.fees / 100).toFixed(2)}, DB: $${(dbTotals.recordedFees / 100).toFixed(2)}`,
      });
    }

    // Check for missing transactions
    const dbPaymentIntents = new Set((orders || []).map((o) => o.payment_intent_id).filter(Boolean));
    for (const txn of transactions) {
      if ((txn.type === 'charge' || txn.type === 'payment') && !dbPaymentIntents.has(txn.id)) {
        discrepancies.push({
          type: 'missing_order',
          stripeId: txn.id,
          amount: txn.amount,
          description: `Stripe transaction ${txn.id} not found in database`,
        });
      }
    }

    const resolved = discrepancies.length === 0;

    // Log reconciliation result
    await supabase.from('reconciliation_logs').insert({
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      discrepancies: discrepancies,
      stripe_revenue: stripeTotals.grossRevenue,
      db_revenue: dbTotals.totalRevenue,
      status: resolved ? 'resolved' : 'needs_review',
    });

    // If discrepancies found, send alert notification
    if (!resolved) {
      console.log(`Found ${discrepancies.length} discrepancies - alerting finance team`);
      
      // Insert notification for finance admins
      await supabase.from('admin_notifications').insert({
        type: 'reconciliation_alert',
        title: 'Daily Reconciliation Discrepancies Found',
        message: `${discrepancies.length} discrepancy(ies) found in daily reconciliation for ${startDate.toISOString().split('T')[0]}`,
        severity: 'high',
        data: { discrepancies, period: { start: startDate.toISOString(), end: endDate.toISOString() } },
        created_at: new Date().toISOString(),
      });
    }

    // Sync to ATLVS ledger if revenue exists
    if (stripeTotals.grossRevenue > 0) {
      const netRevenue = stripeTotals.grossRevenue - stripeTotals.fees;
      
      // Create ledger entries for revenue and fees
      await supabase.from('ledger_entries').insert([
        {
          account_id: await getAccountId(supabase, 'revenue'),
          entry_date: endDate.toISOString(),
          description: `Daily ticket revenue - ${startDate.toISOString().split('T')[0]}`,
          debit: 0,
          credit: stripeTotals.grossRevenue / 100,
          reference_type: 'reconciliation',
          reference_id: null,
          created_at: new Date().toISOString(),
        },
        {
          account_id: await getAccountId(supabase, 'payment_processing_fees'),
          entry_date: endDate.toISOString(),
          description: `Stripe processing fees - ${startDate.toISOString().split('T')[0]}`,
          debit: stripeTotals.fees / 100,
          credit: 0,
          reference_type: 'reconciliation',
          reference_id: null,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    const result: ReconciliationResult = {
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
      stripe: {
        grossRevenue: stripeTotals.grossRevenue,
        fees: stripeTotals.fees,
        netRevenue: stripeTotals.grossRevenue - stripeTotals.fees,
        transactionCount: stripeTotals.transactionCount,
      },
      database: {
        totalOrders: dbTotals.totalOrders,
        totalRevenue: dbTotals.totalRevenue,
        recordedFees: dbTotals.recordedFees,
      },
      discrepancies,
      resolved,
    };

    console.log('Reconciliation completed:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Nightly reconciliation error:', error);
    return new Response(
      JSON.stringify({ error: 'Reconciliation failed', message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper function to get ledger account ID
async function getAccountId(supabase: any, accountType: string): Promise<string | null> {
  const accountMap: Record<string, string> = {
    revenue: 'Ticket Revenue',
    payment_processing_fees: 'Payment Processing Fees',
  };

  const { data } = await supabase
    .from('ledger_accounts')
    .select('id')
    .eq('name', accountMap[accountType])
    .single();

  return data?.id || null;
}
