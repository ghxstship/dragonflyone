"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button } from "@ghxstship/ui";
import { Users, Briefcase, Building, UserPlus, Plus } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionStakeholdersPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Stakeholders" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { total: 24, internal: 12, external: 8, pending: 4 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production.name} title="Stakeholders" description="Manage production stakeholders and relationships" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Add Stakeholder</Button>
      </Stack>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total.toString()} icon={<Users size={20} />} inverted />
        <StatCard label="Internal" value={stats.internal.toString()} icon={<Briefcase size={20} />} inverted />
        <StatCard label="External" value={stats.external.toString()} icon={<Building size={20} />} inverted />
        <StatCard label="Pending" value={stats.pending.toString()} icon={<UserPlus size={20} />} inverted />
      </div>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Stakeholder Directory</H3><Body className="text-on-dark-muted">Stakeholder list will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
