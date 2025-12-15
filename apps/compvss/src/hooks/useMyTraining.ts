'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MY TRAINING HOOKS
// Manage crew training modules
// =============================================================================

export interface TrainingModule {
  id: string;
  name: string;
  category: string;
  duration: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate?: string;
  completedDate?: string;
  required: boolean;
}

// Fetch my training modules
export function useMyTraining() {
  return useQuery({
    queryKey: ['my-training'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(t => ({
        id: t.id,
        name: t.title || '',
        category: t.category || 'General',
        duration: `${t.duration_minutes || 60} min`,
        progress: 0,
        status: (t.active ? 'not_started' : 'completed') as TrainingModule['status'],
        dueDate: undefined,
        completedDate: undefined,
        required: t.certification_required || false,
      })) as TrainingModule[];
    },
  });
}
