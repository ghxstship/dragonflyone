'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// KNOWLEDGE HOOKS
// Manage case studies, best practices, and knowledge base content
// =============================================================================

export interface CaseStudy {
  id: string;
  title: string;
  projectName: string;
  category: string;
  type: 'Success' | 'Post-Mortem' | 'Lessons Learned';
  summary: string;
  author: string;
  date: string;
  metrics?: { label: string; value: string }[];
  keyTakeaways: string[];
}

export interface BestPractice {
  id: string;
  title: string;
  summary: string;
  category: string;
  discipline: string;
  author: string;
  rating: number;
  views: number;
  tags: string[];
}

// Fetch case studies
export function useCaseStudies() {
  return useQuery({
    queryKey: ['case-studies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        title: s.title,
        projectName: s.project_name,
        category: s.category,
        type: s.study_type,
        summary: s.summary,
        author: s.author,
        date: s.created_at?.split('T')[0] || '',
        metrics: s.metrics || [],
        keyTakeaways: s.key_takeaways || [],
      })) as CaseStudy[];
    },
  });
}

// Fetch best practices
export function useBestPractices() {
  return useQuery({
    queryKey: ['best-practices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .order('views', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        category: p.category,
        discipline: p.discipline,
        author: p.author,
        rating: p.rating || 0,
        views: p.views || 0,
        tags: p.tags || [],
      })) as BestPractice[];
    },
  });
}
