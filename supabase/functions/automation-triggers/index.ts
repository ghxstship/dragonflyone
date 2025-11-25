import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TriggerRequest {
  trigger_code: string;
  platform?: string;
  organization_id?: string;
}

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const triggerCode = url.searchParams.get("trigger_code");
    const platform = url.searchParams.get("platform") || "ATLVS";

    if (req.method === "GET") {
      if (!triggerCode) {
        const { data, error } = await supabase
          .from("automation_trigger_catalog")
          .select("*")
          .eq("platform", platform)
          .order("trigger_code");

        if (error) throw error;

        return new Response(JSON.stringify({ triggers: data }), {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("automation_trigger_catalog")
        .select("*")
        .eq("trigger_code", triggerCode)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body: TriggerRequest = await req.json();

      if (!body.trigger_code) {
        return new Response(
          JSON.stringify({ error: "trigger_code is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      }

      const { data: trigger, error: triggerError } = await supabase
        .from("automation_trigger_catalog")
        .select("*")
        .eq("trigger_code", body.trigger_code)
        .single();

      if (triggerError) throw triggerError;

      const sampleData = await generateSampleData(
        body.trigger_code,
        body.organization_id
      );

      return new Response(
        JSON.stringify({
          trigger,
          sample_data: sampleData,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "content-type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Automation triggers error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      }
    );
  }
});

async function generateSampleData(
  triggerCode: string,
  organizationId?: string
): Promise<Record<string, unknown>> {
  const samples: Record<string, Record<string, unknown>> = {
    "deal.won": {
      deal_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Summer Music Festival 2024",
      contact_name: "Jane Smith",
      contact_email: "jane@example.com",
      value: 150000,
      currency: "USD",
      expected_close_date: "2024-06-01",
      organization_id: organizationId,
    },
    "project.created": {
      project_id: "660e8400-e29b-41d4-a716-446655440001",
      code: "PROJ-2024-001",
      name: "Summer Festival Production",
      phase: "intake",
      budget: 150000,
      currency: "USD",
      start_date: "2024-06-01",
      organization_id: organizationId,
    },
    "asset.reserved": {
      asset_id: "770e8400-e29b-41d4-a716-446655440002",
      tag: "LED-WALL-001",
      category: "Video",
      state: "reserved",
      project_id: "660e8400-e29b-41d4-a716-446655440001",
      reserved_from: "2024-06-15",
      reserved_to: "2024-06-20",
      organization_id: organizationId,
    },
    "expense.submitted": {
      expense_id: "880e8400-e29b-41d4-a716-446655440003",
      employee_name: "John Doe",
      amount: 250.5,
      currency: "USD",
      incurred_on: "2024-05-15",
      status: "submitted",
      description: "Equipment rental",
      organization_id: organizationId,
    },
    "purchase_order.approved": {
      purchase_order_id: "990e8400-e29b-41d4-a716-446655440004",
      order_number: "PO-2024-0045",
      vendor_name: "Pro Audio Supply",
      total_amount: 12500,
      currency: "USD",
      status: "approved",
      approved_on: "2024-05-20",
      organization_id: organizationId,
    },
  };

  return samples[triggerCode] || { trigger_code: triggerCode };
}
