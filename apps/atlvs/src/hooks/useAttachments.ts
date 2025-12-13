'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: string;
  created_at: string;
}

interface AttachmentFilters {
  entity_type: string;
  entity_id: string;
  file_type?: string;
}

interface AttachmentsResponse {
  attachments: Attachment[];
  summary: {
    total: number;
    total_size: number;
    by_type: Record<string, number>;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export function useAttachments(filters: AttachmentFilters) {
  return useQuery({
    queryKey: ['attachments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('entity_type', filters.entity_type);
      params.append('entity_id', filters.entity_id);
      if (filters.file_type) params.append('file_type', filters.file_type);

      const response = await fetch(`/api/attachments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }
      return response.json() as Promise<AttachmentsResponse>;
    },
    enabled: !!filters.entity_type && !!filters.entity_id,
  });
}

export function useAttachment(id: string, entityType: string) {
  return useQuery({
    queryKey: ['attachments', id],
    queryFn: async () => {
      const response = await fetch(`/api/attachments/${id}?entity_type=${entityType}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attachment');
      }
      const data = await response.json();
      return data.attachment as Attachment;
    },
    enabled: !!id && !!entityType,
  });
}

interface CreateAttachmentInput {
  entity_type: string;
  entity_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  uploaded_by?: string;
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachment: CreateAttachmentInput) => {
      const response = await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attachment),
      });
      if (!response.ok) {
        throw new Error('Failed to create attachment');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, entityType }: { id: string; entityType: string }) => {
      const response = await fetch(`/api/attachments/${id}?entity_type=${entityType}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete attachment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video';
  if (fileType.startsWith('audio/')) return 'audio';
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'spreadsheet';
  if (fileType.includes('document') || fileType.includes('word')) return 'document';
  return 'file';
}
