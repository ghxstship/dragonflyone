"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Spinner, Container } from "@ghxstship/ui";
import { Volume2, CheckCircle, Clock, Users } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";

export default function SoundcheckPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { scheduled: 8, completed: 5, inProgress: 1, pending: 2 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production?.name || "Production"} title="Soundcheck" description="Audio check schedules and status" />
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
