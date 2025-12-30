'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// PERMITS & INSURANCE HOOKS
// Manage permits, licenses, insurance policies, and compliance for productions
// Event-level roles: Production Manager, Legal, Operations Director
// =============================================================================

export interface Permit {
  id: string;
  production_id: string;
  permit_type: 'event' | 'noise' | 'fire' | 'health' | 'alcohol' | 'street_closure' | 'building' | 'other';
  name: string;
  description?: string;
  issuing_authority: string;
  permit_number?: string;
  status: 'pending' | 'submitted' | 'approved' | 'denied' | 'expired';
  application_date?: string;
  approval_date?: string;
  expiration_date?: string;
  cost?: number;
  document_url?: string;
  requirements?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InsurancePolicy {
  id: string;
  production_id: string;
  policy_type: 'general_liability' | 'workers_comp' | 'equipment' | 'event_cancellation' | 'auto' | 'umbrella' | 'other';
  policy_name: string;
  provider: string;
  policy_number: string;
  coverage_amount: number;
  deductible?: number;
  premium?: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  effective_date: string;
  expiration_date: string;
  document_url?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface PermitFilters {
  productionId?: string;
  permitType?: string;
  status?: string;
}

interface InsuranceFilters {
  productionId?: string;
  policyType?: string;
  status?: string;
}

// Fetch permits
export function usePermits(filters?: PermitFilters) {
  return useQuery({
    queryKey: ['permits', filters],
    queryFn: async () => {
      let query = supabase
        .from('permits')
        .select('*')
        .order('expiration_date', { ascending: true });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.permitType) {
        query = query.eq('permit_type', filters.permitType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Permit[];
    },
  });
}

// Fetch single permit
export function usePermit(id: string) {
  return useQuery({
    queryKey: ['permits', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Permit;
    },
    enabled: !!id,
  });
}

// Fetch insurance policies
export function useInsurancePolicies(filters?: InsuranceFilters) {
  return useQuery({
    queryKey: ['insurance_policies', filters],
    queryFn: async () => {
      let query = supabase
        .from('docs_profile_contract')
        .select('*')
        .order('expiration_date', { ascending: true });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.policyType) {
        query = query.eq('policy_type', filters.policyType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as InsurancePolicy[];
    },
  });
}

// Fetch single insurance policy
export function useInsurancePolicy(id: string) {
  return useQuery({
    queryKey: ['insurance_policies', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('docs_profile_contract')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as InsurancePolicy;
    },
    enabled: !!id,
  });
}

// Create permit
export function useCreatePermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (permit: Omit<Permit, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('permits')
        .insert(permit)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permits'] });
    },
  });
}

// Update permit
export function useUpdatePermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Permit> & { id: string }) => {
      const { data, error } = await supabase
        .from('permits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['permits'] });
      queryClient.invalidateQueries({ queryKey: ['permits', variables.id] });
    },
  });
}

// Create insurance policy
export function useCreateInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policy: Omit<InsurancePolicy, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('docs_profile_contract')
        .insert(policy)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance_policies'] });
    },
  });
}

// Update insurance policy
export function useUpdateInsurancePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InsurancePolicy> & { id: string }) => {
      const { data, error } = await supabase
        .from('docs_profile_contract')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['insurance_policies'] });
      queryClient.invalidateQueries({ queryKey: ['insurance_policies', variables.id] });
    },
  });
}

// Get permit statistics
export function usePermitStats(productionId?: string) {
  return useQuery({
    queryKey: ['permits', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('permits').select('status, permit_type, cost, expiration_date');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const permits = data || [];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return {
        total: permits.length,
        approved: permits.filter(p => p.status === 'approved').length,
        pending: permits.filter(p => p.status === 'pending' || p.status === 'submitted').length,
        expired: permits.filter(p => p.status === 'expired').length,
        expiringSoon: permits.filter(p => {
          if (!p.expiration_date) return false;
          const expDate = new Date(p.expiration_date);
          return expDate >= now && expDate <= thirtyDaysFromNow;
        }).length,
        totalCost: permits.reduce((sum, p) => sum + (p.cost || 0), 0),
      };
    },
  });
}

// Get insurance statistics
export function useInsuranceStats(productionId?: string) {
  return useQuery({
    queryKey: ['insurance_policies', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('docs_profile_contract').select('status, policy_type, coverage_amount, premium, expiration_date');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const policies = data || [];
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      return {
        total: policies.length,
        active: policies.filter(p => p.status === 'active').length,
        pending: policies.filter(p => p.status === 'pending').length,
        expired: policies.filter(p => p.status === 'expired').length,
        expiringSoon: policies.filter(p => {
          if (!p.expiration_date) return false;
          const expDate = new Date(p.expiration_date);
          return expDate >= now && expDate <= thirtyDaysFromNow;
        }).length,
        totalCoverage: policies.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.coverage_amount || 0), 0),
        totalPremium: policies.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.premium || 0), 0),
      };
    },
  });
}

// =============================================================================
// COMPLIANCE PAGE HOOKS (API-based)
// =============================================================================

export interface ComplianceItem {
  id: string;
  title: string;
  compliance_type: string;
  category?: string;
  provider_name?: string;
  status: string;
  effective_date: string;
  expiration_date?: string;
  coverage_amount?: number;
  annual_cost?: number;
}

export interface ComplianceSummary {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
}

const DEMO_COMPLIANCE: { items: ComplianceItem[]; summary: ComplianceSummary } = {
  items: [
    { id: '1', title: 'General Liability Insurance', compliance_type: 'insurance', provider_name: 'Acme Insurance', status: 'active', effective_date: '2025-01-01', expiration_date: '2026-01-01', coverage_amount: 1000000 },
    { id: '2', title: 'Business License', compliance_type: 'license', provider_name: 'City of LA', status: 'active', effective_date: '2025-01-01', expiration_date: '2025-12-31' },
  ],
  summary: { total: 2, active: 2, expired: 0, expiringSoon: 0 },
};

export function useComplianceItems() {
  return useQuery({
    queryKey: ['compliance-items'],
    queryFn: async () => {
      const response = await fetch('/api/compliance');
      if (response.status === 401) {
        return DEMO_COMPLIANCE;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch compliance');
      }
      const data = await response.json();
      return {
        items: data.items || [],
        summary: data.summary || { total: 0, active: 0, expired: 0, expiringSoon: 0 },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateComplianceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-items'] });
    },
  });
}

export function useDeleteComplianceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/compliance/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-items'] });
    },
  });
}

export function useGenerateComplianceReport() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/compliance/report', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to generate report');
      return response.json();
    },
  });
}

export function useComplianceData() {
  const complianceQuery = useComplianceItems();
  const createMutation = useCreateComplianceItem();
  const deleteMutation = useDeleteComplianceItem();
  const reportMutation = useGenerateComplianceReport();

  const data = complianceQuery.data || DEMO_COMPLIANCE;
  const complianceRate = data.summary.total > 0 
    ? Math.round((data.summary.active / data.summary.total) * 100) 
    : 0;

  return {
    items: data.items,
    summary: data.summary,
    complianceRate,
    isLoading: complianceQuery.isLoading,
    error: complianceQuery.error,
    createItem: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteItem: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    generateReport: reportMutation.mutateAsync,
    isGeneratingReport: reportMutation.isPending,
    refetch: complianceQuery.refetch,
  };
}
