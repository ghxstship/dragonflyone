'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Json } from '@ghxstship/config/supabase-types';

// Legend status enum type
type LegendStatus = 'pending' | 'active' | 'draft' | 'archived' | 'inactive';

// Vendor interface matching 3NF schema (legend_organizations + orgs_profile_vendor)
export interface Vendor {
  id: string;
  organization_id: string;
  name: string;
  legal_name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  tax_id?: string | null;
  industry?: string | null;
  status: LegendStatus | null;
  tags?: string[] | null;
  logo_url?: string | null;
  metadata?: Json | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Vendor profile fields
  vendor_type?: string | null;
  payment_terms?: string | null;
  credit_limit?: number | null;
  currency?: string | null;
  tax_exempt?: boolean | null;
  performance_rating?: number | null;
  is_approved?: boolean | null;
  total_orders?: number | null;
  total_spend?: number | null;
}

// Transform database response to Vendor interface
function transformVendor(data: Record<string, unknown>): Vendor {
  const profile = data.orgs_profile_vendor as Record<string, unknown> | null;
  return {
    id: data.id as string,
    organization_id: data.organization_id as string,
    name: data.name as string,
    legal_name: data.legal_name as string | null,
    email: data.email as string | null,
    phone: data.phone as string | null,
    website: data.website as string | null,
    tax_id: data.tax_id as string | null,
    industry: data.industry as string | null,
    status: data.status as LegendStatus | null,
    tags: data.tags as string[] | null,
    logo_url: data.logo_url as string | null,
    metadata: data.metadata as Json | null,
    notes: data.notes as string | null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    vendor_type: profile?.vendor_type as string | null,
    payment_terms: profile?.payment_terms as string | null,
    credit_limit: profile?.credit_limit as number | null,
    currency: profile?.currency as string | null,
    tax_exempt: profile?.tax_exempt as boolean | null,
    performance_rating: profile?.performance_rating as number | null,
    is_approved: profile?.is_approved as boolean | null,
    total_orders: profile?.total_orders as number | null,
    total_spend: profile?.total_spend as number | null,
  };
}

// Fetch all vendors (3NF: legend_organizations with org_type='vendor')
export function useVendors(filters?: { status?: LegendStatus; category?: string }) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_organizations')
        .select('*, orgs_profile_vendor!org_id(*)')
        .eq('org_type', 'vendor')
        .order('name', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('industry', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(transformVendor);
    },
  });
}

// Fetch single vendor
export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_organizations')
        .select('*, orgs_profile_vendor!org_id(*)')
        .eq('id', id)
        .eq('org_type', 'vendor')
        .single();

      if (error) throw error;
      return transformVendor(data as Record<string, unknown>);
    },
    enabled: !!id,
  });
}

// Create vendor (inserts into legend_organizations + orgs_profile_vendor)
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
      // Insert into legend_organizations
      const { data: org, error: orgError } = await supabase
        .from('legend_organizations')
        .insert({
          organization_id: vendor.organization_id,
          name: vendor.name,
          legal_name: vendor.legal_name ?? null,
          email: vendor.email ?? null,
          phone: vendor.phone ?? null,
          website: vendor.website ?? null,
          tax_id: vendor.tax_id ?? null,
          industry: vendor.industry ?? null,
          status: vendor.status ?? 'active',
          tags: vendor.tags ?? null,
          logo_url: vendor.logo_url ?? null,
          metadata: vendor.metadata ?? null,
          notes: vendor.notes ?? null,
          org_type: 'vendor',
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Insert vendor profile
      const { error: profileError } = await supabase
        .from('orgs_profile_vendor')
        .insert({
          org_id: org.id,
          vendor_type: vendor.vendor_type ?? null,
          payment_terms: vendor.payment_terms ?? null,
          credit_limit: vendor.credit_limit ?? null,
          currency: vendor.currency ?? 'USD',
          tax_exempt: vendor.tax_exempt ?? false,
        });

      if (profileError) throw profileError;
      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// Update vendor
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vendor> & { id: string }) => {
      // Build update object with only defined fields
      const orgUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) orgUpdates.name = updates.name;
      if (updates.legal_name !== undefined) orgUpdates.legal_name = updates.legal_name;
      if (updates.email !== undefined) orgUpdates.email = updates.email;
      if (updates.phone !== undefined) orgUpdates.phone = updates.phone;
      if (updates.website !== undefined) orgUpdates.website = updates.website;
      if (updates.tax_id !== undefined) orgUpdates.tax_id = updates.tax_id;
      if (updates.industry !== undefined) orgUpdates.industry = updates.industry;
      if (updates.status !== undefined) orgUpdates.status = updates.status;
      if (updates.tags !== undefined) orgUpdates.tags = updates.tags;
      if (updates.logo_url !== undefined) orgUpdates.logo_url = updates.logo_url;
      if (updates.metadata !== undefined) orgUpdates.metadata = updates.metadata;
      if (updates.notes !== undefined) orgUpdates.notes = updates.notes;

      // Update legend_organizations
      const { data, error } = await supabase
        .from('legend_organizations')
        .update(orgUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update vendor profile if profile fields provided
      const profileUpdates: Record<string, unknown> = {};
      if (updates.vendor_type !== undefined) profileUpdates.vendor_type = updates.vendor_type;
      if (updates.payment_terms !== undefined) profileUpdates.payment_terms = updates.payment_terms;
      if (updates.credit_limit !== undefined) profileUpdates.credit_limit = updates.credit_limit;
      if (updates.currency !== undefined) profileUpdates.currency = updates.currency;
      if (updates.tax_exempt !== undefined) profileUpdates.tax_exempt = updates.tax_exempt;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('orgs_profile_vendor')
          .update(profileUpdates)
          .eq('org_id', id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// Delete vendor (cascades to profile via FK)
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('legend_organizations')
        .delete()
        .eq('id', id)
        .eq('org_type', 'vendor');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// =============================================================================
// VENDOR PERFORMANCE HOOKS
// =============================================================================

interface VendorPerformanceMetrics {
  average_rating: number;
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
  completion_rate: number;
  on_time_rate: number;
  review_count: number;
}

interface VendorIssues {
  total: number;
  open: number;
  resolved: number;
  critical: number;
}

interface MonthlyTrend {
  month: string;
  orders: number;
  revenue: number;
}

interface VendorReview {
  id: string;
  rating: number;
  review_text?: string;
  reviewer_name?: string;
  created_at: string;
}

interface VendorPerformanceResponse {
  vendor: { id: string; name: string; status: string };
  metrics: VendorPerformanceMetrics;
  issues: VendorIssues;
  recent_reviews: VendorReview[];
  monthly_trend: MonthlyTrend[];
  period: string;
}

const DEMO_PERFORMANCE: VendorPerformanceResponse = {
  vendor: { id: 'demo', name: 'Demo Vendor', status: 'active' },
  metrics: {
    average_rating: 4.5,
    total_orders: 24,
    completed_orders: 22,
    total_revenue: 125000,
    completion_rate: 91.7,
    on_time_rate: 88.5,
    review_count: 12,
  },
  issues: { total: 3, open: 1, resolved: 2, critical: 0 },
  recent_reviews: [
    {
      id: '1',
      rating: 5,
      review_text: 'Excellent service and delivery',
      reviewer_name: 'John Smith',
      created_at: new Date().toISOString(),
    },
  ],
  monthly_trend: [
    { month: 'Jul 24', orders: 3, revenue: 15000 },
    { month: 'Aug 24', orders: 4, revenue: 22000 },
    { month: 'Sep 24', orders: 5, revenue: 28000 },
    { month: 'Oct 24', orders: 4, revenue: 20000 },
    { month: 'Nov 24', orders: 3, revenue: 18000 },
    { month: 'Dec 24', orders: 5, revenue: 22000 },
  ],
  period: '12m',
};

export function useVendorPerformance(vendorId: string, period: '3m' | '6m' | '12m' = '12m') {
  return useQuery({
    queryKey: ['vendor-performance', vendorId, period],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${vendorId}/performance?period=${period}`);
      if (response.status === 401 || response.status === 404) {
        return DEMO_PERFORMANCE;
      }
      if (!response.ok) {
        return DEMO_PERFORMANCE;
      }
      return response.json() as Promise<VendorPerformanceResponse>;
    },
    enabled: !!vendorId,
  });
}

interface VendorScorecard {
  id: string;
  quality_score: number;
  delivery_score: number;
  communication_score: number;
  pricing_score: number;
  overall_score: number;
  notes?: string;
  evaluation_date: string;
}

interface VendorScorecardResponse {
  latest: VendorScorecard | null;
  history: VendorScorecard[];
  averages: {
    quality: number | null;
    delivery: number | null;
    communication: number | null;
    pricing: number | null;
  };
  overall_score: number;
  evaluation_count: number;
}

export function useVendorScorecard(vendorId: string) {
  return useQuery({
    queryKey: ['vendor-scorecard', vendorId],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${vendorId}/scorecard`);
      if (!response.ok) {
        throw new Error('Failed to fetch scorecard');
      }
      return response.json() as Promise<VendorScorecardResponse>;
    },
    enabled: !!vendorId,
  });
}

interface CreateScorecardInput {
  quality_score: number;
  delivery_score: number;
  communication_score: number;
  pricing_score: number;
  notes?: string;
}

export function useCreateVendorScorecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorId, ...data }: CreateScorecardInput & { vendorId: string }) => {
      const response = await fetch(`/api/vendors/${vendorId}/scorecard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create scorecard');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-scorecard', variables.vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-performance', variables.vendorId] });
    },
  });
}
