'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY HOSPITALITY HOOKS
// Manage hospitality requests
// =============================================================================

export interface HospitalityRequest {
  id: string;
  event: string;
  category: 'catering' | 'transport' | 'accommodation' | 'other';
  date: string;
  description: string;
  status: 'pending' | 'approved' | 'declined';
  notes?: string;
}

// Fetch my hospitality requests
export function useMyHospitality() {
  return useQuery({
    queryKey: ['my-hospitality'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hospitality_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(h => ({
        id: h.id,
        event: h.event_name || h.production_name || '',
        category: (h.category || h.request_type || 'other') as HospitalityRequest['category'],
        date: h.request_date || h.created_at?.split('T')[0] || '',
        description: h.description || h.notes || '',
        status: (h.status || 'pending') as HospitalityRequest['status'],
        notes: h.response_notes || h.admin_notes,
      })) as HospitalityRequest[];
    },
  });
}
