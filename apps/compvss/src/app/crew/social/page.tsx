"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: "Online" | "Away" | "Offline";
  connections: number;
  projects: number;
  bio?: string;
}

interface CrewPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  type: "Photo" | "Update" | "Achievement";
}

const mockCrew: CrewMember[] = [
  { id: "CRW-001", name: "John Smith", role: "Audio Engineer", department: "Audio", avatar: "JS", status: "Online", connections: 45, projects: 28, bio: "15 years in live sound. L-Acoustics certified." },
  { id: "CRW-002", name: "Sarah Johnson", role: "Lighting Designer", department: "Lighting", avatar: "SJ", status: "Online", connections: 62, projects: 35, bio: "Creating memorable visual experiences since 2010." },
  { id: "CRW-003", name: "Mike Davis", role: "Stage Manager", department: "Stage", avatar: "MD", status: "Away", connections: 78, projects: 52, bio: "Keeping shows running smoothly for 20 years." },
  { id: "CRW-004", name: "Emily Chen", role: "Video Director", department: "Video", avatar: "EC", status: "Offline", connections: 34, projects: 19, bio: "Broadcast and live event video specialist." },
];

const mockPosts: CrewPost[] = [
  { id: "POST-001", authorId: "CRW-001", authorName: "John Smith", authorRole: "Audio Engineer", content: "Just wrapped an amazing festival run! Great team effort everyone 🎵", timestamp: "2 hours ago", likes: 24, comments: 8, type: "Update" },
  { id: "POST-002", authorId: "CRW-002", authorName: "Sarah Johnson", authorRole: "Lighting Designer", content: "New certification achieved! MA3 Programming Level 2 ✨", timestamp: "5 hours ago", likes: 45, comments: 12, type: "Achievement" },
  { id: "POST-003", authorId: "CRW-003", authorName: "Mike Davis", authorRole: "Stage Manager", content: "Behind the scenes from last night's corporate gala", timestamp: "1 day ago", likes: 67, comments: 15, type: "Photo" },
];

export default function CrewSocialPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);

  const onlineCount = mockCrew.filter(c => c.status === "Online").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online": return "bg-green-500";
      case "Away": return "bg-yellow-500";
      case "Offline": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case "Photo": return "📷";
      case "Achievement": return "🏆";
      case "Update": return "💬";
      default: return "📝";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Crew Social</H1>
            <Label className="text-ink-400">Connect with your crew, share updates, and build connections</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Crew Members" value={mockCrew.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Online Now" value={onlineCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Posts Today" value={mockPosts.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Your Connections" value={45} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "feed"} onClick={() => setActiveTab("feed")}>Feed</Tab>
              <Tab active={activeTab === "roster"} onClick={() => setActiveTab("roster")}>Roster</Tab>
              <Tab active={activeTab === "photos"} onClick={() => setActiveTab("photos")}>Photos</Tab>
              <Tab active={activeTab === "connections"} onClick={() => setActiveTab("connections")}>Connections</Tab>
            </TabsList>

            <TabPanel active={activeTab === "feed"}>
              <Grid cols={3} gap={6}>
                <Stack gap={4} className="col-span-2">
                  <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack direction="horizontal" gap={3}>
                      <Card className="w-10 h-10 bg-ink-700 rounded-full flex items-center justify-center">
                        <Label>You</Label>
                      </Card>
                      <Input placeholder="Share an update with your crew..." className="border-ink-700 bg-black text-white flex-1" />
                      <Button variant="solid">Post</Button>
                    </Stack>
                  </Card>
                  {mockPosts.map((post) => (
                    <Card key={post.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="justify-between">
                          <Stack direction="horizontal" gap={3}>
                            <Card className="w-12 h-12 bg-ink-700 rounded-full flex items-center justify-center">
                              <Label>{mockCrew.find(c => c.id === post.authorId)?.avatar}</Label>
                            </Card>
                            <Stack gap={0}>
                              <Label className="text-white">{post.authorName}</Label>
                              <Label size="xs" className="text-ink-400">{post.authorRole}</Label>
                            </Stack>
                          </Stack>
                          <Stack direction="horizontal" gap={2}>
                            <Label className="text-2xl">{getPostIcon(post.type)}</Label>
                            <Label size="xs" className="text-ink-500">{post.timestamp}</Label>
                          </Stack>
                        </Stack>
                        <Body className="text-ink-200">{post.content}</Body>
                        {post.type === "Photo" && (
                          <Card className="h-48 bg-ink-800 flex items-center justify-center">
                            <Label className="text-4xl">🖼️</Label>
                          </Card>
                        )}
                        <Stack direction="horizontal" gap={4}>
                          <Button variant="ghost" size="sm">❤️ {post.likes}</Button>
                          <Button variant="ghost" size="sm">💬 {post.comments}</Button>
                          <Button variant="ghost" size="sm">Share</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
                <Stack gap={4}>
                  <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <Label className="text-ink-400">Online Now</Label>
                      {mockCrew.filter(c => c.status === "Online").map((member) => (
                        <Stack key={member.id} direction="horizontal" gap={3} className="cursor-pointer" onClick={() => setSelectedMember(member)}>
                          <Card className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center relative">
                            <Label size="xs">{member.avatar}</Label>
                            <Card className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                          </Card>
                          <Stack gap={0}>
                            <Label size="xs" className="text-white">{member.name}</Label>
                            <Label size="xs" className="text-ink-500">{member.role}</Label>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                  <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <Label className="text-ink-400">Suggested Connections</Label>
                      {mockCrew.slice(0, 3).map((member) => (
                        <Stack key={member.id} direction="horizontal" className="justify-between items-center">
                          <Stack direction="horizontal" gap={2}>
                            <Card className="w-8 h-8 bg-ink-700 rounded-full flex items-center justify-center">
                              <Label size="xs">{member.avatar}</Label>
                            </Card>
                            <Label size="xs" className="text-white">{member.name}</Label>
                          </Stack>
                          <Button variant="outline" size="sm">Connect</Button>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "roster"}>
              <Grid cols={4} gap={4}>
                {mockCrew.map((member) => (
                  <Card key={member.id} className="border-2 border-ink-800 bg-ink-900/50 p-4 cursor-pointer hover:border-white" onClick={() => setSelectedMember(member)}>
                    <Stack gap={3} className="text-center">
                      <Card className="w-16 h-16 bg-ink-700 rounded-full flex items-center justify-center mx-auto relative">
                        <Label className="text-xl">{member.avatar}</Label>
                        <Card className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-ink-900 ${getStatusColor(member.status)}`} />
                      </Card>
                      <Stack gap={1}>
                        <Label className="text-white">{member.name}</Label>
                        <Label size="xs" className="text-ink-400">{member.role}</Label>
                        <Badge variant="outline">{member.department}</Badge>
                      </Stack>
                      <Stack direction="horizontal" gap={4} className="justify-center">
                        <Stack gap={0}><Label className="font-mono text-white">{member.connections}</Label><Label size="xs" className="text-ink-500">Connections</Label></Stack>
                        <Stack gap={0}><Label className="font-mono text-white">{member.projects}</Label><Label size="xs" className="text-ink-500">Projects</Label></Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "photos"}>
              <Grid cols={4} gap={4}>
                {Array.from({ length: 8 }).map((_, idx) => (
                  <Card key={idx} className="aspect-square bg-ink-800 border-2 border-ink-700 flex items-center justify-center cursor-pointer hover:border-white">
                    <Label className="text-4xl">📷</Label>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "connections"}>
              <Stack gap={4}>
                {mockCrew.map((member) => (
                  <Card key={member.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={4}>
                        <Card className="w-12 h-12 bg-ink-700 rounded-full flex items-center justify-center">
                          <Label>{member.avatar}</Label>
                        </Card>
                        <Stack gap={1}>
                          <Label className="text-white">{member.name}</Label>
                          <Label size="xs" className="text-ink-400">{member.role} • {member.department}</Label>
                        </Stack>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">Message</Button>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crew")}>Crew Directory</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedMember} onClose={() => setSelectedMember(null)}>
        <ModalHeader><H3>{selectedMember?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedMember && (
            <Stack gap={4}>
              <Card className="w-20 h-20 bg-ink-700 rounded-full flex items-center justify-center mx-auto">
                <Label className="text-2xl">{selectedMember.avatar}</Label>
              </Card>
              <Stack gap={1} className="text-center">
                <Label className="text-ink-400">{selectedMember.role}</Label>
                <Badge variant="outline">{selectedMember.department}</Badge>
              </Stack>
              {selectedMember.bio && <Body className="text-ink-300 text-center">{selectedMember.bio}</Body>}
              <Grid cols={2} gap={4}>
                <Card className="p-3 border border-ink-700 text-center">
                  <Label className="font-mono text-white text-xl">{selectedMember.connections}</Label>
                  <Label size="xs" className="text-ink-500">Connections</Label>
                </Card>
                <Card className="p-3 border border-ink-700 text-center">
                  <Label className="font-mono text-white text-xl">{selectedMember.projects}</Label>
                  <Label size="xs" className="text-ink-500">Projects</Label>
                </Card>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedMember(null)}>Close</Button>
          <Button variant="outline">Message</Button>
          <Button variant="solid">Connect</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
