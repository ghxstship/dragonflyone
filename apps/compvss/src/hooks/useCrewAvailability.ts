'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// CREW AVAILABILITY HOOKS
// Manage crew availability calendar
// =============================================================================

export interface CrewAvailability {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: 'Available' | 'Busy' | 'Tentative' | 'Unavailable';
  currentProject?: string;
  nextAvailable?: string;
  weekAvailability: boolean[];
}

// Fetch crew availability
export function useCrewAvailability() {
  return useQuery({
    queryKey: ['crew-availability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_people')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        name: c.name || `${c.first_name} ${c.last_name}`,
        role: c.role || c.job_title || '',
        department: c.department || '',
        avatar: c.name?.charAt(0) || '?',
        status: (c.availability_status || 'Available') as CrewAvailability['status'],
        currentProject: c.current_project,
        nextAvailable: c.next_available_date,
        weekAvailability: [true, true, true, true, true, false, false],
      })) as CrewAvailability[];
    },
  });
}
