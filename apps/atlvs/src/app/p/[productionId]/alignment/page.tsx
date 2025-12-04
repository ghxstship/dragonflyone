"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { Crosshair, Target, Users, CheckCircle } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionAlignmentPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Alignment" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { objectives: 8, aligned: 6, stakeholders: 12, meetings: 4 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Strategic Alignment" description="Ensure stakeholder alignment on production objectives" colorScheme="on-dark" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Objectives" value={stats.objectives.toString()} icon={<Target size={20} />} inverted />
        <StatCard label="Aligned" value={stats.aligned.toString()} icon={<CheckCircle size={20} />} inverted />
        <StatCard label="Stakeholders" value={stats.stakeholders.toString()} icon={<Users size={20} />} inverted />
        <StatCard label="Meetings" value={stats.meetings.toString()} icon={<Crosshair size={20} />} inverted />
      </div>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Alignment Status</H3><Body className="text-on-dark-muted">Alignment tracking will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
