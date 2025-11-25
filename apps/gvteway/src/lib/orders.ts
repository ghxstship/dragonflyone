import type Stripe from "stripe";
import { z } from "zod";

import { supabaseAdmin } from "./supabase";
import { sendEmail } from "./email";

const ticketSelectionSchema = z.object({
  ticketTypeId: z.string().min(1),
  quantity: z
    .union([z.number(), z.string()])
    .transform((value) => (typeof value === "string" ? parseInt(value, 10) : value))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "Quantity must be a positive integer",
    }),
});

export type TicketSelection = z.infer<typeof ticketSelectionSchema>;

type TicketRecord = {
  id: string;
  event_id: string;
  name: string;
  tier: string;
  price_cents: number;
  service_fee_cents: number;
  currency: string;
  gvteway_events?: Array<{
    slug?: string | null;
  }> | null;
};

export type OrderItemPayload = {
  ticket_type_id: string;
  ticket_name: string;
  tier: string;
  quantity: number;
  unit_price_cents: number;
  service_fee_cents: number;
};

const orderStatusSchema = z.enum(["pending", "processing", "requires_action", "succeeded", "failed", "refunded"]);

function normalizeSelections(selections: TicketSelection[]): TicketSelection[] {
  const map = new Map<string, number>();

  selections.forEach((selection) => {
    map.set(selection.ticketTypeId, (map.get(selection.ticketTypeId) ?? 0) + selection.quantity);
  });

  return Array.from(map.entries()).map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
}

async function fetchTicketRecords(ids: string[]): Promise<TicketRecord[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("gvteway_ticket_types")
    .select("id,event_id,name,tier,price_cents,service_fee_cents,currency,gvteway_events(slug)")
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to load ticket definitions: ${error.message}`);
  }

  return data ?? [];
}

function derivePaymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null | undefined) {
  if (!paymentIntent) {
    return null;
  }
  if (typeof paymentIntent === "string") {
    return paymentIntent;
  }
  return paymentIntent.id ?? null;
}

export function parseTicketSelections(metadataValue?: string | null): TicketSelection[] {
  if (!metadataValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(metadataValue);
    const arraySchema = z.array(ticketSelectionSchema);
    const selections = arraySchema.parse(parsed);
    return normalizeSelections(selections);
  } catch (error) {
    console.error("Unable to parse ticket selections metadata", error);
    return [];
  }
}

async function buildOrderItems(selections: TicketSelection[]) {
  const ids = selections.map((selection) => selection.ticketTypeId);
  const uniqueIds = Array.from(new Set(ids));
  const records = await fetchTicketRecords(uniqueIds);
  const recordMap = new Map(records.map((record) => [record.id, record]));

  const orderItems: OrderItemPayload[] = selections.map((selection) => {
    const record = recordMap.get(selection.ticketTypeId);
    if (!record) {
      throw new Error(`Unknown ticket type ${selection.ticketTypeId}`);
    }

    return {
      ticket_type_id: record.id,
      ticket_name: record.name,
      tier: record.tier,
      quantity: selection.quantity,
      unit_price_cents: record.price_cents,
      service_fee_cents: record.service_fee_cents,
    };
  });

  const eventIds = new Set(records.map((record) => record.event_id));
  if (eventIds.size !== 1) {
    throw new Error("Ticket selections span multiple events");
  }

  const currencySet = new Set(records.map((record) => record.currency ?? "usd"));
  if (currencySet.size !== 1) {
    throw new Error("Ticket selections span multiple currencies");
  }

  return {
    orderItems,
    eventId: records[0]?.event_id,
    currency: Array.from(currencySet)[0] ?? "usd",
    eventSlugFromDb: records[0]?.gvteway_events?.[0]?.slug ?? null,
  };
}

export async function createOrderFromCheckoutSession(session: Stripe.Checkout.Session, selections: TicketSelection[]) {
  if (!selections.length) {
    throw new Error("Cannot create order without ticket selections");
  }

  const { orderItems, eventId, currency, eventSlugFromDb } = await buildOrderItems(selections);

  const paymentIntentId = derivePaymentIntentId(session.payment_intent);
  const metadata: Record<string, string> = Object.fromEntries(
    Object.entries(session.metadata ?? {}).map(([key, value]) => [key, value ?? ""]),
  );

  const eventSlug = metadata.eventSlug ?? eventSlugFromDb ?? "";
  const referralCode = metadata.referralCode ?? null;
  const ticketSelectionsMeta = metadata.ticketSelections ?? null;

  const amountFeeCents = orderItems.reduce((acc, item) => acc + item.service_fee_cents * item.quantity, 0);
  const amountSubtotalFromItems = orderItems.reduce(
    (acc, item) => acc + (item.unit_price_cents + item.service_fee_cents) * item.quantity,
    0,
  );

  const amountSubtotalCents = session.amount_subtotal ?? amountSubtotalFromItems;
  const amountTotalCents = session.amount_total ?? amountSubtotalCents;

  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;

  const { data, error } = await supabaseAdmin.rpc("gvteway_create_order", {
    p_checkout_session_id: session.id,
    p_payment_intent_id: paymentIntentId,
    p_event_id: eventId,
    p_event_slug: eventSlug,
    p_customer_email: customerEmail,
    p_referral_code: referralCode,
    p_currency: session.currency ?? currency,
    p_amount_subtotal_cents: amountSubtotalCents,
    p_amount_fee_cents: amountFeeCents,
    p_amount_total_cents: amountTotalCents,
    p_metadata: {
      ...metadata,
      ticketSelections: ticketSelectionsMeta,
    },
    p_items: orderItems,
  });

  if (error) {
    throw new Error(`Failed to create GVTEWAY order: ${error.message}`);
  }

  if (customerEmail) {
    const orderSummary = orderItems
      .map(
        (item) =>
          `${item.quantity} × ${item.ticket_name} (${(item.unit_price_cents / 100).toLocaleString("en-US", {
            style: "currency",
            currency,
          })})`,
      )
      .join("<br/>");

    await sendEmail({
      to: customerEmail,
      subject: `GVTEWAY order confirmed · ${eventSlug || "GHXSTSHIP"}`,
      html: `
        <p>Thank you for securing access to ${eventSlug || "the latest GHXSTSHIP experience"}.</p>
        <p><strong>Order ID:</strong> ${session.id}</p>
        <p><strong>Tickets</strong><br/>${orderSummary}</p>
        <p>Total: ${(amountTotalCents / 100).toLocaleString("en-US", { style: "currency", currency })}</p>
      `,
    });
  }

  return data;
}

export async function updateOrderStatusFromPaymentIntent(
  paymentIntentId: string | null,
  status: z.infer<typeof orderStatusSchema>,
  amountReceivedCents?: number | null,
  reason?: string | null,
) {
  if (!paymentIntentId) {
    return null;
  }

  orderStatusSchema.parse(status);

  const { data, error } = await supabaseAdmin.rpc("gvteway_update_order_status", {
    p_payment_intent_id: paymentIntentId,
    p_status: status,
    p_amount_received_cents: amountReceivedCents ?? null,
    p_reason: reason ?? null,
  });

  if (error) {
    throw new Error(`Failed to update GVTEWAY order: ${error.message}`);
  }

  return data;
}

export async function registerRefundForPaymentIntent(
  paymentIntentId: string | null,
  chargeId: string,
  amountCents: number,
  currency: string,
) {
  if (!paymentIntentId) {
    return null;
  }

  const { data, error } = await supabaseAdmin.rpc("gvteway_register_refund", {
    p_payment_intent_id: paymentIntentId,
    p_charge_id: chargeId,
    p_amount_cents: amountCents,
    p_currency: currency,
  });

  if (error) {
    throw new Error(`Failed to register GVTEWAY refund: ${error.message}`);
  }

  return data;
}
