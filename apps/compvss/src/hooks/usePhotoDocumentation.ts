'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// PHOTO DOCUMENTATION HOOKS
// Manage photo sets and documentation
// =============================================================================

export interface PhotoSet {
  id: string;
  phase: 'Load-In' | 'Build' | 'Tech Rehearsal' | 'Show' | 'Strike' | 'Load-Out';
  projectId: string;
  projectName: string;
  capturedAt: string;
  capturedBy: string;
  photoCount: number;
  description?: string;
  tags: string[];
  approved: boolean;
}

// Fetch photo sets
export function usePhotoSets(projectId?: string) {
  return useQuery({
    queryKey: ['photo-sets', projectId],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select('*')
        .order('captured_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        phase: s.phase,
        projectId: s.project_id,
        projectName: s.project_name,
        capturedAt: s.captured_at,
        capturedBy: s.captured_by,
        photoCount: s.photo_count || 0,
        description: s.description,
        tags: s.tags || [],
        approved: s.approved || false,
      })) as PhotoSet[];
    },
  });
}

// Create photo set
export function useCreatePhotoSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoSet: Omit<PhotoSet, 'id'>) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .insert({
          phase: photoSet.phase,
          project_id: photoSet.projectId,
          project_name: photoSet.projectName,
          captured_at: photoSet.capturedAt,
          captured_by: photoSet.capturedBy,
          photo_count: photoSet.photoCount,
          description: photoSet.description,
          tags: photoSet.tags,
          approved: photoSet.approved,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-sets'] });
    },
  });
}

// Approve photo set
export function useApprovePhotoSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .update({ approved: true })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-sets'] });
    },
  });
}
