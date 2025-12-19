"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Spinner, Container } from "@ghxstship/ui";
import { Clock, Music, Users, CheckCircle } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";

export default function SetTimesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { totalSets: 12, confirmed: 10, pending: 2, stages: 3 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production?.name || "Production"} title="Set Times" description="Artist and performer set schedules" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sets" value={stats.totalSets.toString()} icon={<Music size={20} />} />
        <StatCard label="Confirmed" value={stats.confirmed.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock size={20} />} />
        <StatCard label="Stages" value={stats.stages.toString()} icon={<Users size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Set Time Schedule</H3><Body className="text-muted">Set times will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
