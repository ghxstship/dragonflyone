'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// BID OPPORTUNITIES HOOKS
// Manage bid/no-bid decisions
// =============================================================================

export interface BidOpportunity {
  id: string;
  title: string;
  client: string;
  value: number;
  dueDate: string;
  status: 'Pending Review' | 'Bid' | 'No Bid' | 'Under Evaluation';
  score?: number;
  criteria: { name: string; score: number; weight: number }[];
  recommendation?: 'Bid' | 'No Bid';
  notes?: string;
}

// Fetch bid opportunities
export function useBidOpportunities() {
  return useQuery({
    queryKey: ['bid-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(o => ({
        id: o.id,
        title: o.title || '',
        client: o.client_name || '',
        value: 0,
        dueDate: o.deadline || '',
        status: (o.status || 'Pending Review') as BidOpportunity['status'],
        score: undefined,
        criteria: [],
        recommendation: undefined,
        notes: o.description,
      })) as BidOpportunity[];
    },
  });
}
