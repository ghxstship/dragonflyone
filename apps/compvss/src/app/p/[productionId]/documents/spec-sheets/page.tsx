"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { FileSpreadsheet, CheckCircle, Clock, Download } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function SpecSheetsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Spec Sheets" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 45, current: 42, outdated: 3, downloads: 234 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Spec Sheets" description="Technical specifications and equipment details" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total.toString()} icon={<FileSpreadsheet size={20} />} />
        <StatCard label="Current" value={stats.current.toString()} icon={<CheckCircle size={20} />} />
        <StatCard label="Outdated" value={stats.outdated.toString()} icon={<Clock size={20} />} trend={stats.outdated > 0 ? "down" : "up"} />
        <StatCard label="Downloads" value={stats.downloads.toString()} icon={<Download size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Spec Sheet Library</H3><Body className="text-muted">Spec sheets will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
