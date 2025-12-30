'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// TROUBLESHOOTING HOOKS
// Manage troubleshooting guides
// =============================================================================

export interface TroubleshootingGuide {
  id: string;
  title: string;
  category: string;
  symptom: string;
  steps: string[];
  resolution: string;
  views: number;
  helpful: number;
}

// Fetch troubleshooting guides
export function useTroubleshootingGuides() {
  return useQuery({
    queryKey: ['troubleshooting-guides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .order('views', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(g => ({
        id: g.id,
        title: g.title || g.name || '',
        category: g.category || 'General',
        symptom: g.symptom || g.description || '',
        steps: g.steps || [],
        resolution: g.resolution || g.solution || '',
        views: g.views || 0,
        helpful: g.helpful_percentage || g.helpful || 0,
      })) as TroubleshootingGuide[];
    },
  });
}
