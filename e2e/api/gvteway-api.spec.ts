import { test, expect } from '@playwright/test';

/**
 * API Route Verification: GVTEWAY
 * Tests that all critical API routes return expected responses
 */
test.describe('GVTEWAY API Routes', () => {
  const baseUrl = 'http://localhost:3000';

  test('GET /api/events should return 200 or redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/events`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/tickets should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/tickets`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/orders should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/orders`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/venues should return 200 or redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/venues`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/artists should return 200 or redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/artists`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/rewards should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/rewards`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/community/groups should return 200 or redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/community/groups`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/membership should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/membership`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });
});
