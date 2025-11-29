"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Button,
  Section,
  Card,
  Badge,
  Textarea,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const mockConversations: Conversation[] = [
  { id: "CONV-001", participantName: "John Smith", participantRole: "Audio Lead", lastMessage: "The console is set up and ready", timestamp: "2 min ago", unread: 2, online: true },
  { id: "CONV-002", participantName: "Sarah Johnson", participantRole: "Stage Manager", lastMessage: "Changeover complete, ready for soundcheck", timestamp: "15 min ago", unread: 0, online: true },
  { id: "CONV-003", participantName: "Mike Davis", participantRole: "Lighting Designer", lastMessage: "Focus session scheduled for 3pm", timestamp: "1 hr ago", unread: 1, online: false },
  { id: "CONV-004", participantName: "Emily Chen", participantRole: "Video Director", lastMessage: "Camera positions confirmed", timestamp: "3 hrs ago", unread: 0, online: false },
];

const mockMessages: Message[] = [
  { id: "MSG-001", senderId: "other", content: "Hey, just wanted to check on the audio setup", timestamp: "10:30 AM", read: true },
  { id: "MSG-002", senderId: "me", content: "All good here, console is patched and ready", timestamp: "10:32 AM", read: true },
  { id: "MSG-003", senderId: "other", content: "Great! What about the monitor mixes?", timestamp: "10:33 AM", read: true },
  { id: "MSG-004", senderId: "me", content: "Working on those now, should be done in 20", timestamp: "10:35 AM", read: true },
  { id: "MSG-005", senderId: "other", content: "The console is set up and ready", timestamp: "10:45 AM", read: false },
];

export default function MessagesPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(mockConversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const totalUnread = mockConversations.reduce((s, c) => s + c.unread, 0);
  const onlineCount = mockConversations.filter(c => c.online).length;

  const filteredConversations = mockConversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Messages"
        subtitle="Direct messaging with crew and vendors"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Messages' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard value={mockConversations.length.toString()} label="Conversations" />
              <StatCard value={totalUnread.toString()} label="Unread" />
              <StatCard value={onlineCount.toString()} label="Online Now" />
              <StatCard value="< 5 min" label="Response Time" />
            </Grid>

            <Grid cols={3} gap={6}>
              <Card className="overflow-hidden">
                <Stack gap={0}>
                  <Card className="border-b p-4">
                    <Input type="search" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </Card>
                  <Stack gap={0}>
                    {filteredConversations.map((conv) => (
                      <Card key={conv.id} className={`cursor-pointer border-b p-4 ${selectedConversation?.id === conv.id ? "bg-ink-100" : ""}`} onClick={() => setSelectedConversation(conv)}>
                        <Stack direction="horizontal" gap={3}>
                          <Card className="flex size-10 items-center justify-center rounded-avatar">
                            <Body className="text-body-sm">{conv.participantName.charAt(0)}</Body>
                          </Card>
                          <Stack gap={1} className="flex-1">
                            <Stack direction="horizontal" className="justify-between">
                              <Body>{conv.participantName}</Body>
                              <Body className="text-body-sm">{conv.timestamp}</Body>
                            </Stack>
                            <Body className="text-body-sm">{conv.participantRole}</Body>
                            <Stack direction="horizontal" className="justify-between">
                              <Body className="truncate text-body-sm">{conv.lastMessage}</Body>
                              {conv.unread > 0 && <Badge variant="solid">{conv.unread}</Badge>}
                            </Stack>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              <Card className="col-span-2 flex flex-col">
                {selectedConversation ? (
                  <Stack gap={0} className="h-full">
                    <Card className="border-b p-4">
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Stack direction="horizontal" gap={3}>
                          <Card className="flex size-10 items-center justify-center rounded-avatar">
                            <Body className="text-body-sm">{selectedConversation.participantName.charAt(0)}</Body>
                          </Card>
                          <Stack gap={0}>
                            <Body>{selectedConversation.participantName}</Body>
                            <Body className="text-body-sm">
                              {selectedConversation.online ? "Online" : "Offline"}
                            </Body>
                          </Stack>
                        </Stack>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </Stack>
                    </Card>

                    <Stack className="flex-1 overflow-y-auto p-4" gap={3}>
                      {mockMessages.map((msg) => (
                        <Stack key={msg.id} className={msg.senderId === "me" ? "items-end" : "items-start"}>
                          <Card className={`max-w-xs p-3 ${msg.senderId === "me" ? "bg-primary-500" : ""}`}>
                            <Body className="text-body-sm">{msg.content}</Body>
                          </Card>
                          <Body className="text-body-sm">{msg.timestamp}</Body>
                        </Stack>
                      ))}
                    </Stack>

                    <Card className="border-t p-4">
                      <Stack direction="horizontal" gap={2}>
                        <Textarea placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={1} className="flex-1" />
                        <Button variant="solid">Send</Button>
                      </Stack>
                    </Card>
                  </Stack>
                ) : (
                  <Stack className="h-full items-center justify-center p-8">
                    <Body className="text-body-sm">Select a conversation to start messaging</Body>
                  </Stack>
                )}
              </Card>
            </Grid>

            <Button variant="outline" onClick={() => router.push("/communications")}>Communications Hub</Button>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
