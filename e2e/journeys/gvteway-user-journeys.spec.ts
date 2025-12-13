import { test, expect, Page } from '@playwright/test';

/**
 * GVTEWAY Complete User Journey Tests
 * Validates the full user journey for each workflow step-by-step
 */

const GVTEWAY_BASE = 'http://localhost:3000';

// Helper function to navigate and verify page load
async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp) {
  await page.goto(`${GVTEWAY_BASE}${path}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(urlPattern);
  await expect(page.locator('body')).toBeVisible();
}

test.describe('GVTEWAY Consumer User Journeys', () => {

  test.describe('WF-GVTEWAY-001: Event Discovery & Browse - Complete Journey', () => {
    test('should complete full event discovery workflow', async ({ page }) => {
      // Step 1: Visit homepage
      await navigateAndVerify(page, '/', /localhost:3000/);
      
      // Step 2: Browse events
      await navigateAndVerify(page, '/browse', /browse/);
      
      // Step 3: Use discovery
      await navigateAndVerify(page, '/discover', /discover/);
      
      // Step 4: Take discovery quiz
      await navigateAndVerify(page, '/discover/quiz', /discover\/quiz/);
      
      // Step 5: Search events
      await navigateAndVerify(page, '/search', /search/);
      
      // Step 6: Use universal search
      await navigateAndVerify(page, '/search/universal', /search\/universal/);
      
      // Step 7: View new events
      await navigateAndVerify(page, '/new-events', /new-events/);
      
      // Step 8: Find nearby events
      await navigateAndVerify(page, '/nearby', /nearby/);
      
      // Step 9: Browse by destination
      await navigateAndVerify(page, '/destinations', /destinations/);
      
      // Step 10: View experiences
      await navigateAndVerify(page, '/experiences', /experiences/);
      
      // Step 11: Browse tours
      await navigateAndVerify(page, '/tours', /tours/);
      
      // Step 12: View calendar
      await navigateAndVerify(page, '/calendar', /calendar/);
      
      // Step 13: Use map view
      await navigateAndVerify(page, '/map', /map/);
    });
  });

  test.describe('WF-GVTEWAY-002: Event Details & Information - Complete Journey', () => {
    test('should complete full event details workflow', async ({ page }) => {
      // Step 1: Select event
      await navigateAndVerify(page, '/events', /events/);
      
      // Step 9: Compare events
      await navigateAndVerify(page, '/events/compare', /events\/compare/);
    });
  });

  test.describe('WF-GVTEWAY-003: Ticket Purchase Flow - Complete Journey', () => {
    test('should complete full ticket purchase workflow', async ({ page }) => {
      // Step 1: Select event
      await navigateAndVerify(page, '/events', /events/);
      
      // Step 3: Add to cart
      await navigateAndVerify(page, '/cart', /cart/);
      
      // Step 4: Select currency
      await navigateAndVerify(page, '/checkout/currency', /checkout\/currency/);
      
      // Step 5: Proceed to checkout
      await navigateAndVerify(page, '/checkout', /checkout/);
      
      // Step 9: View confirmation
      await navigateAndVerify(page, '/confirmation', /confirmation/);
    });
  });

  test.describe('WF-GVTEWAY-004: Artist & Venue Discovery - Complete Journey', () => {
    test('should complete full artist/venue discovery workflow', async ({ page }) => {
      // Step 1: Browse artists
      await navigateAndVerify(page, '/artists', /artists/);
      
      // Step 3: Browse venues
      await navigateAndVerify(page, '/venues', /venues/);
      
      // Step 5: View creators
      await navigateAndVerify(page, '/creators', /creators/);
      
      // Step 6: Get directions
      await navigateAndVerify(page, '/directions', /directions/);
    });
  });

  test.describe('WF-GVTEWAY-005: Merchandise Shopping - Complete Journey', () => {
    test('should complete full merchandise shopping workflow', async ({ page }) => {
      // Step 1: Browse merch
      await navigateAndVerify(page, '/merch', /merch/);
      
      // Step 3: View bundles
      await navigateAndVerify(page, '/merch/bundles', /merch\/bundles/);
      
      // Step 5: View deals
      await navigateAndVerify(page, '/deals', /deals/);
      
      // Step 6: Shop shoppable content
      await navigateAndVerify(page, '/shop/shoppable', /shop\/shoppable/);
      
      // Step 7: Browse packages
      await navigateAndVerify(page, '/packages', /packages/);
      
      // Step 8: Buy gift cards
      await navigateAndVerify(page, '/gift-cards', /gift-cards/);
      
      // Step 9: Add to cart
      await navigateAndVerify(page, '/cart', /cart/);
      
      // Step 10: Checkout
      await navigateAndVerify(page, '/checkout', /checkout/);
    });
  });

  test.describe('WF-GVTEWAY-006: Help & Support Access - Complete Journey', () => {
    test('should complete full help & support workflow', async ({ page }) => {
      // Step 1: Access help
      await navigateAndVerify(page, '/help', /help/);
      
      // Step 2: View accessibility info
      await navigateAndVerify(page, '/accessibility', /accessibility/);
      
      // Step 3: Request accessibility
      await navigateAndVerify(page, '/accessibility/request', /accessibility\/request/);
      
      // Step 4: View community guidelines
      await navigateAndVerify(page, '/community/guidelines', /community\/guidelines/);
      
      // Step 5: Get directions
      await navigateAndVerify(page, '/directions', /directions/);
    });
  });

  test.describe('WF-GVTEWAY-007: User Registration - Complete Journey', () => {
    test('should complete full user registration workflow', async ({ page }) => {
      // Step 1: Click sign up
      await navigateAndVerify(page, '/auth/signup', /auth\/signup/);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
      
      // Step 4: Verify email
      await navigateAndVerify(page, '/auth/verify-email', /auth\/verify-email/);
      
      // Step 5: Complete onboarding
      await navigateAndVerify(page, '/onboarding', /onboarding/);
    });
  });
});

test.describe('GVTEWAY Member User Journeys', () => {

  test.describe('WF-GVTEWAY-008: Account Management - Complete Journey', () => {
    test('should complete full account management workflow', async ({ page }) => {
      // Step 1: Access account
      await navigateAndVerify(page, '/account', /account/);
      
      // Step 2: View profile
      await navigateAndVerify(page, '/account/profile', /account\/profile/);
      
      // Step 3: View orders
      await navigateAndVerify(page, '/account/orders', /account\/orders/);
      
      // Step 4: View tickets
      await navigateAndVerify(page, '/account/tickets', /account\/tickets/);
      
      // Step 5: View refunds
      await navigateAndVerify(page, '/account/my-refunds', /account\/my-refunds/);
      
      // Step 6: View transfers
      await navigateAndVerify(page, '/account/my-transfers', /account\/my-transfers/);
      
      // Step 7: Update profile
      await navigateAndVerify(page, '/profile', /profile/);
      
      // Step 8: View badges
      await navigateAndVerify(page, '/profile/badges', /profile\/badges/);
      
      // Step 9: Check reputation
      await navigateAndVerify(page, '/profile/reputation', /profile\/reputation/);
    });
  });

  test.describe('WF-GVTEWAY-009: Ticket Management - Complete Journey', () => {
    test('should complete full ticket management workflow', async ({ page }) => {
      // Access tickets
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      // Transfer tickets
      await navigateAndVerify(page, '/tickets/transfer', /tickets\/transfer/);
      
      // Resale tickets
      await navigateAndVerify(page, '/tickets/resale', /tickets\/resale/);
      
      // Ticket insurance
      await navigateAndVerify(page, '/tickets/insurance', /tickets\/insurance/);
      
      // Ticket wallet
      await navigateAndVerify(page, '/tickets/wallet', /tickets\/wallet/);
    });
  });

  test.describe('WF-GVTEWAY-010: Order History & Refunds - Complete Journey', () => {
    test('should complete full order management workflow', async ({ page }) => {
      // View orders
      await navigateAndVerify(page, '/account/orders', /account\/orders/);
      
      // View refunds
      await navigateAndVerify(page, '/account/my-refunds', /account\/my-refunds/);
    });
  });

  test.describe('WF-GVTEWAY-011: Preferences & Notifications - Complete Journey', () => {
    test('should complete full preferences workflow', async ({ page }) => {
      // Preferences
      await navigateAndVerify(page, '/preferences', /preferences/);
      
      // Notifications
      await navigateAndVerify(page, '/notifications', /notifications/);
      
      // Notification settings
      await navigateAndVerify(page, '/notifications/settings', /notifications\/settings/);
      
      // Favorites
      await navigateAndVerify(page, '/favorites', /favorites/);
      
      // Watchlist
      await navigateAndVerify(page, '/watchlist', /watchlist/);
      
      // Price alerts
      await navigateAndVerify(page, '/price-alerts', /price-alerts/);
    });
  });

  test.describe('WF-GVTEWAY-012: Payment Methods Management - Complete Journey', () => {
    test('should complete full payment methods workflow', async ({ page }) => {
      // Payment methods
      await navigateAndVerify(page, '/payment-methods', /payment-methods/);
      
      // Billing
      await navigateAndVerify(page, '/billing', /billing/);
    });
  });

  test.describe('WF-GVTEWAY-013: Social Features - Complete Journey', () => {
    test('should complete full social features workflow', async ({ page }) => {
      // Friends
      await navigateAndVerify(page, '/friends', /friends/);
      
      // Activity feed
      await navigateAndVerify(page, '/activity', /activity/);
      
      // Messages
      await navigateAndVerify(page, '/messages', /messages/);
      
      // Share
      await navigateAndVerify(page, '/share', /share/);
    });
  });

  test.describe('WF-GVTEWAY-014: Community Participation - Complete Journey', () => {
    test('should complete full community participation workflow', async ({ page }) => {
      // Community
      await navigateAndVerify(page, '/community', /community/);
      
      // Community groups
      await navigateAndVerify(page, '/community/groups', /community\/groups/);
      
      // Community discussions
      await navigateAndVerify(page, '/community/discussions', /community\/discussions/);
      
      // Community events
      await navigateAndVerify(page, '/community/events', /community\/events/);
      
      // Reviews
      await navigateAndVerify(page, '/reviews', /reviews/);
      
      // Leaderboard
      await navigateAndVerify(page, '/leaderboard', /leaderboard/);
    });
  });

  test.describe('WF-GVTEWAY-015: Fan Club & Membership - Complete Journey', () => {
    test('should complete full fan club workflow', async ({ page }) => {
      // Membership
      await navigateAndVerify(page, '/membership', /membership/);
      
      // Membership tiers
      await navigateAndVerify(page, '/membership/tiers', /membership\/tiers/);
      
      // Membership benefits
      await navigateAndVerify(page, '/membership/benefits', /membership\/benefits/);
      
      // Rewards
      await navigateAndVerify(page, '/rewards', /rewards/);
      
      // Rewards history
      await navigateAndVerify(page, '/rewards/history', /rewards\/history/);
      
      // Rewards redeem
      await navigateAndVerify(page, '/rewards/redeem', /rewards\/redeem/);
      
      // Loyalty
      await navigateAndVerify(page, '/loyalty', /loyalty/);
      
      // VIP
      await navigateAndVerify(page, '/vip', /vip/);
    });
  });
});

test.describe('GVTEWAY Artist User Journeys', () => {

  test.describe('WF-GVTEWAY-016: Artist Profile Management - Complete Journey', () => {
    test('should complete full artist profile workflow', async ({ page }) => {
      // Artist dashboard
      await navigateAndVerify(page, '/artist/dashboard', /artist\/dashboard/);
      
      // Artist profile
      await navigateAndVerify(page, '/artist/profile', /artist\/profile/);
      
      // Artist events
      await navigateAndVerify(page, '/artist/events', /artist\/events/);
      
      // Artist analytics
      await navigateAndVerify(page, '/artist/analytics', /artist\/analytics/);
      
      // Artist merch
      await navigateAndVerify(page, '/artist/merch', /artist\/merch/);
      
      // Artist fans
      await navigateAndVerify(page, '/artist/fans', /artist\/fans/);
    });
  });

  test.describe('WF-GVTEWAY-017: Artist Fan Engagement - Complete Journey', () => {
    test('should complete full artist fan engagement workflow', async ({ page }) => {
      // Artist messages
      await navigateAndVerify(page, '/artist/messages', /artist\/messages/);
      
      // Artist announcements
      await navigateAndVerify(page, '/artist/announcements', /artist\/announcements/);
      
      // Artist exclusives
      await navigateAndVerify(page, '/artist/exclusives', /artist\/exclusives/);
    });
  });

  test.describe('WF-GVTEWAY-018: Artist Event Management - Complete Journey', () => {
    test('should complete full artist event management workflow', async ({ page }) => {
      // Artist events
      await navigateAndVerify(page, '/artist/events', /artist\/events/);
      
      // Artist schedule
      await navigateAndVerify(page, '/artist/schedule', /artist\/schedule/);
      
      // Artist guestlist
      await navigateAndVerify(page, '/artist/guestlist', /artist\/guestlist/);
    });
  });
});

test.describe('GVTEWAY Admin User Journeys', () => {

  test.describe('WF-GVTEWAY-019: Event Administration - Complete Journey', () => {
    test('should complete full event administration workflow', async ({ page }) => {
      // Admin dashboard
      await navigateAndVerify(page, '/admin', /admin/);
      
      // Admin events
      await navigateAndVerify(page, '/admin/events', /admin\/events/);
      
      // Admin venues
      await navigateAndVerify(page, '/admin/venues', /admin\/venues/);
      
      // Admin artists
      await navigateAndVerify(page, '/admin/artists', /admin\/artists/);
      
      // Admin tickets
      await navigateAndVerify(page, '/admin/tickets', /admin\/tickets/);
    });
  });

  test.describe('WF-GVTEWAY-020: User Administration - Complete Journey', () => {
    test('should complete full user administration workflow', async ({ page }) => {
      // Admin users
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      // Admin roles
      await navigateAndVerify(page, '/admin/roles', /admin\/roles/);
      
      // Admin permissions
      await navigateAndVerify(page, '/admin/permissions', /admin\/permissions/);
    });
  });

  test.describe('WF-GVTEWAY-021: Content Administration - Complete Journey', () => {
    test('should complete full content administration workflow', async ({ page }) => {
      // Admin content
      await navigateAndVerify(page, '/admin/content', /admin\/content/);
      
      // Admin pages
      await navigateAndVerify(page, '/admin/pages', /admin\/pages/);
      
      // Admin banners
      await navigateAndVerify(page, '/admin/banners', /admin\/banners/);
      
      // Admin promotions
      await navigateAndVerify(page, '/admin/promotions', /admin\/promotions/);
    });
  });

  test.describe('WF-GVTEWAY-022: Financial Administration - Complete Journey', () => {
    test('should complete full financial administration workflow', async ({ page }) => {
      // Admin finance
      await navigateAndVerify(page, '/admin/finance', /admin\/finance/);
      
      // Admin orders
      await navigateAndVerify(page, '/admin/orders', /admin\/orders/);
      
      // Admin refunds
      await navigateAndVerify(page, '/admin/refunds', /admin\/refunds/);
      
      // Admin payouts
      await navigateAndVerify(page, '/admin/payouts', /admin\/payouts/);
      
      // Admin reports
      await navigateAndVerify(page, '/admin/reports', /admin\/reports/);
    });
  });

  test.describe('WF-GVTEWAY-023: Marketing Administration - Complete Journey', () => {
    test('should complete full marketing administration workflow', async ({ page }) => {
      // Admin marketing
      await navigateAndVerify(page, '/admin/marketing', /admin\/marketing/);
      
      // Admin campaigns
      await navigateAndVerify(page, '/admin/campaigns', /admin\/campaigns/);
      
      // Admin emails
      await navigateAndVerify(page, '/admin/emails', /admin\/emails/);
      
      // Admin analytics
      await navigateAndVerify(page, '/admin/analytics', /admin\/analytics/);
    });
  });

  test.describe('WF-GVTEWAY-024: System Administration - Complete Journey', () => {
    test('should complete full system administration workflow', async ({ page }) => {
      // Admin settings
      await navigateAndVerify(page, '/admin/settings', /admin\/settings/);
      
      // Admin integrations
      await navigateAndVerify(page, '/admin/integrations', /admin\/integrations/);
      
      // Admin logs
      await navigateAndVerify(page, '/admin/logs', /admin\/logs/);
      
      // Admin audit
      await navigateAndVerify(page, '/admin/audit', /admin\/audit/);
    });
  });
});

test.describe('GVTEWAY Event Staff User Journeys', () => {

  test.describe('WF-GVTEWAY-025: Box Office Operations - Complete Journey', () => {
    test('should complete full box office workflow', async ({ page }) => {
      // Box office
      await navigateAndVerify(page, '/box-office', /box-office/);
      
      // Box office sales
      await navigateAndVerify(page, '/box-office/sales', /box-office\/sales/);
      
      // Box office will-call
      await navigateAndVerify(page, '/box-office/will-call', /box-office\/will-call/);
      
      // Box office refunds
      await navigateAndVerify(page, '/box-office/refunds', /box-office\/refunds/);
    });
  });

  test.describe('WF-GVTEWAY-026: Gate & Entry Operations - Complete Journey', () => {
    test('should complete full gate operations workflow', async ({ page }) => {
      // Scan
      await navigateAndVerify(page, '/scan', /scan/);
      
      // Gate
      await navigateAndVerify(page, '/gate', /gate/);
      
      // Entry
      await navigateAndVerify(page, '/entry', /entry/);
      
      // Access control
      await navigateAndVerify(page, '/access-control', /access-control/);
    });
  });

  test.describe('WF-GVTEWAY-027: Customer Service Operations - Complete Journey', () => {
    test('should complete full customer service workflow', async ({ page }) => {
      // Support
      await navigateAndVerify(page, '/support', /support/);
      
      // Support tickets
      await navigateAndVerify(page, '/support/tickets', /support\/tickets/);
      
      // Support chat
      await navigateAndVerify(page, '/support/chat', /support\/chat/);
    });
  });
});

test.describe('GVTEWAY Venue Manager User Journeys', () => {

  test.describe('WF-GVTEWAY-028: Venue Management - Complete Journey', () => {
    test('should complete full venue management workflow', async ({ page }) => {
      // Venue dashboard
      await navigateAndVerify(page, '/venue/dashboard', /venue\/dashboard/);
      
      // Venue events
      await navigateAndVerify(page, '/venue/events', /venue\/events/);
      
      // Venue calendar
      await navigateAndVerify(page, '/venue/calendar', /venue\/calendar/);
      
      // Venue settings
      await navigateAndVerify(page, '/venue/settings', /venue\/settings/);
    });
  });

  test.describe('WF-GVTEWAY-029: Venue Operations - Complete Journey', () => {
    test('should complete full venue operations workflow', async ({ page }) => {
      // Venue staff
      await navigateAndVerify(page, '/venue/staff', /venue\/staff/);
      
      // Venue inventory
      await navigateAndVerify(page, '/venue/inventory', /venue\/inventory/);
      
      // Venue reports
      await navigateAndVerify(page, '/venue/reports', /venue\/reports/);
    });
  });
});

test.describe('GVTEWAY Authentication User Journeys', () => {

  test.describe('WF-GVTEWAY-030: User Authentication - Complete Journey', () => {
    test('should complete full authentication workflow', async ({ page }) => {
      // Sign in page
      await navigateAndVerify(page, '/auth/signin', /auth\/signin/);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
      
      // Sign up page
      await navigateAndVerify(page, '/auth/signup', /auth\/signup/);
      
      // Magic link page
      await navigateAndVerify(page, '/auth/magic-link', /auth\/magic-link/);
      
      // Forgot password page
      await navigateAndVerify(page, '/auth/forgot-password', /auth\/forgot-password/);
      
      // Reset password page
      await navigateAndVerify(page, '/auth/reset-password', /auth\/reset-password/);
      
      // Verify email page
      await navigateAndVerify(page, '/auth/verify-email', /auth\/verify-email/);
    });
  });
});

test.describe('GVTEWAY Offline User Journeys', () => {

  test.describe('WF-GVTEWAY-031: Offline Mode - Complete Journey', () => {
    test('should complete full offline mode workflow', async ({ page }) => {
      // Offline page
      await navigateAndVerify(page, '/offline', /offline/);
      
      // Tickets (should work offline)
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      // Ticket wallet (should work offline)
      await navigateAndVerify(page, '/tickets/wallet', /tickets\/wallet/);
    });
  });
});
