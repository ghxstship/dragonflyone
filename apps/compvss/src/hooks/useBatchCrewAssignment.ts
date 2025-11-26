'use client';

import { useState } from 'react';

interface CrewAssignment {
  userId: string;
  role: string;
  callTime?: string;
  rate?: number;
}

interface BatchCrewAssignmentData {
  projectId: string;
  crewMembers: CrewAssignment[];
}

export function useBatchCrewAssignment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCrew = async (data: BatchCrewAssignmentData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Crew assignment failed');
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

  return { assignCrew, loading, error };
}
