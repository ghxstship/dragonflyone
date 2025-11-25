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
    console.log("Starting cleanup jobs...");

    const results = await Promise.all([
      cleanupOldWebhookLogs(),
      cleanupOldAuditLogs(),
      cleanupOrphanedRecords(),
      cleanupExpiredSessions(),
    ]);

    const summary = {
      webhook_logs_deleted: results[0],
      audit_logs_deleted: results[1],
      orphaned_records_deleted: results[2],
      sessions_expired: results[3],
    };

    console.log("Cleanup complete:", summary);

    return new Response(
      JSON.stringify({ success: true, summary }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      }
    );
  }
});

async function cleanupOldWebhookLogs(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const { count } = await supabase
    .from('webhook_event_logs')
    .delete({ count: 'exact' })
    .lt('created_at', cutoffDate.toISOString());

  return count || 0;
}

async function cleanupOldAuditLogs(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 365);

  const { count } = await supabase
    .from('audit_log')
    .delete({ count: 'exact' })
    .lt('created_at', cutoffDate.toISOString());

  return count || 0;
}

async function cleanupOrphanedRecords(): Promise<number> {
  let totalDeleted = 0;

  const { count: assetsCount } = await supabase
    .from('assets')
    .update({ project_id: null })
    .not('project_id', 'is', null)
    .not('project_id', 'in', `(select id from projects)`)
    .select('*', { count: 'exact', head: true });

  totalDeleted += assetsCount || 0;

  return totalDeleted;
}

async function cleanupExpiredSessions(): Promise<number> {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error || !data) return 0;

  let expiredCount = 0;

  for (const user of data.users) {
    if (user.last_sign_in_at) {
      const lastSignIn = new Date(user.last_sign_in_at);
      const daysSinceLastSignIn = (Date.now() - lastSignIn.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastSignIn > 90) {
        await supabase.auth.admin.signOut(user.id);
        expiredCount++;
      }
    }
  }

  return expiredCount;
}
