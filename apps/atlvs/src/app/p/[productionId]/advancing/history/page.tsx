"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid } from "@ghxstship/ui";
import { History, CheckCircle, XCircle, Clock } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function AdvancingHistoryPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return (
      <Stack gap={4}>
        <SectionHeader kicker="History" title="Production Not Found" colorScheme="on-dark" />
      </Stack>
    );
  }

  const historyStats = { total: 156, approved: 142, denied: 8, modified: 6 };

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production.name}
        title="Advance History"
        description="View past advance requests and their outcomes"
        colorScheme="on-dark"
      />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Total Requests" value={historyStats.total.toString()} icon={<History size={20} />} inverted />
        <StatCard label="Approved" value={historyStats.approved.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
        <StatCard label="Denied" value={historyStats.denied.toString()} icon={<XCircle size={20} />} inverted />
        <StatCard label="Modified" value={historyStats.modified.toString()} icon={<Clock size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Recent History</H3>
            <Body className="text-on-dark-muted">Request history will be displayed here.</Body>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
