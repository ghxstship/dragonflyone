'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export interface CreateEventData {
  title: string;
  description: string;
  venue: string;
  eventType: string;
  date: string;
  time: string;
  capacity: string;
  ticketPrice: string;
  vipPrice: string;
}

export function useCreateEvent() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: CreateEventData) => {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      return response.json();
    },
    onSuccess: (event) => {
      router.push(`/events/${event.id}`);
    },
  });
}

export function useEventCreateData() {
  const createMutation = useCreateEvent();

  return {
    createEvent: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  };
}
