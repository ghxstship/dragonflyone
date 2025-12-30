'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// AVAILABILITY HOOKS
// Manage crew availability calendar slots
// =============================================================================

export interface AvailabilitySlot {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  department: string;
  date: string;
  status: 'available' | 'unavailable' | 'tentative' | 'booked';
  start_time?: string;
  end_time?: string;
  notes?: string;
  calendar_source: 'manual' | 'google';
}

interface AvailabilityFilters {
  status?: string;
  department?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// Fetch all availability slots with optional filters
export function useAvailability(filters?: AvailabilityFilters) {
  return useQuery({
    queryKey: ['availability', filters],
    queryFn: async () => {
      let query = supabase
        .from('workforce_time_entries')
        .select(`
          id,
          crew_member_id,
          availability_type,
          start_date,
          end_date,
          start_time,
          end_time,
          notes,
          crew_member:crew_members(id, first_name, last_name, role, department)
        `)
        .order('start_date', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('availability_type', filters.status);
      }
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('crew_member.department', filters.department);
      }
      if (filters?.userId) {
        query = query.eq('crew_member_id', filters.userId);
      }
      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('start_date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((slot: Record<string, unknown>) => {
        const crew = slot.crew_member as Record<string, unknown> | null;
        return {
          id: slot.id as string,
          user_id: slot.crew_member_id as string,
          user_name: crew ? `${crew.first_name} ${crew.last_name}` : 'Unknown',
          role: (crew?.role as string) || '',
          department: (crew?.department as string) || '',
          date: slot.start_date as string,
          status: mapAvailabilityType(slot.availability_type as string),
          start_time: slot.start_time as string | undefined,
          end_time: slot.end_time as string | undefined,
          notes: slot.notes as string | undefined,
          calendar_source: 'manual' as const,
        } as AvailabilitySlot;
      });
    },
  });
}

// Map database availability_type to UI status
function mapAvailabilityType(type: string): AvailabilitySlot['status'] {
  switch (type) {
    case 'available': return 'available';
    case 'unavailable':
    case 'vacation':
    case 'sick':
    case 'personal':
    case 'other_job': return 'unavailable';
    case 'tentative':
    case 'training': return 'tentative';
    default: return 'available';
  }
}

// Create a new availability slot
export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: {
      crew_member_id: string;
      availability_type: string;
      start_date: string;
      end_date?: string;
      start_time?: string;
      end_time?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('workforce_time_entries')
        .insert(slot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Update an availability slot
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<{
      availability_type: string;
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
      notes: string;
    }>) => {
      const { data, error } = await supabase
        .from('workforce_time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Delete an availability slot
export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workforce_time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Bulk update availability status
export function useBulkUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      const { error } = await supabase
        .from('workforce_time_entries')
        .update({ availability_type: status })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
