"use client";

/**
 * Rewards Page
 * Loyalty program with points and rewards
 * Uses DetailPage template for consistent layout
 */

import {
  Body,
  Button,
  Card,
  Grid,
  Badge,
  ProgressBar,
  DetailPage,
  Section,
  SectionHeader,
  StatCard,
  Box,
  Stack,
} from "@ghxstship/ui";
import { Award, Gift, Star, Ticket, Zap, Trophy } from "lucide-react";
import { useRewardsPageData } from "@/hooks/useRewards";

interface RewardItem {
  id: string;
  name: string;
  points: number;
  type: string;
  available: boolean;
}

const tiers = [
  { name: "Bronze", minPoints: 0 },
  { name: "Silver", minPoints: 1000 },
  { name: "Gold", minPoints: 2500 },
  { name: "Platinum", minPoints: 5000 },
];

const earnActivities = [
  { name: "Purchase Ticket", points: 100, icon: Ticket },
  { name: "Refer a Friend", points: 500, icon: Gift },
  { name: "Write Review", points: 50, icon: Star },
  { name: "Social Share", points: 25, icon: Zap },
];

export default function RewardsPage() {
  const { userRewards, isLoading: loading, error, refetch, redeemReward } = useRewardsPageData();

  const handleRedeem = async (rewardId: string) => {
    await redeemReward(rewardId);
  };

  const userPoints = userRewards?.points || 0;
  const userTier = userRewards?.tier || "Bronze";
  const rewards = userRewards?.rewards || [];

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Award className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6">
            <StatCard label="Your Points" value={userPoints.toLocaleString()} icon={<Award className="size-5" />} />
            <StatCard label="Current Tier" value={userTier} icon={<Trophy className="size-5" />} />
            <StatCard label="Available Rewards" value={rewards.filter((r: RewardItem) => r.available).length.toString()} icon={<Gift className="size-5" />} />
          </Grid>

          <SectionHeader title="Membership Tier" description="Your progress through reward tiers" />
          <Card className="p-6 mb-6">
            <Stack gap={4}>
              {tiers.map((tier) => (
                <Stack key={tier.name} gap={2}>
                  <Box className="flex justify-between">
                    <Body className="font-weight-medium">{tier.name}</Body>
                    <Body size="sm" className="text-on-dark-muted">{tier.minPoints.toLocaleString()} pts</Body>
                  </Box>
                  <Box className="relative">
                    <ProgressBar value={tier.name === userTier ? 100 : tier.minPoints < userPoints ? 100 : 0} size="lg" />
                    {tier.name === userTier && (
                      <Box className="absolute right-0 top-1/2 -translate-x-2 -translate-y-1/2">
                        <Zap className="size-6 fill-current text-primary" />
                      </Box>
                    )}
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Card>

          <SectionHeader title="Earn Points" description="Ways to earn more points" />
          <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
            {earnActivities.map((activity, idx) => (
              <Card key={idx} className="p-4">
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <activity.icon className="size-5 text-on-dark-muted" />
                    <Body className="font-weight-medium">{activity.name}</Body>
                  </Box>
                  <Badge variant="success">+{activity.points} pts</Badge>
                </Box>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "rewards",
      label: "Rewards",
      icon: <Gift className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Available Rewards" description="Redeem your points for exclusive perks" />
          {rewards.length === 0 ? (
            <Box className="text-center py-12">
              <Gift className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-on-dark-muted">No rewards available</Body>
            </Box>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
              {rewards.map((reward: RewardItem) => (
                <Card key={reward.id} className={`p-6 ${!reward.available ? "opacity-50" : ""}`}>
                  <Stack gap={4}>
                    <Box className="flex items-start justify-between">
                      <Badge variant={reward.available ? "outline" : "outline"}>{reward.type}</Badge>
                      <Box className="text-right">
                        <Body className="font-weight-medium">{reward.points}</Body>
                        <Body size="sm" className="text-on-dark-muted">points</Body>
                      </Box>
                    </Box>
                    <Body className="font-weight-medium">{reward.name}</Body>
                    <Button
                      variant="solid"
                      className="w-full"
                      disabled={!reward.available || userPoints < reward.points}
                      onClick={() => handleRedeem(reward.id)}
                    >
                      {userPoints < reward.points ? "Insufficient Points" : reward.available ? "Redeem" : "Locked"}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Loyalty Program",
        title: "Rewards Program",
        description: "Earn points and unlock exclusive perks",
        badge: <Badge variant="outline">{userTier} Member</Badge>,
      }}
      loading={loading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
