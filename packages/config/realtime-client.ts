import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';
import { logger } from './logger';

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

    // Create channel and set up subscription
    const channel = this.supabase.channel(channelName);
    
    // Subscribe to postgres changes with proper typing
    channel.on(
      'postgres_changes' as 'system', // Type assertion needed for Supabase overload
      {
        event: config.event || '*',
        schema: config.schema || 'public',
        table: config.table as string,
        filter: config.filter,
      } as unknown as { event: 'system' },
      (payload: unknown) => {
        const typedPayload = payload as { eventType: string; new: unknown; old: unknown };
        switch (typedPayload.eventType) {
          case 'INSERT':
            callbacks.onInsert?.(typedPayload.new as Tables[T]['Row']);
            break;
          case 'UPDATE':
            callbacks.onUpdate?.({
              old: typedPayload.old as Tables[T]['Row'],
              new: typedPayload.new as Tables[T]['Row'],
            });
            break;
          case 'DELETE':
            callbacks.onDelete?.(typedPayload.old as Tables[T]['Row']);
            break;
        }
      }
    ).subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        logger.debug(`Subscribed to ${channelName}`);
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
      logger.debug(`Unsubscribed from ${channelName}`);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      this.supabase.removeChannel(channel);
      logger.debug(`Unsubscribed from ${name}`);
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
