'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SurveyQuestion {
  id: string;
  type: 'rating' | 'text' | 'multiple_choice' | 'checkbox' | 'scale';
  question: string;
  required: boolean;
  options?: string[];
  min_label?: string;
  max_label?: string;
}

export interface Survey {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_image?: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  expires_at?: string;
}

export type SurveyAnswer = string | number | string[];

const DEMO_SURVEY: Survey = {
  id: 'demo-1',
  event_id: 'e1',
  event_title: 'Summer Festival 2024',
  event_date: new Date().toISOString(),
  title: 'Event Feedback Survey',
  description: 'Help us improve future events!',
  questions: [
    { id: 'q1', type: 'rating', question: 'How would you rate the overall experience?', required: true },
    { id: 'q2', type: 'text', question: 'What did you enjoy most?', required: false },
    { id: 'q3', type: 'multiple_choice', question: 'Would you attend again?', required: true, options: ['Definitely', 'Probably', 'Maybe', 'No'] },
  ],
};

export const surveyDetailKeys = {
  all: ['survey-detail'] as const,
  detail: (surveyId: string) => [...surveyDetailKeys.all, surveyId] as const,
};

export function useSurveyDetail(surveyId: string) {
  return useQuery({
    queryKey: surveyDetailKeys.detail(surveyId),
    queryFn: async () => {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (!response.ok) return DEMO_SURVEY;
      const data = await response.json();
      return data.survey || DEMO_SURVEY;
    },
    enabled: !!surveyId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ surveyId, answers }: { surveyId: string; answers: Record<string, SurveyAnswer> }) => {
      const response = await fetch(`/api/surveys/${surveyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('Failed to submit survey');
      return response.json();
    },
    onSuccess: (_, { surveyId }) => {
      queryClient.invalidateQueries({ queryKey: surveyDetailKeys.detail(surveyId) });
    },
  });
}

export function useSurveyDetailData(surveyId: string) {
  const surveyQuery = useSurveyDetail(surveyId);
  const submitMutation = useSubmitSurvey();

  return {
    survey: surveyQuery.data || null,
    isLoading: surveyQuery.isLoading,
    error: surveyQuery.error,
    submitSurvey: (answers: Record<string, SurveyAnswer>) => submitMutation.mutateAsync({ surveyId, answers }),
    isSubmitting: submitMutation.isPending,
  };
}
