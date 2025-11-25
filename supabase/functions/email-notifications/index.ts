import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const resendApiKey = Deno.env.get("RESEND_API_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE environment variables");
}

if (!resendApiKey) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface NotificationRequest {
  type: string;
  recipient_email: string;
  data: Record<string, unknown>;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  try {
    const { type, recipient_email, data }: NotificationRequest = await req.json();

    const emailContent = buildEmailContent(type, data);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GHXSTSHIP <notifications@ghxstship.pro>",
        to: [recipient_email],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.statusText}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, email_id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Email notification error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      }
    );
  }
});

function buildEmailContent(type: string, data: Record<string, unknown>): { subject: string; html: string } {
  switch (type) {
    case "deal_won":
      return {
        subject: `Deal Won: ${data.title}`,
        html: `<p>Congratulations! Deal "${data.title}" has been marked as won.</p><p>Value: $${data.value}</p>`,
      };
    case "project_created":
      return {
        subject: `New Project: ${data.name}`,
        html: `<p>A new project "${data.name}" (${data.code}) has been created.</p><p>Budget: $${data.budget}</p>`,
      };
    case "expense_submitted":
      return {
        subject: `Expense Submitted for Approval`,
        html: `<p>An expense of $${data.amount} has been submitted for your approval.</p><p>Description: ${data.description}</p>`,
      };
    case "purchase_order_approved":
      return {
        subject: `Purchase Order Approved: ${data.order_number}`,
        html: `<p>Purchase order ${data.order_number} has been approved.</p><p>Total: $${data.total_amount}</p>`,
      };
    default:
      return {
        subject: "GHXSTSHIP Notification",
        html: `<p>You have a new notification from GHXSTSHIP.</p>`,
      };
  }
}
