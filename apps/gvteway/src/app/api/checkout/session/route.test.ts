import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the data module
vi.mock('@/data/gvteway', () => ({
  MAX_TICKETS_PER_ORDER: 10,
  getEventById: vi.fn((id: string) => {
    if (id === 'event-123') {
      return {
        id: 'event-123',
        title: 'Test Event',
        slug: 'test-event',
        status: 'published',
        capacity: 1000,
      };
    }
    return null;
  }),
  getTicketTypeById: vi.fn((id: string) => {
    const tickets: Record<string, any> = {
      'ticket-ga': {
        id: 'ticket-ga',
        eventId: 'event-123',
        name: 'General Admission',
        priceCents: 5000,
        serviceFeeCents: 500,
        currency: 'usd',
        tier: 'ga',
      },
      'ticket-vip': {
        id: 'ticket-vip',
        eventId: 'event-123',
        name: 'VIP',
        priceCents: 15000,
        serviceFeeCents: 1500,
        currency: 'usd',
        tier: 'vip',
      },
    };
    return tickets[id] || null;
  }),
  getTicketAvailability: vi.fn((id: string) => {
    const availability: Record<string, number> = {
      'ticket-ga': 100,
      'ticket-vip': 20,
    };
    return availability[id] ?? 0;
  }),
}));

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock env
vi.mock('@/lib/env', () => ({
  env: {
    APP_URL: 'http://localhost:3003',
  },
}));

describe('Checkout Session API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/checkout/session', () => {
    it('should create a checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      const { stripe } = await import('@/lib/stripe');
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          email: 'test@example.com',
          ticketSelections: [
            { ticketTypeId: 'ticket-ga', quantity: 2 },
            { ticketTypeId: 'ticket-vip', quantity: 1 },
          ],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('url');
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
    });

    it('should validate max tickets per order', async () => {
      // MAX_TICKETS_PER_ORDER is 10, requesting 200 should fail validation
      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          email: 'test@example.com',
          ticketSelections: [
            { ticketTypeId: 'ticket-ga', quantity: 200 }, // Exceeds MAX_TICKETS_PER_ORDER (10)
          ],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Route returns 422 for Zod validation error (quantity > 10)
      expect(response.status).toBe(422);
      expect(data).toHaveProperty('error');
    });

    it('should return 404 for non-existent event', async () => {
      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'non-existent-event',
          email: 'test@example.com',
          ticketSelections: [{ ticketTypeId: 'ticket-ga', quantity: 1 }],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          // Missing email and ticketSelections
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data).toHaveProperty('error');
    });

    it('should calculate total correctly with service fees', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      const { stripe } = await import('@/lib/stripe');
      const createSpy = vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession as any);

      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          email: 'test@example.com',
          ticketSelections: [
            { ticketTypeId: 'ticket-ga', quantity: 2 }, // 2 × ($50 + $5 fee) = $110
            { ticketTypeId: 'ticket-vip', quantity: 1 }, // 1 × ($150 + $15 fee) = $165
          ],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      await POST(request);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                unit_amount: 5500, // 5000 + 500 service fee
              }),
              quantity: 2,
            }),
            expect.objectContaining({
              price_data: expect.objectContaining({
                unit_amount: 16500, // 15000 + 1500 service fee
              }),
              quantity: 1,
            }),
          ]),
        })
      );
    });

    it('should handle Stripe API errors gracefully', async () => {
      const { stripe } = await import('@/lib/stripe');
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(
        new Error('Stripe API error')
      );

      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          email: 'test@example.com',
          ticketSelections: [{ ticketTypeId: 'ticket-ga', quantity: 1 }],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
