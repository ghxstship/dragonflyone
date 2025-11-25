import { supabase as typedSupabase, getServerSupabase } from '@ghxstship/config';

// Export untyped supabase clients to avoid TypeScript type instantiation depth errors
export const supabase = typedSupabase as any;
export const supabaseAdmin = getServerSupabase() as any;

export * from '@ghxstship/config/auth-helpers';
export * from '@ghxstship/config/rpc-client';
