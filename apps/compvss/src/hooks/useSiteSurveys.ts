'use client';

import { useQuery } from '@tanstack/react-query';

export interface SiteSurvey {
  id: string;
  survey_number: string;
  project_id: string;
  project_name: string;
  venue_id: string;
  venue_name: string;
  venue_address: string;
  survey_date: string;
  surveyor_id: string;
  surveyor_name: string;
  survey_type: string;
  status: string;
  findings_count: number;
  photos_count: number;
  documents_count: number;
  power_assessment?: string;
  rigging_assessment?: string;
  load_in_assessment?: string;
}

export interface SurveySummary {
  total_surveys: number;
  pending_surveys: number;
  completed_surveys: number;
  venues_surveyed: number;
  issues_identified: number;
  photos_captured: number;
}

const DEFAULT_SUMMARY: SurveySummary = {
  total_surveys: 0,
  pending_surveys: 0,
  completed_surveys: 0,
  venues_surveyed: 0,
  issues_identified: 0,
  photos_captured: 0,
};

export const siteSurveyKeys = {
  all: ['site-surveys'] as const,
  list: () => [...siteSurveyKeys.all, 'list'] as const,
};

export function useSiteSurveysList() {
  return useQuery({
    queryKey: siteSurveyKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/site-surveys');
      if (!response.ok) {
        throw new Error('Failed to fetch site surveys');
      }
      const data = await response.json();
      return {
        surveys: data.surveys || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteSurveysData() {
  const surveysQuery = useSiteSurveysList();

  const data = surveysQuery.data || { surveys: [], summary: DEFAULT_SUMMARY };

  return {
    surveys: data.surveys,
    summary: data.summary,
    isLoading: surveysQuery.isLoading,
    error: surveysQuery.error,
    refetch: surveysQuery.refetch,
  };
}
