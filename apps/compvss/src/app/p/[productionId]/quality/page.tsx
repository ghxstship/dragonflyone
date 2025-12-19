"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Grid, Body, Box, H3, Spinner, Container } from "@ghxstship/ui";
import { CheckSquare, ListTodo, AlertCircle, Wrench, ClipboardCheck } from "lucide-react";
import { useProject } from "../../../../hooks/useProjects";

export default function ProductionQualityPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { checkpoints: 24, punchList: 8, issues: 3, resolved: 45 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production?.name || "Production"} title="Quality" description="QA checkpoints, punch lists, and issue tracking" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="QA Checkpoints" value={stats.checkpoints.toString()} icon={<ClipboardCheck size={20} />} />
        <StatCard label="Punch List Items" value={stats.punchList.toString()} icon={<ListTodo size={20} />} />
        <StatCard label="Open Issues" value={stats.issues.toString()} icon={<AlertCircle size={20} />} trend={stats.issues > 0 ? "down" : "up"} />
        <StatCard label="Resolved" value={stats.resolved.toString()} icon={<CheckSquare size={20} />} trend="up" />
      </div>
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/quality/qa-checkpoints`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><ClipboardCheck size={24} className="text-primary" /></Box><Body className="font-weight-bold">QA Checkpoints</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/quality/punch-list`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><ListTodo size={24} className="text-secondary" /></Box><Body className="font-weight-bold">Punch List</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/quality/issues`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><AlertCircle size={24} className="text-warning" /></Box><Body className="font-weight-bold">Issues</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/quality/troubleshooting`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><Wrench size={24} className="text-accent" /></Box><Body className="font-weight-bold">Troubleshooting</Body></Stack></CardBody>
        </Card>
      </Grid>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Recent Activity</H3><Body className="text-muted">Quality activity will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
