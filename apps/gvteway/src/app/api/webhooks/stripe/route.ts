import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { registerRefundForPaymentIntent, createOrderFromCheckoutSession, parseTicketSelections, updateOrderStatusFromPaymentIntent } from "@/lib/orders";
import { stripeWebhookSecret } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

async function recordStripeEvent(event: Stripe.Event) {
  const { error } = await supabaseAdmin
    .from("gvteway_stripe_events")
    .insert({
      id: event.id,
      type: event.type,
      payload: JSON.parse(JSON.stringify(event)),
    });

  if (error) {
    if (error.code === "23505") {
      return false;
    }
    throw new Error(`Failed to record Stripe event ${event.id}: ${error.message}`);
  }

  return true;
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const selections = parseTicketSelections(session.metadata?.ticketSelections);

  if (selections.length) {
    await createOrderFromCheckoutSession(session, selections);
  }

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  if (paymentIntentId) {
    await updateOrderStatusFromPaymentIntent(paymentIntentId, "succeeded", session.amount_total ?? null);
  }
}

async function handlePaymentIntent(event: Stripe.Event, status: Parameters<typeof updateOrderStatusFromPaymentIntent>[1]) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  await updateOrderStatusFromPaymentIntent(paymentIntent.id, status, paymentIntent.amount_received ?? null, paymentIntent.last_payment_error?.message ?? null);
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const paymentIntentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null;

  const refunds = charge.refunds?.data ?? [];
  if (refunds.length === 0) {
    if (charge.amount_refunded && charge.amount_refunded > 0) {
      await registerRefundForPaymentIntent(paymentIntentId, charge.id, charge.amount_refunded, charge.currency ?? "usd");
    }
    return;
  }

  for (const refund of refunds) {
    if (!refund.amount || refund.amount <= 0) {
      continue;
    }

    await registerRefundForPaymentIntent(paymentIntentId, refund.id ?? charge.id, refund.amount, refund.currency ?? charge.currency ?? "usd");
  }
}

export async function POST(request: Request) {
  const webhookSecret = stripeWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const isNewEvent = await recordStripeEvent(event);

    if (!isNewEvent) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event);
        break;
      case "payment_intent.processing":
        await handlePaymentIntent(event, "processing");
        break;
      case "payment_intent.succeeded":
        await handlePaymentIntent(event, "succeeded");
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntent(event, "failed");
        break;
      case "charge.refunded":
        await handleChargeRefunded(event);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Stripe webhook processing error for event ${event.id}`, error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
