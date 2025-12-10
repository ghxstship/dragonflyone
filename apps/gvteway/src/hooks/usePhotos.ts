'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Photo {
  id: string;
  url: string;
  thumbnail_url: string;
  event_id: string;
  event_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
  caption?: string;
  tags: string[];
  likes: number;
  is_featured: boolean;
  created_at: string;
}

export interface PhotoGallery {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  cover_photo?: string;
  photo_count: number;
  status: 'collecting' | 'published' | 'archived';
}

const DEMO_GALLERIES: PhotoGallery[] = [
  { id: 'g1', event_id: 'e1', event_name: 'Summer Festival 2024', event_date: '2025-07-15', photo_count: 245, status: 'published' },
  { id: 'g2', event_id: 'e2', event_name: 'Jazz Night', event_date: '2025-03-20', photo_count: 89, status: 'collecting' },
];

const DEMO_PHOTOS: Photo[] = [
  { id: 'p1', url: '/photos/demo1.jpg', thumbnail_url: '/photos/demo1-thumb.jpg', event_id: 'e1', event_name: 'Summer Festival 2024', uploaded_by: 'u1', uploaded_by_name: 'Alex J.', tags: ['crowd', 'main-stage'], likes: 45, is_featured: true, created_at: new Date().toISOString() },
  { id: 'p2', url: '/photos/demo2.jpg', thumbnail_url: '/photos/demo2-thumb.jpg', event_id: 'e1', event_name: 'Summer Festival 2024', uploaded_by: 'u2', uploaded_by_name: 'Sarah M.', tags: ['sunset', 'festival'], likes: 32, is_featured: false, created_at: new Date(Date.now() - 3600000).toISOString() },
];

export const photosKeys = {
  all: ['photos'] as const,
  galleries: () => [...photosKeys.all, 'galleries'] as const,
  feed: () => [...photosKeys.all, 'feed'] as const,
};

export function usePhotoGalleries() {
  return useQuery({
    queryKey: photosKeys.galleries(),
    queryFn: async () => {
      const response = await fetch('/api/photos/galleries');
      if (response.status === 401) {
        return DEMO_GALLERIES;
      }
      if (!response.ok) {
        return DEMO_GALLERIES;
      }
      const data = await response.json();
      return data.galleries || DEMO_GALLERIES;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePhotoFeed() {
  return useQuery({
    queryKey: photosKeys.feed(),
    queryFn: async () => {
      const response = await fetch('/api/photos/feed');
      if (response.status === 401) {
        return DEMO_PHOTOS;
      }
      if (!response.ok) {
        return DEMO_PHOTOS;
      }
      const data = await response.json();
      return data.photos || DEMO_PHOTOS;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photosKeys.all });
    },
  });
}

export function useLikePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const response = await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like photo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photosKeys.all });
    },
  });
}

export function usePhotosData() {
  const galleriesQuery = usePhotoGalleries();
  const feedQuery = usePhotoFeed();
  const uploadMutation = useUploadPhoto();
  const likeMutation = useLikePhoto();

  return {
    galleries: galleriesQuery.data || [],
    photos: feedQuery.data || [],
    isLoading: galleriesQuery.isLoading || feedQuery.isLoading,
    error: galleriesQuery.error || feedQuery.error,
    refetch: () => {
      galleriesQuery.refetch();
      feedQuery.refetch();
    },
    uploadPhoto: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    likePhoto: likeMutation.mutateAsync,
  };
}
