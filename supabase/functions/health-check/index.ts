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

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: CheckResult;
    auth: CheckResult;
    storage?: CheckResult;
  };
  uptime: number;
  version: string;
}

interface CheckResult {
  status: "pass" | "fail";
  responseTime?: number;
  error?: string;
}

const startTime = Date.now();

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  const healthCheck: HealthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      auth: await checkAuth(),
    },
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: "1.0.0",
  };

  const failedChecks = Object.values(healthCheck.checks).filter(
    (check) => check.status === "fail"
  );

  if (failedChecks.length > 0) {
    healthCheck.status = failedChecks.length === Object.keys(healthCheck.checks).length
      ? "unhealthy"
      : "degraded";
  }

  const statusCode = healthCheck.status === "healthy" ? 200 : 503;

  return new Response(JSON.stringify(healthCheck, null, 2), {
    status: statusCode,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase
      .from("organizations")
      .select("id")
      .limit(1);

    if (error) {
      return {
        status: "fail",
        error: error.message,
        responseTime: Date.now() - start,
      };
    }

    return {
      status: "pass",
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "fail",
      error: (error as Error).message,
      responseTime: Date.now() - start,
    };
  }
}

async function checkAuth(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      return {
        status: "fail",
        error: error.message,
        responseTime: Date.now() - start,
      };
    }

    return {
      status: "pass",
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "fail",
      error: (error as Error).message,
      responseTime: Date.now() - start,
    };
  }
}
