'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY TIMESHEETS HOOKS
// Manage crew timesheets
// =============================================================================

export interface TimesheetEntry {
  id: string;
  date: string;
  production: string;
  clockIn: string;
  clockOut: string;
  breakTime: number;
  totalHours: number;
  rate: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

// Fetch my timesheets
export function useMyTimesheets() {
  return useQuery({
    queryKey: ['my-timesheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('timesheets')
        .select('*')
        .order('work_date', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(t => ({
        id: t.id,
        date: t.work_date || '',
        production: t.notes || `Shift ${t.id?.substring(0, 8)}`,
        clockIn: t.clock_in || '09:00',
        clockOut: t.clock_out || '17:00',
        breakTime: t.break_minutes || 0,
        totalHours: t.total_hours || 0,
        rate: 0,
        status: (t.status || 'draft') as TimesheetEntry['status'],
      })) as TimesheetEntry[];
    },
  });
}
