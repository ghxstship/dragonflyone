'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SET TIMES HOOKS
// Manage set times and schedule tracking
// =============================================================================

export interface SetTime {
  id: string;
  artistName: string;
  stage: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'Upcoming' | 'On Stage' | 'Completed' | 'Delayed' | 'Cancelled';
  setLength: number;
  changeoverTime: number;
  notes?: string;
}

// Fetch set times
export function useSetTimes(eventId?: string) {
  return useQuery({
    queryKey: ['set-times', eventId],
    queryFn: async () => {
      let query = supabase
        .from('legend_events')
        .select('*')
        .order('scheduled_start', { ascending: true });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        artistName: s.artist_name || s.performer_name || '',
        stage: s.stage || s.venue || '',
        scheduledStart: s.scheduled_start || '',
        scheduledEnd: s.scheduled_end || '',
        actualStart: s.actual_start,
        actualEnd: s.actual_end,
        status: s.status || 'Upcoming',
        setLength: s.set_length || s.duration || 0,
        changeoverTime: s.changeover_time || 0,
        notes: s.notes,
      })) as SetTime[];
    },
  });
}

// Update set time (start/end)
export function useUpdateSetTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actualStart, actualEnd, status }: { id: string; actualStart?: string; actualEnd?: string; status?: SetTime['status'] }) => {
      const updates: Record<string, unknown> = {};
      if (actualStart !== undefined) updates.actual_start = actualStart;
      if (actualEnd !== undefined) updates.actual_end = actualEnd;
      if (status !== undefined) updates.status = status;

      const { data, error } = await supabase
        .from('legend_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['set-times'] });
    },
  });
}
