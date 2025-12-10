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

const DEMO_SURVEYS: SiteSurvey[] = [
  { id: 'demo-1', survey_number: 'SS-2024-001', project_id: 'proj-001', project_name: 'Summer Festival 2024', venue_id: 'venue-001', venue_name: 'Central Park Amphitheater', venue_address: '123 Park Ave, New York, NY', survey_date: new Date().toISOString(), surveyor_id: 'user-001', surveyor_name: 'John Smith', survey_type: 'initial', status: 'completed', findings_count: 5, photos_count: 24, documents_count: 3, power_assessment: 'Good', rigging_assessment: 'Adequate', load_in_assessment: 'Good' },
  { id: 'demo-2', survey_number: 'SS-2024-002', project_id: 'proj-002', project_name: 'Corporate Gala', venue_id: 'venue-002', venue_name: 'Grand Ballroom', venue_address: '456 Main St, Los Angeles, CA', survey_date: new Date(Date.now() + 604800000).toISOString(), surveyor_id: 'user-002', surveyor_name: 'Jane Doe', survey_type: 'technical', status: 'scheduled', findings_count: 0, photos_count: 0, documents_count: 1 },
];

const DEMO_SUMMARY: SurveySummary = {
  total_surveys: 12,
  pending_surveys: 3,
  completed_surveys: 9,
  venues_surveyed: 8,
  issues_identified: 15,
  photos_captured: 156,
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
      if (response.status === 401) {
        return { surveys: DEMO_SURVEYS, summary: DEMO_SUMMARY };
      }
      if (!response.ok) {
        throw new Error('Failed to fetch site surveys');
      }
      const data = await response.json();
      return {
        surveys: data.surveys || [],
        summary: data.summary || DEMO_SUMMARY,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSiteSurveysData() {
  const surveysQuery = useSiteSurveysList();

  const data = surveysQuery.data || { surveys: [], summary: DEMO_SUMMARY };

  return {
    surveys: data.surveys,
    summary: data.summary,
    isLoading: surveysQuery.isLoading,
    error: surveysQuery.error,
    refetch: surveysQuery.refetch,
  };
}
