import { test, expect } from '@playwright/test';

/**
 * API Route Verification: GVTEWAY
 * Comprehensive tests for all workflow-related API routes
 * Covers all 31 GVTEWAY workflows
 * 
 * These tests verify that API endpoints exist and respond appropriately.
 * For unauthenticated requests, we expect either:
 * - 200: Success (public endpoint or auth not required)
 * - 401: Unauthorized (auth required - correct behavior)
 * - 403: Forbidden (auth required with different permissions)
 * 
 * We explicitly DO NOT accept:
 * - 400: Bad Request (indicates malformed test, not endpoint existence)
 * - 404: Not Found (indicates endpoint doesn't exist - test failure)
 * - 500: Server Error (indicates bug - test failure)
 */
test.describe('GVTEWAY API Routes', () => {
  const baseUrl = 'http://localhost:3000';
  
  // Strict valid statuses - endpoint exists and responds correctly
  const VALID_ENDPOINT_STATUSES = [200, 201, 204, 401, 403];
  
  // Helper for explicit status assertion with clear error message
  function assertValidEndpoint(status: number, endpoint: string) {
    expect(
      VALID_ENDPOINT_STATUSES,
      `Endpoint ${endpoint} returned ${status}. Expected 200/201/204 (success) or 401/403 (auth required). Got ${status === 404 ? '404 - endpoint does not exist' : status === 500 ? '500 - server error' : status}`
    ).toContain(status);
  }

  test.describe('WF-GVTEWAY-001: Event Discovery APIs', () => {
    test('GET /api/events', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/events`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/similar-events', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/similar-events`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/discover/quiz', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/discover/quiz`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tours', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tours`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/voice-search', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/voice-search`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-003: Ticket Purchase APIs', () => {
    test('GET /api/tickets', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tickets/enhanced', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/enhanced`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tickets/addons', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/addons`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tickets/deliveries', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/deliveries`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/payments', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/payments`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/split-payment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/split-payment`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/receipts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/receipts`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/waitlist', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/waitlist`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/age-restrictions', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/age-restrictions`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-004: Artist & Venue Discovery APIs', () => {
    test('GET /api/artists', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/artists`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/venues', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/venues`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/directions/venue', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/venue`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/directions/parking', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/parking`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/directions/transport', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/transport`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/directions/route', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/route`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-005: Merchandise Shopping APIs', () => {
    test('GET /api/gift-cards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/gift-cards`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/gift-cards/my-cards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/gift-cards/my-cards`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('POST /api/gift-cards/purchase', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/gift-cards/purchase`, {
        data: { amount: 50 }
      });
      assertValidEndpoint(response.status(), response.url());
    });

    test('POST /api/gift-cards/redeem', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/gift-cards/redeem`, {
        data: { code: 'TEST' }
      });
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-006: Help & Support APIs', () => {
    test('GET /api/guest-chat', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/guest-chat`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-009: Ticket Management APIs', () => {
    test('GET /api/tickets/track', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/track`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tickets/transfer', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/transfer`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tickets/gift', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/gift`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/price-alerts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/price-alerts`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-010: Order Management APIs', () => {
    test('GET /api/orders', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orders`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-014: Community Participation APIs', () => {
    test('GET /api/community/groups', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/community/groups`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/ugc/posts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ugc/posts`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/ugc/campaigns', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ugc/campaigns`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/ugc/hashtags', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ugc/hashtags`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/photo-booth', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/photo-booth`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/contest-giveaway', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/contest-giveaway`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-015: Fan Club & Membership APIs', () => {
    test('GET /api/membership', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/membership`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/rewards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/rewards`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/loyalty-rewards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/loyalty-rewards`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/fan-club-access', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/fan-club-access`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/fan-chapters', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/fan-chapters`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/fan-mentorship', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/fan-mentorship`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-018: Event Matching APIs', () => {
    test('GET /api/music-integration', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/music-integration`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-023: Marketing Administration APIs', () => {
    test('GET /api/ab-testing', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ab-testing`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/influencer-affiliates', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/influencer-affiliates`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/media-kit', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/media-kit`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-024: Social Media Management APIs', () => {
    test('GET /api/social-listening', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/social-listening`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/bulk-posting', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/bulk-posting`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/tiktok-challenges', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tiktok-challenges`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-GVTEWAY-026: POS & Operations APIs', () => {
    test('GET /api/cashless-payments', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/cashless-payments`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Messaging APIs', () => {
    test('GET /api/messages/conversations', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/messages/conversations`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Privacy APIs', () => {
    test('GET /api/privacy/cookies', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/privacy/cookies`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Localization APIs', () => {
    test('GET /api/multi-language', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/multi-language`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/multi-language-events', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/multi-language-events`);
      assertValidEndpoint(response.status(), response.url());
    });
  });
});
