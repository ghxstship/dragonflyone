'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SOUNDCHECK HOOKS
// Manage soundcheck scheduling and coordination
// =============================================================================

export interface SoundcheckSlot {
  id: string;
  artistName: string;
  stage: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
  duration: number;
  requirements: string[];
  engineer?: string;
  notes?: string;
}

// Fetch soundcheck slots
export function useSoundcheckSlots(eventId?: string) {
  return useQuery({
    queryKey: ['soundcheck-slots', eventId],
    queryFn: async () => {
      let query = supabase
        .from('soundcheck_slots')
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
        status: s.status || 'Scheduled',
        duration: s.duration || 0,
        requirements: s.requirements || [],
        engineer: s.engineer || s.assigned_engineer,
        notes: s.notes,
      })) as SoundcheckSlot[];
    },
  });
}

// Update soundcheck status
export function useUpdateSoundcheckStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, actualStart, actualEnd }: { id: string; status: SoundcheckSlot['status']; actualStart?: string; actualEnd?: string }) => {
      const updates: Record<string, unknown> = { status };
      if (actualStart !== undefined) updates.actual_start = actualStart;
      if (actualEnd !== undefined) updates.actual_end = actualEnd;

      const { data, error } = await supabase
        .from('soundcheck_slots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soundcheck-slots'] });
    },
  });
}
