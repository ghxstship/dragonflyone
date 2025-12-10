import { describe, it, expect } from 'vitest';
import type { Membership } from '../useMembership';

describe('useMembership', () => {
  describe('Membership interface', () => {
    it('should have all required fields', () => {
      const membership: Membership = {
        id: 'mem-123',
        user_id: 'user-456',
        tier: 'gold',
        status: 'active',
        start_date: '2025-01-01T00:00:00Z',
        benefits: ['Priority seating', 'Early access', 'Exclusive events'],
        points: 5000,
      };

      expect(membership.id).toBe('mem-123');
      expect(membership.user_id).toBe('user-456');
      expect(membership.tier).toBe('gold');
      expect(membership.status).toBe('active');
      expect(membership.benefits.length).toBe(3);
      expect(membership.points).toBe(5000);
    });

    it('should support all tier levels', () => {
      const tiers: Membership['tier'][] = ['free', 'bronze', 'silver', 'gold', 'platinum'];
      expect(tiers.length).toBe(5);
    });

    it('should support free tier', () => {
      const membership: Membership = {
        id: 'mem-1',
        user_id: 'user-1',
        tier: 'free',
        status: 'active',
        start_date: '2025-01-01T00:00:00Z',
        benefits: [],
        points: 0,
      };
      expect(membership.tier).toBe('free');
      expect(membership.benefits.length).toBe(0);
    });

    it('should support platinum tier with all benefits', () => {
      const membership: Membership = {
        id: 'mem-2',
        user_id: 'user-2',
        tier: 'platinum',
        status: 'active',
        start_date: '2025-01-01T00:00:00Z',
        benefits: [
          'Priority seating',
          'Early access',
          'Exclusive events',
          'VIP lounge access',
          'Concierge service',
          'Free parking',
          'Complimentary drinks',
        ],
        points: 50000,
      };
      expect(membership.tier).toBe('platinum');
      expect(membership.benefits.length).toBe(7);
    });

    it('should support all status values', () => {
      const statuses: Membership['status'][] = ['active', 'expired', 'cancelled'];
      expect(statuses.length).toBe(3);
    });

    it('should support active status', () => {
      const membership: Membership = {
        id: 'mem-1',
        user_id: 'user-1',
        tier: 'silver',
        status: 'active',
        start_date: '2025-01-01T00:00:00Z',
        benefits: ['Early access'],
        points: 1000,
      };
      expect(membership.status).toBe('active');
    });

    it('should support expired status with end date', () => {
      const membership: Membership = {
        id: 'mem-1',
        user_id: 'user-1',
        tier: 'gold',
        status: 'expired',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2025-01-01T00:00:00Z',
        benefits: [],
        points: 2500,
      };
      expect(membership.status).toBe('expired');
      expect(membership.end_date).toBeDefined();
    });

    it('should support cancelled status', () => {
      const membership: Membership = {
        id: 'mem-1',
        user_id: 'user-1',
        tier: 'bronze',
        status: 'cancelled',
        start_date: '2024-06-01T00:00:00Z',
        end_date: '2024-12-15T00:00:00Z',
        benefits: [],
        points: 500,
      };
      expect(membership.status).toBe('cancelled');
    });

    it('should support optional metadata', () => {
      const membership: Membership = {
        id: 'mem-1',
        user_id: 'user-1',
        tier: 'gold',
        status: 'active',
        start_date: '2025-01-01T00:00:00Z',
        benefits: ['VIP access'],
        points: 3000,
        metadata: {
          referral_code: 'REF123',
          upgrade_source: 'promotion',
          previous_tier: 'silver',
        },
      };
      expect(membership.metadata?.referral_code).toBe('REF123');
    });

    it('should support optional timestamps', () => {
      const membership: Membership = {
        id: 'mem-1',
        user_id: 'user-1',
        tier: 'silver',
        status: 'active',
        start_date: '2025-01-01T00:00:00Z',
        benefits: [],
        points: 1500,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-15T00:00:00Z',
      };
      expect(membership.created_at).toBeDefined();
      expect(membership.updated_at).toBeDefined();
    });

    it('should track points accumulation', () => {
      const memberships: Membership[] = [
        { id: 'm1', user_id: 'u1', tier: 'free', status: 'active', start_date: '', benefits: [], points: 0 },
        { id: 'm2', user_id: 'u2', tier: 'bronze', status: 'active', start_date: '', benefits: [], points: 500 },
        { id: 'm3', user_id: 'u3', tier: 'silver', status: 'active', start_date: '', benefits: [], points: 2000 },
        { id: 'm4', user_id: 'u4', tier: 'gold', status: 'active', start_date: '', benefits: [], points: 5000 },
        { id: 'm5', user_id: 'u5', tier: 'platinum', status: 'active', start_date: '', benefits: [], points: 15000 },
      ];

      const tierPoints = memberships.map((m) => ({ tier: m.tier, points: m.points }));
      expect(tierPoints[0].points).toBeLessThan(tierPoints[1].points);
      expect(tierPoints[4].points).toBeGreaterThan(tierPoints[3].points);
    });
  });
});
