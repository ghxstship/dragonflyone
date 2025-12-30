'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// JOB OPPORTUNITIES HOOKS
// Mobile job search and quick apply
// =============================================================================

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-Time' | 'Gig' | 'Contract' | 'Freelance';
  rate: string;
  posted: string;
  deadline?: string;
  skills: string[];
  saved: boolean;
  applied: boolean;
}

// Fetch job opportunities
export function useJobOpportunities() {
  return useQuery({
    queryKey: ['job-opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bid_opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(o => ({
        id: o.id,
        title: o.title || '',
        company: o.client_name || '',
        location: o.location || '',
        type: (o.employment_type || 'Full-Time') as JobOpportunity['type'],
        rate: '',
        posted: o.created_at || '',
        deadline: o.deadline,
        skills: o.skills_required || [],
        saved: false,
        applied: false,
      })) as JobOpportunity[];
    },
  });
}
