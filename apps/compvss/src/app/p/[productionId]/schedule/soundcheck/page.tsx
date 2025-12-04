"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { Volume2, CheckCircle, Clock, Users } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function SoundcheckPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Soundcheck" title="Production Not Found" /></Stack>;
  }

  const stats = { scheduled: 8, completed: 5, inProgress: 1, pending: 2 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Soundcheck" description="Audio check schedules and status" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Scheduled" value={stats.scheduled.toString()} icon={<Volume2 size={20} />} />
        <StatCard label="Completed" value={stats.completed.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="In Progress" value={stats.inProgress.toString()} icon={<Clock size={20} />} />
        <StatCard label="Pending" value={stats.pending.toString()} icon={<Users size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Soundcheck Schedule</H3><Body className="text-muted">Soundcheck schedule will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
