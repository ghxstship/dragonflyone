'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// GLOSSARY HOOKS
// Manage glossary terms
// =============================================================================

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  aliases?: string[];
  relatedTerms?: string[];
}

// Fetch glossary terms
export function useGlossaryTerms() {
  return useQuery({
    queryKey: ['glossary-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('glossary_terms')
        .select('*')
        .order('term', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(t => ({
        id: t.id,
        term: t.term,
        definition: t.definition,
        category: t.category,
        aliases: t.aliases || [],
        relatedTerms: t.related_terms || [],
      })) as GlossaryTerm[];
    },
  });
}
