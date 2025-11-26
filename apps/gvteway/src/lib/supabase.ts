import { 
  supabase as configSupabase, 
  getServerSupabase,
  fromUntyped,
  type TypedSupabaseClient,
  type UntypedSupabaseClient,
} from '@ghxstship/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create untyped clients for gvteway which has many dynamic tables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Untyped Supabase client for browser usage.
 * Gvteway uses many dynamic tables not in the type definitions.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Untyped Supabase admin client for server usage.
 * Gvteway uses many dynamic tables not in the type definitions.
 */
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

/**
 * Helper to access tables dynamically or tables not in generated types.
 * Use this when you need to access tables by string name.
 * 
 * @example
 * const { data } = await fromDynamic(supabase, 'my_table').select('*');
 */
export function fromDynamic(client: TypedSupabaseClient, table: string) {
  return fromUntyped(client, table);
}

/**
 * Create an untyped Supabase client for fully dynamic access.
 * Only use this when you need complete flexibility with table names.
 */
export function getUntypedClient(): UntypedSupabaseClient {
  return supabase as unknown as UntypedSupabaseClient;
}

/**
 * Create an untyped Supabase admin client for fully dynamic access.
 * Only use this when you need complete flexibility with table names.
 */
export function getUntypedAdminClient(): UntypedSupabaseClient {
  return supabaseAdmin as unknown as UntypedSupabaseClient;
}

export { getServerSupabase, fromUntyped };
export type { TypedSupabaseClient, UntypedSupabaseClient };
export * from '@ghxstship/config/auth-helpers';
export * from '@ghxstship/config/rpc-client';
