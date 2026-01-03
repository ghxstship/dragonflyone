"use client";

/**
 * Membership Referrals Page
 * Referral code, share options, and stats
 */

import { useState } from "react";
import {
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Box,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
  StatCard,
  Input,
} from "@ghxstship/ui";
import {
  Users,
  Copy,
  Share2,
  Gift,
  DollarSign,
  Check,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  pendingRewards: number;
  earnedRewards: number;
  referralLink: string;
}

const DEMO_STATS: ReferralStats = {
  referralCode: "MEMBER2024",
  totalReferred: 5,
  pendingRewards: 2,
  earnedRewards: 150,
  referralLink: "https://gvteway.com/join?ref=MEMBER2024",
};

async function fetchReferralStats(): Promise<ReferralStats> {
  const response = await fetch("/api/membership/referrals");
  if (!response.ok) return DEMO_STATS;
  const data = await response.json();
  return data.stats || DEMO_STATS;
}

export default function MembershipReferralsPage() {
  const [copied, setCopied] = useState(false);
  const { data: stats = DEMO_STATS, isLoading, error, refetch } = useQuery({
    queryKey: ["membership-referrals"],
    queryFn: fetchReferralStats,
  });

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async (platform: string) => {
    const text = `Join me on GVTEWAY and get exclusive benefits! Use my referral code: ${stats.referralCode}`;
    const url = stats.referralLink;

    switch (platform) {
      case "email":
        window.open(`mailto:?subject=Join GVTEWAY&body=${encodeURIComponent(text + "\n\n" + url)}`);
        break;
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: "Join GVTEWAY", text, url });
        }
    }
  };

  const tabs = [
    {
      id: "share",
      label: "Share",
      icon: <Share2 className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6" data-testid="referral-stats">
            <StatCard
              label="Friends Referred"
              value={stats.totalReferred.toString()}
              icon={<Users className="size-5" />}
            />
            <StatCard
              label="Pending Rewards"
              value={stats.pendingRewards.toString()}
              icon={<Gift className="size-5" />}
            />
            <StatCard
              label="Rewards Earned"
              value={`$${stats.earnedRewards}`}
              icon={<DollarSign className="size-5" />}
            />
          </Grid>

          <SectionHeader
            title="Your Referral Code"
            description="Share this code with friends to earn rewards"
          />
          <Card className="p-6 mb-6" data-testid="referral-code">
            <Stack gap={4}>
              <Box className="flex items-center gap-4">
                <Box className="flex-1 p-4 bg-surface-secondary rounded-card text-center">
                  <Body className="text-h2-desktop font-weight-bold font-mono tracking-display">
                    {stats.referralCode}
                  </Body>
                </Box>
                <Button
                  variant="solid"
                  onClick={handleCopyCode}
                  data-testid="copy-code"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </Box>

              <Box>
                <Body size="sm" className="text-text-muted mb-2">Or share your referral link:</Body>
                <Box className="flex gap-2">
                  <Input
                    value={stats.referralLink}
                    readOnly
                    className="flex-1 font-mono text-body-sm"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    <Copy className="size-4" />
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Card>

          <SectionHeader
            title="Share Options"
            description="Invite friends through your preferred platform"
          />
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3" data-testid="share-options">
            <Card
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow text-center"
              onClick={() => handleShare("email")}
            >
              <Mail className="size-8 text-primary mx-auto mb-2" />
              <Body className="font-weight-medium">Email</Body>
            </Card>
            <Card
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow text-center"
              onClick={() => handleShare("twitter")}
            >
              <MessageCircle className="size-8 text-primary mx-auto mb-2" />
              <Body className="font-weight-medium">Twitter</Body>
            </Card>
            <Card
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow text-center"
              onClick={() => handleShare("facebook")}
            >
              <Share2 className="size-8 text-primary mx-auto mb-2" />
              <Body className="font-weight-medium">Facebook</Body>
            </Card>
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
          <SectionHeader
            title="Referral Rewards"
            description="How the referral program works"
          />
          <Card className="p-6 mb-6" data-testid="referral-rewards">
            <Stack gap={6}>
              <Box className="flex items-start gap-4">
                <Box className="p-3 bg-primary/10 rounded-card text-primary">
                  <Users className="size-6" />
                </Box>
                <Box>
                  <Body className="font-weight-medium">Invite Friends</Body>
                  <Body size="sm" className="text-text-muted">
                    Share your unique referral code with friends and family
                  </Body>
                </Box>
              </Box>

              <Box className="flex items-start gap-4">
                <Box className="p-3 bg-accent/10 rounded-card text-accent">
                  <Gift className="size-6" />
                </Box>
                <Box>
                  <Body className="font-weight-medium">They Join</Body>
                  <Body size="sm" className="text-text-muted">
                    When they sign up using your code, they get 10% off their first month
                  </Body>
                </Box>
              </Box>

              <Box className="flex items-start gap-4">
                <Box className="p-3 bg-success/10 rounded-card text-success">
                  <DollarSign className="size-6" />
                </Box>
                <Box>
                  <Body className="font-weight-medium">You Earn</Body>
                  <Body size="sm" className="text-text-muted">
                    You receive $10 credit for each friend who becomes a paid member
                  </Body>
                </Box>
              </Box>
            </Stack>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <Box className="flex items-center justify-between">
              <Box>
                <Body className="font-weight-bold" data-testid="referral-rewards">
                  Your Total Earnings
                </Body>
                <Body size="sm" className="text-text-muted">
                  From {stats.totalReferred} successful referrals
                </Body>
              </Box>
              <Badge variant="success" className="text-h3-desktop">
                ${stats.earnedRewards}
              </Badge>
            </Box>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Membership",
        title: "Referral Program",
        description: "Invite friends and earn rewards",
        badge: (
          <Badge variant="success">
            {stats.totalReferred} Referrals
          </Badge>
        ),
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
