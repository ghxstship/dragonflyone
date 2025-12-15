'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// BID PORTAL HOOKS
// Manage bid opportunities and submissions
// =============================================================================

export interface BidOpportunity {
  id: string;
  title: string;
  client: string;
  description: string;
  dueDate: string;
  status: 'Open' | 'Submitted' | 'Under Review' | 'Won' | 'Lost';
  type: string;
  budget?: string;
  bidAmount?: number;
  requirements: string[];
}

// Fetch bid opportunities
export function useBidOpportunities() {
  return useQuery({
    queryKey: ['bid-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_opportunities')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(b => ({
        id: b.id,
        title: b.title,
        client: b.client_name,
        description: b.description,
        dueDate: b.due_date,
        status: b.status,
        type: b.opportunity_type,
        budget: b.budget,
        bidAmount: b.bid_amount,
        requirements: b.requirements || [],
      })) as BidOpportunity[];
    },
  });
}

// Submit bid
export function useSubmitBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bidId, amount, summary }: { bidId: string; amount: number; summary: string }) => {
      const { data, error } = await supabase
        .from('bid_opportunities')
        .update({
          status: 'Submitted',
          bid_amount: amount,
          proposal_summary: summary,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', bidId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bid-opportunities'] });
    },
  });
}
