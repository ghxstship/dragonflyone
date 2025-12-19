'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@ghxstship/config';

// Use database types directly
export type SafetyIncident = Tables<'safety_incidents'>;
export type SafetyIncidentInsert = TablesInsert<'safety_incidents'>;
export type SafetyIncidentUpdate = TablesUpdate<'safety_incidents'>;

// Use crew_certifications table for safety certifications
export type CrewCertification = Tables<'crew_certifications'>;
export type CrewCertificationUpdate = TablesUpdate<'crew_certifications'>;

type IncidentStatus = SafetyIncident['status'];
type IncidentSeverity = SafetyIncident['severity'];
type CertificationStatus = CrewCertification['status'];

export const useSafetyIncidents = (filters?: { status?: IncidentStatus; severity?: IncidentSeverity }) => {
  return useQuery({
    queryKey: ['safety-incidents', filters],
    queryFn: async () => {
      let query = supabase
        .from('safety_incidents')
        .select('*')
        .order('incident_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCrewCertifications = (filters?: { status?: CertificationStatus }) => {
  return useQuery({
    queryKey: ['crew-certifications', filters],
    queryFn: async () => {
      let query = supabase
        .from('crew_certifications')
        .select('*')
        .order('expiration_date');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useReportSafetyIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: SafetyIncidentInsert) => {
      const { data, error } = await supabase
        .from('safety_incidents')
        .insert(incident)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents'] });
    },
  });
};

export const useUpdateSafetyIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: SafetyIncidentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('safety_incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents'] });
    },
  });
};

export const useDeleteSafetyIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('safety_incidents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-incidents'] });
    },
  });
};

export const useUpdateCrewCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CrewCertificationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-certifications'] });
    },
  });
};

export const useDeleteCrewCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crew_certifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-certifications'] });
    },
  });
};

// =============================================================================
// SAFETY PAGE HOOKS (API-based with demo fallback)
// =============================================================================

export interface SafetyIncidentSimple {
  id: string;
  type: string;
  description: string;
  location: string;
  reported_by: string;
  date: string;
  status: string;
  severity: string;
  created_at: string;
}

export function useSafetyPageData() {
  const incidentsQuery = useQuery({
    queryKey: ['safety-page-incidents'],
    queryFn: async () => {
      const response = await fetch('/api/safety/incidents');
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      const data = await response.json();
      return data.incidents || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const incidents = incidentsQuery.data || [];
  const openCount = incidents.filter((i: SafetyIncidentSimple) => i.status !== 'resolved' && i.status !== 'closed').length;
  const resolvedCount = incidents.filter((i: SafetyIncidentSimple) => i.status === 'resolved' || i.status === 'closed').length;

  return {
    incidents,
    openCount,
    resolvedCount,
    isLoading: incidentsQuery.isLoading,
    error: incidentsQuery.error,
    refetch: incidentsQuery.refetch,
  };
}

