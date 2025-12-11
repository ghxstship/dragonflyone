"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
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

import {
  DEMO_CREW_SOCIAL_MEMBERS,
  DEMO_CREW_POSTS,
  type DemoCrewSocialMember as CrewMember,
} from "../../../lib/demo-data";

export default function CrewSocialPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'feed',
    validTabs: ['feed', 'roster', 'photos', 'connections'],
  });
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);

  const onlineCount = DEMO_CREW_SOCIAL_MEMBERS.filter(c => c.status === "Online").length;

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


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={DEMO_CREW_SOCIAL_MEMBERS.length.toString()} label="Crew Members" />
              <StatCard value={onlineCount.toString()} label="Online Now" />
              <StatCard value={DEMO_CREW_POSTS.length.toString()} label="Posts Today" />
              <StatCard value="45" label="Your Connections" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('feed')} onClick={() => setActiveTab('feed')}>Feed</Tab>
                <Tab active={isActive('roster')} onClick={() => setActiveTab('roster')}>Roster</Tab>
                <Tab active={isActive('photos')} onClick={() => setActiveTab('photos')}>Photos</Tab>
                <Tab active={isActive('connections')} onClick={() => setActiveTab('connections')}>Connections</Tab>
              </TabsList>

              <TabPanel active={isActive('feed')}>
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
                    {DEMO_CREW_POSTS.map((post) => (
                      <Card key={post.id} className="p-6">
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="justify-between">
                            <Stack direction="horizontal" gap={3}>
                              <Card className="flex size-12 items-center justify-center rounded-avatar">
                                <Body className="text-body-sm">{DEMO_CREW_SOCIAL_MEMBERS.find(c => c.id === post.authorId)?.avatar}</Body>
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
                        {DEMO_CREW_SOCIAL_MEMBERS.filter(c => c.status === "Online").map((member) => (
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
                        {DEMO_CREW_SOCIAL_MEMBERS.slice(0, 3).map((member) => (
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

              <TabPanel active={isActive('roster')}>
                <Grid cols={4} gap={4}>
                  {DEMO_CREW_SOCIAL_MEMBERS.map((member) => (
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

              <TabPanel active={isActive('photos')}>
                <Grid cols={4} gap={4}>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <Card key={idx} className="flex aspect-square cursor-pointer items-center justify-center">
                      <Body className="text-h3-md">📷</Body>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={isActive('connections')}>
                <Stack gap={4}>
                  {DEMO_CREW_SOCIAL_MEMBERS.map((member) => (
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
