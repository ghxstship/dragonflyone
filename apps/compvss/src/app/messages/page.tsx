"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Button,
  Card,
  Badge,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_CONVERSATIONS,
  DEMO_DIRECT_MESSAGES,
  type DemoConversation as Conversation,
} from "../../lib/demo-data";

const mockConversations = DEMO_CONVERSATIONS;
const mockMessages = DEMO_DIRECT_MESSAGES;

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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Messages"
        subtitle="Direct messaging with crew and vendors"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

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
      </MainContent>
    </CompvssAppLayout>
  );
}
