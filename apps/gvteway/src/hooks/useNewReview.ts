'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ReviewEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  image?: string;
}

export const newReviewKeys = {
  all: ['new-review'] as const,
  event: (eventId: string) => [...newReviewKeys.all, 'event', eventId] as const,
};

export function useReviewEvent(eventId: string | null) {
  return useQuery({
    queryKey: newReviewKeys.event(eventId || ''),
    queryFn: async () => {
      if (!eventId) return null;
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.event as ReviewEvent;
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: { event_id: string; overall_rating: number; venue_rating?: number; value_rating?: number; atmosphere_rating?: number; title: string; content: string; would_recommend?: boolean; highlights?: string[] }) => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      if (!response.ok) throw new Error('Failed to submit review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newReviewKeys.all });
    },
  });
}

export function useNewReviewData(eventId: string | null) {
  const eventQuery = useReviewEvent(eventId);
  const submitMutation = useSubmitReview();

  return {
    event: eventQuery.data || null,
    isLoading: eventQuery.isLoading,
    error: eventQuery.error,
    submitReview: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  };
}
