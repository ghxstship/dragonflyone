'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorCategory {
  id: string;
  organization_id?: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  asset_catalog_category?: string;
  sort_order: number;
  is_active: boolean;
  children?: VendorCategory[];
  created_at: string;
}

export interface VendorContact {
  id: string;
  vendor_profile_id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

export interface VendorDocument {
  id: string;
  vendor_profile_id: string;
  document_type: string;
  name: string;
  file_url: string;
  file_size?: number;
  expires_at?: string;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface VendorProfile {
  id: string;
  organization_id: string;
  vendor_id?: string;
  name: string;
  category_id?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_info: Record<string, unknown>;
  service_areas: string[];
  certifications: Array<Record<string, unknown>>;
  insurance: Record<string, unknown>;
  payment_terms?: string;
  tax_id?: string;
  rating_average: number;
  rating_count: number;
  status: 'pending' | 'approved' | 'suspended' | 'inactive';
  preferred: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: VendorCategory;
  contacts?: VendorContact[];
  documents?: VendorDocument[];
}

interface VendorsResponse {
  vendors: VendorProfile[];
  total: number;
}

interface CategoriesResponse {
  categories: VendorCategory[];
  tree: VendorCategory[];
}

interface VendorFilters {
  organization_id?: string;
  category_id?: string;
  status?: string;
  search?: string;
  preferred?: boolean;
}

interface CreateVendorInput {
  organization_id: string;
  name: string;
  category_id?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_info?: Record<string, unknown>;
  service_areas?: string[];
  payment_terms?: string;
  tax_id?: string;
}

interface UpdateVendorInput {
  name?: string;
  category_id?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  contact_info?: Record<string, unknown>;
  service_areas?: string[];
  certifications?: Array<Record<string, unknown>>;
  insurance?: Record<string, unknown>;
  payment_terms?: string;
  tax_id?: string;
  status?: VendorProfile['status'];
  preferred?: boolean;
}

async function fetchVendors(filters: VendorFilters): Promise<VendorsResponse> {
  const params = new URLSearchParams();
  if (filters.organization_id) params.set('organization_id', filters.organization_id);
  if (filters.category_id) params.set('category_id', filters.category_id);
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('search', filters.search);
  if (filters.preferred) params.set('preferred', 'true');

  const res = await fetch(`/api/vendor-profiles?${params}`);
  if (!res.ok) throw new Error('Failed to fetch vendors');
  return res.json();
}

async function fetchVendor(id: string): Promise<{ vendor: VendorProfile }> {
  const res = await fetch(`/api/vendor-profiles/${id}`);
  if (!res.ok) throw new Error('Failed to fetch vendor');
  return res.json();
}

async function fetchCategories(organizationId?: string): Promise<CategoriesResponse> {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  params.set('include_global', 'true');

  const res = await fetch(`/api/vendor-categories?${params}`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

async function createVendor(input: CreateVendorInput): Promise<{ vendor: VendorProfile }> {
  const res = await fetch('/api/vendor-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create vendor');
  return res.json();
}

async function updateVendor(id: string, input: UpdateVendorInput): Promise<{ vendor: VendorProfile }> {
  const res = await fetch(`/api/vendor-profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update vendor');
  return res.json();
}

async function deleteVendor(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/vendor-profiles/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete vendor');
  return res.json();
}

export function useVendorProfiles(filters: VendorFilters) {
  return useQuery({
    queryKey: ['vendor-profiles', filters],
    queryFn: () => fetchVendors(filters),
    enabled: !!filters.organization_id,
  });
}

export function useVendorProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-profile', id],
    queryFn: () => fetchVendor(id!),
    enabled: !!id,
  });
}

export function useVendorCategories(organizationId?: string) {
  return useQuery({
    queryKey: ['vendor-categories', organizationId],
    queryFn: () => fetchCategories(organizationId),
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVendorInput }) => updateVendor(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile', id] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profiles'] });
    },
  });
}
