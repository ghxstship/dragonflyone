"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Spinner, Container } from "@ghxstship/ui";
import { Clapperboard, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";

export default function TechRehearsalPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { scheduled: 4, completed: 2, issues: 3, resolved: 8 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production?.name || "Production"} title="Tech Rehearsal" description="Technical rehearsal schedules and notes" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Scheduled" value={stats.scheduled.toString()} icon={<Clapperboard size={20} />} />
        <StatCard label="Completed" value={stats.completed.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Open Issues" value={stats.issues.toString()} icon={<AlertTriangle size={20} />} trend={stats.issues > 0 ? "down" : "up"} />
        <StatCard label="Resolved" value={stats.resolved.toString()} icon={<Clock size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Tech Rehearsal Schedule</H3><Body className="text-muted">Tech rehearsal schedule will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
