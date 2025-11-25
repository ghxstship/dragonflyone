// packages/config/webhooks/advancing-webhooks.ts
import type { ProductionAdvance, AdvanceStatus, ProductionAdvanceItem } from '../types/advancing';

/**
 * Webhook payload types for advancing events
 */

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AdvanceWebhookPayload extends WebhookPayload {
  event:
    | 'advance.created'
    | 'advance.submitted'
    | 'advance.approved'
    | 'advance.rejected'
    | 'advance.fulfilled'
    | 'advance.cancelled'
    | 'advance.updated';
  data: {
    advance: ProductionAdvance;
    previous_status?: AdvanceStatus;
    changes?: Partial<ProductionAdvance>;
  };
}

export interface ItemFulfilledWebhookPayload extends WebhookPayload {
  event: 'advance.item_fulfilled';
  data: {
    advance_id: string;
    item: ProductionAdvanceItem;
    quantity_fulfilled: number;
    fulfiller_id: string;
  };
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  retry_count?: number;
  timeout_ms?: number;
}

/**
 * Create webhook payload for advance status change
 */
export function createAdvanceWebhookPayload(
  event: AdvanceWebhookPayload['event'],
  advance: ProductionAdvance,
  previousStatus?: AdvanceStatus,
  changes?: Partial<ProductionAdvance>
): AdvanceWebhookPayload {
  return {
    event,
    timestamp: new Date().toISOString(),
    data: {
      advance,
      previous_status: previousStatus,
      changes,
    },
    metadata: {
      organization_id: advance.organization_id,
      submitter_id: advance.submitter_id,
    },
  };
}

/**
 * Create webhook payload for item fulfillment
 */
export function createItemFulfilledWebhookPayload(
  advanceId: string,
  item: ProductionAdvanceItem,
  quantityFulfilled: number,
  fulfillerId: string
): ItemFulfilledWebhookPayload {
  return {
    event: 'advance.item_fulfilled',
    timestamp: new Date().toISOString(),
    data: {
      advance_id: advanceId,
      item,
      quantity_fulfilled: quantityFulfilled,
      fulfiller_id: fulfillerId,
    },
  };
}

/**
 * Generate HMAC signature for webhook payload
 */
export async function generateWebhookSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await generateWebhookSignature(payload, secret);
  return signature === expectedSignature;
}

/**
 * Send webhook with retry logic
 */
export async function sendWebhook(
  config: WebhookConfig,
  payload: WebhookPayload,
  retryAttempt: number = 0
): Promise<boolean> {
  if (!config.enabled) {
    return false;
  }

  const maxRetries = config.retry_count || 3;
  const timeout = config.timeout_ms || 5000;

  try {
    const payloadString = JSON.stringify(payload);
    const signature = await generateWebhookSignature(payloadString, config.secret);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Event': payload.event,
        'X-Webhook-Timestamp': payload.timestamp,
      },
      body: payloadString,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error(`Webhook delivery failed (attempt ${retryAttempt + 1}):`, error);

    // Retry with exponential backoff
    if (retryAttempt < maxRetries) {
      const delayMs = Math.pow(2, retryAttempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return sendWebhook(config, payload, retryAttempt + 1);
    }

    return false;
  }
}

/**
 * Send webhook for advance status change
 */
export async function sendAdvanceStatusWebhook(
  webhookConfigs: WebhookConfig[],
  advance: ProductionAdvance,
  previousStatus?: AdvanceStatus
): Promise<void> {
  const eventMap: Record<AdvanceStatus, AdvanceWebhookPayload['event']> = {
    draft: 'advance.created',
    submitted: 'advance.submitted',
    under_review: 'advance.updated',
    approved: 'advance.approved',
    in_progress: 'advance.updated',
    fulfilled: 'advance.fulfilled',
    rejected: 'advance.rejected',
    cancelled: 'advance.cancelled',
  };

  const event = eventMap[advance.status];
  const payload = createAdvanceWebhookPayload(event, advance, previousStatus);

  const relevantWebhooks = webhookConfigs.filter(
    (config) => config.enabled && config.events.includes(event)
  );

  await Promise.all(
    relevantWebhooks.map((config) => sendWebhook(config, payload))
  );
}

/**
 * Batch send webhooks for multiple events
 */
export async function sendBatchWebhooks(
  webhookConfigs: WebhookConfig[],
  payloads: WebhookPayload[]
): Promise<{ successful: number; failed: number }> {
  let successful = 0;
  let failed = 0;

  for (const payload of payloads) {
    const relevantWebhooks = webhookConfigs.filter(
      (config) => config.enabled && config.events.includes(payload.event)
    );

    const results = await Promise.all(
      relevantWebhooks.map((config) => sendWebhook(config, payload))
    );

    successful += results.filter((r) => r).length;
    failed += results.filter((r) => !r).length;
  }

  return { successful, failed };
}
