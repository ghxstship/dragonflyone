import { test, expect } from '@playwright/test';

/**
 * API Route Verification: ATLVS
 * Tests that all critical API routes return expected responses
 */
test.describe('ATLVS API Routes', () => {
  const baseUrl = 'http://localhost:3001';

  test('GET /api/projects should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/projects`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/deals should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/deals`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/contacts should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/contacts`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/vendors should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/vendors`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/assets should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/assets`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/budgets should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/budgets`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/analytics should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/analytics`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/advances should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/advances`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/employees should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/employees`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/invoices should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/invoices`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });
});
