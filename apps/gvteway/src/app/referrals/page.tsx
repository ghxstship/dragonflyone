"use client";

import { useState } from "react";
import { useNotifications } from "@ghxstship/ui";
import { ConsumerNavigationPublic } from "@/components/navigation";
import { useReferrals, Referral } from "@/hooks/useReferrals";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Select,
  Section,
  LoadingSpinner,
  EmptyState,
  Container,
  Stack,
  Card,
  StatCard,
  Grid,
  Kicker,
  Label,
} from "@ghxstship/ui";
import { Users, Copy, Gift, CheckCircle } from "lucide-react";

export default function ReferralsPage() {
  const { addNotification } = useNotifications();
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: referrals, isLoading, error, refetch } = useReferrals();

  const filteredReferrals = (referrals || []).filter((r: Referral) =>
    filterStatus === "all" || r.status === filterStatus
  );

  const totalEarned = (referrals || []).reduce((sum: number, r: Referral) => sum + (r.reward_amount || 0), 0);
  const completedCount = (referrals || []).filter((r: Referral) => r.status === "completed" || r.status === "rewarded").length;

  const handleCopyLink = () => {
    const code = (referrals && referrals[0]?.referral_code) || 'GHXST-USER';
    navigator.clipboard.writeText(`https://gvteway.com/ref/${code}`);
    addNotification({ type: 'success', title: 'Copied!', message: 'Referral link copied to clipboard' });
  };

  if (isLoading) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/venues">Find Venues</FooterLink>
              <FooterLink href="/artists">Artists</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(#fff 1px, transparent 1px),
                linear-gradient(90deg, #fff 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading referrals..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
          >
            <FooterColumn title="Discover">
              <FooterLink href="/events">Browse Events</FooterLink>
              <FooterLink href="/venues">Find Venues</FooterLink>
              <FooterLink href="/artists">Artists</FooterLink>
            </FooterColumn>
            <FooterColumn title="Legal">
              <FooterLink href="/legal/privacy">Privacy</FooterLink>
              <FooterLink href="/legal/terms">Terms</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Section background="black" className="relative min-h-screen overflow-hidden py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(#fff 1px, transparent 1px),
                linear-gradient(90deg, #fff 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />
          <Container className="relative z-10">
            <EmptyState
              title="Error Loading Referrals"
              description={error instanceof Error ? error.message : "An error occurred"}
              action={{ label: "Retry", onClick: () => refetch() }}
              inverted
            />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/referrals">Referrals</FooterLink>
            <FooterLink href="/rewards">Rewards</FooterLink>
          </FooterColumn>
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Earn Rewards</Kicker>
              <H2 size="lg" className="text-white">Referral Program</H2>
              <Body className="text-on-dark-muted">
                Invite friends to join GVTEWAY and earn $50 credit for each friend who attends their first event!
              </Body>
            </Stack>

            {/* Stats */}
            <Grid cols={3} gap={6}>
              <StatCard
                value={(referrals || []).length.toString()}
                label="Total Referrals"
                inverted
              />
              <StatCard
                value={completedCount.toString()}
                label="Completed"
                inverted
              />
              <StatCard
                value={`$${totalEarned}`}
                label="Rewards Earned"
                inverted
              />
            </Grid>

            {/* Referral Code Card */}
            <Card inverted variant="elevated" className="p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Gift className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Your Referral Code</H3>
                </Stack>
                <Stack gap={4} direction="horizontal" className="items-center">
                  <Card inverted className="flex-1 p-4">
                    <Body className="font-mono text-white">
                      {(referrals && referrals[0]?.referral_code) || "GHXST-USER"}
                    </Body>
                  </Card>
                  <Button 
                    variant="solid" 
                    inverted
                    onClick={handleCopyLink}
                    icon={<Copy className="size-4" />}
                    iconPosition="left"
                  >
                    Copy Link
                  </Button>
                </Stack>
              </Stack>
            </Card>

            {/* Referral History */}
            <Stack gap={6}>
              <Stack gap={4} direction="horizontal" className="items-center justify-between">
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Users className="size-5 text-on-dark-muted" />
                  <H3 className="text-white">Referral History</H3>
                </Stack>
                <Stack gap={2}>
                  <Label size="xs" className="text-on-dark-muted">Filter</Label>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    inverted
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="converted">Converted</option>
                  </Select>
                </Stack>
              </Stack>

              {filteredReferrals.length === 0 ? (
                <EmptyState
                  title="No Referrals Yet"
                  description="Share your referral code to start earning rewards!"
                  inverted
                />
              ) : (
                <Stack gap={3}>
                  {filteredReferrals.map((referral) => (
                    <Card key={referral.id} inverted interactive>
                      <Stack gap={4} direction="horizontal" className="items-start justify-between">
                        <Stack gap={2}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <CheckCircle className="size-4 text-on-dark-muted" />
                            <Body className="font-display text-white">
                              Referral #{referral.referral_code}
                            </Body>
                          </Stack>
                          <Label size="xs" className="text-on-dark-muted">
                            Created {referral.created_at ? new Date(referral.created_at).toLocaleDateString() : "—"}
                          </Label>
                          {referral.completed_at && (
                            <Label size="xs" className="text-on-dark-disabled">
                              Completed: {new Date(referral.completed_at).toLocaleDateString()}
                            </Label>
                          )}
                        </Stack>
                        <Stack gap={2} className="items-end">
                          <Badge variant={referral.status === "rewarded" ? "solid" : "outline"}>
                            {referral.status.toUpperCase()}
                          </Badge>
                          {(referral.reward_amount || 0) > 0 && (
                            <Body className="font-display text-white">${referral.reward_amount}</Body>
                          )}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
