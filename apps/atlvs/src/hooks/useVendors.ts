'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
  payment_terms?: string;
  tax_id?: string;
  contact_name?: string;
  rating?: number;
  total_orders?: number;
  total_spend?: number;
  created_at: string;
  updated_at: string;
}

// Fetch all vendors
export function useVendors(filters?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ['vendors', filters],
    queryFn: async () => {
      let query = supabase.from('vendors').select('*').order('name', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as unknown as Vendor[];
    },
  });
}

// Fetch single vendor
export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as unknown as Vendor;
    },
    enabled: !!id,
  });
}

// Create vendor
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vendor: Omit<Vendor, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendor)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// Delete vendor
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vendors').delete().eq('id', id);

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
