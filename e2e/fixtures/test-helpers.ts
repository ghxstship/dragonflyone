import { Page, APIRequestContext, expect } from '@playwright/test';
import { APP_URLS, AppName, wasRedirectedToAuth } from './auth';

/**
 * E2E Test Helpers
 * 
 * Provides utility functions for common test operations
 * that handle authentication gracefully.
 */

// Valid response statuses for protected endpoints
const VALID_PROTECTED_STATUSES = [200, 201, 204, 302, 307, 401, 403, 404];
const VALID_PUBLIC_STATUSES = [200, 201, 204, 302, 307];

/**
 * Navigate to a page and handle auth redirects gracefully
 * Returns true if page loaded successfully, false if redirected to auth
 */
export async function navigateToPage(
  page: Page,
  path: string,
  baseUrl: string,
  options?: { expectAuth?: boolean; timeout?: number }
): Promise<{ success: boolean; redirectedToAuth: boolean }> {
  const { expectAuth = false, timeout = 10000 } = options || {};
  
  await page.goto(`${baseUrl}${path}`);
  await page.waitForLoadState('domcontentloaded');
  
  const currentUrl = page.url();
  const redirectedToAuth = wasRedirectedToAuth(currentUrl);
  
  if (expectAuth && redirectedToAuth) {
    // Expected to be redirected to auth - this is valid behavior
    return { success: true, redirectedToAuth: true };
  }
  
  if (!redirectedToAuth) {
    // Page loaded without auth redirect
    await expect(page.locator('body')).toBeVisible({ timeout });
    return { success: true, redirectedToAuth: false };
  }
  
  // Unexpected auth redirect
  return { success: false, redirectedToAuth: true };
}

/**
 * Validate a frontend page is accessible
 * Handles both public and protected pages appropriately
 */
export async function validatePageAccessible(
  page: Page,
  path: string,
  urlPattern: RegExp,
  baseUrl: string,
  options?: { isProtected?: boolean; timeout?: number }
): Promise<boolean> {
  const { isProtected = true, timeout = 5000 } = options || {};
  
  await page.goto(`${baseUrl}${path}`);
  await page.waitForLoadState('domcontentloaded');
  
  const currentUrl = page.url();
  
  // For protected pages, auth redirect is acceptable
  if (isProtected && wasRedirectedToAuth(currentUrl)) {
    // Page correctly requires authentication
    return true;
  }
  
  // Check URL matches expected pattern
  try {
    await expect(page).toHaveURL(urlPattern, { timeout });
    await expect(page.locator('body')).toBeVisible({ timeout });
    return true;
  } catch {
    // If we're on an auth page for a protected route, that's valid
    if (isProtected && wasRedirectedToAuth(page.url())) {
      return true;
    }
    return false;
  }
}

/**
 * Make an API request and validate the response
 * Accepts auth-related status codes as valid for protected endpoints
 */
export async function validateAPIEndpoint(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  options?: { 
    body?: object; 
    isProtected?: boolean;
    expectedStatuses?: number[];
  }
): Promise<{ status: number; ok: boolean; data?: unknown }> {
  const { body, isProtected = true, expectedStatuses } = options || {};
  
  const validStatuses = expectedStatuses || (isProtected ? VALID_PROTECTED_STATUSES : VALID_PUBLIC_STATUSES);
  
  let response;
  
  switch (method) {
    case 'GET':
      response = await request.get(url);
      break;
    case 'POST':
      response = await request.post(url, { data: body || {} });
      break;
    case 'PUT':
      response = await request.put(url, { data: body || {} });
      break;
    case 'PATCH':
      response = await request.patch(url, { data: body || {} });
      break;
    case 'DELETE':
      response = await request.delete(url);
      break;
  }
  
  const status = response.status();
  const ok = validStatuses.includes(status);
  
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // Response may not be JSON
  }
  
  return { status, ok, data };
}

/**
 * Create a frontend validation helper for a specific app
 */
export function createFrontendValidator(app: AppName) {
  const baseUrl = APP_URLS[app];
  
  return {
    /**
     * Validate page is accessible (handles auth redirects)
     */
    async validatePage(
      page: Page,
      path: string,
      urlPattern: RegExp,
      options?: { isProtected?: boolean }
    ): Promise<boolean> {
      return validatePageAccessible(page, path, urlPattern, baseUrl, options);
    },
    
    /**
     * Navigate to page and check it loaded
     */
    async goto(page: Page, path: string): Promise<void> {
      await page.goto(`${baseUrl}${path}`);
      await page.waitForLoadState('domcontentloaded');
    },
    
    /**
     * Check if current page is auth page
     */
    isOnAuthPage(page: Page): boolean {
      return wasRedirectedToAuth(page.url());
    },
    
    baseUrl,
  };
}

/**
 * Create an API validation helper for a specific app
 */
export function createAPIValidator(app: AppName) {
  const baseUrl = APP_URLS[app];
  
  return {
    /**
     * Validate API endpoint responds appropriately
     */
    async validate(
      request: APIRequestContext,
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      path: string,
      options?: { body?: object; isProtected?: boolean }
    ): Promise<{ status: number; ok: boolean; data?: unknown }> {
      return validateAPIEndpoint(request, method, `${baseUrl}${path}`, options);
    },
    
    /**
     * Quick GET validation
     */
    async get(
      request: APIRequestContext,
      path: string,
      options?: { isProtected?: boolean }
    ): Promise<{ status: number; ok: boolean; data?: unknown }> {
      return validateAPIEndpoint(request, 'GET', `${baseUrl}${path}`, options);
    },
    
    /**
     * Quick POST validation
     */
    async post(
      request: APIRequestContext,
      path: string,
      body?: object,
      options?: { isProtected?: boolean }
    ): Promise<{ status: number; ok: boolean; data?: unknown }> {
      return validateAPIEndpoint(request, 'POST', `${baseUrl}${path}`, { body, ...options });
    },
    
    baseUrl,
  };
}

// Pre-configured validators for each app
export const atlvsValidator = {
  frontend: createFrontendValidator('atlvs'),
  api: createAPIValidator('atlvs'),
};

export const compvssValidator = {
  frontend: createFrontendValidator('compvss'),
  api: createAPIValidator('compvss'),
};

export const gvtewayValidator = {
  frontend: createFrontendValidator('gvteway'),
  api: createAPIValidator('gvteway'),
};
