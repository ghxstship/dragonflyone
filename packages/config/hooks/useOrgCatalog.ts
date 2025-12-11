'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  OrganizationCatalogItem,
  CreateOrgCatalogItemPayload,
  UpdateOrgCatalogItemPayload,
  OrgCatalogFilters,
  EffectiveCatalogItem,
} from '../types/catalog';

// ============================================================================
// ORGANIZATION CATALOG HOOKS
// ============================================================================

interface OrgCatalogResponse {
  data: OrganizationCatalogItem[];
  count: number;
}

interface EffectiveCatalogResponse {
  data: EffectiveCatalogItem[];
  count: number;
}

export function useOrgCatalogItems(filters?: OrgCatalogFilters) {
  return useQuery({
    queryKey: ['org-catalog-items', filters],
    queryFn: async (): Promise<OrgCatalogResponse> => {
      const params = new URLSearchParams();
      if (filters?.category) params.set('category', filters.category);
      if (filters?.subcategory) params.set('subcategory', filters.subcategory);
      if (filters?.search) params.set('search', filters.search);
      if (filters?.is_locked !== undefined) params.set('is_locked', String(filters.is_locked));
      if (filters?.is_preferred !== undefined) params.set('is_preferred', String(filters.is_preferred));
      if (filters?.enabled !== undefined) params.set('enabled', String(filters.enabled));
      if (filters?.limit) params.set('limit', String(filters.limit));
      if (filters?.offset) params.set('offset', String(filters.offset));

      const response = await fetch(`/api/catalog/organization?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch organization catalog items');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrgCatalogItem(itemId: string | undefined) {
  return useQuery({
    queryKey: ['org-catalog-item', itemId],
    queryFn: async (): Promise<OrganizationCatalogItem> => {
      const response = await fetch(`/api/catalog/organization/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch organization catalog item');
      const data = await response.json();
      return data.item;
    },
    enabled: !!itemId,
  });
}

export function useEffectiveCatalog(category?: string, includeGlobal: boolean = true) {
  return useQuery({
    queryKey: ['effective-catalog', category, includeGlobal],
    queryFn: async (): Promise<EffectiveCatalogResponse> => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('include_global', String(includeGlobal));

      const response = await fetch(`/api/catalog/effective?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch effective catalog');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOrgCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrgCatalogItemPayload): Promise<OrganizationCatalogItem> => {
      const response = await fetch('/api/catalog/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create organization catalog item');
      }
      const data = await response.json();
      return data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['effective-catalog'] });
    },
  });
}

export function useDuplicateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      sourceItemId: string;
      customItemId?: string;
      customName?: string;
      isLocked?: boolean;
    }): Promise<OrganizationCatalogItem> => {
      const response = await fetch('/api/catalog/organization/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_item_id: params.sourceItemId,
          custom_item_id: params.customItemId,
          custom_name: params.customName,
          is_locked: params.isLocked,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to duplicate catalog item');
      }
      const data = await response.json();
      return data.item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['effective-catalog'] });
    },
  });
}

export function useUpdateOrgCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      itemId: string;
      payload: UpdateOrgCatalogItemPayload;
    }): Promise<OrganizationCatalogItem> => {
      const response = await fetch(`/api/catalog/organization/${params.itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params.payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update organization catalog item');
      }
      const data = await response.json();
      return data.item;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['org-catalog-item', variables.itemId] });
      queryClient.invalidateQueries({ queryKey: ['effective-catalog'] });
    },
  });
}

export function useDeleteOrgCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<void> => {
      const response = await fetch(`/api/catalog/organization/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete organization catalog item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['effective-catalog'] });
    },
  });
}

export function useLockOrgCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      itemId: string;
      lockReason?: string;
    }): Promise<OrganizationCatalogItem> => {
      const response = await fetch(`/api/catalog/organization/${params.itemId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lock_reason: params.lockReason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to lock catalog item');
      }
      const data = await response.json();
      return data.item;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['org-catalog-item', variables.itemId] });
    },
  });
}

export function useUnlockOrgCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string): Promise<OrganizationCatalogItem> => {
      const response = await fetch(`/api/catalog/organization/${itemId}/unlock`, {
        method: 'POST',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unlock catalog item');
      }
      const data = await response.json();
      return data.item;
    },
    onSuccess: (_, itemId) => {
      queryClient.invalidateQueries({ queryKey: ['org-catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['org-catalog-item', itemId] });
    },
  });
}
