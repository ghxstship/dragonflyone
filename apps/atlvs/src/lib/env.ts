import { z } from "zod";

const isProduction = process.env.NODE_ENV === 'production';

// In production, critical variables are required. In development, they're optional.
const serverSchema = z.object({
  // Database - required in production
  SUPABASE_URL: isProduction ? z.string().url() : z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: isProduction ? z.string().min(1) : z.string().min(1).optional(),
  // Admin access - optional (feature flag)
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
