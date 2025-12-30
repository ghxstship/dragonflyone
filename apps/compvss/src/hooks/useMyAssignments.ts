'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY ASSIGNMENTS HOOKS
// Manage crew member assignments
// =============================================================================

export interface Assignment {
  id: string;
  production: string;
  venue: string;
  dates: string;
  department: string;
  role: string;
  rate: number;
  deadline: string;
  status: 'pending' | 'accepted' | 'declined';
}

// Fetch my assignments
export function useMyAssignments() {
  return useQuery({
    queryKey: ['my-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_role_assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(a => ({
        id: a.id,
        production: a.notes || `Assignment ${a.id?.substring(0, 8)}`,
        venue: '',
        dates: a.start_date || a.created_at?.split('T')[0] || '',
        department: a.department || '',
        role: a.role || '',
        rate: a.daily_rate || 0,
        deadline: a.end_date || '',
        status: (a.confirmation_status || 'pending') as Assignment['status'],
      })) as Assignment[];
    },
  });
}

// Update assignment status
export function useUpdateAssignmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Assignment['status'] }) => {
      const { data, error } = await supabase
        .from('event_role_assignments')
        .update({ confirmation_status: status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
    },
  });
}
