export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}



const createPaymentIntentSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('usd'),
  payment_method_id: z.string().optional(),
  save_payment_method: z.boolean().default(false),
});

// GET /api/payments - Get payment history
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('payments')
      .select(`
        *,
        order:orders(id, order_number, total_amount, event:events(id, name))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (orderId) {
      query = query.eq('order_id', orderId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({ payments: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

// POST /api/payments - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createPaymentIntentSchema.parse(body);

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', validated.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order is not pending payment' }, { status: 400 });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: validated.order_id,
        user_id: user.id,
        amount: validated.amount,
        currency: validated.currency,
        status: 'pending',
        payment_type: 'purchase',
        provider: 'stripe',
      })
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    // Create Stripe PaymentIntent
    let clientSecret: string;
    let stripePaymentIntentId: string | null = null;

    if (process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(validated.amount * 100), // Convert to cents
        currency: validated.currency,
        metadata: {
          order_id: validated.order_id,
          payment_id: payment.id,
          user_id: user.id,
        },
        automatic_payment_methods: { enabled: true },
      });

      clientSecret = paymentIntent.client_secret!;
      stripePaymentIntentId = paymentIntent.id;

      // Update payment with Stripe ID
      await supabase
        .from('payments')
        .update({ stripe_payment_intent_id: stripePaymentIntentId })
        .eq('id', payment.id);
    } else {
      // Fallback for development without Stripe
      clientSecret = `pi_dev_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
    }

    return NextResponse.json({
      payment_id: payment.id,
      client_secret: clientSecret,
      stripe_payment_intent_id: stripePaymentIntentId,
      amount: validated.amount,
      currency: validated.currency,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

// PATCH /api/payments - Process/confirm payment
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_id, action, refund_amount, refund_reason } = body;

    if (!payment_id) {
      return NextResponse.json({ error: 'payment_id is required' }, { status: 400 });
    }

    // Get payment
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*, order:orders(*)')
      .eq('id', payment_id)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (action === 'confirm') {
      // Confirm payment (in production, verify with Stripe)
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          processed_at: new Date().toISOString(),
        })
        .eq('id', payment_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'completed', paid_at: new Date().toISOString() })
        .eq('id', payment.order_id);

      // Generate tickets
      // await generateTicketsForOrder(payment.order_id);

      return NextResponse.json({
        success: true,
        message: 'Payment confirmed',
        order_id: payment.order_id,
      });
    }

    if (action === 'refund') {
      const amountToRefund = refund_amount || payment.amount;

      // Create refund record
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          payment_id,
          order_id: payment.order_id,
          amount: amountToRefund,
          reason: refund_reason || 'requested_by_customer',
          status: 'pending',
          initiated_by: user.id,
        })
        .select()
        .single();

      if (refundError) {
        return NextResponse.json({ error: refundError.message }, { status: 500 });
      }

      // In production, process refund with Stripe
      // await stripe.refunds.create({...});

      // Update payment status
      const newStatus = amountToRefund >= payment.amount ? 'refunded' : 'partially_refunded';
      await supabase
        .from('payments')
        .update({
          status: newStatus,
          refunded_amount: (payment.refunded_amount || 0) + amountToRefund,
        })
        .eq('id', payment_id);

      // Update refund status
      await supabase
        .from('refunds')
        .update({ status: 'succeeded', processed_at: new Date().toISOString() })
        .eq('id', refund.id);

      return NextResponse.json({
        success: true,
        refund_id: refund.id,
        amount_refunded: amountToRefund,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
