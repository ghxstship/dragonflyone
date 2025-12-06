'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SHOWS HOOKS
// Manage shows/performances for productions
// Event-level roles: Stage Manager, Production Manager, Technical Director
// =============================================================================

export interface Show {
  id: string;
  production_id: string;
  venue_id?: string;
  title: string;
  show_date: string;
  doors_time?: string;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  show_type: 'performance' | 'preview' | 'dress_rehearsal' | 'tech_rehearsal' | 'load_in' | 'load_out' | 'special_event';
  capacity?: number;
  tickets_sold?: number;
  attendance?: number;
  revenue?: number;
  notes?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  production?: { id: string; title: string };
  venue?: { id: string; name: string };
}

export interface Cue {
  id: string;
  show_id: string;
  production_id: string;
  cue_number: string;
  cue_type: 'go' | 'standby' | 'warning' | 'note';
  scheduled_time?: string;
  actual_time?: string;
  duration_seconds?: number;
  activity: string;
  department_cues?: Record<string, string>;
  talent_notes?: string;
  props?: string[];
  technical_notes?: string;
  operations_notes?: string;
  is_milestone: boolean;
  status: 'pending' | 'standby' | 'executed' | 'skipped';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ShowFilters {
  productionId?: string;
  status?: string;
  showType?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Fetch all shows
export function useShows(filters?: ShowFilters) {
  return useQuery({
    queryKey: ['shows', filters],
    queryFn: async () => {
      let query = supabase
        .from('shows')
        .select(`
          *,
          production:productions(id, title),
          venue:venues(id, name)
        `)
        .order('show_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.showType) {
        query = query.eq('show_type', filters.showType);
      }
      if (filters?.dateFrom) {
        query = query.gte('show_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('show_date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as Show[];
    },
  });
}

// Fetch single show with cues
export function useShow(id: string) {
  return useQuery({
    queryKey: ['shows', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shows')
        .select(`
          *,
          production:productions(id, title),
          venue:venues(id, name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as Show;
    },
    enabled: !!id,
  });
}

// Fetch cues for a show
export function useCues(showId: string) {
  return useQuery({
    queryKey: ['cues', showId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cues')
        .select('*')
        .eq('show_id', showId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as unknown as Cue[];
    },
    enabled: !!showId,
  });
}

// Create show
export function useCreateShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (show: Omit<Show, 'id' | 'created_at' | 'updated_at' | 'production' | 'venue'>) => {
      const { data, error } = await supabase
        .from('shows')
        .insert(show)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
    },
  });
}

// Update show
export function useUpdateShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Show> & { id: string }) => {
      const { data, error } = await supabase
        .from('shows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
      queryClient.invalidateQueries({ queryKey: ['shows', variables.id] });
    },
  });
}

// Delete show
export function useDeleteShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] });
    },
  });
}

// Create cue
export function useCreateCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cue: Omit<Cue, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('cues')
        .insert(cue)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cues', variables.show_id] });
    },
  });
}

// Update cue
export function useUpdateCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cue> & { id: string }) => {
      const { data, error } = await supabase
        .from('cues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cues', data.show_id] });
    },
  });
}

// Delete cue
export function useDeleteCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, showId }: { id: string; showId: string }) => {
      const { error } = await supabase.from('cues').delete().eq('id', id);
      if (error) throw error;
      return { showId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cues', data.showId] });
    },
  });
}

// Execute cue (update status to executed with actual time)
export function useExecuteCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, showId }: { id: string; showId: string }) => {
      const { data, error } = await supabase
        .from('cues')
        .update({
          status: 'executed',
          actual_time: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, showId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cues', data.showId] });
    },
  });
}

// Bulk update cue order
export function useReorderCues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ showId, cueOrders }: { showId: string; cueOrders: { id: string; sort_order: number }[] }) => {
      const updates = cueOrders.map(({ id, sort_order }) =>
        supabase.from('cues').update({ sort_order }).eq('id', id)
      );
      
      await Promise.all(updates);
      return { showId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cues', data.showId] });
    },
  });
}

// Get upcoming shows
export function useUpcomingShows(limit = 10) {
  return useQuery({
    queryKey: ['shows', 'upcoming', limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('shows')
        .select(`
          *,
          production:productions(id, title),
          venue:venues(id, name)
        `)
        .gte('show_date', today)
        .in('status', ['scheduled', 'confirmed'])
        .order('show_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as unknown as Show[];
    },
  });
}

// Get show statistics
export function useShowStats(productionId?: string) {
  return useQuery({
    queryKey: ['shows', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('shows').select('status, tickets_sold, attendance, revenue, capacity');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const shows = data || [];
      return {
        total: shows.length,
        scheduled: shows.filter(s => s.status === 'scheduled').length,
        confirmed: shows.filter(s => s.status === 'confirmed').length,
        completed: shows.filter(s => s.status === 'completed').length,
        cancelled: shows.filter(s => s.status === 'cancelled').length,
        totalTicketsSold: shows.reduce((sum, s) => sum + (s.tickets_sold || 0), 0),
        totalAttendance: shows.reduce((sum, s) => sum + (s.attendance || 0), 0),
        totalRevenue: shows.reduce((sum, s) => sum + (s.revenue || 0), 0),
        totalCapacity: shows.reduce((sum, s) => sum + (s.capacity || 0), 0),
        avgAttendanceRate: shows.length > 0 
          ? (shows.reduce((sum, s) => sum + ((s.attendance || 0) / (s.capacity || 1)), 0) / shows.length * 100).toFixed(1)
          : 0,
      };
    },
  });
}
