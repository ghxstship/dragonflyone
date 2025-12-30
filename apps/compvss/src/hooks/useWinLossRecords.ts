'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// WIN/LOSS RECORDS HOOKS
// Track outcomes and competitive intelligence
// =============================================================================

export interface WinLossRecord {
  id: string;
  opportunity: string;
  client: string;
  value: number;
  result: 'Won' | 'Lost';
  competitor?: string;
  reason: string;
  closeDate: string;
  salesRep: string;
  lessons?: string;
}

// Fetch win/loss records
export function useWinLossRecords() {
  return useQuery({
    queryKey: ['win-loss-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_opportunities')
        .select('*')
        .in('status', ['Won', 'Lost', 'Closed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(o => ({
        id: o.id,
        opportunity: o.title || '',
        client: o.client_name || '',
        value: 0,
        result: (o.status === 'Won' ? 'Won' : 'Lost') as WinLossRecord['result'],
        competitor: undefined,
        reason: o.description || '',
        closeDate: o.closed_at || '',
        salesRep: '',
        lessons: undefined,
      })) as WinLossRecord[];
    },
  });
}
