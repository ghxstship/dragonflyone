import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

import { registerRefundForPaymentIntent } from "@/lib/orders";
import { stripe } from "@/lib/stripe";
import { authorizeAdminRequest } from "@/lib/admin-auth";

const refundSchema = z.object({
  paymentIntentId: z.string().min(1),
  amountCents: z.number().int().positive().optional(),
  reason: z.string().max(255).optional(),
});

export async function POST(request: Request) {
  if (!authorizeAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof refundSchema>;
  try {
    const body = await request.json();
    payload = refundSchema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const paymentIntent = (await stripe.paymentIntents.retrieve(payload.paymentIntentId)) as Stripe.PaymentIntent;

    const amount = payload.amountCents ?? paymentIntent.amount_received ?? paymentIntent.amount ?? 0;

    if (amount <= 0) {
      return NextResponse.json({ error: "Nothing to refund" }, { status: 400 });
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntent.id,
      amount,
      reason: payload.reason as Stripe.RefundCreateParams.Reason | undefined,
    });

    await registerRefundForPaymentIntent(paymentIntent.id, refund.id ?? paymentIntent.latest_charge ?? paymentIntent.id, refund.amount ?? amount, refund.currency ?? paymentIntent.currency ?? "usd");

    return NextResponse.json({ status: "ok", refund });
  } catch (error) {
    console.error("Admin refund error", error);
    return NextResponse.json({ error: "Unable to process refund" }, { status: 500 });
  }
}
