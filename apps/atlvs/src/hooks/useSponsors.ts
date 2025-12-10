'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SPONSORS HOOKS
// Manage sponsors and sponsorship for productions
// Event-level roles: Partnerships Director, Executive Producer, Finance Director
// =============================================================================

export interface SponsorTier {
  id: string;
  production_id: string;
  name: string;
  level: number;
  price: number;
  description?: string;
  benefits: string[];
  max_sponsors?: number;
  logo_placement?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  production_id: string;
  organization_id: string;
  sponsor_tier_id: string;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  website_url?: string;
  status: 'prospect' | 'negotiating' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  contract_value: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  amount_paid: number;
  contract_signed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  tier?: SponsorTier;
  deliverables?: SponsorDeliverable[];
}

export interface SponsorDeliverable {
  id: string;
  sponsor_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface SponsorFilters {
  productionId?: string;
  tierId?: string;
  status?: string;
  paymentStatus?: string;
}

// Fetch sponsor tiers
export function useSponsorTiers(productionId?: string) {
  return useQuery({
    queryKey: ['sponsor_tiers', productionId],
    queryFn: async () => {
      let query = supabase
        .from('sponsor_tiers')
        .select('*')
        .order('level', { ascending: false });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SponsorTier[];
    },
  });
}

// Fetch all sponsors
export function useSponsors(filters?: SponsorFilters) {
  return useQuery({
    queryKey: ['sponsors', filters],
    queryFn: async () => {
      let query = supabase
        .from('sponsors')
        .select(`
          *,
          tier:sponsor_tiers(id, name, level, price)
        `)
        .order('contract_value', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.tierId) {
        query = query.eq('sponsor_tier_id', filters.tierId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Sponsor[];
    },
  });
}

// Fetch single sponsor with deliverables
export function useSponsor(id: string) {
  return useQuery({
    queryKey: ['sponsors', id],
    queryFn: async () => {
      const { data: sponsor, error: sponsorError } = await supabase
        .from('sponsors')
        .select(`
          *,
          tier:sponsor_tiers(*)
        `)
        .eq('id', id)
        .single();

      if (sponsorError) throw sponsorError;

      const { data: deliverables, error: delError } = await supabase
        .from('sponsor_deliverables')
        .select('*')
        .eq('sponsor_id', id)
        .order('due_date', { ascending: true });

      if (delError) throw delError;

      return { ...sponsor, deliverables } as unknown as Sponsor;
    },
    enabled: !!id,
  });
}

// Create sponsor tier
export function useCreateSponsorTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tier: Omit<SponsorTier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sponsor_tiers')
        .insert(tier)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor_tiers'] });
    },
  });
}

// Update sponsor tier
export function useUpdateSponsorTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SponsorTier> & { id: string }) => {
      const { data, error } = await supabase
        .from('sponsor_tiers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor_tiers'] });
    },
  });
}

// Delete sponsor tier
export function useDeleteSponsorTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsor_tiers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor_tiers'] });
    },
  });
}

// Create sponsor
export function useCreateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sponsor: Omit<Sponsor, 'id' | 'created_at' | 'updated_at' | 'tier' | 'deliverables'>) => {
      const { data, error } = await supabase
        .from('sponsors')
        .insert(sponsor)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

// Update sponsor
export function useUpdateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sponsor> & { id: string }) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors', variables.id] });
    },
  });
}

// Create deliverable
export function useCreateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deliverable: Omit<SponsorDeliverable, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sponsor_deliverables')
        .insert(deliverable)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors', variables.sponsor_id] });
    },
  });
}

// Update deliverable
export function useUpdateDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sponsorId, ...updates }: Partial<SponsorDeliverable> & { id: string; sponsorId: string }) => {
      const { data, error } = await supabase
        .from('sponsor_deliverables')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, sponsorId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors', data.sponsorId] });
    },
  });
}

// Complete deliverable
export function useCompleteDeliverable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sponsorId, completedBy }: { id: string; sponsorId: string; completedBy: string }) => {
      const { data, error } = await supabase
        .from('sponsor_deliverables')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, sponsorId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors', data.sponsorId] });
    },
  });
}

// Record payment
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      // First get current sponsor
      const { data: sponsor, error: getError } = await supabase
        .from('sponsors')
        .select('amount_paid, contract_value')
        .eq('id', id)
        .single();

      if (getError) throw getError;

      const newAmountPaid = (sponsor.amount_paid || 0) + amount;
      const paymentStatus = newAmountPaid >= sponsor.contract_value ? 'paid' : 'partial';

      const { data, error } = await supabase
        .from('sponsors')
        .update({
          amount_paid: newAmountPaid,
          payment_status: paymentStatus,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
      queryClient.invalidateQueries({ queryKey: ['sponsors', variables.id] });
    },
  });
}

// Get sponsor statistics
export function useSponsorStats(productionId?: string) {
  return useQuery({
    queryKey: ['sponsors', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('sponsors').select('status, payment_status, contract_value, amount_paid');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const sponsors = data || [];
      return {
        total: sponsors.length,
        confirmed: sponsors.filter(s => s.status === 'confirmed' || s.status === 'active').length,
        prospect: sponsors.filter(s => s.status === 'prospect').length,
        negotiating: sponsors.filter(s => s.status === 'negotiating').length,
        totalValue: sponsors.reduce((sum, s) => sum + (s.contract_value || 0), 0),
        totalPaid: sponsors.reduce((sum, s) => sum + (s.amount_paid || 0), 0),
        outstanding: sponsors.reduce((sum, s) => sum + ((s.contract_value || 0) - (s.amount_paid || 0)), 0),
        paidInFull: sponsors.filter(s => s.payment_status === 'paid').length,
        overdue: sponsors.filter(s => s.payment_status === 'overdue').length,
      };
    },
  });
}
