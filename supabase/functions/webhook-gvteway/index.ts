// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const gvtewayWebhookSecret = Deno.env.get("GVTEWAY_WEBHOOK_SECRET");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

if (!gvtewayWebhookSecret) {
  throw new Error("Missing GVTEWAY_WEBHOOK_SECRET env var");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const encoder = new TextEncoder();

async function verifyHmacSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null
): Promise<boolean> {
  if (!signature || !timestamp) return false;

  const toleranceSeconds = 5 * 60;
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);

  if (Number.isNaN(ts) || Math.abs(now - ts) > toleranceSeconds) return false;

  const payload = encoder.encode(`${timestamp}.${rawBody}`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(gvtewayWebhookSecret!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign("HMAC", key, payload);
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signature === expectedSignature;
}

async function logWebhookEvent(
  eventType: string | null,
  payload: Record<string, unknown>,
  status: "received" | "validated" | "rejected" | "processed",
  failureReason?: string
) {
  await supabase.from("webhook_event_logs").insert({
    provider: "gvteway",
    event_type: eventType,
    payload,
    status,
    failure_reason: failureReason ?? null,
  });
}

async function processGvtewayEvent(
  eventType: string,
  payload: Record<string, unknown>
) {
  switch (eventType) {
    case "ticket.purchased":
      await processTicketPurchased(payload);
      break;
    case "ticket.refunded":
      await processTicketRefunded(payload);
      break;
    case "event.created":
      await processEventCreated(payload);
      break;
    case "event.updated":
      await processEventUpdated(payload);
      break;
    case "order.completed":
      await processOrderCompleted(payload);
      break;
    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

async function processTicketPurchased(payload: Record<string, unknown>) {
  const { event_id, order_id, amount, currency, ticket_count } = payload;

  await supabase.from("ticket_revenue_ingestions").insert({
    organization_id: payload.organization_id as string,
    event_id: event_id as string,
    order_id: order_id as string,
    amount: amount as number,
    currency: currency as string || "USD",
    ticket_count: ticket_count as number,
    ingested_at: new Date().toISOString(),
    metadata: payload,
  });
}

async function processTicketRefunded(payload: Record<string, unknown>) {
  const { order_id, refund_amount } = payload;

  await supabase
    .from("ticket_revenue_ingestions")
    .update({
      refund_amount: refund_amount as number,
      refunded_at: new Date().toISOString(),
    })
    .eq("order_id", order_id);
}

async function processEventCreated(payload: Record<string, unknown>) {
  const { event_id, project_id } = payload;

  if (project_id) {
    await supabase.from("integration_event_links").insert({
      organization_id: payload.organization_id as string,
      gvteway_event_id: event_id as string,
      compvss_project_id: project_id as string,
      atlvs_deal_id: payload.deal_id as string || null,
      sync_status: "active",
      metadata: payload,
    });
  }
}

async function processEventUpdated(payload: Record<string, unknown>) {
  const { event_id } = payload;

  await supabase
    .from("integration_event_links")
    .update({
      last_sync_at: new Date().toISOString(),
      metadata: payload,
    })
    .eq("gvteway_event_id", event_id);
}

async function processOrderCompleted(payload: Record<string, unknown>) {
  const { event_id, order_id, total_amount, currency } = payload;

  await supabase.from("ticket_revenue_ingestions").insert({
    organization_id: payload.organization_id as string,
    event_id: event_id as string,
    order_id: order_id as string,
    amount: total_amount as number,
    currency: currency as string || "USD",
    ticket_count: payload.line_items?.length ?? 1,
    ingested_at: new Date().toISOString(),
    metadata: payload,
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-gvteway-signature");
  const timestamp = req.headers.get("x-gvteway-timestamp");

  const verified = await verifyHmacSignature(rawBody, signature, timestamp);
  if (!verified) {
    await logWebhookEvent(
      null,
      {},
      "rejected",
      "Invalid GVTEWAY signature or expired timestamp"
    );
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType = payload?.event_type ?? payload?.type ?? null;

    await logWebhookEvent(eventType, payload, "validated");

    if (eventType) {
      await processGvtewayEvent(eventType, payload);
      await logWebhookEvent(eventType, payload, "processed");
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    await logWebhookEvent(
      null,
      {},
      "rejected",
      `Processing error: ${error.message}`
    );
    console.error("GVTEWAY webhook processing error", error);
    return new Response(
      JSON.stringify({ error: "Internal processing error" }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
});
