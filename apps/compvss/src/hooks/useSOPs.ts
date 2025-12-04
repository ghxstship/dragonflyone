'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SOPs HOOKS
// Manage Standard Operating Procedures for productions
// Event-level roles: Operations Director, Department Heads, Safety Coordinator
// =============================================================================

export interface SOPCategory {
  id: string;
  production_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOP {
  id: string;
  production_id: string;
  category_id: string;
  title: string;
  description?: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'archived';
  effective_date?: string;
  review_date?: string;
  owner_id?: string;
  requires_acknowledgment: boolean;
  requires_training: boolean;
  training_duration_minutes?: number;
  tags?: string[];
  attachments?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  category?: SOPCategory;
  owner?: { id: string; first_name: string; last_name: string };
  steps?: SOPStep[];
}

export interface SOPStep {
  id: string;
  sop_id: string;
  step_number: number;
  title: string;
  description: string;
  notes?: string;
  warning?: string;
  image_url?: string;
  video_url?: string;
  duration_minutes?: number;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOPAcknowledgment {
  id: string;
  sop_id: string;
  user_id: string;
  acknowledged_at: string;
  ip_address?: string;
  user_agent?: string;
  // Joined data
  sop?: SOP;
  user?: { id: string; first_name: string; last_name: string; email: string };
}

export interface SOPTrainingRecord {
  id: string;
  sop_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  score?: number;
  attempts: number;
  // Joined data
  sop?: SOP;
  user?: { id: string; first_name: string; last_name: string; email: string };
}

interface SOPFilters {
  productionId?: string;
  categoryId?: string;
  status?: string;
}

// Fetch SOP categories
export function useSOPCategories(productionId?: string) {
  return useQuery({
    queryKey: ['sop_categories', productionId],
    queryFn: async () => {
      let query = supabase
        .from('sop_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SOPCategory[];
    },
  });
}

// Fetch all SOPs
export function useSOPs(filters?: SOPFilters) {
  return useQuery({
    queryKey: ['sops', filters],
    queryFn: async () => {
      let query = supabase
        .from('sops')
        .select(`
          *,
          category:sop_categories(id, name, color, icon),
          owner:contacts(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SOP[];
    },
  });
}

// Fetch single SOP with steps
export function useSOP(id: string) {
  return useQuery({
    queryKey: ['sops', id],
    queryFn: async () => {
      const { data: sop, error: sopError } = await supabase
        .from('sops')
        .select(`
          *,
          category:sop_categories(id, name, color, icon),
          owner:contacts(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (sopError) throw sopError;

      const { data: steps, error: stepsError } = await supabase
        .from('sop_steps')
        .select('*')
        .eq('sop_id', id)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;

      return { ...sop, steps } as unknown as SOP;
    },
    enabled: !!id,
  });
}

// Fetch SOP acknowledgments
export function useSOPAcknowledgments(sopId?: string, userId?: string) {
  return useQuery({
    queryKey: ['sop_acknowledgments', sopId, userId],
    queryFn: async () => {
      let query = supabase
        .from('sop_acknowledgments')
        .select(`
          *,
          sop:sops(id, title),
          user:platform_users(id, first_name, last_name, email)
        `)
        .order('acknowledged_at', { ascending: false });

      if (sopId) {
        query = query.eq('sop_id', sopId);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SOPAcknowledgment[];
    },
  });
}

// Fetch SOP training records
export function useSOPTrainingRecords(sopId?: string, userId?: string) {
  return useQuery({
    queryKey: ['sop_training_records', sopId, userId],
    queryFn: async () => {
      let query = supabase
        .from('sop_training_records')
        .select(`
          *,
          sop:sops(id, title),
          user:platform_users(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (sopId) {
        query = query.eq('sop_id', sopId);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SOPTrainingRecord[];
    },
  });
}

// Create SOP category
export function useCreateSOPCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Omit<SOPCategory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sop_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sop_categories'] });
    },
  });
}

// Create SOP
export function useCreateSOP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sop: Omit<SOP, 'id' | 'created_at' | 'updated_at' | 'category' | 'owner' | 'steps'>) => {
      const { data, error } = await supabase
        .from('sops')
        .insert(sop)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
    },
  });
}

// Update SOP
export function useUpdateSOP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SOP> & { id: string }) => {
      const { data, error } = await supabase
        .from('sops')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sops'] });
      queryClient.invalidateQueries({ queryKey: ['sops', variables.id] });
    },
  });
}

// Create SOP step
export function useCreateSOPStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (step: Omit<SOPStep, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sop_steps')
        .insert(step)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sops', variables.sop_id] });
    },
  });
}

// Update SOP step
export function useUpdateSOPStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sopId, ...updates }: Partial<SOPStep> & { id: string; sopId: string }) => {
      const { data, error } = await supabase
        .from('sop_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, sopId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sops', data.sopId] });
    },
  });
}

// Delete SOP step
export function useDeleteSOPStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, sopId }: { id: string; sopId: string }) => {
      const { error } = await supabase.from('sop_steps').delete().eq('id', id);
      if (error) throw error;
      return { sopId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sops', data.sopId] });
    },
  });
}

// Acknowledge SOP
export function useAcknowledgeSOP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sopId, userId }: { sopId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('sop_acknowledgments')
        .insert({
          sop_id: sopId,
          user_id: userId,
          acknowledged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sop_acknowledgments', variables.sopId] });
    },
  });
}

// Start SOP training
export function useStartSOPTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sopId, userId }: { sopId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('sop_training_records')
        .insert({
          sop_id: sopId,
          user_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          attempts: 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sop_training_records', variables.sopId] });
    },
  });
}

// Complete SOP training
export function useCompleteSOPTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, score, passed }: { id: string; score: number; passed: boolean }) => {
      const { data, error } = await supabase
        .from('sop_training_records')
        .update({
          status: passed ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          score,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sop_training_records', data.sop_id] });
    },
  });
}

// Get SOP statistics
export function useSOPStats(productionId?: string) {
  return useQuery({
    queryKey: ['sops', 'stats', productionId],
    queryFn: async () => {
      let query = supabase.from('sops').select('status, requires_acknowledgment, requires_training');
      
      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const sops = data || [];
      return {
        total: sops.length,
        draft: sops.filter(s => s.status === 'draft').length,
        review: sops.filter(s => s.status === 'review').length,
        approved: sops.filter(s => s.status === 'approved').length,
        archived: sops.filter(s => s.status === 'archived').length,
        requiresAcknowledgment: sops.filter(s => s.requires_acknowledgment).length,
        requiresTraining: sops.filter(s => s.requires_training).length,
      };
    },
  });
}
