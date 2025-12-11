'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CatalogVisibilitySetting,
  CreateVisibilitySettingPayload,
  UpdateVisibilitySettingPayload,
  VisibilityFilters,
  AssetRequestPermission,
  CreateAssetPermissionPayload,
  UpdateAssetPermissionPayload,
  PermissionFilters,
} from '../types/catalog';

// ============================================================================
// CATALOG VISIBILITY SETTINGS HOOKS
// ============================================================================

interface VisibilityResponse {
  data: CatalogVisibilitySetting[];
  count: number;
}

export function useCatalogVisibilitySettings(filters?: VisibilityFilters) {
  return useQuery({
    queryKey: ['catalog-visibility-settings', filters],
    queryFn: async (): Promise<VisibilityResponse> => {
      const params = new URLSearchParams();
      if (filters?.scope_type) params.set('scope_type', filters.scope_type);
      if (filters?.scope_id) params.set('scope_id', filters.scope_id);
      if (filters?.target_type) params.set('target_type', filters.target_type);
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/catalog/visibility?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch catalog visibility settings');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCatalogVisibilitySetting(settingId: string | undefined) {
  return useQuery({
    queryKey: ['catalog-visibility-setting', settingId],
    queryFn: async (): Promise<CatalogVisibilitySetting> => {
      const response = await fetch(`/api/catalog/visibility/${settingId}`);
      if (!response.ok) throw new Error('Failed to fetch catalog visibility setting');
      const data = await response.json();
      return data.setting;
    },
    enabled: !!settingId,
  });
}

export function useCreateCatalogVisibilitySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateVisibilitySettingPayload): Promise<CatalogVisibilitySetting> => {
      const response = await fetch('/api/catalog/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create visibility setting');
      }
      const data = await response.json();
      return data.setting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-visibility-settings'] });
    },
  });
}

export function useUpdateCatalogVisibilitySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      settingId: string;
      payload: UpdateVisibilitySettingPayload;
    }): Promise<CatalogVisibilitySetting> => {
      const response = await fetch(`/api/catalog/visibility/${params.settingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update visibility setting');
      }
      const data = await response.json();
      return data.setting;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-visibility-settings'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-visibility-setting', variables.settingId] });
    },
  });
}

export function useDeleteCatalogVisibilitySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingId: string): Promise<void> => {
      const response = await fetch(`/api/catalog/visibility/${settingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete visibility setting');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-visibility-settings'] });
    },
  });
}

// ============================================================================
// ASSET REQUEST PERMISSIONS HOOKS
// ============================================================================

interface PermissionsResponse {
  data: AssetRequestPermission[];
  count: number;
}

export function useAssetRequestPermissions(filters?: PermissionFilters) {
  return useQuery({
    queryKey: ['asset-request-permissions', filters],
    queryFn: async (): Promise<PermissionsResponse> => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.is_active !== undefined) params.set('is_active', String(filters.is_active));
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/catalog/permissions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch asset request permissions');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAssetRequestPermission(permissionId: string | undefined) {
  return useQuery({
    queryKey: ['asset-request-permission', permissionId],
    queryFn: async (): Promise<AssetRequestPermission> => {
      const response = await fetch(`/api/catalog/permissions/${permissionId}`);
      if (!response.ok) throw new Error('Failed to fetch asset request permission');
      const data = await response.json();
      return data.permission;
    },
    enabled: !!permissionId,
  });
}

export function useCanRequestCategory(category: string, subcategory?: string) {
  return useQuery({
    queryKey: ['can-request-category', category, subcategory],
    queryFn: async (): Promise<{ canRequest: boolean; reason?: string }> => {
      const params = new URLSearchParams();
      params.set('category', category);
      if (subcategory) params.set('subcategory', subcategory);

      const response = await fetch(`/api/catalog/permissions/check?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to check category permission');
      return response.json();
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateAssetRequestPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAssetPermissionPayload): Promise<AssetRequestPermission> => {
      const response = await fetch('/api/catalog/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create asset request permission');
      }
      const data = await response.json();
      return data.permission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-request-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['can-request-category'] });
    },
  });
}

export function useUpdateAssetRequestPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      permissionId: string;
      payload: UpdateAssetPermissionPayload;
    }): Promise<AssetRequestPermission> => {
      const response = await fetch(`/api/catalog/permissions/${params.permissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update asset request permission');
      }
      const data = await response.json();
      return data.permission;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset-request-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['asset-request-permission', variables.permissionId] });
      queryClient.invalidateQueries({ queryKey: ['can-request-category'] });
    },
  });
}

export function useDeleteAssetRequestPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permissionId: string): Promise<void> => {
      const response = await fetch(`/api/catalog/permissions/${permissionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete asset request permission');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-request-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['can-request-category'] });
    },
  });
}
