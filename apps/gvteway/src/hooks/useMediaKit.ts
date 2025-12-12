'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MediaKitAsset {
  id: string;
  name: string;
  type: 'logo' | 'photo' | 'video' | 'document' | 'press_release';
  url: string;
  thumbnail_url?: string;
  file_size?: number;
  dimensions?: { width: number; height: number };
  format: string;
  created_at: string;
}

export interface MediaKit {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  assets: MediaKitAsset[];
  is_public: boolean;
  download_count: number;
  created_at: string;
}

export function useMediaKit(eventId?: string) {
  return useQuery({
    queryKey: ['media-kit', eventId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (eventId) params.append('event_id', eventId);
      
      const response = await fetch(`/api/media-kit?${params}`);
      if (!response.ok) throw new Error('Failed to fetch media kit');
      return response.json();
    },
    enabled: !!eventId,
  });
}

export function useMediaKitAssets(mediaKitId?: string, type?: string) {
  return useQuery({
    queryKey: ['media-kit-assets', mediaKitId, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (mediaKitId) params.append('media_kit_id', mediaKitId);
      if (type) params.append('type', type);
      
      const response = await fetch(`/api/media-kit?${params}`);
      if (!response.ok) throw new Error('Failed to fetch media kit assets');
      return response.json();
    },
    enabled: !!mediaKitId,
  });
}

export function useCreateMediaKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      event_id: string;
      name: string;
      description?: string;
      is_public?: boolean;
    }) => {
      const response = await fetch('/api/media-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create media kit');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['media-kit', variables.event_id] });
    },
  });
}

export function useUploadMediaKitAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      media_kit_id: string;
      name: string;
      type: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append('media_kit_id', data.media_kit_id);
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('file', data.file);

      const response = await fetch('/api/media-kit', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload media kit asset');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['media-kit-assets', variables.media_kit_id] });
    },
  });
}

export function useDeleteMediaKitAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetId }: { assetId: string; mediaKitId: string }) => {
      const response = await fetch(`/api/media-kit?asset_id=${assetId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete media kit asset');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['media-kit-assets', variables.mediaKitId] });
    },
  });
}
