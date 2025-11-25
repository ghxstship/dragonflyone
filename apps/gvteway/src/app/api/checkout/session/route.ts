import { NextResponse } from "next/server";
import { z } from "zod";
import type Stripe from "stripe";

import {
  MAX_TICKETS_PER_ORDER,
  getEventById,
  getTicketTypeById,
  getTicketAvailability,
} from "@/data/gvteway";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";

const checkoutPayloadSchema = z.object({
  eventId: z.string(),
  email: z.string().email(),
  ticketSelections: z
    .array(
      z.object({
        ticketTypeId: z.string(),
        quantity: z.number().int().min(1).max(MAX_TICKETS_PER_ORDER),
      })
    )
    .min(1, "Select at least one ticket"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  referralCode: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = checkoutPayloadSchema.parse(json);

    const event = getEventById(payload.eventId);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const invalidSelection = payload.ticketSelections.find((selection) => {
      const ticket = getTicketTypeById(selection.ticketTypeId);
      return !ticket || ticket.eventId !== event.id;
    });

    if (invalidSelection) {
      return NextResponse.json({ error: "Invalid ticket selection" }, { status: 400 });
    }

    const totalRequested = payload.ticketSelections.reduce((acc, selection) => acc + selection.quantity, 0);

    if (totalRequested > MAX_TICKETS_PER_ORDER) {
      return NextResponse.json(
        { error: `Maximum ${MAX_TICKETS_PER_ORDER} tickets allowed per order` },
        { status: 400 }
      );
    }

    const insufficientTicket = payload.ticketSelections.find((selection) => {
      const available = getTicketAvailability(selection.ticketTypeId);
      return selection.quantity > available;
    });

    if (insufficientTicket) {
      const ticket = getTicketTypeById(insufficientTicket.ticketTypeId);
      return NextResponse.json(
        {
          error: `Not enough inventory for ${ticket?.name ?? "selected ticket"}`,
        },
        { status: 409 }
      );
    }

    const lineItems = payload.ticketSelections.map((selection) => {
      const ticket = getTicketTypeById(selection.ticketTypeId)!;
      const unitAmount = ticket.priceCents + ticket.serviceFeeCents;

      return {
        price_data: {
          currency: ticket.currency,
          unit_amount: unitAmount,
          product_data: {
            name: `${event.title} · ${ticket.name}`,
            metadata: {
              eventId: event.id,
              ticketTypeId: ticket.id,
              tier: ticket.tier,
              ticketName: ticket.name,
              priceCents: String(ticket.priceCents),
              serviceFeeCents: String(ticket.serviceFeeCents),
            },
          },
        },
        quantity: selection.quantity,
      } satisfies Stripe.Checkout.SessionCreateParams.LineItem;
    });

    const successUrl =
      payload.successUrl ?? `${env.APP_URL.replace(/\/?$/, "")}/checkout/success?event=${event.slug}`;
    const cancelUrl = payload.cancelUrl ?? `${env.APP_URL.replace(/\/?$/, "")}/events/${event.slug}`;

    const ticketSelectionsJson = JSON.stringify(payload.ticketSelections);
    const sharedMetadata = {
      eventId: event.id,
      eventSlug: event.slug,
      referralCode: payload.referralCode ?? "",
      ticketSelections: ticketSelectionsJson,
    } satisfies Record<string, string>;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: payload.email,
      allow_promotion_codes: true,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sharedMetadata,
      payment_intent_data: {
        metadata: sharedMetadata,
      },
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ id: session.id, url: session.url }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }

    console.error("Stripe checkout session error", error);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
