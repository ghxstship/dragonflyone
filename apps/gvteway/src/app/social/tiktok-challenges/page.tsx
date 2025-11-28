"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface TikTokChallenge {
  id: string;
  name: string;
  hashtag: string;
  eventName: string;
  status: "Active" | "Scheduled" | "Completed";
  startDate: string;
  endDate: string;
  participants: number;
  views: number;
  engagement: number;
  prize?: string;
}

const mockChallenges: TikTokChallenge[] = [
  { id: "TTC-001", name: "Festival Dance Challenge", hashtag: "#SummerFestDance", eventName: "Summer Fest 2024", status: "Active", startDate: "2024-11-20", endDate: "2024-12-05", participants: 12500, views: 2450000, engagement: 8.2, prize: "VIP Tickets + Merch Bundle" },
  { id: "TTC-002", name: "Countdown Duet", hashtag: "#SummerFestCountdown", eventName: "Summer Fest 2024", status: "Active", startDate: "2024-11-15", endDate: "2024-11-30", participants: 8900, views: 1890000, engagement: 6.5, prize: "Backstage Passes" },
  { id: "TTC-003", name: "Best Festival Fit", hashtag: "#FestivalFitCheck", eventName: "Summer Fest 2024", status: "Scheduled", startDate: "2024-12-01", endDate: "2024-12-15", participants: 0, views: 0, engagement: 0, prize: "Shopping Spree" },
  { id: "TTC-004", name: "Throwback Memories", hashtag: "#FestMemories", eventName: "Fall Concert", status: "Completed", startDate: "2024-10-01", endDate: "2024-10-15", participants: 5600, views: 980000, engagement: 7.1 },
];

export default function TikTokChallengesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChallenge, setSelectedChallenge] = useState<TikTokChallenge | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const totalViews = mockChallenges.reduce((s, c) => s + c.views, 0);
  const totalParticipants = mockChallenges.reduce((s, c) => s + c.participants, 0);
  const activeCount = mockChallenges.filter(c => c.status === "Active").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Scheduled": return "text-info-600";
      case "Completed": return "text-ink-500";
      default: return "text-ink-600";
    }
  };

  const filteredChallenges = activeTab === "all" ? mockChallenges : mockChallenges.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Social">
            <FooterLink href="/social">Social Hub</FooterLink>
            <FooterLink href="/social/tiktok-challenges">TikTok Challenges</FooterLink>
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
              <Kicker colorScheme="on-dark">Social</Kicker>
              <H2 size="lg" className="text-white">TikTok Challenges</H2>
              <Body className="text-on-dark-muted">Create and manage viral TikTok challenge campaigns</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Views" value={formatNumber(totalViews)} className="border-2 border-black" />
            <StatCard label="Participants" value={formatNumber(totalParticipants)} className="border-2 border-black" />
            <StatCard label="Active Challenges" value={activeCount} className="border-2 border-black" />
            <StatCard label="Avg Engagement" value="7.3%" className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
                <Tab active={activeTab === "scheduled"} onClick={() => setActiveTab("scheduled")}>Scheduled</Tab>
                <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Challenge</Button>
          </Stack>

          <Stack gap={4}>
            {filteredChallenges.map((challenge) => (
              <Card key={challenge.id} className="border-2 border-black p-6">
                <Grid cols={6} gap={4} className="items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{challenge.name}</Body>
                    <Label className="text-info-600">{challenge.hashtag}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Event</Label>
                    <Label>{challenge.eventName}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Duration</Label>
                    <Label>{challenge.startDate} - {challenge.endDate}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label className="text-ink-500">Views</Label>
                    <Label className="font-mono">{formatNumber(challenge.views)}</Label>
                  </Stack>
                  <Label className={getStatusColor(challenge.status)}>{challenge.status}</Label>
                  <Button variant="outline" size="sm" onClick={() => setSelectedChallenge(challenge)}>Details</Button>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Button variant="outlineInk" onClick={() => router.push("/social")}>Back to Social</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedChallenge} onClose={() => setSelectedChallenge(null)}>
        <ModalHeader><H3>{selectedChallenge?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedChallenge && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Label className="text-info-600 text-body-md">{selectedChallenge.hashtag}</Label>
                <Label className={getStatusColor(selectedChallenge.status)}>{selectedChallenge.status}</Label>
              </Stack>
              <Stack gap={1}><Label className="text-ink-500">Event</Label><Label>{selectedChallenge.eventName}</Label></Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Start Date</Label><Label>{selectedChallenge.startDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">End Date</Label><Label>{selectedChallenge.endDate}</Label></Stack>
              </Grid>
              <Grid cols={3} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Participants</Label><Label className="font-mono text-h6-md">{formatNumber(selectedChallenge.participants)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Views</Label><Label className="font-mono text-h6-md">{formatNumber(selectedChallenge.views)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Engagement</Label><Label className="font-mono text-h6-md">{selectedChallenge.engagement}%</Label></Stack>
              </Grid>
              {selectedChallenge.engagement > 0 && (
                <Stack gap={2}>
                  <Label className="text-ink-500">Engagement Rate</Label>
                  <ProgressBar value={selectedChallenge.engagement * 10} className="h-2" />
                </Stack>
              )}
              {selectedChallenge.prize && (
                <Stack gap={1}><Label className="text-ink-500">Prize</Label><Badge variant="solid">{selectedChallenge.prize}</Badge></Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedChallenge(null)}>Close</Button>
          <Button variant="outline">View Entries</Button>
          <Button variant="solid">Promote</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create TikTok Challenge</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Challenge Name" className="border-2 border-black" />
            <Input placeholder="Hashtag (e.g., #YourChallenge)" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
              <option value="EVT-002">Fall Concert</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="date" className="border-2 border-black" />
              <Input type="date" className="border-2 border-black" />
            </Grid>
            <Textarea placeholder="Challenge description and rules..." rows={3} className="border-2 border-black" />
            <Input placeholder="Prize (optional)" className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
