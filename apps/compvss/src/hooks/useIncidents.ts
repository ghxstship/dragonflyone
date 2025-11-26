'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Incident {
  id: string;
  type: 'minor-injury' | 'major-injury' | 'equipment-damage' | 'near-miss' | 'property-damage' | 'other';
  event_id?: string;
  event_name?: string;
  reporter: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'under-review' | 'investigating' | 'closed' | 'resolved';
  incident_date: string;
  created_at: string;
  updated_at: string;
}

interface IncidentFilters {
  status?: string;
  severity?: string;
  type?: string;
}

// Fetch all incidents
export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: async () => {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('incident_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as Incident[];
    },
  });
}

// Fetch single incident
export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as Incident;
    },
    enabled: !!id,
  });
}

// Create incident
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('incidents')
        .insert(incident)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

// Update incident
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Incident> & { id: string }) => {
      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

// Delete incident
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('incidents').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}
