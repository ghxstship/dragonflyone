'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// PUNCH LIST HOOKS
// Manage punch list items
// =============================================================================

export interface PunchItem {
  id: string;
  title: string;
  description: string;
  location: string;
  department: 'Audio' | 'Lighting' | 'Video' | 'Staging' | 'Rigging' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Verified';
  assignedTo?: string;
  reportedBy: string;
  reportedDate: string;
  dueDate?: string;
  resolvedDate?: string;
  verifiedBy?: string;
  photos?: string[];
  notes?: string;
}

// Fetch punch list items
export function usePunchItems() {
  return useQuery({
    queryKey: ['punch-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('punch_list_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(i => ({
        id: i.id,
        title: i.name || i.description?.substring(0, 50) || 'Untitled',
        description: i.description || '',
        location: i.location || '',
        department: (i.category as PunchItem['department']) || 'General',
        priority: (i.priority as PunchItem['priority']) || 'Medium',
        status: (i.status as PunchItem['status']) || 'Open',
        assignedTo: i.assigned_to,
        reportedBy: i.created_by || 'Unknown',
        reportedDate: i.created_at?.split('T')[0] || '',
        dueDate: i.due_date,
        resolvedDate: i.completed_at?.split('T')[0],
        verifiedBy: i.verified_by,
        photos: [],
        notes: i.notes,
      })) as PunchItem[];
    },
  });
}

// Create punch item
export function useCreatePunchItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<PunchItem, 'id'>) => {
      const { data, error } = await supabase
        .from('punch_list_items')
        .insert({
          name: item.title,
          description: item.description,
          location: item.location,
          category: item.department,
          priority: item.priority,
          status: item.status,
          assigned_to: item.assignedTo,
          due_date: item.dueDate,
          notes: item.notes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punch-items'] });
    },
  });
}

// Update punch item status
export function useUpdatePunchItemStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, resolvedDate, verifiedBy }: { id: string; status: PunchItem['status']; resolvedDate?: string; verifiedBy?: string }) => {
      const { data, error } = await supabase
        .from('punch_list_items')
        .update({
          status,
          completed_at: resolvedDate,
          verified_by: verifiedBy,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['punch-items'] });
    },
  });
}
