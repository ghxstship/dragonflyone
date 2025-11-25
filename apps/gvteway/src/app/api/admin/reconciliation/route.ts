import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { authorizeAdminRequest } from '@/lib/admin-auth';

const reconciliationSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  autoResolve: z.boolean().optional().default(false),
});

interface BalanceTransaction {
  id: string;
  amount: number;
  currency: string;
  created: number;
  type: string;
  fee: number;
  net: number;
  status: string;
}

interface ReconciliationResult {
  period: {
    start: string;
    end: string;
  };
  stripe: {
    grossRevenue: number;
    fees: number;
    netRevenue: number;
    transactionCount: number;
  };
  database: {
    totalOrders: number;
    totalRevenue: number;
    recordedFees: number;
  };
  discrepancies: Array<{
    type: string;
    stripeId?: string;
    amount?: number;
    description: string;
  }>;
  resolved: boolean;
}

export async function POST(request: Request) {
  if (!authorizeAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: z.infer<typeof reconciliationSchema>;
  try {
    const body = await request.json();
    payload = reconciliationSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    // Default to last 24 hours if no date range provided
    const endDate = payload.endDate ? new Date(payload.endDate) : new Date();
    const startDate = payload.startDate
      ? new Date(payload.startDate)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    // Fetch Stripe balance transactions
    const transactions: BalanceTransaction[] = [];
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const response = await stripe.balanceTransactions.list({
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
        limit: 100,
        starting_after: startingAfter,
      });

      transactions.push(...(response.data as BalanceTransaction[]));
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

    const stripeNetRevenue = stripeTotals.grossRevenue - stripeTotals.fees;

    // Fetch database orders
    const { data: orders, error: ordersError } = await supabaseAdmin
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
      (acc: { totalRevenue: number; recordedFees: number; totalOrders: number }, order: any) => {
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

    // Revenue variance check (allow 1% variance for timing differences)
    const revenueVariance = Math.abs(stripeTotals.grossRevenue - dbTotals.totalRevenue);
    const variancePercentage = (revenueVariance / stripeTotals.grossRevenue) * 100;

    if (variancePercentage > 1) {
      discrepancies.push({
        type: 'revenue_mismatch',
        amount: revenueVariance,
        description: `Revenue variance of ${(variancePercentage).toFixed(2)}% detected. Stripe: $${(stripeTotals.grossRevenue / 100).toFixed(2)}, DB: $${(dbTotals.totalRevenue / 100).toFixed(2)}`,
      });
    }

    // Fee variance check
    const feeVariance = Math.abs(stripeTotals.fees - dbTotals.recordedFees);
    if (feeVariance > stripeTotals.fees * 0.01) {
      discrepancies.push({
        type: 'fee_mismatch',
        amount: feeVariance,
        description: `Fee variance detected. Stripe: $${(stripeTotals.fees / 100).toFixed(2)}, DB: $${(dbTotals.recordedFees / 100).toFixed(2)}`,
      });
    }

    // Check for missing transactions
    const dbPaymentIntents = new Set((orders || []).map((o: any) => o.payment_intent_id).filter(Boolean));

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

    // Auto-resolve if requested
    const resolved = discrepancies.length === 0;
    if (payload.autoResolve && discrepancies.length > 0) {
      // Log discrepancies for manual review
      await supabaseAdmin.from('reconciliation_logs').insert({
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        discrepancies: discrepancies,
        stripe_revenue: stripeTotals.grossRevenue,
        db_revenue: dbTotals.totalRevenue,
        status: 'needs_review',
      });
    }

    const result: ReconciliationResult = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      stripe: {
        grossRevenue: stripeTotals.grossRevenue,
        fees: stripeTotals.fees,
        netRevenue: stripeNetRevenue,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Reconciliation error:', error);
    return NextResponse.json(
      { error: 'Reconciliation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching reconciliation history
export async function GET(request: Request) {
  if (!authorizeAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: logs, error } = await supabaseAdmin
      .from('reconciliation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch reconciliation logs: ${error.message}`);
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('Failed to fetch reconciliation history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
