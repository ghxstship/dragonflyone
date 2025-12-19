'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PreferredVendor {
  id: string;
  vendor_id: string;
  category: string;
  priority: number;
  negotiated_discount?: number;
  contract_id?: string;
  valid_from?: string;
  valid_to?: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  vendor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    rating?: number;
  };
  contract?: {
    id: string;
    name: string;
    end_date?: string;
  };
}

export interface PreferredVendorList {
  id: string;
  organization_id: string;
  venue_id?: string;
  name: string;
  description?: string;
  is_exclusive: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  items?: PreferredVendorListItem[];
}

export interface PreferredVendorListItem {
  id: string;
  list_id: string;
  vendor_id: string;
  order_index: number;
  notes?: string;
  vendor?: {
    id: string;
    name: string;
    category?: string;
    rating?: number;
  };
}

interface PreferredVendorsResponse {
  preferred_vendors: PreferredVendor[];
  categories: string[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface PreferredVendorMatrixResponse {
  matrix: Record<string, { vendor: unknown; priority: number; discount?: number }[]>;
  categories: string[];
}

interface CreatePreferredVendorInput {
  vendor_id: string;
  category: string;
  priority?: number;
  negotiated_discount?: number;
  contract_id?: string;
  valid_from?: string;
  valid_to?: string;
  notes?: string;
}

interface UpdatePreferredVendorInput {
  id: string;
  priority?: number;
  negotiated_discount?: number;
  valid_from?: string;
  valid_to?: string;
  notes?: string;
  status?: 'active' | 'inactive';
}

async function fetchPreferredVendors(
  page = 1,
  limit = 50
): Promise<PreferredVendorsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(`/api/preferred-vendors?${params}`);
  if (!res.ok) throw new Error('Failed to fetch preferred vendors');
  return res.json();
}

async function fetchPreferredVendorsByCategory(
  category: string
): Promise<{ preferred_vendors: PreferredVendor[]; category: string }> {
  const params = new URLSearchParams({
    type: 'category',
    category,
  });

  const res = await fetch(`/api/preferred-vendors?${params}`);
  if (!res.ok) throw new Error('Failed to fetch preferred vendors by category');
  return res.json();
}

async function fetchPreferredVendorMatrix(): Promise<PreferredVendorMatrixResponse> {
  const res = await fetch('/api/preferred-vendors?type=matrix');
  if (!res.ok) throw new Error('Failed to fetch preferred vendor matrix');
  return res.json();
}

async function fetchVendorPreferredCategories(
  vendorId: string
): Promise<{ vendor_id: string; preferred_categories: PreferredVendor[] }> {
  const params = new URLSearchParams({
    type: 'vendor',
    vendor_id: vendorId,
  });

  const res = await fetch(`/api/preferred-vendors?${params}`);
  if (!res.ok) throw new Error('Failed to fetch vendor preferred categories');
  return res.json();
}

async function createPreferredVendor(
  input: CreatePreferredVendorInput
): Promise<{ preferred_vendor: PreferredVendor }> {
  const res = await fetch('/api/preferred-vendors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create preferred vendor');
  }
  return res.json();
}

async function updatePreferredVendor(
  input: UpdatePreferredVendorInput
): Promise<{ preferred_vendor: PreferredVendor }> {
  const res = await fetch('/api/preferred-vendors', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update preferred vendor');
  return res.json();
}

async function removePreferredVendor(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/preferred-vendors?id=${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to remove preferred vendor');
  return res.json();
}

export function usePreferredVendors(page = 1, limit = 50) {
  return useQuery({
    queryKey: ['preferred-vendors', page, limit],
    queryFn: () => fetchPreferredVendors(page, limit),
  });
}

export function usePreferredVendorsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['preferred-vendors', 'category', category],
    queryFn: () => fetchPreferredVendorsByCategory(category!),
    enabled: !!category,
  });
}

export function usePreferredVendorMatrix() {
  return useQuery({
    queryKey: ['preferred-vendors', 'matrix'],
    queryFn: fetchPreferredVendorMatrix,
  });
}

export function useVendorPreferredCategories(vendorId: string | undefined) {
  return useQuery({
    queryKey: ['preferred-vendors', 'vendor', vendorId],
    queryFn: () => fetchVendorPreferredCategories(vendorId!),
    enabled: !!vendorId,
  });
}

export function useCreatePreferredVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPreferredVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferred-vendors'] });
    },
  });
}

export function useUpdatePreferredVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferredVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferred-vendors'] });
    },
  });
}

export function useRemovePreferredVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removePreferredVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferred-vendors'] });
    },
  });
}

export function useReorderPreferredVendors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorIds }: { vendorIds: string[] }) => {
      const updates = vendorIds.map((id, index) =>
        updatePreferredVendor({ id, priority: index + 1 })
      );
      await Promise.all(updates);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferred-vendors'] });
    },
  });
}
