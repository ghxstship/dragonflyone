'use client';

/**
 * Unified Organizations Query Hook
 * Single source of truth for all organization types: vendors, sponsors, clients, partners, agencies
 * Maps to legend_organizations table
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type OrgType = 'all' | 'vendor' | 'sponsor' | 'client' | 'partner' | 'agency' | 'subsidiary' | 'other';

export interface Organization {
  id: string;
  organization_id: string;
  name: string;
  legal_name: string | null;
  code: string | null;
  description: string | null;
  org_type: OrgType;
  email: string | null;
  phone: string | null;
  website: string | null;
  tax_id: string | null;
  duns_number: string | null;
  industry: string | null;
  company_size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+' | null;
  primary_contact_id: string | null;
  status: 'active' | 'inactive' | 'pending' | 'archived' | 'draft';
  tags: string[];
  logo_url: string | null;
  metadata: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  primary_contact?: {
    id: string;
    display_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export interface OrganizationsFilters {
  search?: string;
  type?: OrgType;
  status?: string;
  tags?: string[];
  industry?: string;
}

export const organizationsKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationsKeys.all, 'list'] as const,
  list: (filters: OrganizationsFilters) => [...organizationsKeys.lists(), filters] as const,
  details: () => [...organizationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationsKeys.details(), id] as const,
};

async function fetchOrganizations(filters: OrganizationsFilters): Promise<Organization[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('legend_organizations')
    .select(`
      *,
      primary_contact:legend_people!primary_contact_id(id, display_name, email, phone)
    `)
    .order('name', { ascending: true });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('org_type', filters.type);
  }

  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  let orgs = (data || []) as Organization[];

  // Client-side search filtering
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    orgs = orgs.filter(org => 
      org.name.toLowerCase().includes(searchLower) ||
      (org.legal_name && org.legal_name.toLowerCase().includes(searchLower)) ||
      (org.email && org.email.toLowerCase().includes(searchLower)) ||
      (org.industry && org.industry.toLowerCase().includes(searchLower))
    );
  }

  return orgs;
}

async function fetchOrganization(id: string): Promise<Organization> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('legend_organizations')
    .select(`
      *,
      primary_contact:legend_people!primary_contact_id(id, display_name, email, phone)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Organization;
}

interface CreateOrganizationInput {
  organization_id: string;
  name: string;
  legal_name?: string;
  code?: string;
  description?: string;
  org_type: OrgType;
  email?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  industry?: string;
  company_size?: Organization['company_size'];
  primary_contact_id?: string;
  status?: Organization['status'];
  tags?: string[];
  logo_url?: string;
  notes?: string;
}

async function createOrganization(input: CreateOrganizationInput): Promise<Organization> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('legend_organizations')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Organization;
}

interface UpdateOrganizationInput {
  id: string;
  name?: string;
  legal_name?: string;
  code?: string;
  description?: string;
  org_type?: OrgType;
  email?: string;
  phone?: string;
  website?: string;
  tax_id?: string;
  industry?: string;
  company_size?: Organization['company_size'];
  primary_contact_id?: string;
  status?: Organization['status'];
  tags?: string[];
  logo_url?: string;
  notes?: string;
}

async function updateOrganization(input: UpdateOrganizationInput): Promise<Organization> {
  const supabase = createClient();
  
  const { id, ...updates } = input;
  
  const { data, error } = await supabase
    .from('legend_organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Organization;
}

async function deleteOrganization(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('legend_organizations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================================================
// HOOKS
// ============================================================================

export function useOrganizationsQuery(filters: OrganizationsFilters = {}) {
  return useQuery({
    queryKey: organizationsKeys.list(filters),
    queryFn: () => fetchOrganizations(filters),
    staleTime: 60000,
  });
}

export function useOrganizationQuery(id: string) {
  return useQuery({
    queryKey: organizationsKeys.detail(id),
    queryFn: () => fetchOrganization(id),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganization,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
      queryClient.setQueryData(organizationsKeys.detail(data.id), data);
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });
}

export function useOrganizationsStats(filters: OrganizationsFilters = {}) {
  const { data: orgs = [] } = useOrganizationsQuery(filters);
  
  return {
    total: orgs.length,
    active: orgs.filter(o => o.status === 'active').length,
    inactive: orgs.filter(o => o.status === 'inactive').length,
    pending: orgs.filter(o => o.status === 'pending').length,
    byType: {
      vendor: orgs.filter(o => o.org_type === 'vendor').length,
      sponsor: orgs.filter(o => o.org_type === 'sponsor').length,
      client: orgs.filter(o => o.org_type === 'client').length,
      partner: orgs.filter(o => o.org_type === 'partner').length,
      agency: orgs.filter(o => o.org_type === 'agency').length,
      subsidiary: orgs.filter(o => o.org_type === 'subsidiary').length,
      other: orgs.filter(o => o.org_type === 'other').length,
    },
  };
}
