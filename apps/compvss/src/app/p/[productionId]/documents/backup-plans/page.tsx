"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function BackupPlansPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Backup Plans" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 12, tested: 10, pending: 2, lastTest: "2 days ago" };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Backup Plans" description="Contingency and emergency procedures" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Plans" value={stats.total.toString()} icon={<Shield size={20} />} />
        <StatCard label="Tested" value={stats.tested.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Pending Test" value={stats.pending.toString()} icon={<AlertTriangle size={20} />} trend={stats.pending > 0 ? "down" : "up"} />
        <StatCard label="Last Test" value={stats.lastTest} icon={<Clock size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Backup Plan Library</H3><Body className="text-muted">Backup plans will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
