"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Button,
  Section as UISection, Card, Badge, Textarea,
} from "@ghxstship/ui";

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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Messages</H1>
            <Label className="text-ink-400">Direct messaging with crew and vendors</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Conversations" value={mockConversations.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Unread" value={totalUnread} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Online Now" value={onlineCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Response Time" value="< 5 min" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={6}>
            <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
              <Stack gap={0}>
                <Card className="p-4 border-b border-ink-800">
                  <Input type="search" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />
                </Card>
                <Stack gap={0}>
                  {filteredConversations.map((conv) => (
                    <Card key={conv.id} className={`p-4 border-b border-ink-800 cursor-pointer hover:bg-ink-800/50 ${selectedConversation?.id === conv.id ? "bg-ink-800" : ""}`} onClick={() => setSelectedConversation(conv)}>
                      <Stack direction="horizontal" gap={3}>
                        <Card className="w-10 h-10 bg-ink-700 rounded-full flex items-center justify-center relative">
                          <Label>{conv.participantName.charAt(0)}</Label>
                          {conv.online && <Card className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 rounded-full border-2 border-ink-900" />}
                        </Card>
                        <Stack gap={1} className="flex-1">
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-white">{conv.participantName}</Label>
                            <Label size="xs" className="text-ink-500">{conv.timestamp}</Label>
                          </Stack>
                          <Label size="xs" className="text-ink-400">{conv.participantRole}</Label>
                          <Stack direction="horizontal" className="justify-between">
                            <Label size="xs" className="text-ink-500 truncate">{conv.lastMessage}</Label>
                            {conv.unread > 0 && <Badge variant="solid">{conv.unread}</Badge>}
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <Card className="border-2 border-ink-800 bg-ink-900/50 col-span-2 flex flex-col">
              {selectedConversation ? (
                <Stack gap={0} className="h-full">
                  <Card className="p-4 border-b border-ink-800">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Card className="w-10 h-10 bg-ink-700 rounded-full flex items-center justify-center">
                          <Label>{selectedConversation.participantName.charAt(0)}</Label>
                        </Card>
                        <Stack gap={0}>
                          <Label className="text-white">{selectedConversation.participantName}</Label>
                          <Label size="xs" className={selectedConversation.online ? "text-success-400" : "text-ink-500"}>
                            {selectedConversation.online ? "Online" : "Offline"}
                          </Label>
                        </Stack>
                      </Stack>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </Stack>
                  </Card>

                  <Stack className="flex-1 p-4 overflow-y-auto" gap={3}>
                    {mockMessages.map((msg) => (
                      <Stack key={msg.id} className={msg.senderId === "me" ? "items-end" : "items-start"}>
                        <Card className={`p-3 max-w-xs ${msg.senderId === "me" ? "bg-info-600" : "bg-ink-800"}`}>
                          <Label className="text-white">{msg.content}</Label>
                        </Card>
                        <Label size="xs" className="text-ink-500">{msg.timestamp}</Label>
                      </Stack>
                    ))}
                  </Stack>

                  <Card className="p-4 border-t border-ink-800">
                    <Stack direction="horizontal" gap={2}>
                      <Textarea placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={1} className="border-ink-700 bg-black text-white flex-1" />
                      <Button variant="solid">Send</Button>
                    </Stack>
                  </Card>
                </Stack>
              ) : (
                <Stack className="h-full items-center justify-center p-8">
                  <Label className="text-ink-500">Select a conversation to start messaging</Label>
                </Stack>
              )}
            </Card>
          </Grid>

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/communications")}>Communications Hub</Button>
        </Stack>
      </Container>
    </UISection>
  );
}
