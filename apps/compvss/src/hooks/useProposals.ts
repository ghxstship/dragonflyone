'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// PROPOSALS HOOKS
// Manage proposals and version control
// =============================================================================

export interface Proposal {
  id: string;
  title: string;
  client: string;
  rfpId?: string;
  value: number;
  status: 'Draft' | 'In Review' | 'Submitted' | 'Won' | 'Lost';
  dueDate: string;
  version: number;
  lastModified: string;
  team: string[];
}

// Fetch proposals
export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        title: p.title || '',
        client: p.client_id || '',
        rfpId: p.opportunity_id,
        value: p.total_value || 0,
        status: (p.status || 'Draft') as Proposal['status'],
        dueDate: p.valid_until || '',
        version: 1,
        lastModified: p.updated_at || p.created_at || '',
        team: [],
      })) as Proposal[];
    },
  });
}
