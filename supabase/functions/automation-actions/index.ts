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

interface ActionRequest {
  action_code: string;
  payload: Record<string, unknown>;
  organization_id: string;
}

interface ActionResponse {
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
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
    if (req.method === "GET") {
      const url = new URL(req.url);
      const platform = url.searchParams.get("platform") || "ATLVS";

      const { data, error } = await supabase
        .from("automation_action_catalog")
        .select("*")
        .eq("platform", platform)
        .order("action_code");

      if (error) throw error;

      return new Response(JSON.stringify({ actions: data }), {
        status: 200,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body: ActionRequest = await req.json();

      if (!body.action_code || !body.organization_id) {
        return new Response(
          JSON.stringify({
            error: "action_code and organization_id are required",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "content-type": "application/json" },
          }
        );
      }

      const result = await executeAction(
        body.action_code,
        body.payload,
        body.organization_id
      );

      await supabase.from("automation_usage_log").insert({
        organization_id: body.organization_id,
        automation_type: "action",
        automation_code: body.action_code,
        payload: body.payload,
        result: result.result || null,
        status: result.success ? "success" : "failed",
        error_message: result.error || null,
      });

      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Automation actions error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" },
      }
    );
  }
});

async function executeAction(
  actionCode: string,
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  try {
    switch (actionCode) {
      case "create.contact":
        return await createContact(payload, organizationId);
      case "create.deal":
        return await createDeal(payload, organizationId);
      case "create.project":
        return await createProject(payload, organizationId);
      case "update.deal_status":
        return await updateDealStatus(payload, organizationId);
      case "assign.asset":
        return await assignAsset(payload, organizationId);
      case "create.expense":
        return await createExpense(payload, organizationId);
      case "send.notification":
        return await sendNotification(payload, organizationId);
      default:
        return {
          success: false,
          error: `Unknown action code: ${actionCode}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

async function createContact(
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  const { data, error } = await supabase.from("contacts").insert({
    organization_id: organizationId,
    company: payload.company as string,
    first_name: payload.first_name as string,
    last_name: payload.last_name as string,
    email: payload.email as string,
    phone: payload.phone as string,
    metadata: (payload.metadata as Record<string, unknown>) || {},
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, result: data };
}

async function createDeal(
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  const { data, error } = await supabase.from("deals").insert({
    organization_id: organizationId,
    contact_id: payload.contact_id as string,
    title: payload.title as string,
    status: (payload.status as string) || "lead",
    value: payload.value as number,
    expected_close_date: payload.expected_close_date as string,
    probability: payload.probability as number,
    notes: payload.notes as string,
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, result: data };
}

async function createProject(
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  const { data, error } = await supabase.from("projects").insert({
    organization_id: organizationId,
    deal_id: payload.deal_id as string,
    department_id: payload.department_id as string,
    code: payload.code as string,
    name: payload.name as string,
    phase: (payload.phase as string) || "intake",
    budget: payload.budget as number,
    currency: (payload.currency as string) || "USD",
    start_date: payload.start_date as string,
    end_date: payload.end_date as string,
    metadata: (payload.metadata as Record<string, unknown>) || {},
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, result: data };
}

async function updateDealStatus(
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  const { data, error } = await supabase
    .from("deals")
    .update({ status: payload.status as string })
    .eq("id", payload.deal_id as string)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, result: data };
}

async function assignAsset(
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  const { data, error } = await supabase
    .from("assets")
    .update({
      project_id: payload.project_id as string,
      state: "reserved",
    })
    .eq("id", payload.asset_id as string)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, result: data };
}

async function createExpense(
  payload: Record<string, unknown>,
  organizationId: string
): Promise<ActionResponse> {
  const { data, error } = await supabase.from("finance_expenses").insert({
    organization_id: organizationId,
    employee_id: payload.employee_id as string,
    project_id: payload.project_id as string,
    category_id: payload.category_id as string,
    amount: payload.amount as number,
    currency: (payload.currency as string) || "USD",
    incurred_on: payload.incurred_on as string,
    status: (payload.status as string) || "draft",
    description: payload.description as string,
    receipt_url: payload.receipt_url as string,
    metadata: (payload.metadata as Record<string, unknown>) || {},
  }).select().single();

  if (error) return { success: false, error: error.message };
  return { success: true, result: data };
}

async function sendNotification(
  payload: Record<string, unknown>,
  _organizationId: string
): Promise<ActionResponse> {
  console.log("Notification would be sent:", payload);
  return {
    success: true,
    result: {
      message: "Notification queued",
      recipient: payload.recipient,
      subject: payload.subject,
    },
  };
}
