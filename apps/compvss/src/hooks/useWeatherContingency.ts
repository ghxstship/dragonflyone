'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// WEATHER CONTINGENCY HOOKS
// Manage weather contingency plans
// =============================================================================

export interface ContingencyAction {
  id: string;
  trigger: string;
  threshold: string;
  action: string;
  responsible: string;
  status: 'Ready' | 'Activated' | 'Completed';
}

export interface WeatherPlan {
  id: string;
  projectName: string;
  projectId: string;
  eventDate: string;
  venue: string;
  venueType: 'Outdoor' | 'Indoor' | 'Hybrid';
  status: 'Active' | 'Triggered' | 'Cleared';
  currentConditions: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  contingencyPlans: ContingencyAction[];
}

// Fetch weather plans
export function useWeatherPlans() {
  return useQuery({
    queryKey: ['weather-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        projectName: `Weather Plan ${p.id?.substring(0, 8)}`,
        projectId: p.event_id || '',
        eventDate: p.backup_date || p.created_at?.split('T')[0] || '',
        venue: p.backup_venue_id || '',
        venueType: 'Outdoor' as WeatherPlan['venueType'],
        status: 'Active' as WeatherPlan['status'],
        currentConditions: p.communication_plan || 'No data',
        riskLevel: 'Moderate' as WeatherPlan['riskLevel'],
        contingencyPlans: [],
      })) as WeatherPlan[];
    },
  });
}
