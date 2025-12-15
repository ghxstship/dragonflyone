'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// STAKEHOLDERS HOOKS
// Manage stakeholders and updates
// =============================================================================

export interface Stakeholder {
  id: string;
  name: string;
  organization: string;
  role: 'Client' | 'Sponsor' | 'Vendor' | 'Partner';
  status: 'Active' | 'Pending' | 'Inactive';
  accessLevel: 'Full' | 'Limited' | 'View Only';
  lastLogin?: string;
  email?: string;
}

export interface StakeholderUpdate {
  id: string;
  title: string;
  content: string;
  type: 'Status' | 'Milestone' | 'Alert' | 'Document';
  projectName: string;
  author: string;
  timestamp: string;
}

// Fetch stakeholders
export function useStakeholders() {
  return useQuery({
    queryKey: ['stakeholders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakeholders')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        organization: s.organization,
        role: s.role || 'Client',
        status: s.status || 'Active',
        accessLevel: s.access_level || 'View Only',
        lastLogin: s.last_login,
        email: s.email,
      })) as Stakeholder[];
    },
  });
}

// Fetch stakeholder updates
export function useStakeholderUpdates() {
  return useQuery({
    queryKey: ['stakeholder-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stakeholder_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(u => ({
        id: u.id,
        title: u.title,
        content: u.content,
        type: u.update_type || 'Status',
        projectName: u.project_name,
        author: u.author,
        timestamp: u.created_at,
      })) as StakeholderUpdate[];
    },
  });
}

// Invite stakeholder
export function useInviteStakeholder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stakeholder: Omit<Stakeholder, 'id' | 'lastLogin'>) => {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert({
          name: stakeholder.name,
          organization: stakeholder.organization,
          role: stakeholder.role,
          status: 'Pending',
          access_level: stakeholder.accessLevel,
          email: stakeholder.email,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stakeholders'] });
    },
  });
}
