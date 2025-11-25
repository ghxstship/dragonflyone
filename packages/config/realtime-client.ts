import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

export interface RealtimeSubscriptionConfig<T extends TableName> {
  table: T;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
}

export interface RealtimeCallbacks<T extends TableName> {
  onInsert?: (payload: Tables[T]['Row']) => void;
  onUpdate?: (payload: { old: Tables[T]['Row']; new: Tables[T]['Row'] }) => void;
  onDelete?: (payload: Tables[T]['Row']) => void;
  onError?: (error: Error) => void;
}

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  constructor(private supabase: SupabaseClient<Database>) {}

  subscribe<T extends TableName>(
    config: RealtimeSubscriptionConfig<T>,
    callbacks: RealtimeCallbacks<T>
  ): string {
    const channelName = `${config.schema || 'public'}:${config.table}:${config.filter || '*'}`;

    if (this.channels.has(channelName)) {
      console.warn(`Channel ${channelName} already subscribed`);
      return channelName;
    }

    const channel = (this.supabase as any)
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: config.event || '*',
          schema: config.schema || 'public',
          table: config.table,
          filter: config.filter,
        },
        (payload: any) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onInsert?.(payload.new as Tables[T]['Row']);
              break;
            case 'UPDATE':
              callbacks.onUpdate?.({
                old: payload.old as Tables[T]['Row'],
                new: payload.new as Tables[T]['Row'],
              });
              break;
            case 'DELETE':
              callbacks.onDelete?.(payload.old as Tables[T]['Row']);
              break;
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${channelName}`);
        } else if (status === 'CHANNEL_ERROR') {
          callbacks.onError?.(new Error(`Failed to subscribe to ${channelName}`));
        }
      });

    this.channels.set(channelName, channel);
    return channelName;
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel);
      console.log(`Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

export function subscribeToDeals(
  supabase: SupabaseClient<Database>,
  callbacks: RealtimeCallbacks<'deals'>
): string {
  const manager = new RealtimeManager(supabase);
  return manager.subscribe({ table: 'deals' }, callbacks);
}

export function subscribeToProjects(
  supabase: SupabaseClient<Database>,
  callbacks: RealtimeCallbacks<'projects'>
): string {
  const manager = new RealtimeManager(supabase);
  return manager.subscribe({ table: 'projects' }, callbacks);
}

export function subscribeToAssets(
  supabase: SupabaseClient<Database>,
  callbacks: RealtimeCallbacks<'assets'>
): string {
  const manager = new RealtimeManager(supabase);
  return manager.subscribe({ table: 'assets' }, callbacks);
}

export function subscribeToExpenses(
  supabase: SupabaseClient<Database>,
  callbacks: RealtimeCallbacks<'finance_expenses'>
): string {
  const manager = new RealtimeManager(supabase);
  return manager.subscribe({ table: 'finance_expenses' }, callbacks);
}

export function subscribeToAuditLog(
  supabase: SupabaseClient<Database>,
  callbacks: RealtimeCallbacks<'audit_log'>
): string {
  const manager = new RealtimeManager(supabase);
  return manager.subscribe({ table: 'audit_log' }, callbacks);
}
