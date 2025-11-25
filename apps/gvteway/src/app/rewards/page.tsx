'use client';

import { useState, useEffect, useCallback } from 'react';
import { Container, Section, Display, H2, H3, Body, Button, Card, Grid, Badge, ProgressBar, LoadingSpinner, EmptyState, Stack } from '@ghxstship/ui';
import { Award, Gift, Star, TrendingUp, Ticket, Zap } from 'lucide-react';

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
      // TODO: Get actual user ID from auth context
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
    return (
      <Section className="min-h-screen bg-white py-12">
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading rewards..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen bg-white py-12">
        <Container className="py-16">
          <EmptyState
            title="Error Loading Rewards"
            description={error}
            action={{ label: "Retry", onClick: fetchRewards }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white py-12">
      <Container>
        <Stack gap={8}>
          <Display>REWARDS PROGRAM</Display>

          {/* Points Balance */}
          <Card className="p-8 bg-black text-white">
            <Grid cols={2} gap={8}>
              <Stack gap={2}>
                <Body className="text-grey-400">Your Points</Body>
                <Display size="lg">{userPoints.toLocaleString()}</Display>
                <Badge variant="outline" className="mt-4 border-white text-white bg-transparent">
                  {userTier} Member
                </Badge>
              </Stack>
              <Stack className="items-end justify-center">
                <Award className="w-24 h-24 text-white" />
              </Stack>
            </Grid>
          </Card>

          {/* Tier Progress */}
          <Card className="p-6">
            <Stack gap={4}>
              <H2>MEMBERSHIP TIER</H2>
              <Stack gap={3}>
                {tiers.map((tier, idx) => (
                  <Stack key={tier.name} gap={2} className="relative">
                    <Stack gap={2} direction="horizontal" className="justify-between">
                      <Body className="font-bold">{tier.name}</Body>
                      <Body className="text-sm text-grey-600">{tier.minPoints.toLocaleString()} pts</Body>
                    </Stack>
                    <Stack className="relative">
                      <ProgressBar 
                        value={tier.name === userTier ? 100 : tier.minPoints < userPoints ? 100 : 0} 
                        size="lg"
                      />
                      {tier.name === userTier && (
                        <Stack className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2">
                          <Zap className="w-6 h-6 fill-current" />
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>

          {/* Available Rewards */}
          <Stack gap={4}>
            <H2>AVAILABLE REWARDS</H2>
            <Grid cols={2} gap={6}>
              {rewards.map((reward) => (
                <Card 
                  key={reward.id} 
                  className={`p-6 ${!reward.available ? 'opacity-50' : 'hover:shadow-[8px_8px_0_0_#000] transition-shadow'}`}
                >
                  <Stack gap={4}>
                    <Stack gap={4} direction="horizontal" className="items-start justify-between">
                      <Badge variant={reward.available ? 'outline' : 'ghost'}>
                        {reward.type}
                      </Badge>
                      <Stack className="text-right">
                        <Display size="md">{reward.points}</Display>
                        <Body className="text-sm text-grey-600">points</Body>
                      </Stack>
                    </Stack>
                    <H3>{reward.name}</H3>
                    <Button 
                      className="w-full" 
                      disabled={!reward.available || userPoints < reward.points}
                    >
                      {userPoints < reward.points ? 'INSUFFICIENT POINTS' : reward.available ? 'REDEEM' : 'LOCKED'}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          {/* Earn Points */}
          <Card className="p-6">
            <Stack gap={4}>
              <H2>EARN POINTS</H2>
              <Grid cols={2} gap={6}>
                {earnActivities.map((activity, idx) => (
                  <Card key={idx} className="p-4 border-2 border-grey-200">
                    <Stack gap={3} direction="horizontal" className="items-center justify-between">
                      <Stack gap={3} direction="horizontal" className="items-center">
                        <activity.icon className="w-6 h-6 text-grey-600" />
                        <Body className="font-bold">{activity.name}</Body>
                      </Stack>
                      <Badge variant="solid">+{activity.points} pts</Badge>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Section>
  );
}
