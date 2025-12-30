'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// INTEGRATIONS HOOKS
// Manage sync jobs and cross-platform integrations
// =============================================================================

export interface SyncJob {
  id: string;
  source_system: string;
  target_system: string;
  status: 'synced' | 'pending' | 'failed';
  created_at: string;
  payload: {
    action: string;
    [key: string]: unknown;
  };
}

// Fetch sync jobs
export function useSyncJobs() {
  return useQuery({
    queryKey: ['sync-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return (data || []).map(j => ({
        id: j.id,
        source_system: j.source_system,
        target_system: j.target_system,
        status: j.status,
        created_at: j.created_at,
        payload: j.payload || { action: 'sync' },
      })) as SyncJob[];
    },
  });
}
