'use client';

import { useMutation } from '@tanstack/react-query';

export interface QuizAnswers {
  [questionId: string]: string | string[];
}

export interface QuizResult {
  categories: string[];
  genres: string[];
  price_range: string;
  vibe: string;
  recommended_events: {
    id: string;
    title: string;
    date: string;
    venue: string;
    image?: string;
    match_score: number;
  }[];
}

export const discoverQuizKeys = {
  all: ['discover-quiz'] as const,
};

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: async (answers: QuizAnswers) => {
      const response = await fetch('/api/discover/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!response.ok) throw new Error('Failed to submit quiz');
      const data = await response.json();
      return data.result as QuizResult;
    },
  });
}

export function useDiscoverQuizData() {
  const submitMutation = useSubmitQuiz();

  return {
    submitQuiz: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
    result: submitMutation.data,
    error: submitMutation.error,
  };
}
