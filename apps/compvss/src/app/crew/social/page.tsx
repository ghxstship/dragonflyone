"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EnterprisePageHeader,
  MainContent,
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

  const getPostIcon = (type: string) => {
    switch (type) {
      case "Photo": return "📷";
      case "Achievement": return "🏆";
      case "Update": return "💬";
      default: return "📝";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Crew Social"
        subtitle="Connect with your crew, share updates, and build connections"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Crew', href: '/crew' }, { label: 'Social' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={mockCrew.length.toString()} label="Crew Members" />
              <StatCard value={onlineCount.toString()} label="Online Now" />
              <StatCard value={mockPosts.length.toString()} label="Posts Today" />
              <StatCard value="45" label="Your Connections" />
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
                    <Card className="p-4">
                      <Stack direction="horizontal" gap={3}>
                        <Card className="flex size-10 items-center justify-center rounded-avatar">
                          <Body className="text-body-sm">You</Body>
                        </Card>
                        <Input placeholder="Share an update with your crew..." className="flex-1" />
                        <Button variant="solid">Post</Button>
                      </Stack>
                    </Card>
                    {mockPosts.map((post) => (
                      <Card key={post.id} className="p-6">
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="justify-between">
                            <Stack direction="horizontal" gap={3}>
                              <Card className="flex size-12 items-center justify-center rounded-avatar">
                                <Body className="text-body-sm">{mockCrew.find(c => c.id === post.authorId)?.avatar}</Body>
                              </Card>
                              <Stack gap={0}>
                                <Body>{post.authorName}</Body>
                                <Body className="text-body-sm">{post.authorRole}</Body>
                              </Stack>
                            </Stack>
                            <Stack direction="horizontal" gap={2}>
                              <Body className="text-h5-md">{getPostIcon(post.type)}</Body>
                              <Body className="text-body-sm">{post.timestamp}</Body>
                            </Stack>
                          </Stack>
                          <Body>{post.content}</Body>
                          {post.type === "Photo" && (
                            <Card className="flex h-48 items-center justify-center">
                              <Body className="text-h3-md">🖼️</Body>
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
                    <Card className="p-4">
                      <Stack gap={3}>
                        <Body className="font-display">Online Now</Body>
                        {mockCrew.filter(c => c.status === "Online").map((member) => (
                          <Stack key={member.id} direction="horizontal" gap={3} className="cursor-pointer" onClick={() => setSelectedMember(member)}>
                            <Card className="flex size-8 items-center justify-center rounded-avatar">
                              <Body className="text-body-sm">{member.avatar}</Body>
                            </Card>
                            <Stack gap={0}>
                              <Body className="text-body-sm">{member.name}</Body>
                              <Body className="text-body-sm">{member.role}</Body>
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    </Card>
                    <Card className="p-4">
                      <Stack gap={3}>
                        <Body className="font-display">Suggested Connections</Body>
                        {mockCrew.slice(0, 3).map((member) => (
                          <Stack key={member.id} direction="horizontal" className="items-center justify-between">
                            <Stack direction="horizontal" gap={2}>
                              <Card className="flex size-8 items-center justify-center rounded-avatar">
                                <Body className="text-body-sm">{member.avatar}</Body>
                              </Card>
                              <Body className="text-body-sm">{member.name}</Body>
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
                    <Card key={member.id} className="cursor-pointer p-4" onClick={() => setSelectedMember(member)}>
                      <Stack gap={3} className="text-center">
                        <Card className="mx-auto flex size-16 items-center justify-center rounded-avatar">
                          <Body className="text-h6-md">{member.avatar}</Body>
                        </Card>
                        <Stack gap={1}>
                          <Body>{member.name}</Body>
                          <Body className="text-body-sm">{member.role}</Body>
                          <Badge variant="outline">{member.department}</Badge>
                        </Stack>
                        <Stack direction="horizontal" gap={4} className="justify-center">
                          <Stack gap={0}>
                            <Body className="font-display">{member.connections}</Body>
                            <Body className="text-body-sm">Connections</Body>
                          </Stack>
                          <Stack gap={0}>
                            <Body className="font-display">{member.projects}</Body>
                            <Body className="text-body-sm">Projects</Body>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={activeTab === "photos"}>
                <Grid cols={4} gap={4}>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <Card key={idx} className="flex aspect-square cursor-pointer items-center justify-center">
                      <Body className="text-h3-md">📷</Body>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={activeTab === "connections"}>
                <Stack gap={4}>
                  {mockCrew.map((member) => (
                    <Card key={member.id} className="p-4">
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Stack direction="horizontal" gap={4}>
                          <Card className="flex size-12 items-center justify-center rounded-avatar">
                            <Body>{member.avatar}</Body>
                          </Card>
                          <Stack gap={1}>
                            <Body>{member.name}</Body>
                            <Body className="text-body-sm">{member.role} • {member.department}</Body>
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

            <Button variant="outline" onClick={() => router.push("/crew")}>Crew Directory</Button>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedMember} onClose={() => setSelectedMember(null)}>
        <ModalHeader><H3>{selectedMember?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedMember && (
            <Stack gap={4}>
              <Card className="mx-auto flex size-20 items-center justify-center rounded-avatar">
                <Body className="text-h5-md">{selectedMember.avatar}</Body>
              </Card>
              <Stack gap={1} className="text-center">
                <Body>{selectedMember.role}</Body>
                <Badge variant="outline">{selectedMember.department}</Badge>
              </Stack>
              {selectedMember.bio && <Body className="text-center">{selectedMember.bio}</Body>}
              <Grid cols={2} gap={4}>
                <Card className="p-3 text-center">
                  <Body className="text-h6-md font-display">{selectedMember.connections}</Body>
                  <Body className="text-body-sm">Connections</Body>
                </Card>
                <Card className="p-3 text-center">
                  <Body className="text-h6-md font-display">{selectedMember.projects}</Body>
                  <Body className="text-body-sm">Projects</Body>
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
    </CompvssAppLayout>
  );
}
