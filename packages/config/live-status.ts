/**
 * Live Status Indicators
 * Real-time status tracking and updates for projects, events, and resources
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

export type StatusType =
  | 'project'
  | 'event'
  | 'task'
  | 'asset'
  | 'crew_member'
  | 'venue'
  | 'order'
  | 'ticket';

export type StatusValue =
  | 'idle'
  | 'active'
  | 'in_progress'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'on_hold'
  | 'delayed'
  | 'at_risk'
  | 'critical';

export interface StatusUpdate {
  id: string;
  entity_type: StatusType;
  entity_id: string;
  status: StatusValue;
  message?: string;
  metadata?: Record<string, any>;
  updated_by?: string;
  updated_at: string;
}

export interface StatusSubscription {
  entityType: StatusType;
  entityId: string;
  callback: (status: StatusUpdate) => void;
}

/**
 * Live Status Manager
 * Handles real-time status updates and subscriptions
 */
export class LiveStatusManager {
  private subscriptions: Map<string, StatusSubscription[]> = new Map();
  private channels: Map<string, any> = new Map();

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Subscribe to status updates for an entity
   */
  subscribe(
    entityType: StatusType,
    entityId: string,
    callback: (status: StatusUpdate) => void
  ): () => void {
    const key = `${entityType}:${entityId}`;

    // Add to subscriptions
    const subs = this.subscriptions.get(key) || [];
    const subscription: StatusSubscription = { entityType, entityId, callback };
    subs.push(subscription);
    this.subscriptions.set(key, subs);

    // Setup channel if not exists
    if (!this.channels.has(key)) {
      this.setupChannel(entityType, entityId);
    }

    // Return unsubscribe function
    return () => this.unsubscribe(entityType, entityId, callback);
  }

  /**
   * Setup realtime channel for an entity
   */
  private setupChannel(entityType: StatusType, entityId: string) {
    const key = `${entityType}:${entityId}`;
    const channelName = `status:${key}`;

    const channel = this.supabase.channel(channelName);

    // Listen for status updates
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'status_updates',
          filter: `entity_type=eq.${entityType},entity_id=eq.${entityId}`,
        },
        (payload: any) => {
          const status: StatusUpdate = {
            id: payload.new.id,
            entity_type: payload.new.entity_type,
            entity_id: payload.new.entity_id,
            status: payload.new.status,
            message: payload.new.message ?? undefined,
            metadata: payload.new.metadata ?? undefined,
            updated_by: payload.new.updated_by ?? undefined,
            updated_at: payload.new.updated_at,
          };

          // Notify all subscribers
          const subs = this.subscriptions.get(key) || [];
          subs.forEach((sub) => sub.callback(status));
        }
      )
      .subscribe();

    this.channels.set(key, channel);
  }

  /**
   * Unsubscribe from status updates
   */
  private unsubscribe(
    entityType: StatusType,
    entityId: string,
    callback: (status: StatusUpdate) => void
  ) {
    const key = `${entityType}:${entityId}`;
    const subs = this.subscriptions.get(key) || [];
    const filtered = subs.filter((s) => s.callback !== callback);

    if (filtered.length === 0) {
      // No more subscribers, clean up channel
      const channel = this.channels.get(key);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(key);
      }
      this.subscriptions.delete(key);
    } else {
      this.subscriptions.set(key, filtered);
    }
  }

  /**
   * Update status for an entity
   */
  async updateStatus(
    entityType: StatusType,
    entityId: string,
    status: StatusValue,
    message?: string,
    metadata?: Record<string, any>,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.from('status_updates').insert({
        entity_type: entityType,
        entity_id: entityId,
        status,
        message,
        metadata,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current status for an entity
   */
  async getStatus(
    entityType: StatusType,
    entityId: string
  ): Promise<StatusUpdate | null> {
    const { data, error } = await this.supabase
      .from('status_updates')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      status: data.status,
      message: data.message ?? undefined,
      metadata: data.metadata ?? undefined,
      updated_by: data.updated_by ?? undefined,
      updated_at: data.updated_at,
    };
  }

  /**
   * Get status history for an entity
   */
  async getStatusHistory(
    entityType: StatusType,
    entityId: string,
    limit: number = 50
  ): Promise<StatusUpdate[]> {
    const { data, error } = await this.supabase
      .from('status_updates')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row: any) => ({
      id: row.id,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      status: row.status,
      message: row.message ?? undefined,
      metadata: row.metadata ?? undefined,
      updated_by: row.updated_by ?? undefined,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Bulk status update for multiple entities
   */
  async bulkUpdateStatus(
    updates: Array<{
      entityType: StatusType;
      entityId: string;
      status: StatusValue;
      message?: string;
      metadata?: Record<string, any>;
    }>,
    userId?: string
  ): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const records = updates.map((update) => ({
        entity_type: update.entityType,
        entity_id: update.entityId,
        status: update.status,
        message: update.message,
        metadata: update.metadata,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await this.supabase
        .from('status_updates')
        .insert(records)
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, count: data?.length || 0 };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cleanup old status records
   */
  async cleanup(olderThanDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { data, error } = await this.supabase
      .from('status_updates')
      .delete()
      .lt('updated_at', cutoffDate.toISOString())
      .select();

    return data?.length || 0;
  }

  /**
   * Disconnect all channels
   */
  disconnect() {
    this.channels.forEach((channel) => channel.unsubscribe());
    this.channels.clear();
    this.subscriptions.clear();
  }
}

/**
 * Status Badge Component Helper
 * Provides consistent status badge styling
 */
export const getStatusBadgeProps = (status: StatusValue) => {
  const statusConfig: Record<
    StatusValue,
    { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'default' }
  > = {
    idle: { label: 'Idle', variant: 'default' },
    active: { label: 'Active', variant: 'success' },
    in_progress: { label: 'In Progress', variant: 'info' },
    pending: { label: 'Pending', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    cancelled: { label: 'Cancelled', variant: 'default' },
    failed: { label: 'Failed', variant: 'error' },
    on_hold: { label: 'On Hold', variant: 'warning' },
    delayed: { label: 'Delayed', variant: 'warning' },
    at_risk: { label: 'At Risk', variant: 'error' },
    critical: { label: 'Critical', variant: 'error' },
  };

  return statusConfig[status] || statusConfig.idle;
};

/**
 * Status Aggregator
 * Aggregates status across multiple entities
 */
export class StatusAggregator {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get status summary for multiple entities
   */
  async getSummary(
    entityType: StatusType,
    entityIds: string[]
  ): Promise<Record<string, StatusUpdate | null>> {
    const results: Record<string, StatusUpdate | null> = {};

    // Fetch latest status for each entity
    const { data, error } = await this.supabase
      .from('status_updates')
      .select('*')
      .eq('entity_type', entityType)
      .in('entity_id', entityIds)
      .order('updated_at', { ascending: false });

    if (error || !data) {
      entityIds.forEach((id) => (results[id] = null));
      return results;
    }

    // Group by entity_id and take latest
    const grouped = new Map<string, StatusUpdate>();
    data.forEach((row: any) => {
      if (!grouped.has(row.entity_id)) {
        grouped.set(row.entity_id, {
          id: row.id,
          entity_type: row.entity_type,
          entity_id: row.entity_id,
          status: row.status,
          message: row.message ?? undefined,
          metadata: row.metadata ?? undefined,
          updated_by: row.updated_by ?? undefined,
          updated_at: row.updated_at,
        });
      }
    });

    entityIds.forEach((id) => {
      results[id] = grouped.get(id) || null;
    });

    return results;
  }

  /**
   * Get status counts by type
   */
  async getStatusCounts(
    entityType: StatusType,
    entityIds?: string[]
  ): Promise<Record<StatusValue, number>> {
    let query = this.supabase
      .from('status_updates')
      .select('status')
      .eq('entity_type', entityType);

    if (entityIds) {
      query = query.in('entity_id', entityIds);
    }

    const { data, error } = await query;

    if (error || !data) {
      return {} as Record<StatusValue, number>;
    }

    // Get latest status for each entity
    const latestByEntity = new Map<string, string>();
    data.forEach((row: any) => {
      // Assuming data is ordered by updated_at desc from above query
      if (!latestByEntity.has(row.entity_id)) {
        latestByEntity.set(row.entity_id, row.status);
      }
    });

    // Count statuses
    const counts: Record<string, number> = {};
    latestByEntity.forEach((status) => {
      counts[status] = (counts[status] || 0) + 1;
    });

    return counts as Record<StatusValue, number>;
  }
}

/**
 * Export live status utilities
 */
export const liveStatus = {
  createManager: (supabase: SupabaseClient<Database>) => new LiveStatusManager(supabase),
  createAggregator: (supabase: SupabaseClient<Database>) => new StatusAggregator(supabase),
  getStatusBadgeProps,
};

export default liveStatus;
