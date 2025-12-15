'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VENDOR COMPARE HOOKS
// Manage vendor comparison data
// =============================================================================

export interface VendorCompare {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  pricing: 'Budget' | 'Mid-Range' | 'Premium';
  responseTime: string;
  completedProjects: number;
  certifications: string[];
  specialties: string[];
  availability: 'Available' | 'Limited' | 'Booked';
}

// Fetch vendors for comparison
export function useVendorsForCompare() {
  return useQuery({
    queryKey: ['vendors-compare'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(v => ({
        id: v.id,
        name: v.name || '',
        category: v.category || 'General',
        rating: 4.5,
        reviews: 0,
        location: v.city || '',
        distance: 'N/A',
        pricing: 'Mid-Range' as VendorCompare['pricing'],
        responseTime: 'N/A',
        completedProjects: 0,
        certifications: [],
        specialties: [],
        availability: (v.status || 'Available') as VendorCompare['availability'],
      })) as VendorCompare[];
    },
  });
}
