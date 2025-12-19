"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert, Kicker,
  EmptyState,
} from "@ghxstship/ui";
import { useFanClubsData, FanClub } from "@/hooks/useFanClubs";
import { Users } from "lucide-react";

function FanClubPageContent() {
  const router = useRouter();
  const { clubs, summary, isLoading, error } = useFanClubsData();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'clubs',
    validTabs: ['clubs', 'perks', 'my-clubs'],
  });
  const [selectedClub, setSelectedClub] = useState<FanClub | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Transform clubs to display format
  const fanClubs = clubs.map((club: FanClub) => ({
    id: club.id,
    name: club.name,
    artistName: club.artist_name,
    tier: club.tier,
    monthlyPrice: club.monthly_price,
    memberCount: club.member_count,
    benefits: club.benefits || [],
    exclusiveContent: club.exclusive_events || 0,
    upcomingPerks: club.presale_access ? 'Active' : '0',
  }));

  const totalMembers = fanClubs.reduce((sum, c) => sum + c.memberCount, 0);
  const premiumMembers = fanClubs.filter(c => c.tier !== "Free" && c.tier !== "standard").reduce((sum, c) => sum + c.memberCount, 0);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP": return "bg-success-100 text-success-800";
      case "Premium": return "bg-warning-100 text-warning-800";
      case "Free": return "bg-ink-100 text-ink-800";
      default: return "bg-ink-100 text-ink-800";
    }
  };

  const getPerkTypeColor = (type: string) => {
    switch (type) {
      case "Presale": return "bg-warning-100 text-warning-800";
      case "Content": return "bg-success-100 text-success-800";
      case "Merch": return "bg-pink-100 text-pink-800";
      case "Meet & Greet": return "bg-success-100 text-success-800";
      case "Discount": return "bg-warning-100 text-warning-800";
      default: return "bg-ink-100 text-ink-800";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Exclusive Access</Kicker>
              <H2 size="lg" className="text-white">Fan Clubs</H2>
              <Body className="text-on-dark-muted">Join exclusive fan communities and unlock special perks</Body>
            </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Premium Members" value={premiumMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Fan Clubs" value={summary.total_clubs.toString()} className="border-2 border-black" />
            <StatCard label="Exclusive Events" value={summary.exclusive_events.toString()} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('clubs')} onClick={() => setActiveTab('clubs')}>Fan Clubs</Tab>
              <Tab active={isActive('perks')} onClick={() => setActiveTab('perks')}>Exclusive Perks</Tab>
              <Tab active={isActive('my-clubs')} onClick={() => setActiveTab('my-clubs')}>My Memberships</Tab>
            </TabsList>

            <TabPanel active={isActive('clubs')}>
              {isLoading ? (
                <GvtewayLoadingLayout text="Loading fan clubs..." />
              ) : error ? (
                <EmptyState
                  icon={<Users size={48} />}
                  title="Unable to load fan clubs"
                  description="There was a problem loading fan clubs. Please try again."
                  inverted
                />
              ) : fanClubs.length === 0 ? (
                <EmptyState
                  icon={<Users size={48} />}
                  title="No fan clubs available"
                  description="Check back later for exclusive fan club memberships."
                  inverted
                />
              ) : (
              <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
                {fanClubs.map((club) => (
                  <Card key={club.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4 bg-black text-white">
                      <Stack gap={2}>
                        <Body className="font-weight-bold text-body-md">{club.name}</Body>
                        {club.artistName && <Label className="text-ink-600">{club.artistName}</Label>}
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Badge className={getTierColor(club.tier)}>{club.tier}</Badge>
                        {club.monthlyPrice ? (
                          <Label className="font-mono">${club.monthlyPrice}/mo</Label>
                        ) : (
                          <Label className="text-success-600">Free</Label>
                        )}
                      </Stack>
                      <Label className="text-ink-600">{club.memberCount.toLocaleString()} members</Label>
                      <Stack gap={2}>
                        <Label size="xs" className="text-ink-500">BENEFITS</Label>
                        {club.benefits.slice(0, 3).map((benefit, idx) => (
                          <Stack key={idx} direction="horizontal" gap={2}>
                            <Label className="text-success-600">✓</Label>
                            <Label size="sm" className="">{benefit}</Label>
                          </Stack>
                        ))}
                        {club.benefits.length > 3 && (
                          <Label className="text-ink-500">+{club.benefits.length - 3} more</Label>
                        )}
                      </Stack>
                      <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Card className="p-2 bg-ink-50 text-center">
                          <Label className="font-mono text-body-md">{club.exclusiveContent}</Label>
                          <Label size="xs" className="text-ink-500">Content</Label>
                        </Card>
                        <Card className="p-2 bg-ink-50 text-center">
                          <Label className="font-mono text-body-md">{club.upcomingPerks}</Label>
                          <Label size="xs" className="text-ink-500">Perks</Label>
                        </Card>
                      </Grid>
                      <Button variant="solid" onClick={() => { setSelectedClub(club); setShowJoinModal(true); }}>
                        {club.tier === "Free" ? "Join Free" : "Join Now"}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
              )}
            </TabPanel>

            <TabPanel active={isActive('perks')}>
              {isLoading ? (
                <GvtewayLoadingLayout text="Loading exclusive perks..." />
              ) : error ? (
                <EmptyState
                  icon={<Users size={48} />}
                  title="Unable to load exclusive perks"
                  description="There was a problem loading exclusive perks. Please try again."
                  inverted
                />
              ) : clubs.length === 0 ? (
                <EmptyState
                  icon={<Users size={48} />}
                  title="No exclusive perks available"
                  description="Check back later for exclusive perks."
                  inverted
                />
              ) : (
              <Stack gap={4}>
                {clubs.map((club) => (
                  club.benefits.map((benefit: string, idx: number) => (
                    <Card key={`${club.id}-${idx}`} className="border-2 border-black p-4">
                      <Grid cols={4} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-weight-bold">{benefit}</Body>
                          <Label className="text-ink-600">Exclusive benefit for {club.name} members</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Badge className={getPerkTypeColor("Content")}>Content</Badge>
                          <Badge className={getTierColor(club.tier)}>{club.tier} Only</Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Available</Label>
                          <Label className="font-mono">Now</Label>
                        </Stack>
                        <Button variant="outline">Claim Perk</Button>
                      </Grid>
                    </Card>
                  ))
                ))}
              </Stack>
              )}
            </TabPanel>

            <TabPanel active={isActive('my-clubs')}>
              <Card className="border-2 border-black p-8 text-center">
                <Stack gap={4}>
                  <Label className="text-ink-500">You are not a member of any fan clubs yet</Label>
                  <Button variant="solid" onClick={() => setActiveTab('clubs')}>Browse Fan Clubs</Button>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

            <Button variant="outlineInk" inverted onClick={() => router.push("/community")}>Back to Community</Button>
          </Stack>

      <Modal open={showJoinModal && !!selectedClub} onClose={() => { setShowJoinModal(false); setSelectedClub(null); }}>
        <ModalHeader><H3>Join {selectedClub?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedClub && (
            <Stack gap={4}>
              {selectedClub.artistName && <Label className="text-on-light-muted">{selectedClub.artistName}</Label>}
              <Card className="bg-surface-secondary p-4">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack gap={1}>
                    <Badge className={getTierColor(selectedClub.tier)}>{selectedClub.tier} Membership</Badge>
                    <Label className="text-on-light-muted">{selectedClub.memberCount.toLocaleString()} members</Label>
                  </Stack>
                  {selectedClub.monthlyPrice ? (
                    <Stack gap={0} className="text-right">
                      <Label className="font-mono text-h5-md">${selectedClub.monthlyPrice}</Label>
                      <Label size="xs" className="text-on-light-muted">per month</Label>
                    </Stack>
                  ) : (
                    <Label className="text-h6-md text-success">Free</Label>
                  )}
                </Stack>
              </Card>
              <Stack gap={2}>
                <Label className="font-display">Benefits Included:</Label>
                {selectedClub.benefits.map((benefit, idx) => (
                  <Stack key={idx} direction="horizontal" gap={2}>
                    <Label className="text-success">✓</Label>
                    <Label>{benefit}</Label>
                  </Stack>
                ))}
              </Stack>
              {selectedClub.monthlyPrice && (
                <Alert variant="info">You can cancel anytime. No commitment required.</Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowJoinModal(false); setSelectedClub(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowJoinModal(false); setSelectedClub(null); }}>
            {selectedClub?.monthlyPrice ? "Subscribe" : "Join Free"}
          </Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function FanClubPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <FanClubPageContent />
    </Suspense>
  );
}
