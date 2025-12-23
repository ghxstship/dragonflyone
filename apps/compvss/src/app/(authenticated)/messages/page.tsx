"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
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
  useConversations,
  useDirectMessages,
  type Conversation,
} from "../../../hooks/useMessages";

export default function MessagesPage() {
  const router = useRouter();
  const { data: conversations = [], isLoading, error } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { data: messages = [] } = useDirectMessages(selectedConversation?.id || '');
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading messages...</Body>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load messages</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </>
    );
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const onlineCount = conversations.filter(c => c.online).length;

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <EnterprisePageHeader
        title="Messages"
        subtitle="Direct messaging with crew and vendors"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={conversations.length.toString()} label="Conversations" />
              <StatCard value={totalUnread.toString()} label="Unread" />
              <StatCard value={onlineCount.toString()} label="Online Now" />
              <StatCard value="< 5 min" label="Response Time" />
            </Grid>

            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
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
                            <Body size="sm" className="">{conv.participantName.charAt(0)}</Body>
                          </Card>
                          <Stack gap={1} className="flex-1">
                            <Stack direction="horizontal" className="justify-between">
                              <Body>{conv.participantName}</Body>
                              <Body size="sm" className="">{conv.timestamp}</Body>
                            </Stack>
                            <Body size="sm" className="">{conv.participantRole}</Body>
                            <Stack direction="horizontal" className="justify-between">
                              <Body className="truncate">{conv.lastMessage}</Body>
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
                            <Body size="sm" className="">{selectedConversation.participantName.charAt(0)}</Body>
                          </Card>
                          <Stack gap={0}>
                            <Body>{selectedConversation.participantName}</Body>
                            <Body size="sm" className="">
                              {selectedConversation.online ? "Online" : "Offline"}
                            </Body>
                          </Stack>
                        </Stack>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </Stack>
                    </Card>

                    <Stack className="flex-1 overflow-y-auto p-4" gap={3}>
                      {messages.map((msg) => (
                        <Stack key={msg.id} className={msg.senderId === "me" ? "items-end" : "items-start"}>
                          <Card className={`max-w-xs p-3 ${msg.senderId === "me" ? "bg-primary-500" : ""}`}>
                            <Body size="sm" className="">{msg.content}</Body>
                          </Card>
                          <Body size="sm" className="">{msg.timestamp}</Body>
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
                    <Body size="sm" className="">Select a conversation to start messaging</Body>
                  </Stack>
                )}
              </Card>
            </Grid>

            <Button variant="outline" onClick={() => router.push("/communications")}>Communications Hub</Button>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
