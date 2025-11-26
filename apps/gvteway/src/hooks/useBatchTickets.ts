'use client';

import { useState } from 'react';

interface TicketBatch {
  ticketTypeId: string;
  quantity: number;
  price: number;
  seatNumber?: string;
}

interface BatchTicketData {
  eventId: string;
  tickets: TicketBatch[];
}

export function useBatchTickets() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTickets = async (data: BatchTicketData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/batch/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ticket generation failed');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateTickets, loading, error };
}
