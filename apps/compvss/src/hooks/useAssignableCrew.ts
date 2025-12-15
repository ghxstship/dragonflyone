'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// ASSIGNABLE CREW HOOKS
// Manage crew assignment to projects
// =============================================================================

export interface AssignableCrew {
  id: string;
  name: string;
  role: string;
  skills: string[];
  available: boolean;
}

// Fetch assignable crew
export function useAssignableCrew() {
  return useQuery({
    queryKey: ['assignable-crew'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.full_name || '',
        role: c.role || '',
        skills: c.skills || [],
        available: c.status === 'active',
      })) as AssignableCrew[];
    },
  });
}
