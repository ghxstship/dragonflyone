import { describe, it, expect } from 'vitest';
import type { Reward, RewardTransaction } from '../useRewards';

describe('useRewards', () => {
  describe('Reward interface', () => {
    it('should have all required fields', () => {
      const reward: Reward = {
        id: 'reward-123',
        user_id: 'user-456',
        points: 1500,
        tier: 'gold',
        rewards_earned: 5,
      };

      expect(reward.id).toBe('reward-123');
      expect(reward.user_id).toBe('user-456');
      expect(reward.points).toBe(1500);
      expect(reward.tier).toBe('gold');
      expect(reward.rewards_earned).toBe(5);
    });

    it('should support optional timestamps', () => {
      const reward: Reward = {
        id: 'reward-123',
        user_id: 'user-456',
        points: 500,
        tier: 'silver',
        rewards_earned: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(reward.created_at).toBeDefined();
      expect(reward.updated_at).toBeDefined();
    });

    it('should support various tiers', () => {
      const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
      
      tiers.forEach((tier) => {
        const reward: Reward = {
          id: 'reward-1',
          user_id: 'user-1',
          points: 100,
          tier,
          rewards_earned: 0,
        };
        expect(reward.tier).toBe(tier);
      });
    });

    it('should track points balance', () => {
      const reward: Reward = {
        id: 'reward-123',
        user_id: 'user-456',
        points: 10000,
        tier: 'platinum',
        rewards_earned: 15,
      };

      expect(reward.points).toBe(10000);
      expect(reward.rewards_earned).toBe(15);
    });
  });

  describe('RewardTransaction interface', () => {
    it('should have all required fields', () => {
      const transaction: RewardTransaction = {
        id: 'tx-123',
        user_id: 'user-456',
        points: 100,
        type: 'earned',
        description: 'Ticket purchase bonus',
      };

      expect(transaction.id).toBe('tx-123');
      expect(transaction.user_id).toBe('user-456');
      expect(transaction.points).toBe(100);
      expect(transaction.type).toBe('earned');
      expect(transaction.description).toBe('Ticket purchase bonus');
    });

    it('should support earned type', () => {
      const transaction: RewardTransaction = {
        id: 'tx-123',
        user_id: 'user-456',
        points: 250,
        type: 'earned',
        description: 'VIP event attendance',
      };

      expect(transaction.type).toBe('earned');
    });

    it('should support redeemed type', () => {
      const transaction: RewardTransaction = {
        id: 'tx-124',
        user_id: 'user-456',
        points: -500,
        type: 'redeemed',
        description: 'Free drink voucher',
      };

      expect(transaction.type).toBe('redeemed');
    });

    it('should support optional created_at', () => {
      const transaction: RewardTransaction = {
        id: 'tx-123',
        user_id: 'user-456',
        points: 50,
        type: 'earned',
        description: 'Referral bonus',
        created_at: new Date().toISOString(),
      };

      expect(transaction.created_at).toBeDefined();
    });

    it('should track transaction history', () => {
      const transactions: RewardTransaction[] = [
        { id: 'tx-1', user_id: 'user-1', points: 100, type: 'earned', description: 'Sign up bonus' },
        { id: 'tx-2', user_id: 'user-1', points: 50, type: 'earned', description: 'First purchase' },
        { id: 'tx-3', user_id: 'user-1', points: -75, type: 'redeemed', description: 'Discount applied' },
        { id: 'tx-4', user_id: 'user-1', points: 200, type: 'earned', description: 'VIP event' },
      ];

      const totalEarned = transactions
        .filter((t) => t.type === 'earned')
        .reduce((sum, t) => sum + t.points, 0);
      
      const totalRedeemed = transactions
        .filter((t) => t.type === 'redeemed')
        .reduce((sum, t) => sum + Math.abs(t.points), 0);

      expect(totalEarned).toBe(350);
      expect(totalRedeemed).toBe(75);
    });
  });
});
