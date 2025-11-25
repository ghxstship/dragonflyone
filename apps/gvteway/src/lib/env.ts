import { z } from "zod";

const serverSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_SANDBOX_SIGNATURE: z.string().min(1).optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  ADMIN_API_TOKEN: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
});

type EnvSchema = z.infer<typeof serverSchema>;

let _env: EnvSchema | null = null;

function getEnv(): EnvSchema {
  if (_env) return _env;
  
  _env = serverSchema.parse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_SANDBOX_SIGNATURE: process.env.TWILIO_SANDBOX_SIGNATURE,
    APP_URL: process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ADMIN_API_TOKEN: process.env.ADMIN_API_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  });
  
  return _env;
}

// Lazy-loaded env object that validates at runtime, not build time
export const env = new Proxy({} as EnvSchema, {
  get(_target, prop: keyof EnvSchema) {
    return getEnv()[prop];
  },
});

export const stripeWebhookSecret = () => env.STRIPE_WEBHOOK_SECRET;
export const twilioAuthToken = () => env.TWILIO_AUTH_TOKEN;
export const twilioSandboxSignature = () => env.TWILIO_SANDBOX_SIGNATURE;
