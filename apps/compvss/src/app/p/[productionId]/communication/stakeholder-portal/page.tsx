"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { Users, Eye, FileText, Bell } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function StakeholderPortalPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Stakeholder Portal" title="Production Not Found" /></Stack>;
  }

  const stats = { stakeholders: 24, activeViews: 12, sharedDocs: 45, updates: 8 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Stakeholder Portal" description="External stakeholder communication hub" />
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
