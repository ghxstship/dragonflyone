"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Grid, Body, Box, H3, Spinner, EmptyState } from "@ghxstship/ui";
import { TrendingUp, Layers, FileText, BarChart, DollarSign, AlertCircle, Users } from "lucide-react";
import { useInvestors, useInvestorStats, useInvestmentRounds } from "../../../../hooks/useInvestors";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionInvestorsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiInvestors, isLoading, error, refetch } = useInvestors({ productionId });
  const { data: apiStats } = useInvestorStats(productionId);
  const { data: apiRounds } = useInvestmentRounds(productionId);

  // Use API data if available, fallback to demo stats
  const stats = apiStats || { 
    totalInvestors: apiInvestors?.length || 8, 
    totalCommitted: 500000, 
    totalRounds: apiRounds?.length || 2, 
    totalFunded: 350000 
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading investors...</Body>
      </Stack>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load investors"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={productionName} title="Investors" description="Manage investor relationships and funding rounds" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Investors" value={stats.totalInvestors.toString()} icon={<Users size={20} />} inverted />
        <StatCard label="Committed" value={`$${(stats.totalCommitted / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
        <StatCard label="Rounds" value={stats.totalRounds.toString()} icon={<Layers size={20} />} inverted />
        <StatCard label="Funded" value={`$${(stats.totalFunded / 1000).toFixed(0)}K`} icon={<TrendingUp size={20} />} trend="up" inverted />
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
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Investor List</H3>
            {apiInvestors && apiInvestors.length > 0 ? (
              <Stack gap={2}>
                {apiInvestors.slice(0, 5).map((investor) => (
                  <Box key={investor.id} className="flex items-center justify-between rounded border-2 border-ink-700 p-3">
                    <Body className="text-white">{investor.name}</Body>
                    <Body className="text-on-dark-muted">${investor.investment_amount?.toLocaleString() || 0}</Body>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Body className="text-on-dark-muted">No investors yet. Add your first investor through the Rounds page.</Body>
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
