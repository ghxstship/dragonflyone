import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

export type TypedSupabaseClient = SupabaseClient<Database>;
export type UntypedSupabaseClient = SupabaseClient<Record<string, unknown>>;

// Type for untyped query builder
type UntypedQueryBuilder = ReturnType<SupabaseClient['from']>;

// Re-export for convenience
export { SupabaseClient };

/**
 * Helper to access tables not yet in the generated types.
 * Use this for tables that exist in the database but haven't been
 * added to supabase-types.ts yet.
 *
 * Returns a query builder for the specified table.
 */
export function fromUntyped(
  client: TypedSupabaseClient,
  table: string
): UntypedQueryBuilder {
  return (client as unknown as SupabaseClient).from(table);
}

export interface AuthUser {
  id: string;
  email: string;
  platform_user_id: string;
  organization_id: string;
  roles: string[];
  current_role: string;
}

export interface SessionContext {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Create a typed Supabase client for browser usage
 */
export function createBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a typed Supabase client for server/edge usage
 */
export function createServerClient(
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get current authenticated user with platform context
 */
export async function getCurrentUser(
  supabase: TypedSupabaseClient
): Promise<AuthUser | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('id, organization_id')
    .eq('auth_user_id', user.id)
    .single() as { data: { id: string; organization_id: string } | null };

  if (!platformUser) return null;

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_code')
    .eq('platform_user_id', platformUser.id) as { data: { role_code: string }[] | null };

  const roles = userRoles?.map((r) => r.role_code) || [];
  const currentRole = roles[0] || 'ATLVS_VIEWER';

  return {
    id: user.id,
    email: user.email || '',
    platform_user_id: platformUser.id,
    organization_id: platformUser.organization_id,
    roles,
    current_role: currentRole,
  };
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: AuthUser | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

/**
 * Check if user has Legend-level access
 */
export function isLegendUser(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.roles.some((role) => role.startsWith('LEGEND_'));
}

/**
 * Check if user is admin for any platform
 */
export function isAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.roles.some((role) => 
    role.includes('ADMIN') || role.includes('SUPER_ADMIN')
  );
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  supabase: TypedSupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOut(supabase: TypedSupabaseClient) {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Sign up new user with email and password
 */
export async function signUpWithEmail(
  supabase: TypedSupabaseClient,
  email: string,
  password: string,
  metadata?: { full_name?: string }
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Request password reset email
 */
export async function resetPassword(
  supabase: TypedSupabaseClient,
  email: string,
  redirectTo?: string
) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
}

/**
 * Update user password
 */
export async function updatePassword(
  supabase: TypedSupabaseClient,
  newPassword: string
) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  supabase: TypedSupabaseClient,
  callback: (user: AuthUser | null) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser(supabase);
      callback(user);
    } else {
      callback(null);
    }
  });

  return subscription;
}

/**
 * Set custom JWT claims for role-based access
 */
export async function setUserRole(
  supabase: TypedSupabaseClient,
  userId: string,
  roleCode: string
) {
  const { error } = await (supabase as any).rpc('admin_set_user_role', {
    user_id: userId,
    role_code: roleCode,
  });

  if (error) throw error;
}

/**
 * Impersonate another user (Legend roles only)
 */
export async function impersonateUser(
  supabase: TypedSupabaseClient,
  targetUserId: string
) {
  const { data, error } = await (supabase as any).rpc('legend_impersonate_user', {
    target_user_id: targetUserId,
  });

  if (error) throw error;
  return data;
}

/**
 * Stop impersonation and return to original session
 */
export async function stopImpersonation(supabase: TypedSupabaseClient) {
  const { error } = await (supabase as any).rpc('legend_stop_impersonation');
  if (error) throw error;
}
