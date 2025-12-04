"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { BookOpen, CheckCircle, Clock, Users } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function SOPsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="SOPs" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 24, active: 22, underReview: 2, acknowledged: 156 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Standard Operating Procedures" description="SOPs and operational guidelines" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total SOPs" value={stats.total.toString()} icon={<BookOpen size={20} />} />
        <StatCard label="Active" value={stats.active.toString()} icon={<CheckCircle size={20} />} />
        <StatCard label="Under Review" value={stats.underReview.toString()} icon={<Clock size={20} />} />
        <StatCard label="Acknowledged" value={stats.acknowledged.toString()} icon={<Users size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>SOP Library</H3><Body className="text-muted">SOPs will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
