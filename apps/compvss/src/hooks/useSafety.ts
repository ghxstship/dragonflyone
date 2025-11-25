import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SafetyIncident {
  id: string;
  type: 'near_miss' | 'injury' | 'equipment_failure' | 'safety_violation';
  description: string;
  location: string;
  reported_by: string;
  date: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  actions_taken?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface SafetyCertification {
  id: string;
  crew_id: string;
  certification_type: string;
  issued_date: string;
  expiry_date: string;
  status: 'current' | 'expiring' | 'expired';
  created_at?: string;
}

export const useSafetyIncidents = (filters?: { status?: string; severity?: string }) => {
  return useQuery({
    queryKey: ['safety-incidents', filters],
    queryFn: async () => {
      let query = supabase
        .from('safety_incidents')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SafetyIncident[];
    },
  });
};

export const useSafetyCertifications = () => {
  return useQuery({
    queryKey: ['safety-certifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('safety_certifications')
        .select('*')
        .order('expiry_date');
      if (error) throw error;
      return data as SafetyCertification[];
    },
  });
};

export const useReportSafetyIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: Omit<SafetyIncident, 'id' | 'created_at' | 'updated_at'>) => {
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
    mutationFn: async ({ id, ...updates }: Partial<SafetyIncident> & { id: string }) => {
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

export const useUpdateSafetyCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SafetyCertification> & { id: string }) => {
      const { data, error } = await supabase
        .from('safety_certifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-certifications'] });
    },
  });
};

export const useDeleteSafetyCertification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('safety_certifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safety-certifications'] });
    },
  });
};
