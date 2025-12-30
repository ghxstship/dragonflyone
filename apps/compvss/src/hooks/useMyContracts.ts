'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY CONTRACTS HOOKS
// Manage vendor contracts
// =============================================================================

export interface Contract {
  id: string;
  production: string;
  client: string;
  type: string;
  status: 'draft' | 'pending_signature' | 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  value: number;
}

// Fetch my contracts
export function useMyContracts() {
  return useQuery({
    queryKey: ['my-contracts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('docs_profile_contract')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        production: c.title || '',
        client: c.vendor_id || '',
        type: c.contract_type_id || 'Service',
        status: (c.status || 'draft') as Contract['status'],
        startDate: c.start_date || '',
        endDate: c.end_date || '',
        value: c.value || 0,
      })) as Contract[];
    },
  });
}
