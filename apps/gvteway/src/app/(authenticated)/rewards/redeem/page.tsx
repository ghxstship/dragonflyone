"use client";

/**
 * Rewards Redeem Page
 * Catalog of redeemable rewards
 * Uses DetailPage template for consistent layout
 */

import {
  Body,
  Card,
  Grid,
  Badge,
  Button,
  DetailPage,
  Section,
  SectionHeader,
  StatCard,
  Box,
  Stack,
} from "@ghxstship/ui";
import { Award, Gift, Star, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface RewardItem {
  id: string;
  name: string;
  description: string;
  type: string;
  points_required: number;
  availability: "available" | "locked" | "redeemed" | "expired";
  expires_at: string | null;
}

interface RewardsCatalogResponse {
  rewards: RewardItem[];
  user_points: number;
  available_count: number;
}

async function fetchRewardsCatalog(): Promise<RewardsCatalogResponse> {
  const response = await fetch("/api/rewards/catalog");
  if (!response.ok) {
    return {
      rewards: [],
      user_points: 0,
      available_count: 0,
    };
  }
  return response.json();
}

async function redeemReward(rewardId: string): Promise<{ success: boolean }> {
  const response = await fetch("/api/rewards/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reward_id: rewardId }),
  });
  if (!response.ok) {
    throw new Error("Failed to redeem reward");
  }
  return response.json();
}

export default function RewardsRedeemPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["rewards-catalog"],
    queryFn: fetchRewardsCatalog,
  });

  const redeemMutation = useMutation({
    mutationFn: redeemReward,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["rewards-history"] });
    },
  });

  const rewards = data?.rewards || [];
  const userPoints = data?.user_points || 0;
  const availableCount = data?.available_count || 0;

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case "available":
        return <Gift className="size-5 text-success" />;
      case "locked":
        return <Lock className="size-5 text-text-muted" />;
      case "redeemed":
        return <Star className="size-5 text-info" />;
      default:
        return <Gift className="size-5 text-text-disabled" />;
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    const variants: Record<string, "success" | "warning" | "error" | "info" | "ghost" | "outline"> = {
      available: "success",
      locked: "ghost",
      redeemed: "info",
      expired: "error",
    };
    return (
      <Badge variant={variants[availability] || "ghost"}>
        {availability.charAt(0).toUpperCase() + availability.slice(1)}
      </Badge>
    );
  };

  const canRedeem = (reward: RewardItem) => {
    return reward.availability === "available" && userPoints >= reward.points_required;
  };

  const tabs = [
    {
      id: "catalog",
      label: "Rewards Catalog",
      icon: <Gift className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6">
            <StatCard
              label="Your Points"
              value={userPoints.toLocaleString()}
              icon={<Award className="size-5" />}
            />
            <StatCard
              label="Available Rewards"
              value={availableCount.toString()}
              icon={<Gift className="size-5" />}
            />
            <StatCard
              label="Total Rewards"
              value={rewards.length.toString()}
              icon={<Star className="size-5" />}
            />
          </Grid>

          <SectionHeader
            title="Available Rewards"
            description="Redeem your points for exclusive perks"
          />

          {rewards.length === 0 ? (
            <Card className="p-12 text-center">
              <Gift className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted" data-testid="redeemable-items">No rewards available</Body>
            </Card>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2" data-testid="redeemable-items">
              {rewards.map((reward) => (
                <Card
                  key={reward.id}
                  className={`p-6 ${reward.availability !== "available" ? "opacity-60" : ""}`}
                >
                  <Stack gap={4}>
                    <Box className="flex items-start justify-between">
                      <Box className="flex items-center gap-3">
                        {getAvailabilityIcon(reward.availability)}
                        <Badge variant="outline">{reward.type}</Badge>
                      </Box>
                      {getAvailabilityBadge(reward.availability)}
                    </Box>

                    <Stack gap={2}>
                      <Body className="font-weight-medium">{reward.name}</Body>
                      <Body size="sm" className="text-text-muted">
                        {reward.description}
                      </Body>
                    </Stack>

                    <Box className="flex items-center justify-between">
                      <Box className="text-left" data-testid="points-required">
                        <Body className="font-weight-medium">{reward.points_required.toLocaleString()}</Body>
                        <Body size="sm" className="text-text-muted">points</Body>
                      </Box>

                      {reward.expires_at && (
                        <Body size="sm" className="text-text-muted">
                          Expires: {new Date(reward.expires_at).toLocaleDateString()}
                        </Body>
                      )}
                    </Box>

                    <Button
                      variant="solid"
                      className="w-full"
                      disabled={!canRedeem(reward) || redeemMutation.isPending}
                      onClick={() => redeemMutation.mutate(reward.id)}
                    >
                      {redeemMutation.isPending && redeemMutation.variables === reward.id
                        ? "Redeeming..."
                        : userPoints < reward.points_required
                          ? "Insufficient Points"
                          : reward.availability === "available"
                            ? "Redeem"
                            : reward.availability === "locked"
                              ? "Locked"
                              : reward.availability === "redeemed"
                                ? "Already Redeemed"
                                : "Expired"}
                    </Button>

                    {userPoints < reward.points_required && reward.availability === "available" && (
                      <Body size="sm" className="text-center text-warning" data-testid="insufficient-points">
                        You need {(reward.points_required - userPoints).toLocaleString()} more points
                      </Body>
                    )}
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
        kicker: "Rewards Program",
        title: "Redeem Rewards",
        description: "Exchange your points for exclusive perks and experiences",
        badge: <Badge variant="outline">{userPoints.toLocaleString()} pts</Badge>,
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
