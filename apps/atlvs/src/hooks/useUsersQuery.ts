'use client';

/**
 * React Query hooks for Platform Users Management
 * Provides data fetching, mutations, and cache management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface PlatformUser {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  platform_roles: string[];
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
  avatar_url: string | null;
}

export interface PermissionAuditLog {
  id: string;
  action_type: string;
  target_user_id: string | null;
  target_user_email: string | null;
  performed_by_id: string | null;
  performed_by_email: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface UsersFilters {
  search?: string;
  organizationId?: string;
  isActive?: boolean;
}

// Query keys
export const usersKeys = {
  all: ['platform-users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: UsersFilters) => [...usersKeys.lists(), filters] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  auditLogs: () => [...usersKeys.all, 'audit-logs'] as const,
};

// Fetch platform users
async function fetchUsers(filters: UsersFilters): Promise<PlatformUser[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('platform_users')
    .select('id, email, full_name, first_name, last_name, platform_roles, organization_id, created_at, updated_at, last_sign_in_at, is_active, avatar_url')
    .order('created_at', { ascending: false });

  if (filters.organizationId) {
    query = query.eq('organization_id', filters.organizationId);
  }

  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  // Client-side search filtering
  let users = data || [];
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    users = users.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower))
    );
  }

  return users;
}

// Fetch single user
async function fetchUser(id: string): Promise<PlatformUser> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('platform_users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Update user roles
async function updateUserRoles(params: { 
  userId: string; 
  roles: string[];
  performedByEmail?: string;
}): Promise<void> {
  const supabase = createClient();
  
  // Get current user data for audit log
  const { data: currentUser } = await supabase
    .from('platform_users')
    .select('platform_roles, email')
    .eq('id', params.userId)
    .single();

  // Update roles
  const { error } = await supabase
    .from('platform_users')
    .update({ platform_roles: params.roles })
    .eq('id', params.userId);

  if (error) {
    throw new Error(error.message);
  }

  // Log the change
  await supabase.from('permission_audit_log').insert({
    action_type: 'role_assigned',
    target_user_id: params.userId,
    target_user_email: currentUser?.email,
    performed_by_email: params.performedByEmail,
    old_value: { roles: currentUser?.platform_roles || [] },
    new_value: { roles: params.roles },
  });
}

// Fetch permission audit logs
async function fetchAuditLogs(limit: number = 50): Promise<PermissionAuditLog[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('permission_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

// Activate/Deactivate user
async function toggleUserActive(params: {
  userId: string;
  isActive: boolean;
  performedByEmail?: string;
}): Promise<void> {
  const supabase = createClient();
  
  const { data: currentUser } = await supabase
    .from('platform_users')
    .select('is_active, email')
    .eq('id', params.userId)
    .single();

  const { error } = await supabase
    .from('platform_users')
    .update({ is_active: params.isActive })
    .eq('id', params.userId);

  if (error) {
    throw new Error(error.message);
  }

  // Log the change
  await supabase.from('permission_audit_log').insert({
    action_type: params.isActive ? 'user_activated' : 'user_deactivated',
    target_user_id: params.userId,
    target_user_email: currentUser?.email,
    performed_by_email: params.performedByEmail,
    old_value: { is_active: currentUser?.is_active },
    new_value: { is_active: params.isActive },
  });
}

// Hook: List users
export function useUsersQuery(filters: UsersFilters = {}) {
  return useQuery({
    queryKey: usersKeys.list(filters),
    queryFn: () => fetchUsers(filters),
    staleTime: 60000, // 1 minute
  });
}

// Hook: Get single user
export function useUserQuery(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}

// Hook: Update user roles
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserRoles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

// Hook: Toggle user active status
export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUserActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

// Hook: Fetch audit logs
export function usePermissionAuditLogsQuery(limit: number = 50) {
  return useQuery({
    queryKey: usersKeys.auditLogs(),
    queryFn: () => fetchAuditLogs(limit),
    staleTime: 30000, // 30 seconds
  });
}
