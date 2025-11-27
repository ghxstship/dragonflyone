import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Payment Gateways Integration API
 * Integrates with PayPal, Square, Adyen, and other payment processors
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const gateway = searchParams.get('gateway');

    if (type === 'gateways') {
      const gateways = [
        {
          id: 'stripe',
          name: 'Stripe',
          status: 'primary',
          features: ['cards', 'wallets', 'ach', 'subscriptions', 'connect'],
          currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
          fees: { percentage: 2.9, fixed: 0.30 }
        },
        {
          id: 'paypal',
          name: 'PayPal',
          status: 'available',
          features: ['paypal_balance', 'cards', 'pay_later', 'venmo'],
          currencies: ['USD', 'EUR', 'GBP', 'CAD'],
          fees: { percentage: 3.49, fixed: 0.49 }
        },
        {
          id: 'square',
          name: 'Square',
          status: 'available',
          features: ['cards', 'tap_to_pay', 'invoices', 'pos'],
          currencies: ['USD', 'CAD', 'GBP', 'AUD', 'JPY'],
          fees: { percentage: 2.6, fixed: 0.10 }
        },
        {
          id: 'adyen',
          name: 'Adyen',
          status: 'available',
          features: ['cards', 'local_methods', 'wallets', 'pos'],
          currencies: ['150+ currencies'],
          fees: { percentage: 'custom', fixed: 'custom' }
        },
        {
          id: 'klarna',
          name: 'Klarna',
          status: 'available',
          features: ['pay_later', 'installments', 'pay_now'],
          currencies: ['USD', 'EUR', 'GBP', 'SEK'],
          fees: { percentage: 'varies', fixed: 'varies' }
        },
        {
          id: 'afterpay',
          name: 'Afterpay',
          status: 'available',
          features: ['installments'],
          currencies: ['USD', 'AUD', 'NZD', 'CAD', 'GBP'],
          fees: { percentage: 6, fixed: 0.30 }
        }
      ];
      return NextResponse.json({ gateways });
    }

    if (type === 'connections') {
      const { data, error } = await supabase
        .from('payment_gateway_connections')
        .select('*')
        .order('gateway', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Mask sensitive data
      const masked = (data || []).map(c => ({
        ...c,
        api_key: c.api_key ? '****' + c.api_key.slice(-4) : null,
        secret_key: c.secret_key ? '********' : null
      }));

      return NextResponse.json({ connections: masked });
    }

    if (type === 'transactions') {
      let query = supabase
        .from('payment_transactions')
        .select(`
          *,
          order:orders(id, order_number, customer_email)
        `)
        .order('created_at', { ascending: false });

      if (gateway) {
        query = query.eq('gateway', gateway);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ transactions: data });
    }

    if (type === 'refunds') {
      const { data, error } = await supabase
        .from('payment_refunds')
        .select(`
          *,
          transaction:payment_transactions(id, gateway, amount)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ refunds: data });
    }

    if (type === 'disputes') {
      const { data, error } = await supabase
        .from('payment_disputes')
        .select(`
          *,
          transaction:payment_transactions(id, gateway, amount, order_id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ disputes: data });
    }

    if (type === 'analytics') {
      // Get payment analytics
      const { data: transactions } = await supabase
        .from('payment_transactions')
        .select('gateway, amount, status, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const byGateway = (transactions || []).reduce((acc: Record<string, any>, t) => {
        if (!acc[t.gateway]) {
          acc[t.gateway] = { total: 0, count: 0, successful: 0, failed: 0 };
        }
        acc[t.gateway].total += t.amount || 0;
        acc[t.gateway].count++;
        if (t.status === 'succeeded') acc[t.gateway].successful++;
        if (t.status === 'failed') acc[t.gateway].failed++;
        return acc;
      }, {});

      return NextResponse.json({ analytics: byGateway });
    }

    // Default summary
    const [totalVolume, transactionCount] = await Promise.all([
      supabase.from('payment_transactions').select('amount').eq('status', 'succeeded'),
      supabase.from('payment_transactions').select('id', { count: 'exact', head: true })
    ]);

    const volume = (totalVolume.data || []).reduce((sum, t) => sum + (t.amount || 0), 0);

    return NextResponse.json({
      summary: {
        total_volume: volume,
        transaction_count: transactionCount.count || 0
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payment data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'connect') {
      const { gateway, api_key, secret_key, webhook_secret, mode } = body;

      const { data, error } = await supabase
        .from('payment_gateway_connections')
        .upsert({
          gateway,
          api_key,
          secret_key,
          webhook_secret,
          mode: mode || 'test',
          status: 'connected',
          connected_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection: { ...data, api_key: '****', secret_key: '****' } }, { status: 201 });
    }

    if (action === 'disconnect') {
      const { gateway } = body;

      await supabase
        .from('payment_gateway_connections')
        .delete()
        .eq('gateway', gateway);

      return NextResponse.json({ success: true });
    }

    if (action === 'set_primary') {
      const { gateway } = body;

      // Remove primary from all
      await supabase
        .from('payment_gateway_connections')
        .update({ is_primary: false })
        .neq('gateway', gateway);

      // Set new primary
      const { data, error } = await supabase
        .from('payment_gateway_connections')
        .update({ is_primary: true })
        .eq('gateway', gateway)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ connection: data });
    }

    if (action === 'process_refund') {
      const { transaction_id, amount, reason } = body;

      // Get original transaction
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', transaction_id)
        .single();

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      // In production, would call gateway API
      const { data: refund, error } = await supabase
        .from('payment_refunds')
        .insert({
          transaction_id,
          amount: amount || transaction.amount,
          reason,
          status: 'pending',
          gateway: transaction.gateway
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Simulate refund processing
      await supabase
        .from('payment_refunds')
        .update({ status: 'succeeded', processed_at: new Date().toISOString() })
        .eq('id', refund.id);

      return NextResponse.json({ refund: { ...refund, status: 'succeeded' } }, { status: 201 });
    }

    if (action === 'respond_dispute') {
      const { dispute_id, evidence, response_type } = body;

      const { data, error } = await supabase
        .from('payment_disputes')
        .update({
          evidence,
          response_type,
          responded_at: new Date().toISOString(),
          status: 'under_review'
        })
        .eq('id', dispute_id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ dispute: data });
    }

    if (action === 'configure_checkout') {
      const { enabled_gateways, default_gateway, currency, checkout_options } = body;

      const { data, error } = await supabase
        .from('checkout_configuration')
        .upsert({
          id: 'default',
          enabled_gateways: enabled_gateways || [],
          default_gateway,
          currency: currency || 'USD',
          checkout_options: checkout_options || {},
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ configuration: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process payment request' }, { status: 500 });
  }
}
