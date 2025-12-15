'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// EMERGENCY HOOKS
// Manage emergency contacts, procedures, and assembly points
// =============================================================================

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  category: 'Production' | 'Medical' | 'Security' | 'Fire' | 'Police' | 'Venue';
  priority: number;
  available: boolean;
  production_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyProcedure {
  id: string;
  type: 'Medical' | 'Fire' | 'Evacuation' | 'Weather' | 'Security' | 'Other';
  title: string;
  steps: string[];
  contacts: string[];
  lastUpdated: string;
  production_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AssemblyPoint {
  id: string;
  name: string;
  description: string;
  type: 'primary' | 'secondary' | 'medical' | 'command';
  production_id?: string;
}

// Fetch emergency contacts
export function useEmergencyContacts(productionId?: string) {
  return useQuery({
    queryKey: ['emergency-contacts', productionId],
    queryFn: async () => {
      let query = supabase
        .from('emergency_contacts')
        .select('*')
        .order('priority', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EmergencyContact[];
    },
  });
}

// Fetch emergency procedures
export function useEmergencyProcedures(productionId?: string) {
  return useQuery({
    queryKey: ['emergency-procedures', productionId],
    queryFn: async () => {
      let query = supabase
        .from('emergency_procedures')
        .select('*')
        .order('type', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as EmergencyProcedure[];
    },
  });
}

// Create emergency contact
export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert(contact)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
    },
  });
}

// Update emergency contact
export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmergencyContact> & { id: string }) => {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
    },
  });
}

// Delete emergency contact
export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-contacts'] });
    },
  });
}

// Create emergency procedure
export function useCreateEmergencyProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (procedure: Omit<EmergencyProcedure, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('emergency_procedures')
        .insert(procedure)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-procedures'] });
    },
  });
}

// Update emergency procedure
export function useUpdateEmergencyProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmergencyProcedure> & { id: string }) => {
      const { data, error } = await supabase
        .from('emergency_procedures')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-procedures'] });
    },
  });
}

// Delete emergency procedure
export function useDeleteEmergencyProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('emergency_procedures').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergency-procedures'] });
    },
  });
}
