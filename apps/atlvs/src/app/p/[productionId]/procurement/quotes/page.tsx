"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { FileQuestion, Clock, CheckCircle, XCircle } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function ProcurementQuotesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Quotes" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { pending: 12, approved: 45, rejected: 8, expired: 3 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Quotes" description="Review and approve vendor quotes" colorScheme="on-dark" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock size={20} />} inverted />
        <StatCard label="Approved" value={stats.approved.toString()} icon={<CheckCircle size={20} />} inverted />
        <StatCard label="Rejected" value={stats.rejected.toString()} icon={<XCircle size={20} />} inverted />
        <StatCard label="Expired" value={stats.expired.toString()} icon={<FileQuestion size={20} />} inverted />
      </div>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Pending Quotes</H3><Body className="text-on-dark-muted">Quote list will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
