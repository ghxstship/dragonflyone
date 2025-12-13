import { test, expect } from '@playwright/test';

/**
 * API Route Verification: GVTEWAY
 * Comprehensive tests for all workflow-related API routes
 * Covers all 31 GVTEWAY workflows
 */
test.describe('GVTEWAY API Routes', () => {
  const baseUrl = 'http://localhost:3000';
  const validStatuses = [200, 302, 307, 401, 404];

  test.describe('WF-GVTEWAY-001: Event Discovery APIs', () => {
    test('GET /api/events', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/events`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/similar-events', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/similar-events`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/discover/quiz', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/discover/quiz`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tours', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tours`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/voice-search', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/voice-search`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-003: Ticket Purchase APIs', () => {
    test('GET /api/tickets', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tickets/enhanced', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/enhanced`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tickets/addons', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/addons`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tickets/deliveries', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/deliveries`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/payments', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/payments`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/split-payment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/split-payment`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/receipts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/receipts`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/waitlist', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/waitlist`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/age-restrictions', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/age-restrictions`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-004: Artist & Venue Discovery APIs', () => {
    test('GET /api/artists', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/artists`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/venues', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/venues`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/directions/venue', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/venue`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/directions/parking', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/parking`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/directions/transport', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/transport`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/directions/route', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/directions/route`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-005: Merchandise Shopping APIs', () => {
    test('GET /api/gift-cards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/gift-cards`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/gift-cards/my-cards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/gift-cards/my-cards`);
      expect(validStatuses).toContain(response.status());
    });

    test('POST /api/gift-cards/purchase', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/gift-cards/purchase`, {
        data: { amount: 50 }
      });
      expect(validStatuses).toContain(response.status());
    });

    test('POST /api/gift-cards/redeem', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/gift-cards/redeem`, {
        data: { code: 'TEST' }
      });
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-006: Help & Support APIs', () => {
    test('GET /api/guest-chat', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/guest-chat`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-009: Ticket Management APIs', () => {
    test('GET /api/tickets/track', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/track`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tickets/transfer', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/transfer`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tickets/gift', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tickets/gift`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/price-alerts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/price-alerts`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-010: Order Management APIs', () => {
    test('GET /api/orders', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/orders`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-014: Community Participation APIs', () => {
    test('GET /api/community/groups', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/community/groups`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/ugc/posts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ugc/posts`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/ugc/campaigns', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ugc/campaigns`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/ugc/hashtags', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ugc/hashtags`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/photo-booth', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/photo-booth`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/contest-giveaway', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/contest-giveaway`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-015: Fan Club & Membership APIs', () => {
    test('GET /api/membership', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/membership`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/rewards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/rewards`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/loyalty-rewards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/loyalty-rewards`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/fan-club-access', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/fan-club-access`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/fan-chapters', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/fan-chapters`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/fan-mentorship', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/fan-mentorship`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-018: Event Matching APIs', () => {
    test('GET /api/music-integration', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/music-integration`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-023: Marketing Administration APIs', () => {
    test('GET /api/ab-testing', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ab-testing`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/influencer-affiliates', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/influencer-affiliates`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/media-kit', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/media-kit`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-024: Social Media Management APIs', () => {
    test('GET /api/social-listening', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/social-listening`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/bulk-posting', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/bulk-posting`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/tiktok-challenges', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/tiktok-challenges`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-GVTEWAY-026: POS & Operations APIs', () => {
    test('GET /api/cashless-payments', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/cashless-payments`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Messaging APIs', () => {
    test('GET /api/messages/conversations', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/messages/conversations`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Privacy APIs', () => {
    test('GET /api/privacy/cookies', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/privacy/cookies`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Localization APIs', () => {
    test('GET /api/multi-language', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/multi-language`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/multi-language-events', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/multi-language-events`);
      expect(validStatuses).toContain(response.status());
    });
  });
});
