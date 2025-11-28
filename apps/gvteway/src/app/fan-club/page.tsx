"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface FanClub {
  id: string;
  name: string;
  artistId?: string;
  artistName?: string;
  memberCount: number;
  tier: "Free" | "Premium" | "VIP";
  monthlyPrice?: number;
  benefits: string[];
  exclusiveContent: number;
  upcomingPerks: number;
}

interface ExclusivePerk {
  id: string;
  title: string;
  type: "Presale" | "Content" | "Merch" | "Meet & Greet" | "Discount";
  description: string;
  availableDate: string;
  claimedCount: number;
  totalAvailable?: number;
  tier: "Free" | "Premium" | "VIP";
}

const mockFanClubs: FanClub[] = [
  { id: "FC-001", name: "Midnight Collective Fans", artistName: "The Midnight Collective", memberCount: 12500, tier: "Premium", monthlyPrice: 9.99, benefits: ["48hr Presale", "Exclusive Content", "Member Discord", "10% Merch Discount"], exclusiveContent: 45, upcomingPerks: 3 },
  { id: "FC-002", name: "Aurora Keys Inner Circle", artistName: "Aurora Keys", memberCount: 8200, tier: "VIP", monthlyPrice: 19.99, benefits: ["72hr Presale", "Meet & Greet Lottery", "Signed Merch", "Live Q&As", "20% Discount"], exclusiveContent: 78, upcomingPerks: 5 },
  { id: "FC-003", name: "Summer Fest Superfans", memberCount: 25000, tier: "Free", benefits: ["Newsletter", "Early Announcements", "Community Access"], exclusiveContent: 12, upcomingPerks: 2 },
];

const mockPerks: ExclusivePerk[] = [
  { id: "PERK-001", title: "Summer Fest 2024 Presale", type: "Presale", description: "Get tickets 48 hours before general public", availableDate: "2024-11-20", claimedCount: 3450, totalAvailable: 5000, tier: "Premium" },
  { id: "PERK-002", title: "Behind the Scenes Documentary", type: "Content", description: "Exclusive 30-minute documentary from the last tour", availableDate: "2024-11-15", claimedCount: 8900, tier: "Premium" },
  { id: "PERK-003", title: "Limited Edition Poster", type: "Merch", description: "Signed limited edition tour poster", availableDate: "2024-11-25", claimedCount: 150, totalAvailable: 500, tier: "VIP" },
  { id: "PERK-004", title: "Virtual Meet & Greet", type: "Meet & Greet", description: "15-minute video call with the artist", availableDate: "2024-12-01", claimedCount: 20, totalAvailable: 50, tier: "VIP" },
  { id: "PERK-005", title: "Holiday Merch Discount", type: "Discount", description: "30% off all merchandise", availableDate: "2024-12-15", claimedCount: 0, tier: "Free" },
];

export default function FanClubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("clubs");
  const [selectedClub, setSelectedClub] = useState<FanClub | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const totalMembers = mockFanClubs.reduce((sum, c) => sum + c.memberCount, 0);
  const premiumMembers = mockFanClubs.filter(c => c.tier !== "Free").reduce((sum, c) => sum + c.memberCount, 0);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP": return "bg-purple-100 text-purple-800";
      case "Premium": return "bg-warning-100 text-warning-800";
      case "Free": return "bg-ink-100 text-ink-800";
      default: return "bg-ink-100 text-ink-800";
    }
  };

  const getPerkTypeColor = (type: string) => {
    switch (type) {
      case "Presale": return "bg-info-100 text-info-800";
      case "Content": return "bg-purple-100 text-purple-800";
      case "Merch": return "bg-pink-100 text-pink-800";
      case "Meet & Greet": return "bg-success-100 text-success-800";
      case "Discount": return "bg-warning-100 text-warning-800";
      default: return "bg-ink-100 text-ink-800";
    }
  };

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Community">
            <FooterLink href="/fan-club">Fan Clubs</FooterLink>
            <FooterLink href="/community">Community</FooterLink>
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
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Exclusive Access</Kicker>
              <H2 size="lg" className="text-white">Fan Clubs</H2>
              <Body className="text-on-dark-muted">Join exclusive fan communities and unlock special perks</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Premium Members" value={premiumMembers.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Fan Clubs" value={mockFanClubs.length} className="border-2 border-black" />
            <StatCard label="Active Perks" value={mockPerks.length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "clubs"} onClick={() => setActiveTab("clubs")}>Fan Clubs</Tab>
              <Tab active={activeTab === "perks"} onClick={() => setActiveTab("perks")}>Exclusive Perks</Tab>
              <Tab active={activeTab === "my-clubs"} onClick={() => setActiveTab("my-clubs")}>My Memberships</Tab>
            </TabsList>

            <TabPanel active={activeTab === "clubs"}>
              <Grid cols={3} gap={6}>
                {mockFanClubs.map((club) => (
                  <Card key={club.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4 bg-black text-white">
                      <Stack gap={2}>
                        <Body className="font-bold text-body-md">{club.name}</Body>
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
                            <Label className="text-body-sm">{benefit}</Label>
                          </Stack>
                        ))}
                        {club.benefits.length > 3 && (
                          <Label className="text-ink-500 text-body-sm">+{club.benefits.length - 3} more</Label>
                        )}
                      </Stack>
                      <Grid cols={2} gap={2}>
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
            </TabPanel>

            <TabPanel active={activeTab === "perks"}>
              <Stack gap={4}>
                {mockPerks.map((perk) => (
                  <Card key={perk.id} className="border-2 border-black p-4">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-bold">{perk.title}</Body>
                        <Label className="text-ink-600 text-body-sm">{perk.description}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Badge className={getPerkTypeColor(perk.type)}>{perk.type}</Badge>
                        <Badge className={getTierColor(perk.tier)}>{perk.tier} Only</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Available</Label>
                        <Label className="font-mono">{perk.availableDate}</Label>
                        {perk.totalAvailable && (
                          <Label size="xs" className="text-ink-500">{perk.claimedCount}/{perk.totalAvailable} claimed</Label>
                        )}
                      </Stack>
                      <Button variant="outline">Claim Perk</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "my-clubs"}>
              <Card className="border-2 border-black p-8 text-center">
                <Stack gap={4}>
                  <Label className="text-ink-500">You are not a member of any fan clubs yet</Label>
                  <Button variant="solid" onClick={() => setActiveTab("clubs")}>Browse Fan Clubs</Button>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

            <Button variant="outlineInk" inverted onClick={() => router.push("/community")}>Back to Community</Button>
          </Stack>
        </Container>
      </Section>

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
    </PageLayout>
  );
}
