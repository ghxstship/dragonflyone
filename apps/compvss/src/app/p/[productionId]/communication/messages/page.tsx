"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { MessageSquare, Send, Inbox, Archive } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function MessagesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Messages" title="Production Not Found" /></Stack>;
  }

  const stats = { inbox: 24, sent: 156, unread: 8, archived: 234 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Messages" description="Direct messages and notifications" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Inbox" value={stats.inbox.toString()} icon={<Inbox size={20} />} />
        <StatCard label="Sent" value={stats.sent.toString()} icon={<Send size={20} />} />
        <StatCard label="Unread" value={stats.unread.toString()} icon={<MessageSquare size={20} />} trend={stats.unread > 5 ? "down" : "neutral"} />
        <StatCard label="Archived" value={stats.archived.toString()} icon={<Archive size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Inbox</H3><Body className="text-muted">Messages will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
