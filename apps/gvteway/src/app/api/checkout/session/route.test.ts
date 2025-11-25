import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

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

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockEvent, error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: mockTicketTypes, error: null })),
      })),
    })),
  },
}));

const mockEvent = {
  id: 'event-123',
  name: 'Test Event',
  status: 'published',
  capacity: 1000,
};

const mockTicketTypes = [
  {
    id: 'ticket-ga',
    name: 'General Admission',
    price: 5000, // $50.00
    available: 100,
  },
  {
    id: 'ticket-vip',
    name: 'VIP',
    price: 15000, // $150.00
    available: 20,
  },
];

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
          tickets: [
            { ticketTypeId: 'ticket-ga', quantity: 2 },
            { ticketTypeId: 'ticket-vip', quantity: 1 },
          ],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('url');
      expect(stripe.checkout.sessions.create).toHaveBeenCalled();
    });

    it('should validate ticket availability', async () => {
      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          tickets: [
            { ticketTypeId: 'ticket-ga', quantity: 200 }, // Exceeds available
          ],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('available');
    });

    it('should validate event status', async () => {
      const { supabaseAdmin } = await import('@/lib/supabase');
      vi.mocked(supabaseAdmin.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { ...mockEvent, status: 'cancelled' },
              error: null,
            })),
          })),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3003/api/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: 'event-123',
          tickets: [{ ticketTypeId: 'ticket-ga', quantity: 1 }],
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
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
          // Missing tickets array
          successUrl: 'http://localhost:3003/checkout/success',
          cancelUrl: 'http://localhost:3003/checkout/cancel',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data).toHaveProperty('error');
    });

    it('should calculate total correctly', async () => {
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
          tickets: [
            { ticketTypeId: 'ticket-ga', quantity: 2 }, // 2 × $50 = $100
            { ticketTypeId: 'ticket-vip', quantity: 1 }, // 1 × $150 = $150
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
                unit_amount: 5000,
              }),
              quantity: 2,
            }),
            expect.objectContaining({
              price_data: expect.objectContaining({
                unit_amount: 15000,
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
          tickets: [{ ticketTypeId: 'ticket-ga', quantity: 1 }],
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
