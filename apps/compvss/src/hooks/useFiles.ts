'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// FILES HOOKS
// Manage project files with version control
// =============================================================================

export interface ProjectFile {
  id: string;
  name: string;
  type: 'PDF' | 'CAD' | 'Image' | 'Document' | 'Spreadsheet' | 'Other';
  project: string;
  project_id?: string;
  size: string;
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

export interface FileVersion {
  version: number;
  uploadedAt: string;
  uploadedBy: string;
  changes: string;
  url?: string;
}

// Fetch all project files
export function useProjectFiles(projectId?: string) {
  return useQuery({
    queryKey: ['project-files', projectId],
    queryFn: async () => {
      let query = supabase
        .from('production_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('production_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(d => ({
        id: d.id,
        name: d.name || d.title,
        type: d.document_type || 'Document',
        project: d.production_id || 'Unknown',
        project_id: d.production_id,
        size: d.file_size || '0 KB',
        version: d.version || 1,
        uploadedAt: d.created_at?.split('T')[0] || '',
        uploadedBy: d.created_by || 'Unknown',
        url: d.url,
        created_at: d.created_at,
        updated_at: d.updated_at,
      })) as ProjectFile[];
    },
  });
}

// Fetch file versions
export function useFileVersions(fileId: string) {
  return useQuery({
    queryKey: ['file-versions', fileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', fileId)
        .order('version', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(v => ({
        version: v.version,
        uploadedAt: v.created_at?.split('T')[0] || '',
        uploadedBy: v.created_by || 'Unknown',
        changes: v.changes || 'No description',
        url: v.url,
      })) as FileVersion[];
    },
    enabled: !!fileId,
  });
}

// Upload file
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: Omit<ProjectFile, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('production_documents')
        .insert({
          name: file.name,
          document_type: file.type,
          production_id: file.project_id,
          file_size: file.size,
          version: file.version,
          url: file.url,
          created_by: file.uploadedBy,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files'] });
    },
  });
}

// Delete file
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('production_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-files'] });
    },
  });
}
