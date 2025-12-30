'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// STAGES HOOKS
// Manage stages and technical rehearsals
// =============================================================================

export interface Stage {
  id: string;
  name: string;
  type: 'Outdoor' | 'Indoor' | 'Tent' | 'Arena';
  dimensions: string;
  capacity: number;
  status: 'Active' | 'Setup' | 'Teardown' | 'Inactive';
  production_id?: string;
}

export interface TechRehearsalSession {
  id: string;
  name: string;
  type: 'Full Tech' | 'Cue-to-Cue' | 'Dress Rehearsal' | 'Sound Check' | 'Focus Call';
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  departments: string[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  issues: number;
  production_id?: string;
}

export interface RehearsalNote {
  id: string;
  session_id: string;
  timestamp: string;
  department: string;
  type: 'Issue' | 'Fix' | 'Note' | 'Cue Change';
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  resolved: boolean;
}

// Fetch stages
export function useStages(productionId?: string) {
  return useQuery({
    queryKey: ['stages', productionId],
    queryFn: async () => {
      let query = supabase
        .from('legend_places')
        .select('*')
        .order('name', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        type: s.stage_type || 'Outdoor',
        dimensions: s.dimensions || '',
        capacity: s.capacity || 0,
        status: s.status || 'Active',
        production_id: s.production_id,
      })) as Stage[];
    },
  });
}

// Fetch tech rehearsal sessions
export function useTechRehearsalSessions(productionId?: string) {
  return useQuery({
    queryKey: ['tech-rehearsal-sessions', productionId],
    queryFn: async () => {
      let query = supabase
        .from('legend_events')
        .select('*')
        .order('date', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        type: s.session_type,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        location: s.location,
        departments: s.departments || [],
        status: s.status,
        notes: s.notes,
        issues: s.issues_count || 0,
        production_id: s.production_id,
      })) as TechRehearsalSession[];
    },
  });
}

// Fetch rehearsal notes
export function useRehearsalNotes(sessionId?: string) {
  return useQuery({
    queryKey: ['rehearsal-notes', sessionId],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select('*')
        .order('timestamp', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(n => ({
        id: n.id,
        session_id: n.session_id,
        timestamp: n.timestamp,
        department: n.department,
        type: n.note_type,
        description: n.description,
        priority: n.priority,
        assignedTo: n.assigned_to,
        resolved: n.resolved,
      })) as RehearsalNote[];
    },
  });
}

// Add rehearsal note
export function useAddRehearsalNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<RehearsalNote, 'id'>) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .insert({
          session_id: note.session_id,
          timestamp: note.timestamp,
          department: note.department,
          note_type: note.type,
          description: note.description,
          priority: note.priority,
          assigned_to: note.assignedTo,
          resolved: note.resolved,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rehearsal-notes'] });
    },
  });
}
