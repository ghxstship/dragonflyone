// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

if (!twilioAuthToken) {
  throw new Error("Missing TWILIO_AUTH_TOKEN env var");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function logWebhook(status: 'received' | 'validated' | 'rejected' | 'processed', payload: Record<string, unknown>, failureReason?: string) {
  await supabase.from('webhook_event_logs').insert({
    provider: 'twilio',
    event_type: payload?.EventType ?? payload?.SmsStatus ?? null,
    headers: {},
    payload,
    status,
    failure_reason: failureReason ?? null,
  });
}

function buildSignaturePayload(url: string, params: URLSearchParams) {
  const data = new URLSearchParams(params);
  const ordered = Array.from(data.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  let payload = url;
  for (const [key, value] of ordered) {
    payload += key + value;
  }
  return payload;
}

async function validateTwilioSignature(req: Request, rawBody: string) {
  const signatureHeader = req.headers.get('x-twilio-signature');
  if (!signatureHeader) {
    return false;
  }

  const url = req.headers.get('x-forwarded-url') ?? req.url;
  const contentType = req.headers.get('content-type') ?? '';
  let payloadToSign = '';

  if (contentType.includes('application/x-www-form-urlencoded')) {
    payloadToSign = buildSignaturePayload(url, new URLSearchParams(rawBody));
  } else if (contentType.includes('application/json')) {
    payloadToSign = url + rawBody;
  } else {
    payloadToSign = url;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(twilioAuthToken),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadToSign));
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return computedSignature === signatureHeader;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  }

  const rawBody = await req.text();
  const payload = req.headers.get('content-type')?.includes('application/x-www-form-urlencoded')
    ? Object.fromEntries(new URLSearchParams(rawBody).entries())
    : (() => {
        try {
          return JSON.parse(rawBody);
        } catch (error) {
          console.error('Unable to parse Twilio payload as JSON', error);
          return {};
        }
      })();

  const isValid = await validateTwilioSignature(req, rawBody);
  if (!isValid) {
    await logWebhook('rejected', payload, 'Invalid Twilio signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  await logWebhook('validated', payload);
  return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: { 'content-type': 'application/json' } });
});
