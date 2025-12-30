'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// DRAWINGS HOOKS
// Manage technical drawings and CAD files
// =============================================================================

export interface Drawing {
  id: string;
  name: string;
  category: 'Stage' | 'Lighting' | 'Audio' | 'Video' | 'Rigging' | 'Site';
  type: 'Vectorworks' | 'AutoCAD' | 'SketchUp' | 'CAD' | 'PDF';
  project: string;
  project_id?: string;
  version: number;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  markups: number;
  url?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all drawings
export function useDrawings(projectId?: string) {
  return useQuery({
    queryKey: ['drawings', projectId],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select('*')
        .in('document_type', ['CAD', 'Drawing', 'PDF', 'Vectorworks', 'AutoCAD', 'SketchUp'])
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('production_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        name: d.name || d.title,
        category: d.category || 'Stage',
        type: d.document_type || 'PDF',
        project: d.production_id || 'Unknown',
        project_id: d.production_id,
        version: d.version || 1,
        size: d.file_size || '0 KB',
        uploadedBy: d.created_by || 'Unknown',
        uploadedAt: d.created_at?.split('T')[0] || '',
        markups: d.markups_count || 0,
        url: d.url,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })) as Drawing[];
    },
  });
}

// Upload drawing
export function useUploadDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (drawing: Omit<Drawing, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .insert({
          name: drawing.name,
          document_type: drawing.type,
          category: drawing.category,
          production_id: drawing.project_id,
          version: drawing.version,
          file_size: drawing.size,
          url: drawing.url,
          created_by: drawing.uploadedBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
    },
  });
}

// Delete drawing
export function useDeleteDrawing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('legend_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings'] });
    },
  });
}
