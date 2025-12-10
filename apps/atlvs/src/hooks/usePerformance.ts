'use client';

import { useQuery } from '@tanstack/react-query';

export interface Review {
  id: string;
  employee_id: string;
  reviewer_id: string;
  employee?: { id: string; full_name: string; email: string };
  reviewer?: { id: string; full_name: string; email: string };
  review_period: string;
  review_type: string;
  status: string;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  scheduled_date: string;
  created_at: string;
  [key: string]: unknown;
}

const DEMO_REVIEWS: Review[] = [
  {
    id: '1',
    employee_id: 'emp1',
    reviewer_id: 'mgr1',
    employee: { id: 'emp1', full_name: 'John Smith', email: 'john@example.com' },
    reviewer: { id: 'mgr1', full_name: 'Sarah Johnson', email: 'sarah@example.com' },
    review_period: 'Q4 2024',
    review_type: 'annual',
    status: 'completed',
    overall_score: 4.2,
    strengths: ['Leadership', 'Technical Skills'],
    improvements: ['Time Management'],
    scheduled_date: '2024-12-15',
    created_at: '2024-12-01',
  },
  {
    id: '2',
    employee_id: 'emp2',
    reviewer_id: 'mgr1',
    employee: { id: 'emp2', full_name: 'Jane Doe', email: 'jane@example.com' },
    reviewer: { id: 'mgr1', full_name: 'Sarah Johnson', email: 'sarah@example.com' },
    review_period: 'Q4 2024',
    review_type: 'quarterly',
    status: 'in_progress',
    overall_score: 0,
    strengths: [],
    improvements: [],
    scheduled_date: '2025-01-10',
    created_at: '2024-12-20',
  },
];

export const performanceKeys = {
  all: ['performance'] as const,
  reviews: () => [...performanceKeys.all, 'reviews'] as const,
};

export function usePerformanceReviews() {
  return useQuery({
    queryKey: performanceKeys.reviews(),
    queryFn: async () => {
      const response = await fetch('/api/performance?include_goals=true');
      if (response.status === 401) {
        return DEMO_REVIEWS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      return data.reviews || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePerformanceData() {
  const reviewsQuery = usePerformanceReviews();

  const reviews = reviewsQuery.data || [];
  const completedCount = reviews.filter(r => r.status === 'completed').length;
  const reviewsWithScore = reviews.filter(r => r.overall_score > 0);
  const avgScore = reviewsWithScore.length > 0
    ? reviewsWithScore.reduce((sum, r) => sum + r.overall_score, 0) / reviewsWithScore.length
    : 0;

  return {
    reviews,
    completedCount,
    avgScore,
    inProgressCount: reviews.filter(r => r.status === 'in_progress').length,
    isLoading: reviewsQuery.isLoading,
    error: reviewsQuery.error,
    refetch: reviewsQuery.refetch,
  };
}
