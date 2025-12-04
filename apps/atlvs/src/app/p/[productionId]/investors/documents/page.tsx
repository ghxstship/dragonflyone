"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid } from "@ghxstship/ui";
import { FileText, Upload, Download, Eye } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function InvestorDocumentsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Documents" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { total: 15, shared: 12, pending: 3, views: 156 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Investor Documents" description="Share documents with investors" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Total Documents" value={stats.total.toString()} icon={<FileText size={20} />} inverted />
        <StatCard label="Shared" value={stats.shared.toString()} icon={<Upload size={20} />} inverted />
        <StatCard label="Pending Review" value={stats.pending.toString()} icon={<Download size={20} />} inverted />
        <StatCard label="Total Views" value={stats.views.toString()} icon={<Eye size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Document Library</H3><Body className="text-on-dark-muted">Investor documents will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
