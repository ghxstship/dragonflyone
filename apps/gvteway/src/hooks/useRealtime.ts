import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseRealtimeOptions<T> {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: T) => void;
  filter?: string;
}

interface PostgresChangePayload {
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

export function useRealtime<T = Record<string, unknown>>({
  table,
  event,
  callback,
  filter,
}: UseRealtimeOptions<T>) {
  useEffect(() => {
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      const channelName = `${table}-changes`;
      
      // Use type assertion to work around Supabase type limitations
      const channelInstance = supabase.channel(channelName) as RealtimeChannel & {
        on: (
          type: string,
          opts: Record<string, unknown>,
          cb: (payload: PostgresChangePayload) => void
        ) => RealtimeChannel;
      };

      const handleChange = (payload: PostgresChangePayload) => {
        callback(payload.new as T);
      };

      if (filter) {
        channel = channelInstance.on(
          'postgres_changes',
          { event, schema: 'public', table, filter },
          handleChange
        );
      } else {
        channel = channelInstance.on(
          'postgres_changes',
          { event, schema: 'public', table },
          handleChange
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
