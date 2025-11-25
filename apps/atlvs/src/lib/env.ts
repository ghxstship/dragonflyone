import { z } from "zod";

const serverSchema = z.object({
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ADMIN_API_TOKEN: z.string().min(1).optional(),
});

type EnvSchema = z.infer<typeof serverSchema>;

let _env: EnvSchema | null = null;

function getEnv(): EnvSchema {
  if (_env) return _env;
  
  _env = serverSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN,
  });
  
  return _env;
}

// Lazy-loaded env object that validates at runtime, not build time
export const env = new Proxy({} as EnvSchema, {
  get(_target, prop: keyof EnvSchema) {
    return getEnv()[prop];
  },
});
