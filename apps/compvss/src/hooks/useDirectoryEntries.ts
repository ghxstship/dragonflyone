'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// DIRECTORY ENTRIES HOOKS
// Manage directory search and filters
// =============================================================================

export interface DirectoryEntry {
  id: string;
  name: string;
  type: 'Crew' | 'Vendor' | 'Venue';
  location: string;
  specialties: string[];
  languages: string[];
  available: boolean;
  rating: number;
}

// Fetch directory entries
export function useDirectoryEntries() {
  return useQuery({
    queryKey: ['directory-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('directory_entries')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(e => ({
        id: e.id,
        name: e.name || '',
        type: (e.entry_type || e.type || 'Crew') as DirectoryEntry['type'],
        location: e.location || e.city || '',
        specialties: e.specialties || e.tags || [],
        languages: e.languages || ['English'],
        available: e.available !== false,
        rating: e.rating || 4.5,
      })) as DirectoryEntry[];
    },
  });
}
