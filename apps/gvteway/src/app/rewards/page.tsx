'use client';

import { useState, useEffect, useCallback } from 'react';
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from '@/components/app-layout';
import { 
  H2, 
  H3, 
  Body, 
  Button, 
  Card, 
  Grid, 
  Badge, 
  ProgressBar, 
  EmptyState, 
  Stack, 
  Kicker,
  Label,
} from '@ghxstship/ui';
import { Award, Gift, Star, TrendingUp, Ticket, Zap, Trophy } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  points: number;
  type: string;
  available: boolean;
}

interface UserRewards {
  user_id: string;
  points: number;
  tier: string;
  lifetime_points: number;
  rewards: Reward[];
  activities: { action: string; points: number; date: string }[];
}

const tiers = [
  { name: 'Bronze', minPoints: 0 },
  { name: 'Silver', minPoints: 1000 },
  { name: 'Gold', minPoints: 2500 },
  { name: 'Platinum', minPoints: 5000 },
];

const earnActivities = [
  { name: 'Purchase Ticket', points: 100, icon: Ticket },
  { name: 'Refer a Friend', points: 500, icon: Gift },
  { name: 'Write Review', points: 50, icon: Star },
  { name: 'Social Share', points: 25, icon: TrendingUp },
];

export default function RewardsPage() {
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rewards?user_id=demo-user-123');
      if (!response.ok) {
        throw new Error('Failed to fetch rewards');
      }
      const data = await response.json();
      setUserRewards(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const handleRedeem = async (rewardId: string) => {
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'demo-user-123',
          reward_id: rewardId,
          action: 'redeem',
        }),
      });
      if (response.ok) {
        fetchRewards();
      }
    } catch (err) {
      console.error('Failed to redeem reward:', err);
    }
  };

  const userPoints = userRewards?.points || 0;
  const userTier = userRewards?.tier || 'Bronze';
  const rewards = userRewards?.rewards || [];

  if (loading) {
    return <GvtewayLoadingLayout text="Loading rewards..." />;
  }

  if (error) {
    return (
      <GvtewayEmptyLayout
        title="Error Loading Rewards"
        description={error}
        action={{ label: "Retry", onClick: fetchRewards }}
      />
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Loyalty Program</Kicker>
              <H2 size="lg" className="text-white">Rewards Program</H2>
              <Body className="text-on-dark-muted">Earn points and unlock exclusive perks</Body>
            </Stack>

            {/* Points Balance Card */}
            <Card inverted variant="elevated" className="p-8">
              <Grid cols={2} gap={8}>
                <Stack gap={4}>
                  <Label size="xs" className="text-on-dark-muted">Your Points</Label>
                  <H2 size="lg" className="font-display text-white">{userPoints.toLocaleString()}</H2>
                  <Badge variant="outline">{userTier} Member</Badge>
                </Stack>
                <Stack className="items-end justify-center">
                  <Award className="size-24 text-on-dark-muted" />
                </Stack>
              </Grid>
            </Card>

            {/* Tier Progress */}
            <Card inverted className="p-6">
              <Stack gap={6}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Trophy className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Membership Tier</H3>
                </Stack>
                <Stack gap={4}>
                  {tiers.map((tier) => (
                    <Stack key={tier.name} gap={2}>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Body className="font-display text-white">{tier.name}</Body>
                        <Label size="xs" className="text-on-dark-muted">{tier.minPoints.toLocaleString()} pts</Label>
                      </Stack>
                      <Stack className="relative">
                        <ProgressBar 
                          value={tier.name === userTier ? 100 : tier.minPoints < userPoints ? 100 : 0} 
                          size="lg"
                        />
                        {tier.name === userTier && (
                          <Stack className="absolute right-0 top-1/2 -translate-x-2 -translate-y-1/2">
                            <Zap className="size-6 fill-current text-white" />
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>

            {/* Available Rewards */}
            <Stack gap={6}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Gift className="size-5 text-on-dark-muted" />
                <H3 className="text-white">Available Rewards</H3>
              </Stack>
              <Grid cols={2} gap={6}>
                {rewards.map((reward) => (
                  <Card 
                    key={reward.id} 
                    inverted
                    interactive={reward.available}
                    className={`p-6 ${!reward.available ? 'opacity-50' : ''}`}
                  >
                    <Stack gap={4}>
                      <Stack gap={4} direction="horizontal" className="items-start justify-between">
                        <Badge variant={reward.available ? 'outline' : 'ghost'}>
                          {reward.type}
                        </Badge>
                        <Stack className="text-right">
                          <Body className="font-display text-white">{reward.points}</Body>
                          <Label size="xs" className="text-on-dark-muted">points</Label>
                        </Stack>
                      </Stack>
                      <H3 className="text-white">{reward.name}</H3>
                      <Button 
                        variant="solid"
                        inverted
                        fullWidth
                        disabled={!reward.available || userPoints < reward.points}
                        onClick={() => handleRedeem(reward.id)}
                      >
                        {userPoints < reward.points ? 'Insufficient Points' : reward.available ? 'Redeem' : 'Locked'}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>

            {/* Earn Points */}
            <Card inverted className="p-6">
              <Stack gap={6}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Star className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Earn Points</H3>
                </Stack>
                <Grid cols={2} gap={4}>
                  {earnActivities.map((activity, idx) => (
                    <Card key={idx} inverted interactive>
                      <Stack gap={3} direction="horizontal" className="items-center justify-between">
                        <Stack gap={3} direction="horizontal" className="items-center">
                          <activity.icon className="size-5 text-on-dark-muted" />
                          <Body className="font-display text-white">{activity.name}</Body>
                        </Stack>
                        <Badge variant="solid">+{activity.points} pts</Badge>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>
          </Stack>
    </GvtewayAppLayout>
  );
}
