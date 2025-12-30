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
        .from('deals')
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

// Fetch all sponsors (3NF: legend_organizations + orgs_profile_sponsor)
export function useSponsors(filters?: SponsorFilters) {
  return useQuery({
    queryKey: ['sponsors', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_organizations')
        .select(`
          *,
          orgs_profile_sponsor!org_id(*)
        `)
        .not('orgs_profile_sponsor', 'is', null)
        .order('created_at', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('orgs_profile_sponsor.production_id', filters.productionId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform to legacy Sponsor interface
      return (data || []).map(org => {
        const profile = (org.orgs_profile_sponsor as Record<string, unknown>[])?.[0] || {};
        return {
          id: org.id,
          production_id: profile.production_id as string,
          organization_id: org.organization_id,
          company_name: org.name,
          contact_name: org.primary_contact_id,
          contact_email: org.email,
          contact_phone: org.phone,
          logo_url: org.logo_url,
          website_url: org.website,
          status: profile.sponsorship_status as string || 'prospect',
          contract_value: profile.contract_value as number || 0,
          payment_status: profile.payment_status as string || 'pending',
          amount_paid: profile.amount_paid as number || 0,
          notes: org.notes,
          created_at: org.created_at,
          updated_at: org.updated_at,
        };
      }) as unknown as Sponsor[];
    },
  });
}

// Fetch single sponsor with deliverables (3NF: legend_organizations + orgs_profile_sponsor)
export function useSponsor(id: string) {
  return useQuery({
    queryKey: ['sponsors', id],
    queryFn: async () => {
      const { data: org, error: orgError } = await supabase
        .from('legend_organizations')
        .select(`
          *,
          orgs_profile_sponsor!org_id(*)
        `)
        .eq('id', id)
        .single();

      if (orgError) throw orgError;

      const profile = (org.orgs_profile_sponsor as Record<string, unknown>[])?.[0] || {};
      
      return {
        id: org.id,
        production_id: profile.production_id as string,
        organization_id: org.organization_id,
        company_name: org.name,
        contact_name: org.primary_contact_id,
        contact_email: org.email,
        contact_phone: org.phone,
        logo_url: org.logo_url,
        website_url: org.website,
        status: profile.sponsorship_status as string || 'prospect',
        contract_value: profile.contract_value as number || 0,
        payment_status: profile.payment_status as string || 'pending',
        amount_paid: profile.amount_paid as number || 0,
        notes: org.notes,
        created_at: org.created_at,
        updated_at: org.updated_at,
        deliverables: [],
      } as unknown as Sponsor;
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
        .from('deals')
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
        .from('deals')
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
        .from('deals')
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

// Create sponsor (3NF: legend_organizations + orgs_profile_sponsor)
export function useCreateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sponsor: Omit<Sponsor, 'id' | 'created_at' | 'updated_at' | 'tier' | 'deliverables'>) => {
      // Create organization first
      const { data: org, error: orgError } = await supabase
        .from('legend_organizations')
        .insert({
          name: sponsor.company_name,
          org_type: 'sponsor',
          status: 'active',
          email: sponsor.contact_email,
          phone: sponsor.contact_phone,
          logo_url: sponsor.logo_url,
          website: sponsor.website_url,
          notes: sponsor.notes,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create sponsor profile
      const { error: profileError } = await supabase
        .from('orgs_profile_sponsor')
        .insert({
          org_id: org.id,
          sponsorship_status: sponsor.status,
          contract_value: sponsor.contract_value,
          payment_status: sponsor.payment_status,
          amount_paid: sponsor.amount_paid,
        });

      if (profileError) {
        // Rollback org creation
        await supabase.from('legend_organizations').delete().eq('id', org.id);
        throw profileError;
      }

      return org;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors'] });
    },
  });
}

// Update sponsor (3NF: legend_organizations + orgs_profile_sponsor)
export function useUpdateSponsor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Sponsor> & { id: string }) => {
      // Update organization
      const { data, error } = await supabase
        .from('legend_organizations')
        .update({
          name: updates.company_name,
          email: updates.contact_email,
          phone: updates.contact_phone,
          logo_url: updates.logo_url,
          website: updates.website_url,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update sponsor profile
      if (updates.status || updates.contract_value || updates.payment_status || updates.amount_paid) {
        await supabase
          .from('orgs_profile_sponsor')
          .update({
            sponsorship_status: updates.status,
            contract_value: updates.contract_value,
            payment_status: updates.payment_status,
            amount_paid: updates.amount_paid,
          })
          .eq('org_id', id);
      }

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
        .from('projects')
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
        .from('projects')
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
        .from('projects')
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

// Record payment (3NF: orgs_profile_sponsor)
export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      // First get current sponsor profile
      const { data: profile, error: getError } = await supabase
        .from('orgs_profile_sponsor')
        .select('amount_paid, contract_value')
        .eq('org_id', id)
        .single();

      if (getError) throw getError;

      const newAmountPaid = (profile.amount_paid || 0) + amount;
      const paymentStatus = newAmountPaid >= (profile.contract_value || 0) ? 'paid' : 'partial';

      const { data, error } = await supabase
        .from('orgs_profile_sponsor')
        .update({
          amount_paid: newAmountPaid,
          payment_status: paymentStatus,
        })
        .eq('org_id', id)
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
      // 3NF: legend_organizations + orgs_profile_sponsor
      let query = supabase.from('legend_organizations').select('status, orgs_profile_sponsor!org_id(sponsorship_status, payment_status, contract_value, amount_paid)').not('orgs_profile_sponsor', 'is', null);
      
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
