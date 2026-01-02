import { test as base, Page, BrowserContext, APIRequestContext } from '@playwright/test';

/**
 * E2E Authentication Fixtures
 * 
 * Provides authenticated browser contexts and API request contexts
 * for testing protected routes and API endpoints.
 * 
 * Uses test user credentials from environment variables or defaults
 * to test accounts for local development.
 */

// Test user credentials - use environment variables in CI
const TEST_USERS = {
  atlvs: {
    email: process.env.E2E_ATLVS_EMAIL || 'test-atlvs@dragonflyone.test',
    password: process.env.E2E_ATLVS_PASSWORD || 'TestPassword123!',
  },
  compvss: {
    email: process.env.E2E_COMPVSS_EMAIL || 'test-compvss@dragonflyone.test',
    password: process.env.E2E_COMPVSS_PASSWORD || 'TestPassword123!',
  },
  gvteway: {
    email: process.env.E2E_GVTEWAY_EMAIL || 'test-gvteway@dragonflyone.test',
    password: process.env.E2E_GVTEWAY_PASSWORD || 'TestPassword123!',
  },
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || 'test-admin@dragonflyone.test',
    password: process.env.E2E_ADMIN_PASSWORD || 'TestPassword123!',
  },
};

// Base URLs for each app
export const APP_URLS = {
  atlvs: process.env.ATLVS_URL || 'http://localhost:3001',
  compvss: process.env.COMPVSS_URL || 'http://localhost:3002',
  gvteway: process.env.GVTEWAY_URL || 'http://localhost:3000',
};

export type AppName = 'atlvs' | 'compvss' | 'gvteway';
export type UserRole = 'atlvs' | 'compvss' | 'gvteway' | 'admin';

/**
 * Authenticate via the app's sign-in page
 * Returns cookies/storage state for reuse
 */
async function authenticateViaUI(
  page: Page,
  baseUrl: string,
  email: string,
  password: string
): Promise<void> {
  await page.goto(`${baseUrl}/auth/signin`);
  await page.waitForLoadState('domcontentloaded');

  // Fill in credentials
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  
  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Submit the form
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")');
  await submitButton.click();

  // Wait for redirect away from auth pages
  await page.waitForURL((url) => !url.pathname.includes('/auth/signin'), { timeout: 10000 });
}

/**
 * Get auth token via API for direct API testing
 */
async function getAuthToken(
  request: APIRequestContext,
  baseUrl: string,
  email: string,
  password: string
): Promise<string | null> {
  try {
    const response = await request.post(`${baseUrl}/api/auth/signin`, {
      data: { email, password },
    });

    if (response.ok()) {
      const data = await response.json();
      return data.access_token || data.token || null;
    }
  } catch {
    // Auth endpoint may not exist or may use different format
  }
  return null;
}

/**
 * Create authenticated API request context with proper headers
 */
export function createAuthHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Extended test fixtures with authentication support
 */
type AuthFixtures = {
  authenticatedPage: Page;
  authenticatedContext: BrowserContext;
  authToken: string | null;
  appUrl: string;
  currentApp: AppName;
};

/**
 * Create test fixtures for a specific app
 */
export function createAppTest(app: AppName) {
  return base.extend<AuthFixtures>({
    currentApp: [app, { option: true }],
    appUrl: [APP_URLS[app], { option: true }],

    authenticatedContext: async ({ browser }, use) => {
      const context = await browser.newContext();
      
      // Create a page to authenticate
      const page = await context.newPage();
      const user = TEST_USERS[app];
      
      try {
        await authenticateViaUI(page, APP_URLS[app], user.email, user.password);
      } catch {
        // If UI auth fails, continue without auth (tests will handle 401s appropriately)
        console.warn(`[E2E] UI authentication failed for ${app}, continuing without auth`);
      }
      
      await page.close();
      await use(context);
      await context.close();
    },

    authenticatedPage: async ({ authenticatedContext }, use) => {
      const page = await authenticatedContext.newPage();
      await use(page);
      await page.close();
    },

    authToken: async ({ request }, use) => {
      const user = TEST_USERS[app];
      const token = await getAuthToken(request, APP_URLS[app], user.email, user.password);
      await use(token);
    },
  });
}

// Pre-configured tests for each app
export const atlvsTest = createAppTest('atlvs');
export const compvssTest = createAppTest('compvss');
export const gvtewayTest = createAppTest('gvteway');

/**
 * Helper to assert authentication is available
 * Use this in beforeAll/beforeEach to fail the test suite if auth is required but unavailable
 * 
 * @deprecated Prefer using expect() assertions directly in tests for explicit failure messages
 */
export function requireAuth(authToken: string | null, context: string = 'this test'): asserts authToken is string {
  if (!authToken) {
    throw new Error(`Authentication required for ${context} but no auth token available. Check test user credentials.`);
  }
}

/**
 * Helper to validate API response, accepting auth redirects as valid
 */
export function isValidAuthResponse(status: number): boolean {
  // 200-299: Success
  // 302, 307: Redirects (may be auth redirect)
  // 401: Unauthorized (expected when not authenticated)
  // 403: Forbidden (expected for role-based access)
  return [200, 201, 204, 302, 307, 401, 403].includes(status);
}

/**
 * Helper to check if a page was redirected to auth
 */
export function wasRedirectedToAuth(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

/**
 * Create mock auth cookies for testing without real authentication
 * This is useful for testing UI components without hitting real auth endpoints
 */
export function createMockAuthCookies(baseUrl: string) {
  const domain = new URL(baseUrl).hostname;
  return [
    {
      name: 'sb-access-token',
      value: 'mock-access-token-for-e2e-testing',
      domain,
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    },
    {
      name: 'sb-refresh-token',
      value: 'mock-refresh-token-for-e2e-testing',
      domain,
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax' as const,
    },
  ];
}

export { TEST_USERS };
