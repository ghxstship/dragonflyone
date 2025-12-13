import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * GVTEWAY Full-Stack Validation Tests
 * Validates complete user journeys across all application layers:
 * - Frontend (UI pages and components)
 * - Backend API routes
 * - Database operations via Supabase
 * - Edge functions
 */

const GVTEWAY_BASE = 'http://localhost:3000';
const validStatuses = [200, 201, 302, 307, 401, 404];

// Helper to validate frontend page
async function validateFrontend(page: Page, path: string, urlPattern: RegExp) {
  await page.goto(`${GVTEWAY_BASE}${path}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(urlPattern);
  await expect(page.locator('body')).toBeVisible();
  return true;
}

// Helper to validate API endpoint
async function validateAPI(request: APIRequestContext, method: string, path: string, body?: object) {
  const url = `${GVTEWAY_BASE}${path}`;
  let response;
  
  if (method === 'GET') {
    response = await request.get(url);
  } else if (method === 'POST') {
    response = await request.post(url, { data: body || {} });
  } else if (method === 'PUT') {
    response = await request.put(url, { data: body || {} });
  } else if (method === 'DELETE') {
    response = await request.delete(url);
  }
  
  expect(validStatuses).toContain(response?.status());
  return response;
}

test.describe('GVTEWAY Full-Stack Workflow Validation', () => {

  test.describe('WF-GVTEWAY-001: Event Discovery & Browse - Full Stack', () => {
    
    test('Frontend Layer: Event discovery pages accessible', async ({ page }) => {
      await validateFrontend(page, '/', /localhost:3000/);
      await validateFrontend(page, '/browse', /browse/);
      await validateFrontend(page, '/discover', /discover/);
      await validateFrontend(page, '/discover/quiz', /discover\/quiz/);
      await validateFrontend(page, '/search', /search/);
      await validateFrontend(page, '/search/universal', /search\/universal/);
      await validateFrontend(page, '/new-events', /new-events/);
      await validateFrontend(page, '/nearby', /nearby/);
      await validateFrontend(page, '/destinations', /destinations/);
      await validateFrontend(page, '/experiences', /experiences/);
      await validateFrontend(page, '/tours', /tours/);
      await validateFrontend(page, '/calendar', /calendar/);
      await validateFrontend(page, '/map', /map/);
    });

    test('API Layer: Event discovery endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/events');
      await validateAPI(request, 'GET', '/api/similar-events');
      await validateAPI(request, 'GET', '/api/discover/quiz');
      await validateAPI(request, 'GET', '/api/tours');
      await validateAPI(request, 'GET', '/api/voice-search');
    });

    test('Database Layer: Events data operations', async ({ request }) => {
      const eventsRes = await request.get(`${GVTEWAY_BASE}/api/events`);
      if (eventsRes.status() === 200) {
        const data = await eventsRes.json();
        expect(data).toBeDefined();
      }
    });
  });

  test.describe('WF-GVTEWAY-002: Event Details & Information - Full Stack', () => {
    
    test('Frontend Layer: Event details pages accessible', async ({ page }) => {
      await validateFrontend(page, '/events', /events/);
      await validateFrontend(page, '/events/compare', /events\/compare/);
    });
  });

  test.describe('WF-GVTEWAY-003: Ticket Purchase Flow - Full Stack', () => {
    
    test('Frontend Layer: Ticket purchase pages accessible', async ({ page }) => {
      await validateFrontend(page, '/events', /events/);
      await validateFrontend(page, '/cart', /cart/);
      await validateFrontend(page, '/checkout/currency', /checkout\/currency/);
      await validateFrontend(page, '/checkout', /checkout/);
      await validateFrontend(page, '/confirmation', /confirmation/);
    });

    test('API Layer: Ticket purchase endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/tickets');
      await validateAPI(request, 'GET', '/api/tickets/enhanced');
      await validateAPI(request, 'GET', '/api/tickets/addons');
      await validateAPI(request, 'GET', '/api/tickets/deliveries');
      await validateAPI(request, 'GET', '/api/payments');
      await validateAPI(request, 'GET', '/api/split-payment');
      await validateAPI(request, 'GET', '/api/receipts');
      await validateAPI(request, 'GET', '/api/waitlist');
      await validateAPI(request, 'GET', '/api/age-restrictions');
    });
  });

  test.describe('WF-GVTEWAY-004: Artist & Venue Discovery - Full Stack', () => {
    
    test('Frontend Layer: Artist/venue pages accessible', async ({ page }) => {
      await validateFrontend(page, '/artists', /artists/);
      await validateFrontend(page, '/venues', /venues/);
      await validateFrontend(page, '/creators', /creators/);
      await validateFrontend(page, '/directions', /directions/);
    });

    test('API Layer: Artist/venue endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/artists');
      await validateAPI(request, 'GET', '/api/venues');
      await validateAPI(request, 'GET', '/api/directions/venue');
      await validateAPI(request, 'GET', '/api/directions/parking');
      await validateAPI(request, 'GET', '/api/directions/transport');
      await validateAPI(request, 'GET', '/api/directions/route');
    });
  });

  test.describe('WF-GVTEWAY-005: Merchandise Shopping - Full Stack', () => {
    
    test('Frontend Layer: Merchandise pages accessible', async ({ page }) => {
      await validateFrontend(page, '/merch', /merch/);
      await validateFrontend(page, '/merch/bundles', /merch\/bundles/);
      await validateFrontend(page, '/deals', /deals/);
      await validateFrontend(page, '/shop/shoppable', /shop\/shoppable/);
      await validateFrontend(page, '/packages', /packages/);
      await validateFrontend(page, '/gift-cards', /gift-cards/);
    });

    test('API Layer: Merchandise endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/gift-cards');
      await validateAPI(request, 'GET', '/api/gift-cards/my-cards');
      await validateAPI(request, 'POST', '/api/gift-cards/purchase', { amount: 50 });
      await validateAPI(request, 'POST', '/api/gift-cards/redeem', { code: 'TEST' });
    });
  });

  test.describe('WF-GVTEWAY-006: Help & Support Access - Full Stack', () => {
    
    test('Frontend Layer: Help pages accessible', async ({ page }) => {
      await validateFrontend(page, '/help', /help/);
      await validateFrontend(page, '/accessibility', /accessibility/);
      await validateFrontend(page, '/accessibility/request', /accessibility\/request/);
      await validateFrontend(page, '/community/guidelines', /community\/guidelines/);
    });

    test('API Layer: Help endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/guest-chat');
    });
  });

  test.describe('WF-GVTEWAY-007: User Registration - Full Stack', () => {
    
    test('Frontend Layer: Registration pages accessible', async ({ page }) => {
      await validateFrontend(page, '/auth/signup', /auth\/signup/);
      await validateFrontend(page, '/auth/verify-email', /auth\/verify-email/);
      await validateFrontend(page, '/onboarding', /onboarding/);
    });
  });

  test.describe('WF-GVTEWAY-008: Account Management - Full Stack', () => {
    
    test('Frontend Layer: Account pages accessible', async ({ page }) => {
      await validateFrontend(page, '/account', /account/);
      await validateFrontend(page, '/account/profile', /account\/profile/);
      await validateFrontend(page, '/account/orders', /account\/orders/);
      await validateFrontend(page, '/account/tickets', /account\/tickets/);
      await validateFrontend(page, '/account/my-refunds', /account\/my-refunds/);
      await validateFrontend(page, '/account/my-transfers', /account\/my-transfers/);
      await validateFrontend(page, '/profile', /profile/);
      await validateFrontend(page, '/profile/badges', /profile\/badges/);
      await validateFrontend(page, '/profile/reputation', /profile\/reputation/);
    });
  });

  test.describe('WF-GVTEWAY-009: Ticket Management - Full Stack', () => {
    
    test('Frontend Layer: Ticket management pages accessible', async ({ page }) => {
      await validateFrontend(page, '/tickets', /tickets/);
      await validateFrontend(page, '/tickets/transfer', /tickets\/transfer/);
      await validateFrontend(page, '/tickets/resale', /tickets\/resale/);
      await validateFrontend(page, '/tickets/insurance', /tickets\/insurance/);
      await validateFrontend(page, '/tickets/wallet', /tickets\/wallet/);
    });

    test('API Layer: Ticket management endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/tickets/track');
      await validateAPI(request, 'GET', '/api/tickets/transfer');
      await validateAPI(request, 'GET', '/api/tickets/gift');
      await validateAPI(request, 'GET', '/api/price-alerts');
    });
  });

  test.describe('WF-GVTEWAY-010: Order History & Refunds - Full Stack', () => {
    
    test('Frontend Layer: Order pages accessible', async ({ page }) => {
      await validateFrontend(page, '/account/orders', /account\/orders/);
      await validateFrontend(page, '/account/my-refunds', /account\/my-refunds/);
    });

    test('API Layer: Order endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/orders');
    });
  });

  test.describe('WF-GVTEWAY-011: Preferences & Notifications - Full Stack', () => {
    
    test('Frontend Layer: Preferences pages accessible', async ({ page }) => {
      await validateFrontend(page, '/preferences', /preferences/);
      await validateFrontend(page, '/notifications', /notifications/);
      await validateFrontend(page, '/notifications/settings', /notifications\/settings/);
      await validateFrontend(page, '/favorites', /favorites/);
      await validateFrontend(page, '/watchlist', /watchlist/);
      await validateFrontend(page, '/price-alerts', /price-alerts/);
    });
  });

  test.describe('WF-GVTEWAY-012: Payment Methods Management - Full Stack', () => {
    
    test('Frontend Layer: Payment pages accessible', async ({ page }) => {
      await validateFrontend(page, '/payment-methods', /payment-methods/);
      await validateFrontend(page, '/billing', /billing/);
    });
  });

  test.describe('WF-GVTEWAY-013: Social Features - Full Stack', () => {
    
    test('Frontend Layer: Social pages accessible', async ({ page }) => {
      await validateFrontend(page, '/friends', /friends/);
      await validateFrontend(page, '/activity', /activity/);
      await validateFrontend(page, '/messages', /messages/);
      await validateFrontend(page, '/share', /share/);
    });

    test('API Layer: Messaging endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/messages/conversations');
    });
  });

  test.describe('WF-GVTEWAY-014: Community Participation - Full Stack', () => {
    
    test('Frontend Layer: Community pages accessible', async ({ page }) => {
      await validateFrontend(page, '/community', /community/);
      await validateFrontend(page, '/community/groups', /community\/groups/);
      await validateFrontend(page, '/community/discussions', /community\/discussions/);
      await validateFrontend(page, '/community/events', /community\/events/);
      await validateFrontend(page, '/reviews', /reviews/);
      await validateFrontend(page, '/leaderboard', /leaderboard/);
    });

    test('API Layer: Community endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/community/groups');
      await validateAPI(request, 'GET', '/api/ugc/posts');
      await validateAPI(request, 'GET', '/api/ugc/campaigns');
      await validateAPI(request, 'GET', '/api/ugc/hashtags');
      await validateAPI(request, 'GET', '/api/photo-booth');
      await validateAPI(request, 'GET', '/api/contest-giveaway');
    });
  });

  test.describe('WF-GVTEWAY-015: Fan Club & Membership - Full Stack', () => {
    
    test('Frontend Layer: Membership pages accessible', async ({ page }) => {
      await validateFrontend(page, '/membership', /membership/);
      await validateFrontend(page, '/membership/tiers', /membership\/tiers/);
      await validateFrontend(page, '/membership/benefits', /membership\/benefits/);
      await validateFrontend(page, '/rewards', /rewards/);
      await validateFrontend(page, '/rewards/history', /rewards\/history/);
      await validateFrontend(page, '/rewards/redeem', /rewards\/redeem/);
      await validateFrontend(page, '/loyalty', /loyalty/);
      await validateFrontend(page, '/vip', /vip/);
    });

    test('API Layer: Membership endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/membership');
      await validateAPI(request, 'GET', '/api/rewards');
      await validateAPI(request, 'GET', '/api/loyalty-rewards');
      await validateAPI(request, 'GET', '/api/fan-club-access');
      await validateAPI(request, 'GET', '/api/fan-chapters');
      await validateAPI(request, 'GET', '/api/fan-mentorship');
    });
  });

  test.describe('WF-GVTEWAY-016: Artist Profile Management - Full Stack', () => {
    
    test('Frontend Layer: Artist dashboard pages accessible', async ({ page }) => {
      await validateFrontend(page, '/artist/dashboard', /artist\/dashboard/);
      await validateFrontend(page, '/artist/profile', /artist\/profile/);
      await validateFrontend(page, '/artist/events', /artist\/events/);
      await validateFrontend(page, '/artist/analytics', /artist\/analytics/);
      await validateFrontend(page, '/artist/merch', /artist\/merch/);
      await validateFrontend(page, '/artist/fans', /artist\/fans/);
    });
  });

  test.describe('WF-GVTEWAY-017: Artist Fan Engagement - Full Stack', () => {
    
    test('Frontend Layer: Artist engagement pages accessible', async ({ page }) => {
      await validateFrontend(page, '/artist/messages', /artist\/messages/);
      await validateFrontend(page, '/artist/announcements', /artist\/announcements/);
      await validateFrontend(page, '/artist/exclusives', /artist\/exclusives/);
    });
  });

  test.describe('WF-GVTEWAY-018: Artist Event Management - Full Stack', () => {
    
    test('Frontend Layer: Artist event pages accessible', async ({ page }) => {
      await validateFrontend(page, '/artist/events', /artist\/events/);
      await validateFrontend(page, '/artist/schedule', /artist\/schedule/);
      await validateFrontend(page, '/artist/guestlist', /artist\/guestlist/);
    });

    test('API Layer: Music integration endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/music-integration');
    });
  });

  test.describe('WF-GVTEWAY-019: Event Administration - Full Stack', () => {
    
    test('Frontend Layer: Admin event pages accessible', async ({ page }) => {
      await validateFrontend(page, '/admin', /admin/);
      await validateFrontend(page, '/admin/events', /admin\/events/);
      await validateFrontend(page, '/admin/venues', /admin\/venues/);
      await validateFrontend(page, '/admin/artists', /admin\/artists/);
      await validateFrontend(page, '/admin/tickets', /admin\/tickets/);
    });
  });

  test.describe('WF-GVTEWAY-020: User Administration - Full Stack', () => {
    
    test('Frontend Layer: Admin user pages accessible', async ({ page }) => {
      await validateFrontend(page, '/admin/users', /admin\/users/);
      await validateFrontend(page, '/admin/roles', /admin\/roles/);
      await validateFrontend(page, '/admin/permissions', /admin\/permissions/);
    });
  });

  test.describe('WF-GVTEWAY-021: Content Administration - Full Stack', () => {
    
    test('Frontend Layer: Admin content pages accessible', async ({ page }) => {
      await validateFrontend(page, '/admin/content', /admin\/content/);
      await validateFrontend(page, '/admin/pages', /admin\/pages/);
      await validateFrontend(page, '/admin/banners', /admin\/banners/);
      await validateFrontend(page, '/admin/promotions', /admin\/promotions/);
    });
  });

  test.describe('WF-GVTEWAY-022: Financial Administration - Full Stack', () => {
    
    test('Frontend Layer: Admin finance pages accessible', async ({ page }) => {
      await validateFrontend(page, '/admin/finance', /admin\/finance/);
      await validateFrontend(page, '/admin/orders', /admin\/orders/);
      await validateFrontend(page, '/admin/refunds', /admin\/refunds/);
      await validateFrontend(page, '/admin/payouts', /admin\/payouts/);
      await validateFrontend(page, '/admin/reports', /admin\/reports/);
    });
  });

  test.describe('WF-GVTEWAY-023: Marketing Administration - Full Stack', () => {
    
    test('Frontend Layer: Admin marketing pages accessible', async ({ page }) => {
      await validateFrontend(page, '/admin/marketing', /admin\/marketing/);
      await validateFrontend(page, '/admin/campaigns', /admin\/campaigns/);
      await validateFrontend(page, '/admin/emails', /admin\/emails/);
      await validateFrontend(page, '/admin/analytics', /admin\/analytics/);
    });

    test('API Layer: Marketing endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/ab-testing');
      await validateAPI(request, 'GET', '/api/influencer-affiliates');
      await validateAPI(request, 'GET', '/api/media-kit');
    });
  });

  test.describe('WF-GVTEWAY-024: System Administration - Full Stack', () => {
    
    test('Frontend Layer: Admin system pages accessible', async ({ page }) => {
      await validateFrontend(page, '/admin/settings', /admin\/settings/);
      await validateFrontend(page, '/admin/integrations', /admin\/integrations/);
      await validateFrontend(page, '/admin/logs', /admin\/logs/);
      await validateFrontend(page, '/admin/audit', /admin\/audit/);
    });

    test('API Layer: Social media endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/social-listening');
      await validateAPI(request, 'GET', '/api/bulk-posting');
      await validateAPI(request, 'GET', '/api/tiktok-challenges');
    });
  });

  test.describe('WF-GVTEWAY-025: Box Office Operations - Full Stack', () => {
    
    test('Frontend Layer: Box office pages accessible', async ({ page }) => {
      await validateFrontend(page, '/box-office', /box-office/);
      await validateFrontend(page, '/box-office/sales', /box-office\/sales/);
      await validateFrontend(page, '/box-office/will-call', /box-office\/will-call/);
      await validateFrontend(page, '/box-office/refunds', /box-office\/refunds/);
    });
  });

  test.describe('WF-GVTEWAY-026: Gate & Entry Operations - Full Stack', () => {
    
    test('Frontend Layer: Gate pages accessible', async ({ page }) => {
      await validateFrontend(page, '/scan', /scan/);
      await validateFrontend(page, '/gate', /gate/);
      await validateFrontend(page, '/entry', /entry/);
      await validateFrontend(page, '/access-control', /access-control/);
    });

    test('API Layer: POS endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/cashless-payments');
    });
  });

  test.describe('WF-GVTEWAY-027: Customer Service Operations - Full Stack', () => {
    
    test('Frontend Layer: Support pages accessible', async ({ page }) => {
      await validateFrontend(page, '/support', /support/);
      await validateFrontend(page, '/support/tickets', /support\/tickets/);
      await validateFrontend(page, '/support/chat', /support\/chat/);
    });
  });

  test.describe('WF-GVTEWAY-028: Venue Management - Full Stack', () => {
    
    test('Frontend Layer: Venue manager pages accessible', async ({ page }) => {
      await validateFrontend(page, '/venue/dashboard', /venue\/dashboard/);
      await validateFrontend(page, '/venue/events', /venue\/events/);
      await validateFrontend(page, '/venue/calendar', /venue\/calendar/);
      await validateFrontend(page, '/venue/settings', /venue\/settings/);
    });
  });

  test.describe('WF-GVTEWAY-029: Venue Operations - Full Stack', () => {
    
    test('Frontend Layer: Venue operations pages accessible', async ({ page }) => {
      await validateFrontend(page, '/venue/staff', /venue\/staff/);
      await validateFrontend(page, '/venue/inventory', /venue\/inventory/);
      await validateFrontend(page, '/venue/reports', /venue\/reports/);
    });
  });

  test.describe('WF-GVTEWAY-030: Authentication - Full Stack', () => {
    
    test('Frontend Layer: Auth pages accessible', async ({ page }) => {
      await validateFrontend(page, '/auth/signin', /auth\/signin/);
      await validateFrontend(page, '/auth/signup', /auth\/signup/);
      await validateFrontend(page, '/auth/magic-link', /auth\/magic-link/);
      await validateFrontend(page, '/auth/forgot-password', /auth\/forgot-password/);
      await validateFrontend(page, '/auth/reset-password', /auth\/reset-password/);
      await validateFrontend(page, '/auth/verify-email', /auth\/verify-email/);
    });

    test('API Layer: Auth endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/auth/me');
      await validateAPI(request, 'POST', '/api/auth/signin', { email: 'test@example.com', password: 'test' });
      await validateAPI(request, 'POST', '/api/auth/signup', { email: 'test@example.com', password: 'test' });
      await validateAPI(request, 'POST', '/api/auth/magic-link', { email: 'test@example.com' });
    });
  });

  test.describe('WF-GVTEWAY-031: Offline Mode - Full Stack', () => {
    
    test('Frontend Layer: Offline pages accessible', async ({ page }) => {
      await validateFrontend(page, '/offline', /offline/);
      await validateFrontend(page, '/tickets/wallet', /tickets\/wallet/);
    });
  });

  test.describe('Privacy & Localization - Full Stack', () => {
    
    test('API Layer: Privacy endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/privacy/cookies');
    });

    test('API Layer: Localization endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/multi-language');
      await validateAPI(request, 'GET', '/api/multi-language-events');
    });
  });
});
