/**
 * Webhook System
 * Outbound webhooks for real-time event notifications to external systems
 */

import { createClient } from '@supabase/supabase-js';

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
  events: WebhookEvent[];
  secret: string;
  is_active: boolean;
  headers?: Record<string, string>;
  retry_count: number;
  timeout_ms: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: WebhookEvent;
  payload: Record<string, any>;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  response_status?: number;
  response_body?: string;
  error_message?: string;
  attempt_count: number;
  delivered_at?: string;
  created_at: string;
}

/**
 * Webhook Manager
 * Handles webhook registration, delivery, and retry logic
 */
export class WebhookManager {
  constructor(private supabase: ReturnType<typeof createClient>) {}

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
      // Generate webhook secret
      const secret = this.generateSecret();

      const { data, error } = await this.supabase
        .from('webhooks')
        .insert({
          user_id: userId,
          name,
          url,
          events,
          secret,
          is_active: true,
          headers,
          retry_count: 3,
          timeout_ms: 5000,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        webhook: {
          id: data.id,
          user_id: data.user_id,
          name: data.name,
          url: data.url,
          events: data.events,
          secret: data.secret,
          is_active: data.is_active,
          headers: data.headers,
          retry_count: data.retry_count,
          timeout_ms: data.timeout_ms,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
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
    updates: Partial<Pick<Webhook, 'name' | 'url' | 'events' | 'headers' | 'is_active'>>
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
    } catch (error: any) {
      return { success: false, error: error.message };
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

    return data.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      url: row.url,
      events: row.events,
      secret: row.secret,
      is_active: row.is_active,
      headers: row.headers,
      retry_count: row.retry_count,
      timeout_ms: row.timeout_ms,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  /**
   * Trigger webhook for an event
   */
  async triggerWebhook(
    eventType: WebhookEvent,
    payload: Record<string, any>
  ): Promise<void> {
    // Get all active webhooks subscribed to this event
    const { data: webhooks, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (error || !webhooks || webhooks.length === 0) {
      return;
    }

    // Create delivery records for each webhook
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
    payload: Record<string, any>
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from('webhook_deliveries')
      .insert({
        webhook_id: webhookId,
        event_type: eventType,
        payload,
        status: 'pending',
        attempt_count: 0,
      })
      .select()
      .single();

    if (!error && data) {
      // Attempt delivery asynchronously
      this.attemptDelivery(data.id);
    }
  }

  /**
   * Attempt webhook delivery
   */
  private async attemptDelivery(deliveryId: string): Promise<void> {
    try {
      // Get delivery and webhook details
      const { data: delivery, error: deliveryError } = await this.supabase
        .from('webhook_deliveries')
        .select('*, webhooks(*)')
        .eq('id', deliveryId)
        .single();

      if (deliveryError || !delivery) {
        return;
      }

      const webhook = delivery.webhooks;
      if (!webhook || !webhook.is_active) {
        return;
      }

      // Prepare request
      const signature = this.generateSignature(delivery.payload, webhook.secret);
      const headers = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': delivery.event_type,
        'User-Agent': 'GHXSTSHIP-Webhooks/1.0',
        ...webhook.headers,
      };

      // Send webhook
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), webhook.timeout_ms);

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

        // Update delivery status
        await this.supabase
          .from('webhook_deliveries')
          .update({
            status: response.ok ? 'delivered' : 'failed',
            response_status: response.status,
            response_body: responseBody.slice(0, 1000), // Limit size
            attempt_count: delivery.attempt_count + 1,
            delivered_at: response.ok ? new Date().toISOString() : undefined,
            error_message: response.ok ? undefined : `HTTP ${response.status}`,
          })
          .eq('id', deliveryId);

        // Retry if failed and attempts remaining
        if (!response.ok && delivery.attempt_count < webhook.retry_count) {
          setTimeout(() => this.attemptDelivery(deliveryId), 5000 * (delivery.attempt_count + 1));
        }
      } catch (error: any) {
        clearTimeout(timeout);

        // Update delivery with error
        await this.supabase
          .from('webhook_deliveries')
          .update({
            status: delivery.attempt_count < webhook.retry_count - 1 ? 'retrying' : 'failed',
            attempt_count: delivery.attempt_count + 1,
            error_message: error.message,
          })
          .eq('id', deliveryId);

        // Retry if attempts remaining
        if (delivery.attempt_count < webhook.retry_count) {
          setTimeout(() => this.attemptDelivery(deliveryId), 5000 * (delivery.attempt_count + 1));
        }
      }
    } catch (error) {
      console.error('Webhook delivery error:', error);
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: Record<string, any>, secret: string): string {
    // In a real implementation, use crypto.createHmac
    // This is a simplified version
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

    return data.map((row: any) => ({
      id: row.id,
      webhook_id: row.webhook_id,
      event_type: row.event_type,
      payload: row.payload,
      status: row.status,
      response_status: row.response_status,
      response_body: row.response_body,
      error_message: row.error_message,
      attempt_count: row.attempt_count,
      delivered_at: row.delivered_at,
      created_at: row.created_at,
    }));
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

    // Send test payload
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
  createManager: (supabase: ReturnType<typeof createClient>) => new WebhookManager(supabase),
};

export default webhooks;
