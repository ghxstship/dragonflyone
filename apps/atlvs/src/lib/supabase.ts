import { 
  supabase as configSupabase, 
  getServerSupabase,
  fromUntyped,
  type TypedSupabaseClient,
  type UntypedSupabaseClient,
} from '@ghxstship/config';

/**
 * Typed Supabase client for browser usage.
 * Use this for tables defined in supabase-types.ts
 */
export const supabase = configSupabase;

/**
 * Typed Supabase admin client for server usage.
 * Use this for tables defined in supabase-types.ts
 * Note: This is a function to avoid module-level initialization during build
 */
export const getSupabaseAdmin = getServerSupabase;

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
  return getSupabaseAdmin() as unknown as UntypedSupabaseClient;
}

/**
 * Create a Supabase admin client for API routes.
 * Call this inside request handlers, not at module level.
 */
export function createAdminClient() {
  return getServerSupabase();
}

export { getServerSupabase, fromUntyped };
export type { TypedSupabaseClient, UntypedSupabaseClient };
export * from '@ghxstship/config/auth-helpers';
export * from '@ghxstship/config/rpc-client';
