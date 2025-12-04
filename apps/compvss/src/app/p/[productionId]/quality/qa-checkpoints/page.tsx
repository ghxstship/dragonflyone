"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { ClipboardCheck, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function QACheckpointsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="QA Checkpoints" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 24, passed: 18, pending: 4, failed: 2 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="QA Checkpoints" description="Quality assurance verification points" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total.toString()} icon={<ClipboardCheck size={20} />} />
        <StatCard label="Passed" value={stats.passed.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock size={20} />} />
        <StatCard label="Failed" value={stats.failed.toString()} icon={<AlertTriangle size={20} />} trend={stats.failed > 0 ? "down" : "up"} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Checkpoint List</H3><Body className="text-muted">QA checkpoints will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
