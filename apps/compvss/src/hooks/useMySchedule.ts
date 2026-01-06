'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY SCHEDULE HOOKS
// Manage crew member schedule
// =============================================================================

export interface MyScheduleItem {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  production: string;
  venue: string;
  location: string;
  department: string;
  role: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'confirmed' | 'pending' | 'cancelled';
  [key: string]: unknown;
}

export interface MyScheduleSummary {
  total: number;
  today: number;
  this_week: number;
  upcoming: number;
}

// Fetch my schedule with summary
export function useMySchedule() {
  const query = useQuery({
    queryKey: ['my-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workforce_time_entries')
        .select('*')
        .order('work_date', { ascending: true });

      if (error) throw error;
      
      const items = (data || []).map(s => ({
        id: s.id,
        title: s.description || 'Shift',
        date: s.work_date || '',
        start_time: s.start_time || '09:00',
        end_time: s.end_time || '17:00',
        production: '',
        venue: s.location || '',
        location: s.location || '',
        department: '',
        role: '',
        status: (s.status as MyScheduleItem['status']) || 'confirmed',
      })) as MyScheduleItem[];

      const today = new Date().toISOString().split('T')[0];
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const summary: MyScheduleSummary = {
        total: items.length,
        today: items.filter(i => i.date === today).length,
        this_week: items.filter(i => i.date >= today && i.date <= weekFromNow).length,
        upcoming: items.filter(i => i.date > today).length,
      };

      return { items, summary };
    },
  });

  return {
    items: query.data?.items || [],
    summary: query.data?.summary,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
