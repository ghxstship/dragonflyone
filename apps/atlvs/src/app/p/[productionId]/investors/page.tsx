"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Grid, Body, Box, H3 } from "@ghxstship/ui";
import { TrendingUp, Layers, FileText, BarChart, DollarSign } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionInvestorsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Investors" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { totalInvestors: 8, totalCommitted: 500000, rounds: 2, documents: 15 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Investors" description="Manage investor relationships and funding rounds" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Investors" value={stats.totalInvestors.toString()} icon={<TrendingUp size={20} />} inverted />
        <StatCard label="Committed" value={`$${(stats.totalCommitted / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
        <StatCard label="Rounds" value={stats.rounds.toString()} icon={<Layers size={20} />} inverted />
        <StatCard label="Documents" value={stats.documents.toString()} icon={<FileText size={20} />} inverted />
      </Grid>
      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/investors/rounds`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-800"><Layers size={24} className="text-primary" /></Box><Body className="font-weight-bold text-white">Rounds</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/investors/documents`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-800"><FileText size={24} className="text-secondary" /></Box><Body className="font-weight-bold text-white">Documents</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/investors/reports`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-800"><BarChart size={24} className="text-accent" /></Box><Body className="font-weight-bold text-white">Reports</Body></Stack></CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Investor Updates</H3><Body className="text-on-dark-muted">Recent investor communications will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
