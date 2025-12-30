'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// VENDOR COMPARE HOOKS
// Manage vendor comparison data (3NF: legend_organizations + orgs_profile_vendor)
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

// Fetch vendors for comparison (3NF: legend_organizations)
export function useVendorsForCompare() {
  return useQuery({
    queryKey: ['vendors-compare'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_organizations')
        .select('*, orgs_profile_vendor!org_id(performance_rating, total_orders)')
        .eq('org_type', 'vendor')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(v => {
        const profile = v.orgs_profile_vendor as { performance_rating?: number; total_orders?: number } | null;
        const meta = v.metadata as { city?: string } | null;
        return {
          id: v.id,
          name: v.name || '',
          category: v.industry || 'General',
          rating: profile?.performance_rating || 4.5,
          reviews: 0,
          location: meta?.city || '',
          distance: 'N/A',
          pricing: 'Mid-Range' as VendorCompare['pricing'],
          responseTime: 'N/A',
          completedProjects: profile?.total_orders || 0,
          certifications: [],
          specialties: [],
          availability: (v.status === 'active' ? 'Available' : 'Limited') as VendorCompare['availability'],
        };
      }) as VendorCompare[];
    },
  });
}
