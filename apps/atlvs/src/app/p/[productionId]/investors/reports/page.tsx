"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid } from "@ghxstship/ui";
import { BarChart, Calendar, Send, Eye } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function InvestorReportsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Reports" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { total: 8, sent: 6, scheduled: 2, avgViews: 12 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Investor Reports" description="Generate and send investor updates" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Total Reports" value={stats.total.toString()} icon={<BarChart size={20} />} inverted />
        <StatCard label="Sent" value={stats.sent.toString()} icon={<Send size={20} />} inverted />
        <StatCard label="Scheduled" value={stats.scheduled.toString()} icon={<Calendar size={20} />} inverted />
        <StatCard label="Avg Views" value={stats.avgViews.toString()} icon={<Eye size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Report History</H3><Body className="text-on-dark-muted">Investor reports will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
