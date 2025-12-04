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
        .from('investment_rounds')
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
        .from('investment_rounds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as InvestmentRound;
    },
    enabled: !!id,
  });
}

// Fetch all investors
export function useInvestors(filters?: InvestorFilters) {
  return useQuery({
    queryKey: ['investors', filters],
    queryFn: async () => {
      let query = supabase
        .from('investors')
        .select(`
          *,
          round:investment_rounds(id, name, round_type)
        `)
        .order('investment_amount', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.roundId) {
        query = query.eq('round_id', filters.roundId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.investorType) {
        query = query.eq('investor_type', filters.investorType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Investor[];
    },
  });
}

// Fetch single investor
export function useInvestor(id: string) {
  return useQuery({
    queryKey: ['investors', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investors')
        .select(`
          *,
          round:investment_rounds(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Investor;
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
        .from('investor_documents')
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
        .from('investment_rounds')
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
        .from('investment_rounds')
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

// Create investor
export function useCreateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (investor: Omit<Investor, 'id' | 'created_at' | 'updated_at' | 'round'>) => {
      const { data, error } = await supabase
        .from('investors')
        .insert(investor)
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

// Update investor
export function useUpdateInvestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Investor> & { id: string }) => {
      const { data, error } = await supabase
        .from('investors')
        .update(updates)
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

// Record funding
export function useRecordFunding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      // Update investor status and funding date
      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .update({
          status: 'funded',
          funding_date: new Date().toISOString(),
        })
        .eq('id', id)
        .select('round_id')
        .single();

      if (investorError) throw investorError;

      // Update round raised amount
      if (investor.round_id) {
        const { data: round, error: roundError } = await supabase
          .from('investment_rounds')
          .select('raised_amount')
          .eq('id', investor.round_id)
          .single();

        if (roundError) throw roundError;

        await supabase
          .from('investment_rounds')
          .update({
            raised_amount: (round.raised_amount || 0) + amount,
          })
          .eq('id', investor.round_id);
      }

      return investor;
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
      let investorQuery = supabase.from('investors').select('status, investment_amount');
      let roundQuery = supabase.from('investment_rounds').select('target_amount, raised_amount, status');
      
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
