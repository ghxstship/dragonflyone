'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY SCHEDULE HOOKS
// Manage crew member schedule
// =============================================================================

export interface ScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  production: string;
  venue: string;
  department: string;
  role: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

// Fetch my schedule
export function useMySchedule() {
  return useQuery({
    queryKey: ['my-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_schedules')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        date: s.date || s.shift_date || '',
        startTime: s.start_time || '09:00',
        endTime: s.end_time || '17:00',
        production: s.production_name || s.event_name || '',
        venue: s.venue || s.location || '',
        department: s.department || '',
        role: s.role || s.position || '',
        status: s.status || 'confirmed',
      })) as ScheduleItem[];
    },
  });
}
