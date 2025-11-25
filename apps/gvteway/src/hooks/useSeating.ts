'use client';

import { useState } from 'react';

interface Seat {
  id: string;
  section: string;
  row: string;
  number: string;
  status: 'available' | 'reserved' | 'sold';
  ticket_type_id: string;
  x_position?: number;
  y_position?: number;
}

interface Seating {
  id: string;
  layout_name: string;
  total_capacity: number;
  seats: Seat[];
}

export function useSeating(eventId: string) {
  const [seating, setSeating] = useState<Seating | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeating = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/seating`);
      const data = await response.json();
      
      if (response.ok) {
        setSeating(data.seating);
      } else {
        setError(data.error || 'Failed to fetch seating');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const createSeating = async (seatingData: {
    venue_id: string;
    layout_name: string;
    total_capacity: number;
    seats: Array<{
      section: string;
      row: string;
      number: string;
      ticket_type_id: string;
      x?: number;
      y?: number;
    }>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/seating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seatingData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSeating(data.seating);
        return data.seating;
      } else {
        setError(data.error || 'Failed to create seating');
        return null;
      }
    } catch (err) {
      setError('Network error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSeating = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/seating`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSeating(null);
        return true;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete seating');
        return false;
      }
    } catch (err) {
      setError('Network error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    seating,
    loading,
    error,
    fetchSeating,
    createSeating,
    deleteSeating,
  };
}
