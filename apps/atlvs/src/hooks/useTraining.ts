'use client';

import { useQuery } from '@tanstack/react-query';

export interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  instructor_name: string;
  instructor?: { id: string; full_name: string; email: string };
  capacity: number;
  enrolled_count: number;
  start_date: string;
  end_date: string;
  status: string;
  is_virtual: boolean;
  created_at: string;
  [key: string]: unknown;
}

const DEMO_PROGRAMS: TrainingProgram[] = [
  { id: '1', title: 'Safety Fundamentals', description: 'Core safety training', category: 'safety', duration_hours: 8, instructor_name: 'John Smith', capacity: 30, enrolled_count: 25, start_date: '2025-02-01', end_date: '2025-02-01', status: 'active', is_virtual: false, created_at: '2025-01-10' },
  { id: '2', title: 'Leadership Workshop', description: 'Management skills', category: 'management', duration_hours: 16, instructor_name: 'Sarah Johnson', capacity: 20, enrolled_count: 18, start_date: '2025-02-15', end_date: '2025-02-16', status: 'active', is_virtual: true, created_at: '2025-01-12' },
];

export const trainingKeys = {
  all: ['training'] as const,
  list: () => [...trainingKeys.all, 'list'] as const,
};

export function useTrainingPrograms() {
  return useQuery({
    queryKey: trainingKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/training');
      if (response.status === 401) {
        return DEMO_PROGRAMS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch training programs');
      }
      const data = await response.json();
      return data.programs || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrainingData() {
  const programsQuery = useTrainingPrograms();

  const programs = programsQuery.data || [];
  const activeCount = programs.filter((p: TrainingProgram) => p.status === 'active').length;
  const totalEnrolled = programs.reduce((sum: number, p: TrainingProgram) => sum + (p.enrolled_count || 0), 0);
  const totalCapacity = programs.reduce((sum: number, p: TrainingProgram) => sum + (p.capacity || 0), 0);

  return {
    programs,
    activeCount,
    totalEnrolled,
    totalCapacity,
    isLoading: programsQuery.isLoading,
    error: programsQuery.error,
    refetch: programsQuery.refetch,
  };
}
