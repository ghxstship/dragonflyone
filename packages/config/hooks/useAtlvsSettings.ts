import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface TaxSetting {
  id: string;
  name: string;
  rate: number;
  type: string;
  jurisdiction: string;
  status: 'Active' | 'Inactive';
  appliesTo: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  status: 'Active' | 'Revoked';
  createdAt: string;
  expiresAt?: string;
}

interface ConnectedApp {
  id: string;
  name: string;
  provider: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  lastSync: string;
  permissions: string[];
  icon?: string;
}

interface OrganizationSettings {
  id: string;
  name: string;
  legalName: string;
  taxId: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  currency: string;
  fiscalYearStart: string;
}

interface SecuritySettings {
  id: string;
  twoFactorEnabled: boolean;
  passwordPolicy: string;
  sessionTimeout: number;
  ipWhitelist: string[];
  auditLogRetention: number;
  ssoEnabled: boolean;
  ssoProvider?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
}

interface ExportJob {
  id: string;
  type: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  format: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: number;
}

interface ImportJob {
  id: string;
  type: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  fileName: string;
  recordsTotal: number;
  recordsProcessed: number;
  recordsFailed: number;
  createdAt: string;
  completedAt?: string;
  errors?: string[];
}

// API Base
const API_BASE = '/api/admin/settings';

// Tax Settings
async function fetchTaxSettings(): Promise<TaxSetting[]> {
  const response = await fetch(`${API_BASE}/tax`);
  if (!response.ok) throw new Error('Failed to fetch tax settings');
  return response.json();
}

export function useTaxSettingsQuery() {
  return useQuery({
    queryKey: ['tax-settings'],
    queryFn: fetchTaxSettings,
  });
}

export function useCreateTaxSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<TaxSetting>) => {
      const response = await fetch(`${API_BASE}/tax`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create tax setting');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-settings'] }),
  });
}

export function useUpdateTaxSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<TaxSetting> & { id: string }) => {
      const response = await fetch(`${API_BASE}/tax/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update tax setting');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-settings'] }),
  });
}

export function useDeleteTaxSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/tax/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete tax setting');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-settings'] }),
  });
}

export function useTaxSettings() {
  const query = useTaxSettingsQuery();
  const settings = query.data || [];
  const activeSettings = settings.filter(s => s.status === 'Active').length;
  return { settings, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeSettings };
}

// API Keys
async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await fetch(`${API_BASE}/api-keys`);
  if (!response.ok) throw new Error('Failed to fetch API keys');
  return response.json();
}

export function useApiKeysQuery() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: fetchApiKeys,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<ApiKey>) => {
      const response = await fetch(`${API_BASE}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create API key');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/api-keys/${id}/revoke`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to revoke API key');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });
}

export function useApiKeys() {
  const query = useApiKeysQuery();
  const keys = query.data || [];
  const activeKeys = keys.filter(k => k.status === 'Active').length;
  return { keys, isLoading: query.isLoading, error: query.error, refetch: query.refetch, activeKeys };
}

// Connected Apps
async function fetchConnectedApps(): Promise<ConnectedApp[]> {
  const response = await fetch(`${API_BASE}/apps`);
  if (!response.ok) throw new Error('Failed to fetch connected apps');
  return response.json();
}

export function useConnectedAppsQuery() {
  return useQuery({
    queryKey: ['connected-apps'],
    queryFn: fetchConnectedApps,
  });
}

export function useConnectApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { provider: string; credentials: Record<string, string> }) => {
      const response = await fetch(`${API_BASE}/apps/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to connect app');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connected-apps'] }),
  });
}

export function useDisconnectApp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/apps/${id}/disconnect`, { method: 'POST' });
      if (!response.ok) throw new Error('Failed to disconnect app');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connected-apps'] }),
  });
}

export function useConnectedApps() {
  const query = useConnectedAppsQuery();
  const apps = query.data || [];
  const connectedCount = apps.filter(a => a.status === 'Connected').length;
  return { apps, isLoading: query.isLoading, error: query.error, refetch: query.refetch, connectedCount };
}

// Organization Settings
async function fetchOrganizationSettings(): Promise<OrganizationSettings> {
  const response = await fetch(`${API_BASE}/organization`);
  if (!response.ok) throw new Error('Failed to fetch organization settings');
  return response.json();
}

export function useOrganizationSettingsQuery() {
  return useQuery({
    queryKey: ['organization-settings'],
    queryFn: fetchOrganizationSettings,
  });
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<OrganizationSettings>) => {
      const response = await fetch(`${API_BASE}/organization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update organization settings');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organization-settings'] }),
  });
}

export function useOrganizationSettings() {
  const query = useOrganizationSettingsQuery();
  return { settings: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
}

// Security Settings
async function fetchSecuritySettings(): Promise<SecuritySettings> {
  const response = await fetch(`${API_BASE}/security`);
  if (!response.ok) throw new Error('Failed to fetch security settings');
  return response.json();
}

export function useSecuritySettingsQuery() {
  return useQuery({
    queryKey: ['security-settings'],
    queryFn: fetchSecuritySettings,
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<SecuritySettings>) => {
      const response = await fetch(`${API_BASE}/security`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update security settings');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security-settings'] }),
  });
}

export function useSecuritySettings() {
  const query = useSecuritySettingsQuery();
  return { settings: query.data, isLoading: query.isLoading, error: query.error, refetch: query.refetch };
}

// Roles
async function fetchRoles(): Promise<Role[]> {
  const response = await fetch(`${API_BASE}/roles`);
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
}

export function useRolesQuery() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Role>) => {
      const response = await fetch(`${API_BASE}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Role> & { id: string }) => {
      const response = await fetch(`${API_BASE}/roles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/roles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete role');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
}

export function useRoles() {
  const query = useRolesQuery();
  const roles = query.data || [];
  const customRoles = roles.filter(r => !r.isSystem).length;
  const totalUsers = roles.reduce((sum, r) => sum + r.userCount, 0);
  return { roles, isLoading: query.isLoading, error: query.error, refetch: query.refetch, customRoles, totalUsers };
}

// Export Jobs
async function fetchExportJobs(): Promise<ExportJob[]> {
  const response = await fetch(`${API_BASE}/exports`);
  if (!response.ok) throw new Error('Failed to fetch export jobs');
  return response.json();
}

export function useExportJobsQuery() {
  return useQuery({
    queryKey: ['export-jobs'],
    queryFn: fetchExportJobs,
  });
}

export function useCreateExportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { type: string; format: string; filters?: Record<string, unknown> }) => {
      const response = await fetch(`${API_BASE}/exports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create export job');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['export-jobs'] }),
  });
}

export function useExportJobs() {
  const query = useExportJobsQuery();
  const jobs = query.data || [];
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const pendingJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'Processing').length;
  return { jobs, isLoading: query.isLoading, error: query.error, refetch: query.refetch, completedJobs, pendingJobs };
}

// Import Jobs
async function fetchImportJobs(): Promise<ImportJob[]> {
  const response = await fetch(`${API_BASE}/imports`);
  if (!response.ok) throw new Error('Failed to fetch import jobs');
  return response.json();
}

export function useImportJobsQuery() {
  return useQuery({
    queryKey: ['import-jobs'],
    queryFn: fetchImportJobs,
  });
}

export function useCreateImportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${API_BASE}/imports`, {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to create import job');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['import-jobs'] }),
  });
}

export function useImportJobs() {
  const query = useImportJobsQuery();
  const jobs = query.data || [];
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const failedJobs = jobs.filter(j => j.status === 'Failed').length;
  return { jobs, isLoading: query.isLoading, error: query.error, refetch: query.refetch, completedJobs, failedJobs };
}
