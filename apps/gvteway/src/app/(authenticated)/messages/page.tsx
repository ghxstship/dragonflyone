"use client";

import { useState } from "react";
import { MessageSquare, Send, Search, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Input, Grid, DetailPage, Section, Box, Stack } from "@ghxstship/ui";

interface Conversation { id: string; name: string; lastMessage: string; time: string; unread: boolean; }
const DEMO: Conversation[] = [
  { id: "1", name: "Summer Festival Support", lastMessage: "Your tickets are confirmed!", time: "2:30 PM", unread: true },
  { id: "2", name: "Jazz Night", lastMessage: "Event starts at 8 PM", time: "Yesterday", unread: false },
];

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const { data: conversations = [], isLoading, error, refetch } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => { const r = await fetch("/api/messages"); if (!r.ok) return DEMO; return (await r.json()).conversations?.length ? (await r.json()).conversations : DEMO; },
  });

  const filtered = conversations.filter((c: Conversation) => c.name.toLowerCase().includes(search.toLowerCase()));

  const tabs = [{
    id: "messages", label: "Messages", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
          <Box className="lg:col-span-1">
            <Box className="relative mb-4">
              <label htmlFor="message-search" className="sr-only">Search conversations</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
              <Input id="message-search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </Box>
            <Stack gap={2}>
              {filtered.map((conv: Conversation) => (
                <Card key={conv.id} className={`p-4 cursor-pointer transition-colors ${selected === conv.id ? "border-primary" : ""} ${conv.unread ? "bg-surface-elevated" : ""}`} onClick={() => setSelected(conv.id)}>
                  <Box className="flex items-start justify-between">
                    <Box><Body className={`font-weight-medium ${conv.unread ? "" : "text-text-muted"}`}>{conv.name}</Body><Body size="sm" className="text-text-disabled truncate">{conv.lastMessage}</Body></Box>
                    <Body size="sm" className="text-text-disabled">{conv.time}</Body>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>
          <Card className="lg:col-span-2 p-6 h-96 flex flex-col">
            {selected ? (
              <>
                <Box className="flex-1 flex items-center justify-center"><Body className="text-text-muted">Message history will appear here</Body></Box>
                <Box className="flex gap-2 pt-4 border-t border-border">
                  <label htmlFor="message-input" className="sr-only">Type your message</label>
                  <Input id="message-input" placeholder="Type a message..." className="flex-1" />
                  <Button variant="solid" icon={<Send className="size-4" />}>Send</Button>
                </Box>
              </>
            ) : (
              <Box className="h-full flex items-center justify-center"><Box className="text-center"><MessageSquare className="size-12 text-text-disabled mx-auto mb-4" /><Body className="text-text-muted">Select a conversation</Body></Box></Box>
            )}
          </Card>
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Inbox", title: "Messages", description: "Your conversations" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
