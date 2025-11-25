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

serve(async (_req: Request): Promise<Response> => {
  try {
    console.log("Starting cache warming process...");

    await Promise.all([
      supabase.rpc('refresh_all_materialized_views'),
      warmOrganizationCaches(),
      warmDashboardCaches(),
    ]);

    console.log("Cache warming complete");

    return new Response(
      JSON.stringify({ success: true, message: "Cache warmed successfully" }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Cache warming error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
});

async function warmOrganizationCaches() {
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id')
    .limit(100);

  if (!orgs) return;

  await Promise.all(
    orgs.map(org =>
      supabase.rpc('rpc_dashboard_metrics', { p_org_id: org.id })
    )
  );
}

async function warmDashboardCaches() {
  await supabase
    .from('mv_executive_dashboard')
    .select('*')
    .limit(100);

  await supabase
    .from('mv_project_financials')
    .select('*')
    .limit(100);

  await supabase
    .from('mv_asset_utilization')
    .select('*')
    .limit(100);
}
