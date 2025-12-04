"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid } from "@ghxstship/ui";
import { Layers, DollarSign, Users, Calendar } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function InvestorRoundsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Rounds" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { active: 1, completed: 1, totalRaised: 500000, investors: 8 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Funding Rounds" description="Track investment rounds and commitments" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Active Rounds" value={stats.active.toString()} icon={<Layers size={20} />} inverted />
        <StatCard label="Completed" value={stats.completed.toString()} icon={<Calendar size={20} />} inverted />
        <StatCard label="Total Raised" value={`$${(stats.totalRaised / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
        <StatCard label="Investors" value={stats.investors.toString()} icon={<Users size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Funding Rounds</H3><Body className="text-on-dark-muted">Round details will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
