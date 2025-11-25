import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface DealPayload {
  deal_id: string;
  project_code: string;
  project_name: string;
  department_id?: string;
  organization_id: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

async function upsertProject(payload: DealPayload) {
  const { data, error } = await supabase
    .from("projects")
    .upsert(
      {
        organization_id: payload.organization_id,
        deal_id: payload.deal_id,
        code: payload.project_code,
        name: payload.project_name,
        department_id: payload.department_id ?? null,
        budget: payload.budget ?? null,
        start_date: payload.start_date ?? null,
        end_date: payload.end_date ?? null,
      },
      { onConflict: "deal_id" },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as DealPayload;

    if (!payload.deal_id || !payload.project_code || !payload.organization_id || !payload.project_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const project = await upsertProject(payload);

    return new Response(JSON.stringify({ status: "ok", project }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("deal-project-handoff failure", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
