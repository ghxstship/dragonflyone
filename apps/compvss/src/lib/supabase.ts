import { supabase as typedSupabase, getServerSupabase } from '@ghxstship/config';

export { getServerSupabase };
export const supabaseAdmin = getServerSupabase() as any;
// Export untyped supabase for API routes to avoid type instantiation depth errors
export const supabase = typedSupabase as any;

export * from '@ghxstship/config/auth-helpers';
export * from '@ghxstship/config/rpc-client';
