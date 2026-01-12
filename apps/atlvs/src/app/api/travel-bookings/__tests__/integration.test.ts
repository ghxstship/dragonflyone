/**
 * ATLVS Travel Bookings API Integration Tests
 * Tests for the complete booking flow
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createAdminClient } from '@/lib/supabase';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'secret_test_123',
        status: 'requires_payment_method',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      }),
    },
  }));
});

describe('ATLVS Travel Bookings API Integration', () => {
  let testPackageId: string;
  let testBookingId: string;

  beforeAll(async () => {
    // Create a test package
    const supabase = createAdminClient();
    const { data: pkg } = await supabase
      .from('booking_packages')
      .insert({
        name: 'Test Package',
        description: 'Integration test package',
        event_types: ['Test'],
        base_price: 100,
        min_guests: 1,
        max_guests: 10,
        duration_hours: 24,
        included_items: [
          { name: 'Test Item', category: 'Test', quantity: 1 },
        ],
        optional_add_ons: [],
        is_featured: false,
        is_active: true,
      })
      .select()
      .single();

    testPackageId = pkg?.id || '';
  });

  afterAll(async () => {
    // Clean up test data
    const supabase = createAdminClient();

    if (testBookingId) {
      await supabase
        .from('travel_bookings')
        .delete()
        .eq('id', testBookingId);
    }

    if (testPackageId) {
      await supabase
        .from('booking_packages')
        .delete()
        .eq('id', testPackageId);
    }
  });

  describe('POST /api/travel-bookings/create', () => {
    it('should create a travel booking with valid data', async () => {
      const response = await fetch('http://localhost:3001/api/travel-bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: testPackageId,
          numTravelers: 2,
          travelDates: {
            start: new Date('2026-07-01').toISOString(),
            end: new Date('2026-07-02').toISOString(),
          },
          selectedAddOns: [],
          travelerDetails: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-1234',
            country: 'USA',
            agreeToTerms: true,
            marketingOptIn: false,
          },
          pricing: {
            subtotal: 200,
            addOnsTotal: 0,
            serviceFee: 20,
            tax: 16,
            discount: 0,
            total: 236,
            currency: 'USD',
          },
        }),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.bookingId).toBeDefined();
      expect(data.bookingNumber).toMatch(/^ATLVS-/);
      expect(data.status).toBe('pending');

      testBookingId = data.bookingId;
    });

    it('should reject booking for non-existent package', async () => {
      const response = await fetch('http://localhost:3001/api/travel-bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: '00000000-0000-0000-0000-000000000000',
          numTravelers: 2,
          travelDates: {
            start: new Date('2026-07-01').toISOString(),
            end: new Date('2026-07-02').toISOString(),
          },
          selectedAddOns: [],
          travelerDetails: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-1234',
            country: 'USA',
            agreeToTerms: true,
          },
          pricing: {
            subtotal: 200,
            addOnsTotal: 0,
            serviceFee: 20,
            tax: 16,
            discount: 0,
            total: 236,
            currency: 'USD',
          },
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('Package not found');
    });

    it('should reject booking with too many travelers', async () => {
      const response = await fetch('http://localhost:3001/api/travel-bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: testPackageId,
          numTravelers: 20, // Exceeds max_guests of 10
          travelDates: {
            start: new Date('2026-07-01').toISOString(),
            end: new Date('2026-07-02').toISOString(),
          },
          selectedAddOns: [],
          travelerDetails: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '555-1234',
            country: 'USA',
            agreeToTerms: true,
          },
          pricing: {
            subtotal: 200,
            addOnsTotal: 0,
            serviceFee: 20,
            tax: 16,
            discount: 0,
            total: 236,
            currency: 'USD',
          },
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Maximum');
    });

    it('should reject booking with invalid data', async () => {
      const response = await fetch('http://localhost:3001/api/travel-bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: testPackageId,
          numTravelers: 'invalid', // Should be a number
          travelDates: {
            start: new Date('2026-07-01').toISOString(),
            end: new Date('2026-07-02').toISOString(),
          },
          travelerDetails: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'invalid-email', // Invalid email
            phone: '555-1234',
            country: 'USA',
            agreeToTerms: true,
          },
          pricing: {
            subtotal: 200,
            addOnsTotal: 0,
            serviceFee: 20,
            tax: 16,
            discount: 0,
            total: 236,
            currency: 'USD',
          },
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('GET /api/travel-bookings/[id]', () => {
    it('should retrieve booking by ID', async () => {
      if (!testBookingId) {
        throw new Error('Test booking not created');
      }

      const response = await fetch(`http://localhost:3001/api/travel-bookings/${testBookingId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.bookingId).toBe(testBookingId);
      expect(data.platform).toBe('atlvs');
      expect(data.itemType).toBe('package');
      expect(data.guestDetails.firstName).toBe('John');
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await fetch(
        'http://localhost:3001/api/travel-bookings/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/travel-bookings/[id]/payment-intent', () => {
    it('should create payment intent for booking', async () => {
      if (!testBookingId) {
        throw new Error('Test booking not created');
      }

      const response = await fetch(
        `http://localhost:3001/api/travel-bookings/${testBookingId}/payment-intent`,
        { method: 'POST' }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.clientSecret).toBeDefined();
      expect(data.paymentIntentId).toBeDefined();
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await fetch(
        'http://localhost:3001/api/travel-bookings/00000000-0000-0000-0000-000000000000/payment-intent',
        { method: 'POST' }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/travel-bookings/confirm', () => {
    it('should confirm booking after payment', async () => {
      if (!testBookingId) {
        throw new Error('Test booking not created');
      }

      const response = await fetch('http://localhost:3001/api/travel-bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: testBookingId,
          paymentIntentId: 'pi_test_123',
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('confirmed');
      expect(data.paymentStatus).toBe('succeeded');
      expect(data.confirmedAt).toBeDefined();
    });

    it('should reject confirmation with mismatched payment intent', async () => {
      if (!testBookingId) {
        throw new Error('Test booking not created');
      }

      const response = await fetch('http://localhost:3001/api/travel-bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: testBookingId,
          paymentIntentId: 'pi_wrong_123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('mismatch');
    });
  });

  describe('Complete Booking Flow', () => {
    it('should complete the entire booking flow', async () => {
      // 1. Create booking
      const createResponse = await fetch('http://localhost:3001/api/travel-bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: testPackageId,
          numTravelers: 3,
          travelDates: {
            start: new Date('2026-08-01').toISOString(),
            end: new Date('2026-08-02').toISOString(),
          },
          selectedAddOns: [],
          travelerDetails: {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '555-5678',
            country: 'USA',
            agreeToTerms: true,
            marketingOptIn: true,
          },
          pricing: {
            subtotal: 300,
            addOnsTotal: 0,
            serviceFee: 30,
            tax: 24,
            discount: 0,
            total: 354,
            currency: 'USD',
          },
        }),
      });

      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json();
      const flowBookingId = createData.bookingId;

      // 2. Create payment intent
      const paymentResponse = await fetch(
        `http://localhost:3001/api/travel-bookings/${flowBookingId}/payment-intent`,
        { method: 'POST' }
      );

      expect(paymentResponse.status).toBe(200);
      const paymentData = await paymentResponse.json();

      // 3. Confirm booking
      const confirmResponse = await fetch('http://localhost:3001/api/travel-bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: flowBookingId,
          paymentIntentId: paymentData.paymentIntentId,
        }),
      });

      expect(confirmResponse.status).toBe(200);
      const confirmData = await confirmResponse.json();
      expect(confirmData.status).toBe('confirmed');

      // 4. Verify booking is retrievable
      const getResponse = await fetch(
        `http://localhost:3001/api/travel-bookings/${flowBookingId}`
      );

      expect(getResponse.status).toBe(200);
      const getData = await getResponse.json();
      expect(getData.status).toBe('confirmed');
      expect(getData.guestDetails.email).toBe('jane.smith@example.com');

      // Cleanup
      const supabase = createAdminClient();
      await supabase.from('travel_bookings').delete().eq('id', flowBookingId);
    });
  });
});
