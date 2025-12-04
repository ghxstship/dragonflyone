"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button, Grid } from "@ghxstship/ui";
import { FileSearch, Clock, CheckCircle, Send, Plus } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function ProcurementRFPsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="RFPs" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { draft: 2, sent: 3, responses: 8, awarded: 5 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production.name} title="RFPs" description="Request for proposals management" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New RFP</Button>
      </Stack>
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Draft" value={stats.draft.toString()} icon={<FileSearch size={20} />} inverted />
        <StatCard label="Sent" value={stats.sent.toString()} icon={<Send size={20} />} inverted />
        <StatCard label="Responses" value={stats.responses.toString()} icon={<Clock size={20} />} inverted />
        <StatCard label="Awarded" value={stats.awarded.toString()} icon={<CheckCircle size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Active RFPs</H3><Body className="text-on-dark-muted">RFP list will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
