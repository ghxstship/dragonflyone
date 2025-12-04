"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { FileText, Copy, Download, Star } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function DocumentTemplatesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Templates" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 18, used: 156, favorites: 8, downloads: 89 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Document Templates" description="Reusable document templates" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Templates" value={stats.total.toString()} icon={<FileText size={20} />} />
        <StatCard label="Times Used" value={stats.used.toString()} icon={<Copy size={20} />} />
        <StatCard label="Favorites" value={stats.favorites.toString()} icon={<Star size={20} />} />
        <StatCard label="Downloads" value={stats.downloads.toString()} icon={<Download size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Template Library</H3><Body className="text-muted">Templates will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
