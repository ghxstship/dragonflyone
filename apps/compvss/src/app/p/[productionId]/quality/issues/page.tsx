"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button, Spinner, Container } from "@ghxstship/ui";
import { AlertCircle, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";

export default function QualityIssuesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { open: 8, inProgress: 5, resolved: 42, closed: 38 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production?.name || "Production"} title="Quality Issues" description="Track and resolve quality issues" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Report Issue</Button>
      </Stack>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open" value={stats.open.toString()} icon={<AlertCircle size={20} />} trend={stats.open > 5 ? "down" : "neutral"} />
        <StatCard label="In Progress" value={stats.inProgress.toString()} icon={<Clock size={20} />} />
        <StatCard label="Resolved" value={stats.resolved.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Closed" value={stats.closed.toString()} icon={<XCircle size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Open Issues</H3><Body className="text-muted">Issue list will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
