'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SHOW CALL HOOKS
// Manage crew check-in and attendance tracking
// =============================================================================

export interface ShowCallCrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  callTime: string;
  status: 'Checked In' | 'On Site' | 'Late' | 'No Show' | 'Not Due';
  checkedInAt?: string;
  phone: string;
}

// Fetch show call crew
export function useShowCallCrew(eventId?: string) {
  return useQuery({
    queryKey: ['show-call-crew', eventId],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('call_time', { ascending: true });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.crew_name || c.name || '',
        role: c.role || c.position || '',
        department: c.department || '',
        callTime: c.call_time || '',
        status: c.status || 'Not Due',
        checkedInAt: c.checked_in_at,
        phone: c.phone || c.contact_phone || '',
      })) as ShowCallCrewMember[];
    },
  });
}

// Check in crew member
export function useCheckInCrew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ShowCallCrewMember['status'] }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          checked_in_at: status === 'Checked In' || status === 'On Site' ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-call-crew'] });
    },
  });
}
