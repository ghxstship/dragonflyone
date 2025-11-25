import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { apiRoute } from '@ghxstship/config/middleware';

const subscribeSchema = z.object({
  tierId: z.string().uuid(),
  paymentMethodId: z.string().min(1),
  promoCode: z.string().optional(),
});

export const POST = apiRoute(
  async (request: NextRequest, context: any) => {
    const body = await request.json();
    const { tierId, paymentMethodId, promoCode } = subscribeSchema.parse(body);
    const userId = context.user.id;

    const { data: tier, error: tierError } = await supabaseAdmin
      .from('membership_tiers')
      .select('*')
      .eq('id', tierId)
      .single();

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Membership tier not found' }, { status: 404 });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('platform_users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const subscriptionData: any = {
      customer: customerId,
      items: [{ price: tier.stripe_price_id }],
      metadata: {
        userId,
        tierId,
      },
    };

    if (promoCode) {
      const promotionCodes = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      });

      if (promotionCodes.data.length > 0) {
        subscriptionData.promotion_code = promotionCodes.data[0].id;
      }
    }

    const subscription = await stripe.subscriptions.create(subscriptionData);

    const { error: membershipError } = await supabaseAdmin.from('memberships').insert({
      user_id: userId,
      tier_id: tierId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

    if (membershipError) {
      await stripe.subscriptions.cancel(subscription.id);
      return NextResponse.json(
        { error: 'Failed to create membership', message: membershipError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: subscription.latest_invoice
        ? (subscription.latest_invoice as any).payment_intent?.client_secret
        : null,
    });
  },
  {
    auth: true,
    validation: subscribeSchema,
    audit: { action: 'membership:subscribe', resource: 'memberships' },
  }
);
