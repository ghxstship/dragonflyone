import { QueryClient } from '@tanstack/react-query';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

/**
 * Real-time Data Synchronization Utilities
 * Integrates Supabase real-time with React Query cache
 */

export type RealtimeChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimeSyncOptions<T> {
  table: string;
  queryKey: unknown[];
  queryClient: QueryClient;
  event?: RealtimeChangeEvent;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (payload: { old: T }) => void;
  schema?: string;
}

/**
 * Subscribe to real-time changes and sync with query cache
 */
export function subscribeToTable<T extends { id: string }>({
  table,
  queryKey,
  queryClient,
  event = '*',
  filter,
  onInsert,
  onUpdate,
  onDelete,
  schema = 'public',
}: RealtimeSyncOptions<T>): RealtimeChannel {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        filter,
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
          case 'INSERT':
            // Add new record to cache
            queryClient.setQueryData<T[]>(queryKey, (old) => {
              if (!old) return [newRecord as T];
              return [...old, newRecord as T];
            });
            onInsert?.(newRecord as T);
            break;

          case 'UPDATE':
            // Update record in cache
            queryClient.setQueryData<T[]>(queryKey, (old) => {
              if (!old) return old;
              return old.map((item) =>
                item.id === (newRecord as T).id ? (newRecord as T) : item
              );
            });
            onUpdate?.(newRecord as T);
            break;

          case 'DELETE':
            // Remove record from cache
            queryClient.setQueryData<T[]>(queryKey, (old) => {
              if (!old) return old;
              return old.filter((item) => item.id !== (oldRecord as T).id);
            });
            onDelete?.({ old: oldRecord as T });
            break;
        }

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to multiple tables at once
 */
export function subscribeToMultipleTables<T extends { id: string }>(
  subscriptions: RealtimeSyncOptions<T>[]
): RealtimeChannel[] {
  return subscriptions.map((sub) => subscribeToTable(sub));
}

/**
 * Unsubscribe from real-time channel
 */
export async function unsubscribe(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}

/**
 * Unsubscribe from multiple channels
 */
export async function unsubscribeAll(channels: RealtimeChannel[]): Promise<void> {
  await Promise.all(channels.map((channel) => unsubscribe(channel)));
}

/**
 * Subscribe to presence (user online status)
 */
export interface PresenceState {
  userId: string;
  online: boolean;
  lastSeen?: string;
  metadata?: Record<string, unknown>;
}

export function subscribeToPresence(
  channelName: string,
  userId: string,
  onPresenceChange?: (state: PresenceState[]) => void
): RealtimeChannel {
  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const users = Object.values(presenceState).flat() as PresenceState[];
      onPresenceChange?.(users);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          online: true,
          lastSeen: new Date().toISOString(),
        });
      }
    });

  return channel;
}

/**
 * Subscribe to broadcast messages (real-time events)
 */
export function subscribeToBroadcast<T = unknown>(
  channelName: string,
  eventName: string,
  onMessage: (payload: T) => void
): RealtimeChannel {
  const channel = supabase.channel(channelName);

  channel
    .on('broadcast', { event: eventName }, ({ payload }) => {
      onMessage(payload as T);
    })
    .subscribe();

  return channel;
}

/**
 * Send broadcast message
 */
export async function sendBroadcast<T = unknown>(
  channel: RealtimeChannel,
  eventName: string,
  payload: T
): Promise<void> {
  await channel.send({
    type: 'broadcast',
    event: eventName,
    payload,
  });
}

/**
 * Create a real-time query hook
 */
export function createRealtimeQueryHook<T extends { id: string }>(
  table: string,
  queryKey: unknown[]
) {
  return function useRealtimeQuery(queryClient: QueryClient, options?: Partial<RealtimeSyncOptions<T>>) {
    const channel = subscribeToTable<T>({
      table,
      queryKey,
      queryClient,
      ...options,
    });

    return {
      channel,
      unsubscribe: () => unsubscribe(channel),
    };
  };
}
