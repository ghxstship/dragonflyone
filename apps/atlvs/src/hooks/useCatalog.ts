'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CatalogCategory {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  global_asset_category?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: CatalogCategory[];
}

export interface CatalogPricingTier {
  id: string;
  item_id: string;
  quantity_min: number;
  quantity_max?: number;
  price: number;
  discount_percent?: number;
  created_at: string;
}

export interface CatalogVariant {
  id: string;
  item_id: string;
  name: string;
  sku?: string;
  attributes: Record<string, unknown>;
  price_adjustment: number;
  is_active: boolean;
  created_at: string;
}

export interface CatalogItem {
  id: string;
  organization_id: string;
  category_id?: string;
  vendor_profile_id?: string;
  name: string;
  description?: string;
  sku?: string;
  unit_type: string;
  base_price: number;
  currency: string;
  pricing_rules: Record<string, unknown>;
  specifications: Record<string, unknown>;
  images: string[];
  tags: string[];
  min_quantity: number;
  max_quantity?: number;
  lead_time_days?: number;
  is_taxable: boolean;
  tax_rate?: number;
  status: 'draft' | 'active' | 'inactive' | 'discontinued';
  metadata?: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  category?: CatalogCategory;
  vendor?: { id: string; name: string; logo_url?: string };
  pricing_tiers?: CatalogPricingTier[];
  variants?: CatalogVariant[];
}

interface CatalogItemsResponse {
  items: CatalogItem[];
}

interface CatalogCategoriesResponse {
  categories: CatalogCategory[];
  tree: CatalogCategory[];
}

interface CatalogFilters {
  organization_id?: string;
  category_id?: string;
  vendor_profile_id?: string;
  status?: string;
  search?: string;
}

interface CreateCatalogItemInput {
  organization_id: string;
  category_id?: string;
  vendor_profile_id?: string;
  name: string;
  description?: string;
  sku?: string;
  unit_type?: string;
  base_price: number;
  currency?: string;
  pricing_rules?: Record<string, unknown>;
  specifications?: Record<string, unknown>;
  images?: string[];
  tags?: string[];
  min_quantity?: number;
  max_quantity?: number;
  lead_time_days?: number;
  is_taxable?: boolean;
  tax_rate?: number;
}

interface UpdateCatalogItemInput {
  category_id?: string;
  vendor_profile_id?: string;
  name?: string;
  description?: string;
  sku?: string;
  unit_type?: string;
  base_price?: number;
  currency?: string;
  pricing_rules?: Record<string, unknown>;
  specifications?: Record<string, unknown>;
  images?: string[];
  tags?: string[];
  min_quantity?: number;
  max_quantity?: number;
  lead_time_days?: number;
  is_taxable?: boolean;
  tax_rate?: number;
  status?: CatalogItem['status'];
}

async function fetchCatalogItems(filters: CatalogFilters): Promise<CatalogItemsResponse> {
  const params = new URLSearchParams();
  if (filters.organization_id) params.set('organization_id', filters.organization_id);
  if (filters.category_id) params.set('category_id', filters.category_id);
  if (filters.vendor_profile_id) params.set('vendor_profile_id', filters.vendor_profile_id);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);

  const res = await fetch(`/api/catalog?${params}`);
  if (!res.ok) throw new Error('Failed to fetch catalog items');
  return res.json();
}

async function fetchCatalogItem(id: string): Promise<{ item: CatalogItem }> {
  const res = await fetch(`/api/catalog/${id}`);
  if (!res.ok) throw new Error('Failed to fetch catalog item');
  return res.json();
}

async function fetchCatalogCategories(organizationId?: string): Promise<CatalogCategoriesResponse> {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  params.set('include_global', 'true');

  const res = await fetch(`/api/catalog/categories?${params}`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function createCatalogItem(input: CreateCatalogItemInput): Promise<{ item: CatalogItem }> {
  const res = await fetch('/api/catalog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create catalog item');
  return res.json();
}

async function updateCatalogItem(id: string, input: UpdateCatalogItemInput): Promise<{ item: CatalogItem }> {
  const res = await fetch(`/api/catalog/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update catalog item');
  return res.json();
}

async function deleteCatalogItem(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete catalog item');
  return res.json();
}

export function useCatalogItems(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['catalog-items', filters],
    queryFn: () => fetchCatalogItems(filters),
    enabled: !!filters.organization_id,
  });
}

export function useCatalogItem(id: string | undefined) {
  return useQuery({
    queryKey: ['catalog-item', id],
    queryFn: () => fetchCatalogItem(id!),
    enabled: !!id,
  });
}

export function useCatalogCategories(organizationId?: string) {
  return useQuery({
    queryKey: ['catalog-categories', organizationId],
    queryFn: () => fetchCatalogCategories(organizationId),
  });
}

export function useCreateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
    },
  });
}

export function useUpdateCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCatalogItemInput }) =>
      updateCatalogItem(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-item', id] });
    },
  });
}

export function useDeleteCatalogItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCatalogItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-items'] });
    },
  });
}
