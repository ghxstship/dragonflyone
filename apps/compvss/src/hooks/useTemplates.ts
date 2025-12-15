'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// TEMPLATES HOOKS
// Manage document templates
// =============================================================================

export interface Template {
  id: string;
  name: string;
  category: string;
  fileType: string;
  description: string;
  version: string;
  size: string;
  downloads: number;
  lastUpdated: string;
  updatedBy: string;
  tags: string[];
}

// Fetch templates
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(t => ({
        id: t.id,
        name: t.name || t.title || '',
        category: t.category || 'Form',
        fileType: t.file_type || 'PDF',
        description: t.description || '',
        version: t.version || '1.0',
        size: t.file_size || '0 KB',
        downloads: t.downloads || 0,
        lastUpdated: t.updated_at?.split('T')[0] || '',
        updatedBy: t.updated_by || 'System',
        tags: t.tags || [],
      })) as Template[];
    },
  });
}
