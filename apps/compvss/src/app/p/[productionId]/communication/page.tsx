"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, Box, H3 } from "@ghxstship/ui";
import { MessageSquare, Hash, Users, Bell } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionCommunicationPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Communication" title="Production Not Found" /></Stack>;
  }

  const stats = { messages: 456, channels: 12, stakeholders: 24, unread: 8 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Communication" description="Messages, channels, and stakeholder portal" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Messages" value={stats.messages.toString()} icon={<MessageSquare size={20} />} />
        <StatCard label="Channels" value={stats.channels.toString()} icon={<Hash size={20} />} />
        <StatCard label="Stakeholders" value={stats.stakeholders.toString()} icon={<Users size={20} />} />
        <StatCard label="Unread" value={stats.unread.toString()} icon={<Bell size={20} />} trend={stats.unread > 5 ? "down" : "neutral"} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/communication/messages`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><MessageSquare size={24} className="text-primary" /></Box><Body className="font-weight-bold">Messages</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/communication/channels`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><Hash size={24} className="text-secondary" /></Box><Body className="font-weight-bold">Channels</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/communication/stakeholder-portal`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><Users size={24} className="text-accent" /></Box><Body className="font-weight-bold">Stakeholder Portal</Body></Stack></CardBody>
        </Card>
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Recent Activity</H3><Body className="text-muted">Communication activity will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
