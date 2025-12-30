'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MULTILINGUAL HOOKS
// Content translations for international crews
// =============================================================================

export interface TranslatedContent {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  translations: {
    language: string;
    status: 'Complete' | 'In Progress' | 'Pending';
    progress: number;
  }[];
}

export interface LanguageSetting {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  contentCount: number;
  translators: number;
}

// Fetch translated content
export function useTranslatedContent() {
  return useQuery({
    queryKey: ['translated-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        title: c.title || '',
        category: c.category || '',
        lastUpdated: c.updated_at || '',
        translations: c.translations || [],
      })) as TranslatedContent[];
    },
  });
}

// Fetch language settings
export function useLanguageSettings() {
  return useQuery({
    queryKey: ['language-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(l => ({
        code: l.code || '',
        name: l.name || '',
        nativeName: l.native_name || l.name || '',
        enabled: l.enabled !== false,
        contentCount: l.content_count || 0,
        translators: l.translators_count || 0,
      })) as LanguageSetting[];
    },
  });
}
