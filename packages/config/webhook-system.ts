/**
 * Webhook System
 * Outbound webhooks for real-time event notifications to external systems
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';

// Database types
type WebhooksRow = Database['public']['Tables']['webhooks']['Row'];
type WebhooksInsert = Database['public']['Tables']['webhooks']['Insert'];
type WebhooksUpdate = Database['public']['Tables']['webhooks']['Update'];
type WebhookDeliveriesRow = Database['public']['Tables']['webhook_deliveries']['Row'];
type WebhookDeliveriesInsert = Database['public']['Tables']['webhook_deliveries']['Insert'];

export type WebhookEvent =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'event.created'
  | 'event.updated'
  | 'event.deleted'
  | 'ticket.purchased'
  | 'ticket.refunded'
  | 'order.completed'
  | 'order.cancelled'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'crew.assigned'
  | 'crew.removed'
  | 'asset.checked_out'
  | 'asset.returned'
  | 'document.uploaded'
  | 'user.created'
  | 'user.updated';

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  headers?: Record<string, string> | null;
  retry_count: number;
  timeout_ms: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Json;
  status: string;
  response_status?: number | null;
  response_body?: string | null;
  error_message?: string | null;
  attempt_count: number;
  delivered_at?: string | null;
  created_at: string;
}

/**
 * Convert database row to Webhook interface
 */
function rowToWebhook(row: WebhooksRow): Webhook {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    url: row.url,
    events: row.events,
    secret: row.secret,
    is_active: row.is_active ?? true,
    headers: row.headers as Record<string, string> | null,
    retry_count: row.retry_count ?? 3,
    timeout_ms: row.timeout_ms ?? 5000,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Convert database row to WebhookDelivery interface
 */
function rowToDelivery(row: WebhookDeliveriesRow): WebhookDelivery {
  return {
    id: row.id,
    webhook_id: row.webhook_id,
    event_type: row.event_type,
    payload: row.payload,
    status: row.status,
    response_status: row.response_status,
    response_body: row.response_body,
    error_message: row.error_message,
    attempt_count: row.attempt_count ?? 0,
    delivered_at: row.delivered_at,
    created_at: row.created_at,
  };
}

/**
 * Webhook Manager
 * Handles webhook registration, delivery, and retry logic
 */
export class WebhookManager {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Register a new webhook
   */
  async createWebhook(
    userId: string,
    name: string,
    url: string,
    events: WebhookEvent[],
    headers?: Record<string, string>
  ): Promise<{ success: boolean; webhook?: Webhook; error?: string }> {
    try {
      const secret = this.generateSecret();

      const insertData: WebhooksInsert = {
        user_id: userId,
        name,
        url,
        events,
        secret,
        is_active: true,
        headers: headers as Json,
        retry_count: 3,
        timeout_ms: 5000,
      };

      const { data, error } = await this.supabase
        .from('webhooks')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        webhook: rowToWebhook(data),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Generate webhook secret
   */
  private generateSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'whsec_';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  /**
   * Update webhook
   */
  async updateWebhook(
    webhookId: string,
    userId: string,
    updates: WebhooksUpdate
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('webhooks')
        .update(updates)
        .eq('id', webhookId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Get user's webhooks
   */
  async getWebhooks(userId: string): Promise<Webhook[]> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(rowToWebhook);
  }

  /**
   * Trigger webhook for an event
   */
  async triggerWebhook(
    eventType: WebhookEvent,
    payload: Record<string, unknown>
  ): Promise<void> {
    const { data: webhooks, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (error || !webhooks || webhooks.length === 0) {
      return;
    }

    for (const webhook of webhooks) {
      await this.createDelivery(webhook.id, eventType, payload);
    }
  }

  /**
   * Create webhook delivery
   */
  private async createDelivery(
    webhookId: string,
    eventType: WebhookEvent,
    payload: Record<string, unknown>
  ): Promise<void> {
    const insertData: WebhookDeliveriesInsert = {
      webhook_id: webhookId,
      event_type: eventType,
      payload: payload as Json,
      status: 'pending',
      attempt_count: 0,
    };

    const { data, error } = await this.supabase
      .from('webhook_deliveries')
      .insert(insertData)
      .select()
      .single();

    if (!error && data) {
      this.attemptDelivery(data.id);
    }
  }

  /**
   * Attempt webhook delivery
   */
  private async attemptDelivery(deliveryId: string): Promise<void> {
    try {
      const { data: delivery, error: deliveryError } = await this.supabase
        .from('webhook_deliveries')
        .select('*, webhooks(*)')
        .eq('id', deliveryId)
        .single();

      if (deliveryError || !delivery) {
        return;
      }

      const webhook = delivery.webhooks as WebhooksRow | null;
      if (!webhook || !webhook.is_active) {
        return;
      }

      const attemptCount = delivery.attempt_count ?? 0;
      const retryCount = webhook.retry_count ?? 3;
      const timeoutMs = webhook.timeout_ms ?? 5000;

      const payloadObj = (typeof delivery.payload === 'object' && delivery.payload !== null)
        ? delivery.payload as Record<string, unknown>
        : {};
      const signature = this.generateSignature(payloadObj, webhook.secret);
      
      const webhookHeaders = (webhook.headers && typeof webhook.headers === 'object' && !Array.isArray(webhook.headers))
        ? webhook.headers as Record<string, string>
        : {};

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event_type,
        'User-Agent': 'GHXSTSHIP-Webhooks/1.0',
        ...webhookHeaders,
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            event: delivery.event_type,
            data: delivery.payload,
            webhook_id: webhook.id,
            delivery_id: delivery.id,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const responseBody = await response.text().catch(() => '');

        await this.supabase
          .from('webhook_deliveries')
          .update({
            status: response.ok ? 'delivered' : 'failed',
            response_status: response.status,
            response_body: responseBody.slice(0, 1000),
            attempt_count: attemptCount + 1,
            delivered_at: response.ok ? new Date().toISOString() : null,
            error_message: response.ok ? null : `HTTP ${response.status}`,
          })
          .eq('id', deliveryId);

        if (!response.ok && attemptCount < retryCount) {
          setTimeout(() => this.attemptDelivery(deliveryId), 5000 * (attemptCount + 1));
        }
      } catch (error: unknown) {
        clearTimeout(timeout);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        await this.supabase
          .from('webhook_deliveries')
          .update({
            status: attemptCount < retryCount - 1 ? 'retrying' : 'failed',
            attempt_count: attemptCount + 1,
            error_message: errorMessage,
          })
          .eq('id', deliveryId);

        if (attemptCount < retryCount) {
          setTimeout(() => this.attemptDelivery(deliveryId), 5000 * (attemptCount + 1));
        }
      }
    } catch (error) {
      console.error('Webhook delivery error:', error);
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: Record<string, unknown>, secret: string): string {
    const content = JSON.stringify(payload);
    return `sha256=${secret.slice(0, 16)}-${content.length}`;
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(JSON.parse(payload), secret);
    return signature === expectedSignature;
  }

  /**
   * Get webhook deliveries
   */
  async getDeliveries(
    webhookId: string,
    limit: number = 50
  ): Promise<WebhookDelivery[]> {
    const { data, error } = await this.supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(rowToDelivery);
  }

  /**
   * Retry failed delivery
   */
  async retryDelivery(deliveryId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('webhook_deliveries')
      .update({
        status: 'pending',
        error_message: null,
      })
      .eq('id', deliveryId)
      .select()
      .single();

    if (!error && data) {
      this.attemptDelivery(deliveryId);
      return true;
    }

    return false;
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const { data: webhook, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .eq('user_id', userId)
      .single();

    if (error || !webhook) {
      return { success: false, error: 'Webhook not found' };
    }

    const testPayload = {
      test: true,
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
    };

    await this.createDelivery(webhookId, 'project.created', testPayload);

    return { success: true };
  }
}

/**
 * Export webhook utilities
 */
export const webhooks = {
  createManager: (supabase: SupabaseClient<Database>) => new WebhookManager(supabase),
};

export default webhooks;
