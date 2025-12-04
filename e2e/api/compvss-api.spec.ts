import { test, expect } from '@playwright/test';

/**
 * API Route Verification: COMPVSS
 * Tests that all critical API routes return expected responses
 */
test.describe('COMPVSS API Routes', () => {
  const baseUrl = 'http://localhost:3002';

  test('GET /api/projects should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/projects`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/crew should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/crew`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/equipment should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/equipment`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/schedule should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/schedule`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/advancing/catalog should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/advancing/catalog`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/safety should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/safety`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/incidents should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/incidents`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/credentials should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/credentials`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/sops should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/sops`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });

  test('GET /api/venues should return 200 or auth redirect', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/venues`);
    expect([200, 302, 307, 401]).toContain(response.status());
  });
});
