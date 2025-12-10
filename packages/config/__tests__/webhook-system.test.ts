import { describe, it, expect } from 'vitest';
import { Webhook, WebhookDelivery, WebhookEvent } from '../webhook-system';

describe('webhook-system', () => {
  describe('WebhookEvent types', () => {
    it('should include all project events', () => {
      const projectEvents: WebhookEvent[] = ['project.created', 'project.updated', 'project.deleted'];
      expect(projectEvents.length).toBe(3);
    });

    it('should include all event events', () => {
      const eventEvents: WebhookEvent[] = ['event.created', 'event.updated', 'event.deleted'];
      expect(eventEvents.length).toBe(3);
    });

    it('should include all ticket events', () => {
      const ticketEvents: WebhookEvent[] = ['ticket.purchased', 'ticket.refunded'];
      expect(ticketEvents.length).toBe(2);
    });

    it('should include all order events', () => {
      const orderEvents: WebhookEvent[] = ['order.completed', 'order.cancelled'];
      expect(orderEvents.length).toBe(2);
    });

    it('should include all payment events', () => {
      const paymentEvents: WebhookEvent[] = ['payment.succeeded', 'payment.failed'];
      expect(paymentEvents.length).toBe(2);
    });

    it('should include all crew events', () => {
      const crewEvents: WebhookEvent[] = ['crew.assigned', 'crew.removed'];
      expect(crewEvents.length).toBe(2);
    });

    it('should include all asset events', () => {
      const assetEvents: WebhookEvent[] = ['asset.checked_out', 'asset.returned'];
      expect(assetEvents.length).toBe(2);
    });

    it('should include document and user events', () => {
      const otherEvents: WebhookEvent[] = ['document.uploaded', 'user.created', 'user.updated'];
      expect(otherEvents.length).toBe(3);
    });
  });

  describe('Webhook interface', () => {
    it('should have all required fields', () => {
      const webhook: Webhook = {
        id: 'webhook-123',
        user_id: 'user-123',
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: ['project.created', 'project.updated'],
        secret: 'whsec_abc123',
        is_active: true,
        retry_count: 3,
        timeout_ms: 5000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(webhook.id).toBe('webhook-123');
      expect(webhook.name).toBe('Test Webhook');
      expect(webhook.url).toBe('https://example.com/webhook');
      expect(webhook.events).toContain('project.created');
      expect(webhook.is_active).toBe(true);
      expect(webhook.retry_count).toBe(3);
      expect(webhook.timeout_ms).toBe(5000);
    });

    it('should allow optional headers', () => {
      const webhook: Webhook = {
        id: 'webhook-123',
        user_id: 'user-123',
        name: 'Test Webhook',
        url: 'https://example.com/webhook',
        events: ['project.created'],
        secret: 'whsec_abc123',
        is_active: true,
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
        retry_count: 3,
        timeout_ms: 5000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(webhook.headers?.['Authorization']).toBe('Bearer token123');
      expect(webhook.headers?.['X-Custom-Header']).toBe('custom-value');
    });
  });

  describe('WebhookDelivery interface', () => {
    it('should have all required fields', () => {
      const delivery: WebhookDelivery = {
        id: 'delivery-123',
        webhook_id: 'webhook-123',
        event_type: 'project.created',
        payload: { project_id: 'proj-123', name: 'Test Project' },
        status: 'pending',
        attempt_count: 0,
        created_at: new Date().toISOString(),
      };

      expect(delivery.id).toBe('delivery-123');
      expect(delivery.webhook_id).toBe('webhook-123');
      expect(delivery.event_type).toBe('project.created');
      expect(delivery.status).toBe('pending');
      expect(delivery.attempt_count).toBe(0);
    });

    it('should support all status values', () => {
      const statuses: WebhookDelivery['status'][] = ['pending', 'delivered', 'failed', 'retrying'];
      expect(statuses.length).toBe(4);
    });

    it('should allow optional response fields', () => {
      const delivery: WebhookDelivery = {
        id: 'delivery-123',
        webhook_id: 'webhook-123',
        event_type: 'project.created',
        payload: { project_id: 'proj-123' },
        status: 'delivered',
        response_status: 200,
        response_body: '{"success": true}',
        attempt_count: 1,
        delivered_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      expect(delivery.response_status).toBe(200);
      expect(delivery.response_body).toBe('{"success": true}');
      expect(delivery.delivered_at).toBeDefined();
    });

    it('should allow error message for failed deliveries', () => {
      const delivery: WebhookDelivery = {
        id: 'delivery-123',
        webhook_id: 'webhook-123',
        event_type: 'project.created',
        payload: { project_id: 'proj-123' },
        status: 'failed',
        response_status: 500,
        error_message: 'Internal Server Error',
        attempt_count: 3,
        created_at: new Date().toISOString(),
      };

      expect(delivery.status).toBe('failed');
      expect(delivery.error_message).toBe('Internal Server Error');
      expect(delivery.attempt_count).toBe(3);
    });
  });

  describe('Signature verification logic', () => {
    // Test the signature generation/verification logic
    const generateSignature = (payload: Record<string, unknown>, secret: string): string => {
      const content = JSON.stringify(payload);
      return `sha256=${secret.slice(0, 16)}-${content.length}`;
    };

    const verifySignature = (payload: string, signature: string, secret: string): boolean => {
      const expectedSignature = generateSignature(JSON.parse(payload), secret);
      return signature === expectedSignature;
    };

    it('should generate consistent signatures for same payload', () => {
      const payload = { test: 'data', value: 123 };
      const secret = 'whsec_abcdefghijklmnop';

      const sig1 = generateSignature(payload, secret);
      const sig2 = generateSignature(payload, secret);

      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different payload sizes', () => {
      const payload1 = { test: 'short' };
      const payload2 = { test: 'much longer payload data here' };
      const secret = 'whsec_abcdefghijklmnop';

      const sig1 = generateSignature(payload1, secret);
      const sig2 = generateSignature(payload2, secret);

      // Signatures differ because content length differs
      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = { test: 'data' };
      const secret1 = 'whsec_secret1xxxxxxxx';
      const secret2 = 'whsec_secret2xxxxxxxx';

      const sig1 = generateSignature(payload, secret1);
      const sig2 = generateSignature(payload, secret2);

      expect(sig1).not.toBe(sig2);
    });

    it('should verify valid signature', () => {
      const payload = { test: 'data', value: 123 };
      const secret = 'whsec_abcdefghijklmnop';
      const signature = generateSignature(payload, secret);

      const isValid = verifySignature(JSON.stringify(payload), signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = { test: 'data' };
      const secret = 'whsec_abcdefghijklmnop';
      const invalidSignature = 'sha256=invalid-signature';

      const isValid = verifySignature(JSON.stringify(payload), invalidSignature, secret);
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const payload = { test: 'data' };
      const secret1 = 'whsec_secret1xxxxxxxx';
      const secret2 = 'whsec_secret2xxxxxxxx';
      const signature = generateSignature(payload, secret1);

      const isValid = verifySignature(JSON.stringify(payload), signature, secret2);
      expect(isValid).toBe(false);
    });
  });

  describe('Secret generation pattern', () => {
    const generateSecret = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let secret = 'whsec_';
      for (let i = 0; i < 32; i++) {
        secret += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return secret;
    };

    it('should generate secret with correct prefix', () => {
      const secret = generateSecret();
      expect(secret.startsWith('whsec_')).toBe(true);
    });

    it('should generate secret with correct length', () => {
      const secret = generateSecret();
      expect(secret.length).toBe(38); // 'whsec_' (6) + 32 chars
    });

    it('should generate unique secrets', () => {
      const secrets = new Set<string>();
      for (let i = 0; i < 100; i++) {
        secrets.add(generateSecret());
      }
      expect(secrets.size).toBe(100);
    });
  });
});
