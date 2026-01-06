"use client";

/**
 * Membership Dashboard Page
 * Shows current membership status, card, renewal info
 * Uses DetailPage template with tabs
 */

import { useRouter } from "next/navigation";
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
} from "@ghxstship/ui";
import {
  Crown,
  Calendar,
  CreditCard,
  ArrowUpRight,
  XCircle,
  RefreshCw,
  Gift,
  Star,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Membership {
  id: string;
  tier: string;
  status: string;
  points: number;
  created_at: string;
  end_date?: string;
}

async function fetchCurrentMembership(): Promise<Membership | null> {
  const response = await fetch("/api/membership?current=true");
  if (!response.ok) return null;
  const data = await response.json();
  return data.membership || null;
}

export default function MembershipDashboardPage() {
  const router = useRouter();
  const { data: membership, isLoading, error, refetch } = useQuery({
    queryKey: ["current-membership"],
    queryFn: fetchCurrentMembership,
  });

  const memberSince = membership?.created_at
    ? new Date(membership.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const renewalDate = membership?.end_date
    ? new Date(membership.end_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const daysUntilRenewal = membership?.end_date
    ? Math.ceil(
        (new Date(membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const handleUpgrade = () => {
    router.push("/membership/apply?upgrade=true");
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your membership?")) return;
    
    try {
      const response = await fetch("/api/membership", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          membership_id: membership?.id,
          action: "cancel",
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to cancel membership. Please try again.");
        return;
      }
      refetch();
    } catch {
      alert("Failed to cancel membership. Please check your connection and try again.");
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <Crown className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6">
            <StatCard
              label="Current Tier"
              value={membership?.tier || "Free"}
              icon={<Crown className="size-5" />}
              data-testid="membership-status"
            />
            <StatCard
              label="Points Balance"
              value={(membership?.points || 0).toLocaleString()}
              icon={<Star className="size-5" />}
            />
            <StatCard
              label="Days Until Renewal"
              value={daysUntilRenewal?.toString() || "—"}
              icon={<Clock className="size-5" />}
              data-testid="renewal-date"
            />
          </Grid>

          <SectionHeader title="Membership Card" description="Your digital membership card" />
          <Card className="p-6 mb-6 bg-gradient-to-br from-primary to-secondary text-text-primary" data-testid="membership-card">
            <Stack gap={4}>
              <Box className="flex items-center justify-between">
                <Crown className="size-8" />
                <Badge variant="outline" className="border-white text-text-primary">
                  {membership?.tier || "Free"} Member
                </Badge>
              </Box>
              <Box>
                <Body size="sm" className="opacity-80">Member Since</Body>
                <Body className="font-weight-bold" data-testid="member-since">{memberSince}</Body>
              </Box>
              <Box className="flex items-center justify-between">
                <Box>
                  <Body size="sm" className="opacity-80">Member ID</Body>
                  <Body className="font-mono">{membership?.id?.slice(0, 8) || "—"}</Body>
                </Box>
                <Box className="text-right">
                  <Body size="sm" className="opacity-80">Status</Body>
                  <Body className="font-weight-bold capitalize">{membership?.status || "Active"}</Body>
                </Box>
              </Box>
            </Stack>
          </Card>

          <SectionHeader title="Quick Actions" description="Manage your membership" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleUpgrade}>
              <Box className="flex items-center gap-3">
                <ArrowUpRight className="size-5 text-primary" />
                <Box>
                  <Body className="font-weight-medium">Upgrade Tier</Body>
                  <Body size="sm" className="text-text-muted">Get more benefits</Body>
                </Box>
              </Box>
            </Card>
            <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push("/membership/benefits")}>
              <Box className="flex items-center gap-3">
                <Gift className="size-5 text-accent" />
                <Box>
                  <Body className="font-weight-medium">View Benefits</Body>
                  <Body size="sm" className="text-text-muted">See what you get</Body>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Section>
      ),
    },
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Billing Information" description="Your payment and renewal details" />
          <Card className="p-6 mb-6">
            <Stack gap={4}>
              <Box className="flex items-center justify-between p-4 bg-surface-secondary rounded-card">
                <Box>
                  <Body size="sm" className="text-text-muted">Next Renewal</Body>
                  <Body className="font-weight-bold" data-testid="renewal-date">{renewalDate}</Body>
                </Box>
                <Badge variant={daysUntilRenewal && daysUntilRenewal < 7 ? "error" : "success"}>
                  {daysUntilRenewal ? `${daysUntilRenewal} days` : "—"}
                </Badge>
              </Box>

              <Box className="flex items-center justify-between">
                <Box>
                  <Body className="font-weight-medium">Auto-Renewal</Body>
                  <Body size="sm" className="text-text-muted">
                    Your membership will automatically renew
                  </Body>
                </Box>
                <Badge variant="success">Enabled</Badge>
              </Box>

              <Box className="flex gap-3 pt-4 border-t border-border-primary">
                <Button variant="outline" onClick={() => router.push("/membership/history")}>
                  <Calendar className="size-4 mr-2" />
                  View History
                </Button>
                <Button variant="outline">
                  <RefreshCw className="size-4 mr-2" />
                  Update Payment
                </Button>
              </Box>
            </Stack>
          </Card>

          <SectionHeader title="Cancel Membership" description="We're sorry to see you go" />
          <Card className="p-6 border-error/20">
            <Box className="flex items-center justify-between">
              <Box>
                <Body className="font-weight-medium">Cancel your membership</Body>
                <Body size="sm" className="text-text-muted">
                  You will lose access to all member benefits
                </Body>
              </Box>
              <Button variant="ghost" className="text-error" onClick={handleCancel}>
                <XCircle className="size-4 mr-2" />
                Cancel
              </Button>
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
        title: "Your Membership",
        description: "Manage your membership and benefits",
        badge: (
          <Badge variant={membership?.status === "active" ? "success" : "warning"}>
            {membership?.status || "Active"}
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
