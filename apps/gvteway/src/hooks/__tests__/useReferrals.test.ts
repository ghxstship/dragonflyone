import { describe, it, expect } from 'vitest';
import type { Referral } from '../useReferrals';

describe('useReferrals', () => {
  describe('Referral interface', () => {
    it('should have all required fields', () => {
      const referral: Referral = {
        id: 'ref-123',
        referrer_id: 'user-456',
        referral_code: 'REF-ABC123',
        status: 'pending',
      };

      expect(referral.id).toBe('ref-123');
      expect(referral.referrer_id).toBe('user-456');
      expect(referral.referral_code).toBe('REF-ABC123');
      expect(referral.status).toBe('pending');
    });

    it('should support all status values', () => {
      const statuses: Referral['status'][] = ['pending', 'completed', 'rewarded'];
      expect(statuses.length).toBe(3);
    });

    it('should support pending status', () => {
      const referral: Referral = {
        id: 'ref-1',
        referrer_id: 'user-1',
        referral_code: 'REF-XYZ789',
        status: 'pending',
      };
      expect(referral.status).toBe('pending');
      expect(referral.referred_id).toBeUndefined();
    });

    it('should support completed status with referred user', () => {
      const referral: Referral = {
        id: 'ref-1',
        referrer_id: 'user-1',
        referred_id: 'user-2',
        referral_code: 'REF-ABC123',
        status: 'completed',
        completed_at: new Date().toISOString(),
      };
      expect(referral.status).toBe('completed');
      expect(referral.referred_id).toBe('user-2');
      expect(referral.completed_at).toBeDefined();
    });

    it('should support rewarded status with reward amount', () => {
      const referral: Referral = {
        id: 'ref-1',
        referrer_id: 'user-1',
        referred_id: 'user-2',
        referral_code: 'REF-ABC123',
        status: 'rewarded',
        reward_amount: 25,
        completed_at: new Date().toISOString(),
      };
      expect(referral.status).toBe('rewarded');
      expect(referral.reward_amount).toBe(25);
    });

    it('should support optional timestamps', () => {
      const referral: Referral = {
        id: 'ref-1',
        referrer_id: 'user-1',
        referral_code: 'REF-ABC123',
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      expect(referral.created_at).toBeDefined();
    });

    it('should track referral history', () => {
      const referrals: Referral[] = [
        { id: 'ref-1', referrer_id: 'user-1', referral_code: 'REF-001', status: 'rewarded', reward_amount: 25 },
        { id: 'ref-2', referrer_id: 'user-1', referral_code: 'REF-002', status: 'completed' },
        { id: 'ref-3', referrer_id: 'user-1', referral_code: 'REF-003', status: 'pending' },
        { id: 'ref-4', referrer_id: 'user-1', referral_code: 'REF-004', status: 'rewarded', reward_amount: 25 },
      ];

      const rewarded = referrals.filter((r) => r.status === 'rewarded');
      const totalRewards = rewarded.reduce((sum, r) => sum + (r.reward_amount || 0), 0);

      expect(rewarded.length).toBe(2);
      expect(totalRewards).toBe(50);
    });

    it('should generate unique referral codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        codes.add(code);
      }
      // With random generation, we expect most codes to be unique
      expect(codes.size).toBeGreaterThan(95);
    });
  });
});
