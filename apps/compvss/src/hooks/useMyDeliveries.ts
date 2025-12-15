'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY DELIVERIES HOOKS
// Manage vendor deliveries
// =============================================================================

export interface Delivery {
  id: string;
  production: string;
  venue: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'confirmed';
  items: string[];
  contactName: string;
  contactPhone: string;
}

// Fetch my deliveries
export function useMyDeliveries() {
  return useQuery({
    queryKey: ['my-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        production: `Delivery ${d.id?.substring(0, 8)}`,
        venue: typeof d.destination_address === 'string' ? d.destination_address : '',
        date: d.scheduled_date || '',
        time: '09:00',
        status: (d.status || 'scheduled') as Delivery['status'],
        items: [],
        contactName: '',
        contactPhone: '',
      })) as Delivery[];
    },
  });
}
