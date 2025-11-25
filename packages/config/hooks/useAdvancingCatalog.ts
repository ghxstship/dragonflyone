// packages/config/hooks/useAdvancingCatalog.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ProductionCatalogItem,
  ProductionAdvance,
  CatalogFilters,
  AdvanceFilters,
  CreateAdvancePayload,
  UpdateAdvancePayload,
  ApproveAdvancePayload,
  RejectAdvancePayload,
  FulfillAdvancePayload,
} from '../types/advancing';

export interface CatalogCategory {
  category: string;
  subcategories: string[];
}

/**
 * Fetch catalog with filters
 * Supports universal multi-industry catalog with enhanced filtering:
 * - category/subcategory: Category-based filtering
 * - industry_vertical: Filter by industry (events, construction, healthcare, etc.)
 * - procurement_type: Filter by type (rental, purchase, service, labor, etc.)
 * - featured: Show only featured items
 * - price_min/price_max: Price range filtering
 * - search: Full-text search across name and keywords
 */
export function useAdvancingCatalog(filters?: CatalogFilters) {
  return useQuery({
    queryKey: ['advancing-catalog', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Category filters
      if (filters?.category) params.append('category', filters.category);
      if (filters?.subcategory) params.append('subcategory', filters.subcategory);
      
      // Universal catalog filters
      if (filters?.industry_vertical) params.append('industry_vertical', filters.industry_vertical);
      if (filters?.procurement_type) params.append('procurement_type', filters.procurement_type);
      if (filters?.featured) params.append('featured', 'true');
      
      // Price range filters
      if (filters?.price_min !== undefined) params.append('price_min', filters.price_min.toString());
      if (filters?.price_max !== undefined) params.append('price_max', filters.price_max.toString());
      
      // Search and pagination
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/advancing/catalog?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch catalog');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - catalog doesn't change often
  });
}

// Fetch catalog categories
export function useCatalogCategories() {
  return useQuery({
    queryKey: ['advancing-catalog-categories'],
    queryFn: async () => {
      const response = await fetch('/api/advancing/catalog/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const json = await response.json();
      return json.data as CatalogCategory[];
    },
  });
}

// Fetch single catalog item
export function useCatalogItem(id: string | undefined) {
  return useQuery({
    queryKey: ['advancing-catalog', id],
    queryFn: async () => {
      const response = await fetch(`/api/advancing/catalog/${id}`);
      if (!response.ok) throw new Error('Failed to fetch catalog item');
      const json = await response.json();
      return json.data as ProductionCatalogItem;
    },
    enabled: !!id,
  });
}

// Fetch advance requests with filters
export function useAdvancingRequests(filters?: AdvanceFilters) {
  return useQuery({
    queryKey: ['advancing-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.submitter_id) params.append('submitter_id', filters.submitter_id);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/advancing/requests?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
  });
}

// Fetch single advance request
export function useAdvancingRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['advancing-requests', id],
    queryFn: async () => {
      const response = await fetch(`/api/advancing/requests/${id}`);
      if (!response.ok) throw new Error('Failed to fetch request');
      const json = await response.json();
      return json.data as ProductionAdvance;
    },
    enabled: !!id,
  });
}

// Create advance request
export function useCreateAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAdvancePayload) => {
      const response = await fetch('/api/advancing/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create advance request');
      const json = await response.json();
      return json.data as ProductionAdvance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
    },
  });
}

// Update advance request
export function useUpdateAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAdvancePayload }) => {
      const response = await fetch(`/api/advancing/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update advance request');
      const json = await response.json();
      return json.data as ProductionAdvance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['advancing-requests', variables.id] });
    },
  });
}

// Delete advance request
export function useDeleteAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/advancing/requests/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete advance request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
    },
  });
}

// Approve advance request
export function useApproveAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ApproveAdvancePayload }) => {
      const response = await fetch(`/api/advancing/requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to approve advance request');
      const json = await response.json();
      return json.data as ProductionAdvance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['advancing-requests', variables.id] });
    },
  });
}

// Reject advance request
export function useRejectAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RejectAdvancePayload }) => {
      const response = await fetch(`/api/advancing/requests/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to reject advance request');
      const json = await response.json();
      return json.data as ProductionAdvance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['advancing-requests', variables.id] });
    },
  });
}

// Fulfill advance request
export function useFulfillAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: FulfillAdvancePayload }) => {
      const response = await fetch(`/api/advancing/requests/${id}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to fulfill advance request');
      const json = await response.json();
      return json.data as ProductionAdvance;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['advancing-requests'] });
      queryClient.invalidateQueries({ queryKey: ['advancing-requests', variables.id] });
    },
  });
}
