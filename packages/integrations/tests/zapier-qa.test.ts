import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Zapier Integration QA Test Suite
 * Tests instant/delayed triggers, pagination, and rate limits
 */

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const API_KEY = process.env.TEST_API_KEY || 'test_key';

describe('Zapier Trigger QA Tests', () => {
  describe('Instant Triggers (Webhooks)', () => {
    it('should register webhook subscription successfully', async () => {
      const response = await fetch(`${BASE_URL}/api/zapier/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hookUrl: 'https://hooks.zapier.com/test/123',
          event: 'deal.created'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('hookUrl');
    });

    it('should deliver webhook within 5 seconds of event', async () => {
      const startTime = Date.now();
      
      // Trigger an event
      const triggerResponse = await fetch(`${BASE_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test Deal for Webhook',
          value: 1000
        })
      });

      expect(triggerResponse.ok).toBe(true);

      // Check webhook delivery log
      await new Promise(resolve => setTimeout(resolve, 2000));

      const deliveryResponse = await fetch(`${BASE_URL}/api/zapier/webhooks/deliveries?limit=1`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      const deliveries = await deliveryResponse.json();
      const deliveryTime = new Date(deliveries.data[0]?.delivered_at).getTime();
      const latency = deliveryTime - startTime;

      expect(latency).toBeLessThan(5000); // Under 5 seconds
    });

    it('should handle webhook failures with retry', async () => {
      // Register webhook to failing endpoint
      const response = await fetch(`${BASE_URL}/api/zapier/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hookUrl: 'https://httpstat.us/500',
          event: 'deal.created'
        })
      });

      const webhook = await response.json();

      // Trigger event
      await fetch(`${BASE_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Retry Test Deal', value: 500 })
      });

      // Wait for retries
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Check delivery attempts
      const deliveriesResponse = await fetch(
        `${BASE_URL}/api/zapier/webhooks/${webhook.id}/deliveries`,
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );

      const deliveries = await deliveriesResponse.json();
      expect(deliveries.data.length).toBeGreaterThan(1); // Multiple attempts
    });

    it('should unsubscribe webhook successfully', async () => {
      // First create a webhook
      const createResponse = await fetch(`${BASE_URL}/api/zapier/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hookUrl: 'https://hooks.zapier.com/test/delete',
          event: 'deal.updated'
        })
      });

      const webhook = await createResponse.json();

      // Delete the webhook
      const deleteResponse = await fetch(`${BASE_URL}/api/zapier/webhooks/${webhook.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      expect(deleteResponse.status).toBe(204);

      // Verify it's gone
      const getResponse = await fetch(`${BASE_URL}/api/zapier/webhooks/${webhook.id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      expect(getResponse.status).toBe(404);
    });
  });

  describe('Polling Triggers', () => {
    it('should return results in reverse chronological order', async () => {
      const response = await fetch(`${BASE_URL}/api/zapier/triggers/deal.created`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);

      // Verify order
      for (let i = 1; i < data.length; i++) {
        const prevDate = new Date(data[i - 1].created_at);
        const currDate = new Date(data[i].created_at);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });

    it('should include unique id field for deduplication', async () => {
      const response = await fetch(`${BASE_URL}/api/zapier/triggers/deal.created`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      const data = await response.json();
      const ids = data.map((item: any) => item.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size); // All IDs unique
    });

    it('should respect limit parameter', async () => {
      const limits = [5, 10, 25, 50];

      for (const limit of limits) {
        const response = await fetch(
          `${BASE_URL}/api/zapier/triggers/deal.created?limit=${limit}`,
          { headers: { 'Authorization': `Bearer ${API_KEY}` } }
        );

        const data = await response.json();
        expect(data.length).toBeLessThanOrEqual(limit);
      }
    });
  });

  describe('Pagination', () => {
    it('should support cursor-based pagination', async () => {
      // First page
      const page1Response = await fetch(`${BASE_URL}/api/deals?limit=10`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      const page1 = await page1Response.json();
      expect(page1).toHaveProperty('data');
      expect(page1).toHaveProperty('pagination');
      expect(page1.pagination).toHaveProperty('cursor');

      if (page1.pagination.hasMore) {
        // Second page
        const page2Response = await fetch(
          `${BASE_URL}/api/deals?limit=10&cursor=${page1.pagination.cursor}`,
          { headers: { 'Authorization': `Bearer ${API_KEY}` } }
        );

        const page2 = await page2Response.json();
        expect(page2.data.length).toBeGreaterThan(0);

        // Verify no overlap
        const page1Ids = new Set(page1.data.map((d: any) => d.id));
        const hasOverlap = page2.data.some((d: any) => page1Ids.has(d.id));
        expect(hasOverlap).toBe(false);
      }
    });

    it('should handle invalid cursor gracefully', async () => {
      const response = await fetch(`${BASE_URL}/api/deals?cursor=invalid_cursor`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toHaveProperty('code');
    });

    it('should return consistent results during pagination', async () => {
      const allItems: any[] = [];
      let cursor: string | undefined;

      do {
        const url = `${BASE_URL}/api/deals?limit=25${cursor ? `&cursor=${cursor}` : ''}`;
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        const data = await response.json();
        allItems.push(...data.data);
        cursor = data.pagination?.cursor;

        // Safety limit
        if (allItems.length > 1000) break;
      } while (cursor);

      // Verify no duplicates
      const ids = allItems.map(item => item.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe('Rate Limits', () => {
    it('should include rate limit headers in response', async () => {
      const response = await fetch(`${BASE_URL}/api/deals`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
      expect(response.headers.has('X-RateLimit-Reset')).toBe(true);
    });

    it('should return 429 with Retry-After when rate limited', async () => {
      // Use a test key with low rate limit
      const lowLimitKey = process.env.LOW_RATE_LIMIT_KEY;
      if (!lowLimitKey) {
        console.log('Skipping rate limit test - no low limit key');
        return;
      }

      const requests = Array.from({ length: 50 }, () =>
        fetch(`${BASE_URL}/api/deals`, {
          headers: { 'Authorization': `Bearer ${lowLimitKey}` }
        })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.find(r => r.status === 429);

      if (rateLimited) {
        expect(rateLimited.headers.has('Retry-After')).toBe(true);
        const retryAfter = parseInt(rateLimited.headers.get('Retry-After') || '0');
        expect(retryAfter).toBeGreaterThan(0);
      }
    });

    it('should recover after rate limit window', async () => {
      const lowLimitKey = process.env.LOW_RATE_LIMIT_KEY;
      if (!lowLimitKey) return;

      // Exhaust rate limit
      const requests = Array.from({ length: 20 }, () =>
        fetch(`${BASE_URL}/api/deals`, {
          headers: { 'Authorization': `Bearer ${lowLimitKey}` }
        })
      );

      await Promise.all(requests);

      // Wait for reset
      await new Promise(resolve => setTimeout(resolve, 61000));

      // Should work again
      const response = await fetch(`${BASE_URL}/api/deals`, {
        headers: { 'Authorization': `Bearer ${lowLimitKey}` }
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Search Actions', () => {
    it('should find resources by exact match', async () => {
      const response = await fetch(
        `${BASE_URL}/api/zapier/search/deals?name=Test%20Deal`,
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const response = await fetch(
        `${BASE_URL}/api/zapier/search/deals?name=NonexistentDeal12345`,
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toEqual([]);
    });

    it('should support multiple search fields', async () => {
      const response = await fetch(
        `${BASE_URL}/api/zapier/search/contacts?email=test@example.com&company=Acme`,
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );

      expect(response.ok).toBe(true);
    });
  });
});

describe('Zapier Actions QA Tests', () => {
  describe('Create Actions', () => {
    it('should create resource and return full object', async () => {
      const response = await fetch(`${BASE_URL}/api/zapier/actions/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Zapier Created Deal',
          value: 5000,
          stage: 'qualification'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.name).toBe('Zapier Created Deal');
    });

    it('should validate required fields', async () => {
      const response = await fetch(`${BASE_URL}/api/zapier/actions/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Missing required 'name' field
          value: 5000
        })
      });

      expect(response.status).toBe(422);
      const data = await response.json();
      expect(data.error).toHaveProperty('details');
    });
  });

  describe('Update Actions', () => {
    it('should update resource and return updated object', async () => {
      // First create
      const createResponse = await fetch(`${BASE_URL}/api/zapier/actions/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Update Test', value: 1000 })
      });

      const created = await createResponse.json();

      // Then update
      const updateResponse = await fetch(`${BASE_URL}/api/zapier/actions/deals/${created.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: 2000 })
      });

      expect(updateResponse.ok).toBe(true);
      const updated = await updateResponse.json();
      expect(updated.value).toBe(2000);
      expect(updated.name).toBe('Update Test'); // Unchanged field preserved
    });
  });
});
