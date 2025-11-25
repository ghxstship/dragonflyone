import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseRealtimeOptions<T> {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: T) => void;
  filter?: string;
}

export function useRealtime<T = any>({
  table,
  event,
  callback,
  filter,
}: UseRealtimeOptions<T>) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      const channelName = `${table}-changes`;
      
      channel = supabase.channel(channelName);

      if (filter) {
        (channel as any).on(
          'postgres_changes',
          { event, schema: 'public', table, filter },
          (payload: any) => callback(payload.new as T)
        );
      } else {
        (channel as any).on(
          'postgres_changes',
          { event, schema: 'public', table },
          (payload: any) => callback(payload.new as T)
        );
      }

      await channel.subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, event, filter, callback]);
}
