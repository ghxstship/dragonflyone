/**
 * COMPVSS Competition Entries API Integration Tests
 * Tests for the complete entry registration flow
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@/lib/supabase/server';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_comp_123',
        client_secret: 'secret_test_comp_123',
        status: 'requires_payment_method',
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_test_comp_123',
        status: 'succeeded',
      }),
    },
  }));
});

describe('COMPVSS Competition Entries API Integration', () => {
  let testCompetitionId: string;
  let testEntryId: string;

  beforeAll(async () => {
    // Create a test competition
    const supabase = await createClient();
    const { data: comp } = await supabase
      .from('competitions')
      .insert({
        name: 'Test Competition',
        description: 'Integration test competition',
        start_date: new Date('2026-09-01').toISOString(),
        end_date: new Date('2026-09-03').toISOString(),
        location: { name: 'Test Venue', city: 'Test City', country: 'USA' },
        entry_fee: 50,
        max_participants: 100,
        category: 'Test',
        status: 'open',
      })
      .select()
      .single();

    testCompetitionId = comp?.id || '';
  });

  afterAll(async () => {
    // Clean up test data
    const supabase = await createClient();

    if (testEntryId) {
      await supabase
        .from('competition_entries')
        .delete()
        .eq('id', testEntryId);
    }

    if (testCompetitionId) {
      await supabase
        .from('competitions')
        .delete()
        .eq('id', testCompetitionId);
    }
  });

  describe('POST /api/competition-entries/create', () => {
    it('should create a competition entry with valid data', async () => {
      const response = await fetch('http://localhost:3002/api/competition-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: testCompetitionId,
          numParticipants: 1,
          participantDetails: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            phone: '555-9876',
            country: 'USA',
            agreeToTerms: true,
            marketingOptIn: false,
          },
          pricing: {
            subtotal: 50,
            addOnsTotal: 0,
            serviceFee: 5,
            tax: 4,
            discount: 0,
            total: 59,
            currency: 'USD',
          },
          teamName: 'Solo Player',
          category: 'Test',
        }),
      });

      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.entryId).toBeDefined();
      expect(data.entryNumber).toMatch(/^COMP-/);
      expect(data.status).toBe('pending');

      testEntryId = data.entryId;
    });

    it('should reject entry for non-existent competition', async () => {
      const response = await fetch('http://localhost:3002/api/competition-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: '00000000-0000-0000-0000-000000000000',
          numParticipants: 1,
          participantDetails: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice.johnson@example.com',
            phone: '555-9876',
            country: 'USA',
            agreeToTerms: true,
          },
          pricing: {
            subtotal: 50,
            addOnsTotal: 0,
            serviceFee: 5,
            tax: 4,
            discount: 0,
            total: 59,
            currency: 'USD',
          },
        }),
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('Competition not found');
    });

    it('should reject entry with invalid email', async () => {
      const response = await fetch('http://localhost:3002/api/competition-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: testCompetitionId,
          numParticipants: 1,
          participantDetails: {
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'not-an-email',
            phone: '555-9876',
            country: 'USA',
            agreeToTerms: true,
          },
          pricing: {
            subtotal: 50,
            addOnsTotal: 0,
            serviceFee: 5,
            tax: 4,
            discount: 0,
            total: 59,
            currency: 'USD',
          },
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('GET /api/competition-entries/[id]', () => {
    it('should retrieve entry by ID', async () => {
      if (!testEntryId) {
        throw new Error('Test entry not created');
      }

      const response = await fetch(`http://localhost:3002/api/competition-entries/${testEntryId}`);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.bookingId).toBe(testEntryId);
      expect(data.platform).toBe('compvss');
      expect(data.itemType).toBe('competition');
      expect(data.guestDetails.firstName).toBe('Alice');
    });

    it('should return 404 for non-existent entry', async () => {
      const response = await fetch(
        'http://localhost:3002/api/competition-entries/00000000-0000-0000-0000-000000000000'
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/competition-entries/[id]/payment-intent', () => {
    it('should create payment intent for entry', async () => {
      if (!testEntryId) {
        throw new Error('Test entry not created');
      }

      const response = await fetch(
        `http://localhost:3002/api/competition-entries/${testEntryId}/payment-intent`,
        { method: 'POST' }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.clientSecret).toBeDefined();
      expect(data.paymentIntentId).toBeDefined();
    });

    it('should return 404 for non-existent entry', async () => {
      const response = await fetch(
        'http://localhost:3002/api/competition-entries/00000000-0000-0000-0000-000000000000/payment-intent',
        { method: 'POST' }
      );

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/competition-entries/confirm', () => {
    it('should confirm entry after payment', async () => {
      if (!testEntryId) {
        throw new Error('Test entry not created');
      }

      const response = await fetch('http://localhost:3002/api/competition-entries/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: testEntryId,
          paymentIntentId: 'pi_test_comp_123',
        }),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('confirmed');
      expect(data.paymentStatus).toBe('succeeded');
      expect(data.confirmedAt).toBeDefined();
    });

    it('should reject confirmation with mismatched payment intent', async () => {
      if (!testEntryId) {
        throw new Error('Test entry not created');
      }

      const response = await fetch('http://localhost:3002/api/competition-entries/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: testEntryId,
          paymentIntentId: 'pi_wrong_123',
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('mismatch');
    });
  });

  describe('Complete Entry Flow', () => {
    it('should complete the entire entry registration flow', async () => {
      // 1. Create entry
      const createResponse = await fetch('http://localhost:3002/api/competition-entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: testCompetitionId,
          numParticipants: 3,
          participantDetails: {
            firstName: 'Bob',
            lastName: 'Williams',
            email: 'bob.williams@example.com',
            phone: '555-4321',
            country: 'USA',
            agreeToTerms: true,
            marketingOptIn: true,
          },
          pricing: {
            subtotal: 150,
            addOnsTotal: 0,
            serviceFee: 15,
            tax: 12,
            discount: 0,
            total: 177,
            currency: 'USD',
          },
          teamName: 'The Champions',
          category: 'Test',
        }),
      });

      expect(createResponse.status).toBe(201);
      const createData = await createResponse.json();
      const flowEntryId = createData.entryId;

      // 2. Create payment intent
      const paymentResponse = await fetch(
        `http://localhost:3002/api/competition-entries/${flowEntryId}/payment-intent`,
        { method: 'POST' }
      );

      expect(paymentResponse.status).toBe(200);
      const paymentData = await paymentResponse.json();

      // 3. Confirm entry
      const confirmResponse = await fetch('http://localhost:3002/api/competition-entries/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: flowEntryId,
          paymentIntentId: paymentData.paymentIntentId,
        }),
      });

      expect(confirmResponse.status).toBe(200);
      const confirmData = await confirmResponse.json();
      expect(confirmData.status).toBe('confirmed');
      expect(confirmData.metadata.teamName).toBe('The Champions');

      // 4. Verify entry is retrievable
      const getResponse = await fetch(
        `http://localhost:3002/api/competition-entries/${flowEntryId}`
      );

      expect(getResponse.status).toBe(200);
      const getData = await getResponse.json();
      expect(getData.status).toBe('confirmed');
      expect(getData.guestDetails.email).toBe('bob.williams@example.com');

      // Cleanup
      const supabase = await createClient();
      await supabase.from('competition_entries').delete().eq('id', flowEntryId);
    });
  });
});
