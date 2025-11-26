"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-green-600";
      case "Upcoming": return "text-blue-600";
      case "Completed": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Attendance": return "bg-blue-100 text-blue-800";
      case "Social": return "bg-pink-100 text-pink-800";
      case "Engagement": return "bg-purple-100 text-purple-800";
      case "Referral": return "bg-green-100 text-green-800";
      case "Collection": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredChallenges = activeTab === "all" ? mockChallenges : mockChallenges.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Challenges & Competitions</H1>
            <Body className="text-grey-600">Complete challenges, earn rewards, and climb the leaderboard</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Challenges" value={activeChallenges} className="border-2 border-black" />
            <StatCard label="Total Participants" value={totalParticipants.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Your Completed" value={completedByUser} className="border-2 border-black" />
            <StatCard label="Your Points" value="2,450" className="border-2 border-black" />
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
                  <Card key={challenge.id} className={`border-2 overflow-hidden ${challenge.userCompleted ? "border-green-500" : "border-black"}`}>
                    <Card className={`p-4 ${challenge.type === "Community" ? "bg-purple-600" : "bg-black"} text-white`}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-bold">{challenge.title}</Body>
                          <Label className="text-white/80">{challenge.description}</Label>
                        </Stack>
                        <Badge variant="outline" className="text-white border-white">{challenge.type}</Badge>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Stack direction="horizontal" gap={2}>
                        <Badge className={getCategoryColor(challenge.category)}>{challenge.category}</Badge>
                        <Label className={getStatusColor(challenge.status)}>{challenge.status}</Label>
                      </Stack>
                      
                      {challenge.type === "Community" ? (
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-gray-600">Community Progress</Label>
                            <Label className="font-mono">{challenge.currentProgress.toLocaleString()}/{challenge.goal.toLocaleString()}</Label>
                          </Stack>
                          <ProgressBar value={(challenge.currentProgress / challenge.goal) * 100} size="md" />
                        </Stack>
                      ) : (
                        <Stack gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-gray-600">Your Progress</Label>
                            <Label className="font-mono">{challenge.userProgress || 0}/{challenge.goal}</Label>
                          </Stack>
                          <ProgressBar value={((challenge.userProgress || 0) / challenge.goal) * 100} size="md" />
                        </Stack>
                      )}

                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-gray-500">Reward</Label>
                          <Label className="text-sm">{challenge.reward}</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-gray-500">Participants</Label>
                          <Label className="font-mono">{challenge.participants.toLocaleString()}</Label>
                        </Stack>
                      </Grid>

                      <Stack gap={1}>
                        <Label size="xs" className="text-gray-500">Ends</Label>
                        <Label className="font-mono">{challenge.endDate}</Label>
                      </Stack>

                      {challenge.userCompleted ? (
                        <Button variant="outline" disabled>Completed ✓</Button>
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
              <Card className="border-2 border-black p-6">
                <Stack gap={4}>
                  <H3>TOP CHALLENGERS</H3>
                  <Stack gap={3}>
                    {mockLeaderboard.map((entry) => (
                      <Card key={entry.rank} className={`p-4 ${entry.rank <= 3 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50"} border`}>
                        <Grid cols={4} gap={4} className="items-center">
                          <Stack direction="horizontal" gap={3} className="items-center">
                            <Label className={`font-mono text-2xl ${entry.rank === 1 ? "text-yellow-600" : entry.rank === 2 ? "text-gray-500" : entry.rank === 3 ? "text-orange-600" : "text-gray-400"}`}>
                              #{entry.rank}
                            </Label>
                            <Body className="font-bold">{entry.userName}</Body>
                          </Stack>
                          <Stack gap={0}>
                            <Label className="font-mono text-xl">{entry.points.toLocaleString()}</Label>
                            <Label size="xs" className="text-gray-500">points</Label>
                          </Stack>
                          <Stack gap={0}>
                            <Label className="font-mono">{entry.completedChallenges}</Label>
                            <Label size="xs" className="text-gray-500">challenges</Label>
                          </Stack>
                          <Button variant="outline" size="sm">View Profile</Button>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                  <Card className="p-4 bg-black text-white">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={3} className="items-center">
                        <Label className="font-mono text-2xl">#42</Label>
                        <Body className="font-bold">You</Body>
                      </Stack>
                      <Stack gap={0}>
                        <Label className="font-mono text-xl">2,450</Label>
                        <Label size="xs" className="text-gray-400">points</Label>
                      </Stack>
                      <Stack gap={0}>
                        <Label className="font-mono">{completedByUser}</Label>
                        <Label size="xs" className="text-gray-400">challenges</Label>
                      </Stack>
                      <Label className="text-yellow-400">Keep going!</Label>
                    </Grid>
                  </Card>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/community")}>Back to Community</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedChallenge} onClose={() => setSelectedChallenge(null)}>
        <ModalHeader><H3>{selectedChallenge?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedChallenge && (
            <Stack gap={4}>
              <Body className="text-gray-600">{selectedChallenge.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Type</Label><Badge variant="outline">{selectedChallenge.type}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Category</Label><Badge className={getCategoryColor(selectedChallenge.category)}>{selectedChallenge.category}</Badge></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="font-bold">Progress</Label>
                <ProgressBar value={((selectedChallenge.userProgress || selectedChallenge.currentProgress) / selectedChallenge.goal) * 100} size="lg" />
                <Label className="text-center font-mono">{selectedChallenge.userProgress || selectedChallenge.currentProgress} / {selectedChallenge.goal}</Label>
              </Stack>
              <Card className="p-4 bg-yellow-50 border border-yellow-200">
                <Stack gap={2}>
                  <Label className="font-bold">Reward</Label>
                  <Body>{selectedChallenge.reward}</Body>
                  <Label className="text-yellow-700">+{selectedChallenge.rewardPoints} points</Label>
                </Stack>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Participants</Label><Label className="font-mono">{selectedChallenge.participants.toLocaleString()}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Ends</Label><Label className="font-mono">{selectedChallenge.endDate}</Label></Stack>
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
    </Section>
  );
}
