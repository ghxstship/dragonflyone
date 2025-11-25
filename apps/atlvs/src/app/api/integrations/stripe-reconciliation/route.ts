import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

// GET /api/integrations/stripe-reconciliation - Get reconciliation status and reports
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

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (action === 'balance') {
      // Get current Stripe balance
      const balance = await stripe.balance.retrieve();

      return NextResponse.json({
        balance: {
          available: balance.available.map(b => ({
            amount: b.amount / 100,
            currency: b.currency,
          })),
          pending: balance.pending.map(b => ({
            amount: b.amount / 100,
            currency: b.currency,
          })),
        },
      });
    }

    if (action === 'transactions') {
      // Get balance transactions
      const params: Stripe.BalanceTransactionListParams = {
        limit: 100,
      };

      if (startDate) {
        params.created = { gte: Math.floor(new Date(startDate).getTime() / 1000) };
      }
      if (endDate) {
        const existingCreated = params.created as Stripe.RangeQueryParam | undefined;
        params.created = { ...existingCreated, lte: Math.floor(new Date(endDate).getTime() / 1000) };
      }

      const transactions = await stripe.balanceTransactions.list(params);

      // Aggregate by type
      const summary: Record<string, { count: number; amount: number; fee: number }> = {};
      
      transactions.data.forEach(tx => {
        if (!summary[tx.type]) {
          summary[tx.type] = { count: 0, amount: 0, fee: 0 };
        }
        summary[tx.type].count++;
        summary[tx.type].amount += tx.amount / 100;
        summary[tx.type].fee += tx.fee / 100;
      });

      return NextResponse.json({
        transactions: transactions.data.map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount / 100,
          fee: tx.fee / 100,
          net: tx.net / 100,
          currency: tx.currency,
          description: tx.description,
          created: new Date(tx.created * 1000).toISOString(),
        })),
        summary,
        has_more: transactions.has_more,
      });
    }

    if (action === 'payouts') {
      // Get payouts
      const payouts = await stripe.payouts.list({ limit: 50 });

      return NextResponse.json({
        payouts: payouts.data.map(p => ({
          id: p.id,
          amount: p.amount / 100,
          currency: p.currency,
          status: p.status,
          arrival_date: new Date(p.arrival_date * 1000).toISOString(),
          created: new Date(p.created * 1000).toISOString(),
        })),
      });
    }

    if (action === 'reconciliation_report') {
      // Get reconciliation data
      const { data: reconciliations } = await supabase
        .from('stripe_reconciliations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Get latest reconciliation stats
      const { data: latestStats } = await supabase
        .from('stripe_reconciliations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return NextResponse.json({
        reconciliations: reconciliations || [],
        latest_stats: latestStats,
      });
    }

    // Default: Get dashboard summary
    const balance = await stripe.balance.retrieve();
    const recentTransactions = await stripe.balanceTransactions.list({ limit: 10 });
    const recentPayouts = await stripe.payouts.list({ limit: 5 });

    // Get ATLVS ledger totals for comparison
    const { data: atlvsRevenue } = await supabase
      .from('invoices')
      .select('total_amount')
      .eq('status', 'paid')
      .gte('paid_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const atlvsTotal = atlvsRevenue?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

    // Calculate Stripe totals for same period
    const stripeTotal = recentTransactions.data
      .filter(tx => tx.type === 'charge')
      .reduce((sum, tx) => sum + tx.amount / 100, 0);

    const variance = Math.abs(atlvsTotal - stripeTotal);
    const variancePercent = atlvsTotal > 0 ? (variance / atlvsTotal * 100) : 0;

    return NextResponse.json({
      dashboard: {
        stripe_balance: {
          available: balance.available.reduce((sum, b) => sum + b.amount / 100, 0),
          pending: balance.pending.reduce((sum, b) => sum + b.amount / 100, 0),
        },
        recent_transactions: recentTransactions.data.slice(0, 5).map(tx => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount / 100,
          created: new Date(tx.created * 1000).toISOString(),
        })),
        recent_payouts: recentPayouts.data.map(p => ({
          id: p.id,
          amount: p.amount / 100,
          status: p.status,
          arrival_date: new Date(p.arrival_date * 1000).toISOString(),
        })),
        reconciliation: {
          stripe_total: stripeTotal,
          atlvs_total: atlvsTotal,
          variance,
          variance_percent: variancePercent.toFixed(2),
          status: variancePercent > 1 ? 'variance_detected' : 'matched',
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch data' }, { status: 500 });
  }
}

// POST /api/integrations/stripe-reconciliation - Run reconciliation or sync
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || 'run_reconciliation';

    if (action === 'run_reconciliation') {
      const { start_date, end_date } = body;

      // Get Stripe transactions
      const stripeParams: Stripe.BalanceTransactionListParams = {
        limit: 100,
        type: 'charge',
      };

      if (start_date) {
        stripeParams.created = { gte: Math.floor(new Date(start_date).getTime() / 1000) };
      }
      if (end_date) {
        const existingCreated = stripeParams.created as Stripe.RangeQueryParam | undefined;
        stripeParams.created = { ...existingCreated, lte: Math.floor(new Date(end_date).getTime() / 1000) };
      }

      const stripeTransactions = await stripe.balanceTransactions.list(stripeParams);

      // Get ATLVS invoices for same period
      let atlvsQuery = supabase
        .from('invoices')
        .select('*')
        .eq('status', 'paid');

      if (start_date) {
        atlvsQuery = atlvsQuery.gte('paid_at', start_date);
      }
      if (end_date) {
        atlvsQuery = atlvsQuery.lte('paid_at', end_date);
      }

      const { data: atlvsInvoices } = await atlvsQuery;

      // Calculate totals
      const stripeTotal = stripeTransactions.data.reduce((sum, tx) => sum + tx.amount / 100, 0);
      const stripeFees = stripeTransactions.data.reduce((sum, tx) => sum + tx.fee / 100, 0);
      const stripeNet = stripeTransactions.data.reduce((sum, tx) => sum + tx.net / 100, 0);
      const atlvsTotal = atlvsInvoices?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0;

      const variance = Math.abs(stripeTotal - atlvsTotal);
      const variancePercent = atlvsTotal > 0 ? (variance / atlvsTotal * 100) : 0;

      // Save reconciliation record
      const { data: reconciliation, error } = await supabase
        .from('stripe_reconciliations')
        .insert({
          start_date,
          end_date,
          stripe_gross: stripeTotal,
          stripe_fees: stripeFees,
          stripe_net: stripeNet,
          stripe_transaction_count: stripeTransactions.data.length,
          atlvs_total: atlvsTotal,
          atlvs_invoice_count: atlvsInvoices?.length || 0,
          variance_amount: variance,
          variance_percent: variancePercent,
          status: variancePercent > 1 ? 'variance_detected' : 'matched',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Alert if variance exceeds threshold
      if (variancePercent > 1) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'stripe_variance_alert',
          title: 'Stripe Reconciliation Variance',
          message: `Variance of ${variancePercent.toFixed(2)}% detected between Stripe and ATLVS records`,
          link: `/finance/reconciliation/${reconciliation.id}`,
          is_read: false,
        });
      }

      return NextResponse.json({
        reconciliation,
        details: {
          stripe: {
            gross: stripeTotal,
            fees: stripeFees,
            net: stripeNet,
            transaction_count: stripeTransactions.data.length,
          },
          atlvs: {
            total: atlvsTotal,
            invoice_count: atlvsInvoices?.length || 0,
          },
          variance: {
            amount: variance,
            percent: variancePercent.toFixed(2),
          },
        },
      });
    } else if (action === 'sync_transactions') {
      // Sync Stripe transactions to local database
      const transactions = await stripe.balanceTransactions.list({ limit: 100 });

      const records = transactions.data.map(tx => ({
        stripe_id: tx.id,
        type: tx.type,
        amount: tx.amount,
        fee: tx.fee,
        net: tx.net,
        currency: tx.currency,
        description: tx.description,
        source: tx.source,
        status: tx.status,
        created_at: new Date(tx.created * 1000).toISOString(),
      }));

      const { data: synced, error } = await supabase
        .from('stripe_transactions')
        .upsert(records, { onConflict: 'stripe_id' })
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        synced_count: synced?.length || 0,
        has_more: transactions.has_more,
      });
    } else if (action === 'get_payout_schedule') {
      // Get payout schedule settings
      const account = await stripe.accounts.retrieve();

      return NextResponse.json({
        payout_schedule: account.settings?.payouts?.schedule,
        debit_negative_balances: account.settings?.payouts?.debit_negative_balances,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
