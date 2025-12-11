"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_CHALLENGES,
  DEMO_LEADERBOARD,
  type DemoChallenge as Challenge,
} from "@/lib/demo-data";

const mockChallenges = DEMO_CHALLENGES;
const mockLeaderboard = DEMO_LEADERBOARD;

function ChallengesPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'active',
    validTabs: ['active', 'upcoming', 'completed', 'leaderboard'],
  });
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
    <GvtewayAppLayout>
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
              <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active</Tab>
              <Tab active={isActive('upcoming')} onClick={() => setActiveTab('upcoming')}>Upcoming</Tab>
              <Tab active={isActive('completed')} onClick={() => setActiveTab('completed')}>Completed</Tab>
              <Tab active={isActive('leaderboard')} onClick={() => setActiveTab('leaderboard')}>Leaderboard</Tab>
            </TabsList>

            <TabPanel active={!isActive('leaderboard')}>
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

            <TabPanel active={isActive('leaderboard')}>
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
    </GvtewayAppLayout>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ChallengesPageContent />
    </Suspense>
  );
}
