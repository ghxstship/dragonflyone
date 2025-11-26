'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CrewMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  rate: number;
  availability: 'available' | 'busy' | 'on-leave';
  skills?: string[];
  certifications?: string[];
  rating?: number;
  projects_completed?: number;
  created_at: string;
  updated_at: string;
}

interface CrewFilters {
  role?: string;
  department?: string;
  availability?: string;
}

// Fetch all crew members
export function useCrew(filters?: CrewFilters) {
  return useQuery({
    queryKey: ['crew', filters],
    queryFn: async () => {
      let query = supabase
        .from('crew_members')
        .select('*')
        .order('full_name', { ascending: true });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.availability) {
        query = query.eq('availability', filters.availability);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown) as CrewMember[];
    },
  });
}

// Fetch single crew member
export function useCrewMember(id: string) {
  return useQuery({
    queryKey: ['crew', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as CrewMember;
    },
    enabled: !!id,
  });
}

// Create crew member
export function useCreateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (crewMember: Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('crew_members')
        .insert(crewMember)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
    },
  });
}

// Update crew member
export function useUpdateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrewMember> & { id: string }) => {
      const { data, error } = await supabase
        .from('crew_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
    },
  });
}

// Delete crew member
export function useDeleteCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error} = await supabase.from('crew_members').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
    },
  });
}
