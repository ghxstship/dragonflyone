"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { useReferrals, Referral } from "../../hooks/useReferrals";
import {
  PageLayout,
  Navigation,
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
  SectionLayout,
  LoadingSpinner,
  EmptyState,
  Container,
  Stack,
  Card,
  StatCard,
  Grid,
  Link,
} from "@ghxstship/ui";

export default function ReferralsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [filterStatus, setFilterStatus] = useState("all");
  // Note: In production, pass the actual user ID from auth context
  const { data: referrals, isLoading, error, refetch } = useReferrals();

  const filteredReferrals = (referrals || []).filter((r: Referral) =>
    filterStatus === "all" || r.status === filterStatus
  );

  const totalEarned = (referrals || []).reduce((sum: number, r: Referral) => sum + (r.reward_amount || 0), 0);
  const completedCount = (referrals || []).filter((r: Referral) => r.status === "completed" || r.status === "rewarded").length;

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-grey-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/referrals">Referrals</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      {isLoading ? (
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading referrals..." />
        </Container>
      ) : error ? (
        <Container className="py-16">
          <EmptyState
            title="Error Loading Referrals"
            description={error instanceof Error ? error.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        </Container>
      ) : (
        <SectionLayout background="black">
          <Container>
            <Stack gap={8} className="max-w-4xl mx-auto">
              <H2 className="text-white">Referral Program</H2>
              <Body className="text-grey-400">
                Invite friends to join GVTEWAY and earn $50 credit for each friend who attends their first event!
              </Body>

              <Grid cols={3} gap={6}>
                <StatCard
                  value={(referrals || []).length}
                  label="Total Referrals"
                  className="bg-black text-white border-grey-800"
                />
                <StatCard
                  value={completedCount}
                  label="Completed"
                  className="bg-black text-white border-grey-800"
                />
                <StatCard
                  value={`$${totalEarned}`}
                  label="Rewards Earned"
                  className="bg-black text-white border-grey-800"
                />
              </Grid>

              <Card className="border-2 border-grey-800 p-6 bg-black">
                <Stack gap={4}>
                  <H3 className="text-white">Your Referral Code</H3>
                  <Stack gap={4} direction="horizontal" className="items-center">
                    <Card className="flex-1 border-2 border-grey-700 bg-black p-4">
                      <Body className="font-mono text-h6-md text-white">
                        {(referrals && referrals[0]?.referral_code) || "GHXST-USER"}
                      </Body>
                    </Card>
                    <Button variant="solid" onClick={() => { navigator.clipboard.writeText(`https://gvteway.com/ref/${(referrals && referrals[0]?.referral_code) || 'GHXST-USER'}`); addNotification({ type: 'success', title: 'Copied!', message: 'Referral link copied to clipboard' }); }}>Copy Link</Button>
                  </Stack>
                </Stack>
              </Card>

              <Stack gap={4}>
                <Stack gap={4} direction="horizontal" className="justify-between items-center">
                  <H3 className="text-white">Referral History</H3>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-black text-white border-grey-700"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="converted">Converted</option>
                  </Select>
                </Stack>

                {filteredReferrals.length === 0 ? (
                  <EmptyState
                    title="No Referrals Yet"
                    description="Share your referral code to start earning rewards!"
                  />
                ) : (
                  <Stack gap={3}>
                    {filteredReferrals.map((referral) => (
                      <Card key={referral.id} className="border-2 border-grey-800 p-6 bg-black">
                        <Stack gap={4} direction="horizontal" className="justify-between items-start">
                          <Stack gap={1}>
                            <Body className="font-display text-body-md text-white">
                              Referral #{referral.referral_code}
                            </Body>
                            <Body className="text-body-sm text-grey-400">
                              Created {referral.created_at ? new Date(referral.created_at).toLocaleDateString() : "—"}
                            </Body>
                            {referral.completed_at && (
                              <Body className="text-body-sm text-grey-400">
                                Completed: {new Date(referral.completed_at).toLocaleDateString()}
                              </Body>
                            )}
                          </Stack>
                          <Stack gap={2} className="text-right items-end">
                            <Badge variant={referral.status === "rewarded" ? "solid" : "outline"}>
                              {referral.status}
                            </Badge>
                            {(referral.reward_amount || 0) > 0 && (
                              <Body className="font-mono text-body-md text-white">${referral.reward_amount}</Body>
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
        </SectionLayout>
      )}
    </PageLayout>
  );
}
