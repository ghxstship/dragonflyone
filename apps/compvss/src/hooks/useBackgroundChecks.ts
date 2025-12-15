'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// BACKGROUND CHECKS HOOKS
// Manage crew background checks
// =============================================================================

export interface BackgroundCheck {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  department: string;
  checkType: 'Standard' | 'Enhanced' | 'Federal';
  status: 'Cleared' | 'Pending' | 'In Progress' | 'Expired' | 'Flagged';
  submittedDate: string;
  completedDate?: string;
  expirationDate?: string;
  daysUntilExpiry?: number;
  provider: string;
}

// Fetch background checks
export function useBackgroundChecks() {
  return useQuery({
    queryKey: ['background-checks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('background_checks')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(c => {
        const expirationDate = c.expires_at;
        let daysUntilExpiry: number | undefined;
        if (expirationDate) {
          const expDate = new Date(expirationDate);
          const today = new Date();
          daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        return {
          id: c.id,
          crewMemberId: c.employee_id || '',
          crewMemberName: c.subject_name || '',
          department: c.scope || '',
          checkType: c.check_type as BackgroundCheck['checkType'],
          status: c.status as BackgroundCheck['status'],
          submittedDate: c.submitted_at || c.created_at || '',
          completedDate: c.completed_at,
          expirationDate: c.expires_at,
          daysUntilExpiry,
          provider: c.provider || '',
        };
      }) as BackgroundCheck[];
    },
  });
}

// Create background check
export function useCreateBackgroundCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (check: Omit<BackgroundCheck, 'id' | 'daysUntilExpiry'>) => {
      const { data, error } = await supabase
        .from('background_checks')
        .insert({
          employee_id: check.crewMemberId,
          subject_name: check.crewMemberName,
          scope: check.department,
          check_type: check.checkType,
          status: check.status,
          submitted_at: check.submittedDate,
          completed_at: check.completedDate,
          expires_at: check.expirationDate,
          provider: check.provider,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-checks'] });
    },
  });
}

// Renew background check
export function useRenewBackgroundCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (check: BackgroundCheck) => {
      const { data, error } = await supabase
        .from('background_checks')
        .insert({
          employee_id: check.crewMemberId,
          subject_name: check.crewMemberName,
          scope: check.department,
          check_type: check.checkType,
          status: 'Pending',
          submitted_at: new Date().toISOString().split('T')[0],
          provider: check.provider,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-checks'] });
    },
  });
}

// Delete background check
export function useDeleteBackgroundCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('background_checks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['background-checks'] });
    },
  });
}
