"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Spinner, Container } from "@ghxstship/ui";
import { Users, Eye, FileText, Bell } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";

export default function StakeholderPortalPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { stakeholders: 24, activeViews: 12, sharedDocs: 45, updates: 8 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production?.name || "Production"} title="Stakeholder Portal" description="External stakeholder communication hub" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Stakeholders" value={stats.stakeholders.toString()} icon={<Users size={20} />} />
        <StatCard label="Active Views" value={stats.activeViews.toString()} icon={<Eye size={20} />} />
        <StatCard label="Shared Docs" value={stats.sharedDocs.toString()} icon={<FileText size={20} />} />
        <StatCard label="Updates" value={stats.updates.toString()} icon={<Bell size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Portal Overview</H3><Body className="text-muted">Stakeholder portal content will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
