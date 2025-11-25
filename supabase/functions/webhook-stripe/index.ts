// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

if (!stripeWebhookSecret) {
  throw new Error("Missing STRIPE_WEBHOOK_SECRET env var");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const encoder = new TextEncoder();

function parseStripeSignature(signatureHeader: string | null) {
  if (!signatureHeader) return null;
  const parts = signatureHeader.split(",").map((part) => part.trim().split("="));
  const tsPart = parts.find(([key]) => key === "t");
  const v1Part = parts.find(([key]) => key === "v1");
  if (!tsPart || !v1Part || !tsPart[1] || !v1Part[1]) return null;
  return { timestamp: Number(tsPart[1]), signature: v1Part[1] };
}

function hexToUint8Array(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

async function verifyStripeSignature(rawBody: string, header: string | null) {
  const parsed = parseStripeSignature(header);
  if (!parsed || Number.isNaN(parsed.timestamp)) return false;
  const toleranceSeconds = 5 * 60;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parsed.timestamp) > toleranceSeconds) return false;
  const data = encoder.encode(`${parsed.timestamp}.${rawBody}`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(stripeWebhookSecret!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const signatureBytes = hexToUint8Array(parsed.signature);
  return crypto.subtle.verify({ name: "HMAC" }, key, signatureBytes, data);
}

async function logWebhookEvent(
  eventType: string | null,
  payload: Record<string, unknown>,
  status: 'received' | 'validated' | 'rejected' | 'processed',
  failureReason?: string,
) {
  await supabase.from('webhook_event_logs').insert({
    provider: 'stripe',
    event_type: eventType,
    payload,
    status,
    failure_reason: failureReason ?? null,
  });
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  const verified = await verifyStripeSignature(rawBody, signature);
  if (!verified) {
    await logWebhookEvent(null, {}, 'rejected', 'Invalid Stripe signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType = payload?.type ?? null;
    await logWebhookEvent(eventType, payload, 'validated');
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    await logWebhookEvent(null, {}, 'rejected', 'Malformed JSON payload');
    console.error('Stripe webhook parse error', error);
    return new Response(JSON.stringify({ error: 'Bad Request' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
});
