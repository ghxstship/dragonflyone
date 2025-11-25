/// <reference types="@supabase/supabase-js" />
/// <reference lib="deno.ns" />

declare module "https://deno.land/std@0.224.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { signal?: AbortSignal },
  ): Promise<void> | void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.47.6" {
  export * from "@supabase/supabase-js";
}
