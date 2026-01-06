'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// INVESTORS HOOKS
// Manage investors and investment rounds for productions
// Event-level roles: Executive Producer, Finance Director, CFO
// =============================================================================

export interface InvestmentRound {
  id: string;
  production_id: string;
  name: string;
  round_type: 'seed' | 'series_a' | 'series_b' | 'bridge' | 'other';
  target_amount: number;
  minimum_investment: number;
  raised_amount: number;
  status: 'planning' | 'open' | 'closing' | 'closed';
  open_date?: string;
  close_date?: string;
  terms?: string;
  documents?: string[];
  created_at: string;
  updated_at: string;
}

export interface Investor {
  id: string;
  production_id: string;
  round_id?: string;
  investor_type: 'individual' | 'entity' | 'fund';
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  investment_amount: number;
  ownership_percentage?: number;
  status: 'prospect' | 'committed' | 'funded' | 'exited';
  commitment_date?: string;
  funding_date?: string;
  notes?: string;
  documents?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  round?: InvestmentRound;
}

export interface InvestorDocument {
  id: string;
  investor_id?: string;
  round_id?: string;
  document_type: 'subscription_agreement' | 'operating_agreement' | 'term_sheet' | 'side_letter' | 'other';
  title: string;
  file_url: string;
  status: 'draft' | 'sent' | 'signed' | 'executed';
  sent_at?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

interface InvestorFilters {
  productionId?: string;
  roundId?: string;
  status?: string;
  investorType?: string;
}

// Fetch investment rounds
export function useInvestmentRounds(productionId?: string) {
  return useQuery({
    queryKey: ['investment_rounds', productionId],
    queryFn: async () => {
      let query = supabase
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as InvestmentRound[];
    },
  });
}

// Fetch single investment round
export function useInvestmentRound(id: string) {
  return useQuery({
    queryKey: ['investment_rounds', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as InvestmentRound;
    },
    enabled: !!id,
  });
}

// Fetch all investors (3NF: legend_organizations with org_type='investor')
export function useInvestors(filters?: InvestorFilters) {
  return useQuery({
    queryKey: ['investors', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_organizations')
        .select('*')
        .eq('org_type', 'investor')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Fetch single investor (3NF: legend_organizations with org_type='investor')
export function useInvestor(id: string) {
  return useQuery({
    queryKey: ['investors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_organizations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Fetch investor documents
export function useInvestorDocuments(investorId?: string, roundId?: string) {
  return useQuery({
    queryKey: ['investor_documents', investorId, roundId],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (investorId) {
        query = query.eq('investor_id', investorId);
      }
      if (roundId) {
        query = query.eq('round_id', roundId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as InvestorDocument[];
    },
  });
}

// Create investment round
export function useCreateInvestmentRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (round: Omit<InvestmentRound, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('deals')
        .insert(round)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investment_rounds'] });
    },
  });
}

// Update investment round
export function useUpdateInvestmentRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InvestmentRound> & { id: string }) => {
      const { data, error } = await supabase
        .from('deals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investment_rounds'] });
      queryClient.invalidateQueries({ queryKey: ['investment_rounds', variables.id] });
    },
  });
}

// Create investor (3NF: legend_organizations with org_type='investor')
export function useCreateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investor: Omit<Investor, 'id' | 'created_at' | 'updated_at' | 'round'>) => {
      const { data, error } = await supabase
        .from('legend_organizations')
        .insert({
          name: investor.name,
          org_type: 'investor',
          status: investor.status || 'prospect',
          email: investor.contact_email,
          phone: investor.contact_phone,
          notes: investor.notes,
          metadata: {
            production_id: investor.production_id,
            investor_type: investor.investor_type,
            investment_amount: investor.investment_amount,
            ownership_percentage: investor.ownership_percentage,
            round_id: investor.round_id,
          },
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      queryClient.invalidateQueries({ queryKey: ['investment_rounds'] });
    },
  });
}

// Update investor (3NF: legend_organizations with org_type='investor')
export function useUpdateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Investor> & { id: string }) => {
      const { data, error } = await supabase
        .from('legend_organizations')
        .update({
          name: updates.name,
          status: updates.status,
          email: updates.contact_email,
          phone: updates.contact_phone,
          notes: updates.notes,
          metadata: {
            investor_type: updates.investor_type,
            investment_amount: updates.investment_amount,
            ownership_percentage: updates.ownership_percentage,
          },
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      queryClient.invalidateQueries({ queryKey: ['investors', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['investment_rounds'] });
    },
  });
}

// Record funding (3NF: legend_organizations with org_type='investor')
export function useRecordFunding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      // Update investor status and funding date
      const { data: org, error: orgError } = await supabase
        .from('legend_organizations')
        .update({
          status: 'funded',
          metadata: {
            funding_date: new Date().toISOString(),
          },
        })
        .eq('id', id)
        .select('metadata')
        .single();

      if (orgError) throw orgError;

      const meta = org.metadata as Record<string, unknown> || {};
      const roundId = meta.round_id as string;

      // Update round raised amount
      if (roundId) {
        const { data: round, error: roundError } = await supabase
          .from('deals')
          .select('raised_amount')
          .eq('id', roundId)
          .single();

        if (roundError) throw roundError;

        await supabase
          .from('deals')
          .update({
            raised_amount: (round.raised_amount || 0) + amount,
          })
          .eq('id', roundId);
      }

      return org;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      queryClient.invalidateQueries({ queryKey: ['investors', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['investment_rounds'] });
    },
  });
}

// Get investor statistics
export function useInvestorStats(productionId?: string) {
  return useQuery({
    queryKey: ['investors', 'stats', productionId],
    queryFn: async () => {
      // 3NF: legend_organizations with org_type='investor'
      let investorQuery = supabase.from('legend_organizations').select('status, metadata').eq('org_type', 'investor');
      let roundQuery = supabase.from('deals').select('target_amount, raised_amount, status');
      
      if (productionId) {
        investorQuery = investorQuery.eq('production_id', productionId);
        roundQuery = roundQuery.eq('production_id', productionId);
      }

      const [investorResult, roundResult] = await Promise.all([
        investorQuery,
        roundQuery,
      ]);

      if (investorResult.error) throw investorResult.error;
      if (roundResult.error) throw roundResult.error;

      const investors = investorResult.data || [];
      const rounds = roundResult.data || [];

      return {
        totalInvestors: investors.length,
        funded: investors.filter(i => i.status === 'funded').length,
        committed: investors.filter(i => i.status === 'committed').length,
        prospect: investors.filter(i => i.status === 'prospect').length,
        totalCommitted: investors.filter(i => i.status === 'committed' || i.status === 'funded')
          .reduce((sum, i) => sum + (i.investment_amount || 0), 0),
        totalFunded: investors.filter(i => i.status === 'funded')
          .reduce((sum, i) => sum + (i.investment_amount || 0), 0),
        totalRounds: rounds.length,
        openRounds: rounds.filter(r => r.status === 'open').length,
        totalTarget: rounds.reduce((sum, r) => sum + (r.target_amount || 0), 0),
        totalRaised: rounds.reduce((sum, r) => sum + (r.raised_amount || 0), 0),
      };
    },
  });
}
