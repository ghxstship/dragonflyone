"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "Individual" | "Team" | "Community";
  category: "Attendance" | "Social" | "Engagement" | "Referral" | "Collection";
  startDate: string;
  endDate: string;
  status: "Active" | "Upcoming" | "Completed";
  participants: number;
  goal: number;
  currentProgress: number;
  reward: string;
  rewardPoints: number;
  userProgress?: number;
  userCompleted?: boolean;
}

interface Leaderboard {
  rank: number;
  userName: string;
  points: number;
  completedChallenges: number;
}

const mockChallenges: Challenge[] = [
  { id: "CH-001", title: "Concert Explorer", description: "Attend 5 different events this season", type: "Individual", category: "Attendance", startDate: "2024-11-01", endDate: "2024-12-31", status: "Active", participants: 1250, goal: 5, currentProgress: 3, reward: "Explorer Badge + 500 Points", rewardPoints: 500, userProgress: 3 },
  { id: "CH-002", title: "Social Butterfly", description: "Share 10 events on social media", type: "Individual", category: "Social", startDate: "2024-11-01", endDate: "2024-11-30", status: "Active", participants: 890, goal: 10, currentProgress: 7, reward: "Social Badge + 300 Points", rewardPoints: 300, userProgress: 7 },
  { id: "CH-003", title: "Community Goal: 10K Check-ins", description: "Help the community reach 10,000 event check-ins", type: "Community", category: "Engagement", startDate: "2024-11-01", endDate: "2024-11-30", status: "Active", participants: 4500, goal: 10000, currentProgress: 7850, reward: "Everyone gets 100 bonus points", rewardPoints: 100 },
  { id: "CH-004", title: "Referral Champion", description: "Invite 3 friends who purchase tickets", type: "Individual", category: "Referral", startDate: "2024-11-15", endDate: "2024-12-15", status: "Active", participants: 450, goal: 3, currentProgress: 1, reward: "Free Ticket + 1000 Points", rewardPoints: 1000, userProgress: 1 },
  { id: "CH-005", title: "Merch Collector", description: "Purchase items from 3 different events", type: "Individual", category: "Collection", startDate: "2024-12-01", endDate: "2024-12-31", status: "Upcoming", participants: 0, goal: 3, currentProgress: 0, reward: "Collector Badge + Exclusive Item", rewardPoints: 750 },
  { id: "CH-006", title: "Summer Fest Superfan", description: "Complete all Summer Fest activities", type: "Individual", category: "Engagement", startDate: "2024-10-01", endDate: "2024-10-31", status: "Completed", participants: 2100, goal: 10, currentProgress: 10, reward: "Superfan Badge + VIP Upgrade", rewardPoints: 2000, userProgress: 10, userCompleted: true },
];

const mockLeaderboard: Leaderboard[] = [
  { rank: 1, userName: "MusicFan2024", points: 15420, completedChallenges: 12 },
  { rank: 2, userName: "ConcertQueen", points: 14850, completedChallenges: 11 },
  { rank: 3, userName: "LiveShowLover", points: 13200, completedChallenges: 10 },
  { rank: 4, userName: "FestivalFreak", points: 12100, completedChallenges: 9 },
  { rank: 5, userName: "VenueHopper", points: 11500, completedChallenges: 9 },
];

export default function ChallengesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const activeChallenges = mockChallenges.filter(c => c.status === "Active").length;
  const totalParticipants = mockChallenges.reduce((sum, c) => sum + c.participants, 0);
  const completedByUser = mockChallenges.filter(c => c.userCompleted).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'solid' | 'outline' | 'ghost'> = {
      Active: 'solid',
      Upcoming: 'outline',
      Completed: 'ghost',
    };
    return <Badge variant={variants[status] || 'ghost'}>{status}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    return <Badge variant="outline">{category}</Badge>;
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
          <FooterColumn title="Community">
            <FooterLink href="/community">Community</FooterLink>
            <FooterLink href="/community/challenges">Challenges</FooterLink>
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
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Challenges & Competitions</H2>
              <Body className="text-on-dark-muted">Complete challenges, earn rewards, and climb the leaderboard</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Active Challenges" value={activeChallenges.toString()} inverted />
              <StatCard label="Total Participants" value={totalParticipants.toLocaleString()} inverted />
              <StatCard label="Your Completed" value={completedByUser.toString()} inverted />
              <StatCard label="Your Points" value="2,450" inverted />
            </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
              <Tab active={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>Upcoming</Tab>
              <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed</Tab>
              <Tab active={activeTab === "leaderboard"} onClick={() => setActiveTab("leaderboard")}>Leaderboard</Tab>
            </TabsList>

            <TabPanel active={activeTab !== "leaderboard"}>
              <Grid cols={2} gap={6}>
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} inverted variant={challenge.userCompleted ? "elevated" : "default"} className="overflow-hidden">
                    <Card inverted className={`p-4 ${challenge.type === "Community" ? "bg-primary-600" : ""}`}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{challenge.title}</Body>
                          <Label className="text-on-dark-muted">{challenge.description}</Label>
                        </Stack>
                        <Badge variant="outline" className="text-white border-white">{challenge.type}</Badge>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" gap={2}>
                        {getCategoryBadge(challenge.category)}
                        {getStatusBadge(challenge.status)}
                      </Stack>
                      
                      {challenge.type === "Community" ? (
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-on-light-muted">Community Progress</Label>
                            <Label className="font-mono">{challenge.currentProgress.toLocaleString()}/{challenge.goal.toLocaleString()}</Label>
                          </Stack>
                          <ProgressBar value={(challenge.currentProgress / challenge.goal) * 100} size="md" />
                        </Stack>
                      ) : (
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-on-light-muted">Your Progress</Label>
                            <Label className="font-mono">{challenge.userProgress || 0}/{challenge.goal}</Label>
                          </Stack>
                          <ProgressBar value={((challenge.userProgress || 0) / challenge.goal) * 100} size="md" />
                        </Stack>
                      )}

                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-light-muted">Reward</Label>
                          <Label size="sm">{challenge.reward}</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-on-light-muted">Participants</Label>
                          <Label className="font-mono">{challenge.participants.toLocaleString()}</Label>
                        </Stack>
                      </Grid>

                      <Stack gap={1}>
                        <Label size="xs" className="text-on-light-muted">Ends</Label>
                        <Label className="font-mono">{challenge.endDate}</Label>
                      </Stack>

                      {challenge.userCompleted ? (
                        <Button variant="outline" disabled>Completed </Button>
                      ) : challenge.status === "Active" ? (
                        <Button variant="solid" onClick={() => setSelectedChallenge(challenge)}>View Details</Button>
                      ) : (
                        <Button variant="outline" onClick={() => setSelectedChallenge(challenge)}>Learn More</Button>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "leaderboard"}>
              <Card inverted className="p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Top Challengers</H3>
                  <Stack gap={3}>
                    {mockLeaderboard.map((entry) => (
                      <Card key={entry.rank} inverted variant={entry.rank <= 3 ? "elevated" : "default"}>
                        <Grid cols={4} gap={4} className="items-center">
                          <Stack direction="horizontal" gap={3} className="items-center">
                            <Label className="font-mono text-h5-md text-white">
                              #{entry.rank}
                            </Label>
                            <Body className="font-display text-white">{entry.userName}</Body>
                          </Stack>
                          <Stack gap={0}>
                            <Label className="font-mono text-h6-md text-white">{entry.points.toLocaleString()}</Label>
                            <Label size="xs" className="text-on-dark-muted">points</Label>
                          </Stack>
                          <Stack gap={0}>
                            <Label className="font-mono text-white">{entry.completedChallenges}</Label>
                            <Label size="xs" className="text-on-dark-muted">challenges</Label>
                          </Stack>
                          <Button variant="outlineInk" size="sm">View Profile</Button>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                  <Card inverted variant="elevated" className="p-4">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Label className="font-mono text-h5-md text-white">#42</Label>
                        <Body className="font-display text-white">You</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Label className="font-mono text-h6-md text-white">2,450</Label>
                        <Label size="xs" className="text-on-dark-muted">points</Label>
                      </Stack>
                      <Stack gap={0}>
                        <Label className="font-mono text-white">{completedByUser}</Label>
                        <Label size="xs" className="text-on-dark-muted">challenges</Label>
                      </Stack>
                      <Badge variant="solid">Keep going!</Badge>
                    </Grid>
                  </Card>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outlineInk" onClick={() => router.push("/community")}>Back to Community</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedChallenge} onClose={() => setSelectedChallenge(null)}>
        <ModalHeader><H3>{selectedChallenge?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedChallenge && (
            <Stack gap={4}>
              <Body className="text-on-light-muted">{selectedChallenge.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Type</Label><Badge variant="outline">{selectedChallenge.type}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Category</Label>{getCategoryBadge(selectedChallenge.category)}</Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="font-display">Progress</Label>
                <ProgressBar value={((selectedChallenge.userProgress || selectedChallenge.currentProgress) / selectedChallenge.goal) * 100} size="lg" />
                <Label className="text-center font-mono">{selectedChallenge.userProgress || selectedChallenge.currentProgress} / {selectedChallenge.goal}</Label>
              </Stack>
              <Card className="border-2 p-4">
                <Stack gap={2}>
                  <Label className="font-display">Reward</Label>
                  <Body>{selectedChallenge.reward}</Body>
                  <Badge variant="solid">+{selectedChallenge.rewardPoints} points</Badge>
                </Stack>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Participants</Label><Label className="font-mono">{selectedChallenge.participants.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-on-light-muted">Ends</Label><Label className="font-mono">{selectedChallenge.endDate}</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedChallenge(null)}>Close</Button>
          {selectedChallenge?.status === "Active" && !selectedChallenge.userCompleted && (
            <Button variant="solid">Join Challenge</Button>
          )}
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
