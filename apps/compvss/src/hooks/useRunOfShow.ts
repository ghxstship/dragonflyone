'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// RUN OF SHOW HOOKS
// Manage cues and run of show data
// =============================================================================

export interface CueItem {
  id: string;
  time: string;
  cue: string;
  department: string;
  notes?: string;
  status: 'pending' | 'ready' | 'complete';
}

// Fetch cues
export function useCues(eventId?: string) {
  return useQuery({
    queryKey: ['cues', eventId],
    queryFn: async () => {
      let query = supabase
        .from('show_cues')
        .select('*')
        .order('scheduled_time', { ascending: true });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        time: c.scheduled_time || '',
        cue: c.activity || c.cue_number || '',
        department: c.cue_type || 'General',
        notes: c.notes || c.audio_notes || c.blocking_notes,
        status: (c.status as CueItem['status']) || 'pending',
      })) as CueItem[];
    },
  });
}

// Update cue status
export function useUpdateCueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CueItem['status'] }) => {
      const { data, error } = await supabase
        .from('show_cues')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cues'] });
    },
  });
}
