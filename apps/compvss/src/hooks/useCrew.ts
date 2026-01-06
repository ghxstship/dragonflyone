'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@ghxstship/config';

export interface CrewMember {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  preferred_name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  avatar_url?: string;
  bio?: string;
  title?: string;
  platform_user_id?: string;
  status: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  notes?: string;
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
        .from('legend_people')
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
        .from('legend_people')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return (data as unknown) as CrewMember;
    },
    enabled: !!id,
  });
}

// Input type for creating crew members (maps to database columns)
interface CreateCrewMemberInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  title?: string;
  bio?: string;
  tags?: string[];
  organization_id: string;
}

// Create crew member
export function useCreateCrewMember() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  return useMutation({
    mutationFn: async (input: CreateCrewMemberInput) => {
      const organizationId = input.organization_id || user?.organization_id;
      
      if (!organizationId) {
        throw new Error('Organization ID is required to create a crew member. User must be a member of an organization.');
      }

      const { data, error } = await supabase
        .from('legend_people')
        .insert({
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email || null,
          phone: input.phone || null,
          mobile: input.mobile || null,
          title: input.title || null,
          bio: input.bio || null,
          tags: input.tags || [],
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newCrewMember) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['crew'] });

      // Snapshot previous value
      const previousCrew = queryClient.getQueryData<CrewMember[]>(['crew']);

      // Optimistically update to the new value
      const optimisticCrewMember: CrewMember = {
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        organization_id: newCrewMember.organization_id || user?.organization_id || '',
        first_name: newCrewMember.first_name,
        last_name: newCrewMember.last_name,
        display_name: `${newCrewMember.first_name} ${newCrewMember.last_name}`,
        email: newCrewMember.email,
        phone: newCrewMember.phone,
        mobile: newCrewMember.mobile,
        title: newCrewMember.title,
        bio: newCrewMember.bio,
        tags: newCrewMember.tags,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<CrewMember[]>(['crew'], (old) => old ? [...old, optimisticCrewMember] : [optimisticCrewMember]);

      // Return context with snapshot for rollback
      return { previousCrew };
    },
    onError: (err, newCrewMember, context) => {
      // Rollback on error
      if (context?.previousCrew) {
        queryClient.setQueryData(['crew'], context.previousCrew);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
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
        .from('legend_people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, ...updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['crew'] });
      await queryClient.cancelQueries({ queryKey: ['crew', id] });

      // Snapshot previous values
      const previousCrew = queryClient.getQueryData<CrewMember[]>(['crew']);
      const previousCrewMember = queryClient.getQueryData<CrewMember>(['crew', id]);

      // Optimistically update the crew list
      if (previousCrew) {
        queryClient.setQueryData<CrewMember[]>(['crew'], (old) =>
          old ? old.map(member => member.id === id ? { ...member, ...updates } : member) : old
        );
      }

      // Optimistically update the individual crew member
      if (previousCrewMember) {
        queryClient.setQueryData(['crew', id], { ...previousCrewMember, ...updates });
      }

      // Return context with snapshots for rollback
      return { previousCrew, previousCrewMember };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousCrew) {
        queryClient.setQueryData(['crew'], context.previousCrew);
      }
      if (context?.previousCrewMember) {
        queryClient.setQueryData(['crew', id], context.previousCrewMember);
      }
    },
    onSettled: ({ id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['crew'] });
      queryClient.invalidateQueries({ queryKey: ['crew', id] });
    },
  });
}

// Delete crew member
export function useDeleteCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error} = await supabase.from('legend_people').delete().eq('id', id);

      if (error) throw error;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['crew'] });
      await queryClient.cancelQueries({ queryKey: ['crew', id] });

      // Snapshot previous values
      const previousCrew = queryClient.getQueryData<CrewMember[]>(['crew']);
      const previousCrewMember = queryClient.getQueryData<CrewMember>(['crew', id]);

      // Optimistically remove from the crew list
      if (previousCrew) {
        queryClient.setQueryData<CrewMember[]>(['crew'], (old) =>
          old ? old.filter(member => member.id !== id) : old
        );
      }

      // Optimistically remove the individual crew member
      queryClient.removeQueries({ queryKey: ['crew', id] });

      // Return context with snapshots for rollback
      return { previousCrew, previousCrewMember, deletedId: id };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousCrew) {
        queryClient.setQueryData(['crew'], context.previousCrew);
      }
      if (context?.previousCrewMember && context?.deletedId) {
        queryClient.setQueryData(['crew', context.deletedId], context.previousCrewMember);
      }
    },
    onSettled: (id) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['crew'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['crew', id] });
      }
    },
  });
}
