"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Spinner, Container } from "@ghxstship/ui";
import { Wrench, BookOpen, Search, CheckCircle } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";

export default function TroubleshootingPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading } = useProject(productionId);

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  const stats = { guides: 45, recentSearches: 12, resolved: 28, avgTime: 15 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production?.name || "Production"} title="Troubleshooting" description="Guides and solutions for common issues" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Guides" value={stats.guides.toString()} icon={<BookOpen size={20} />} />
        <StatCard label="Recent Searches" value={stats.recentSearches.toString()} icon={<Search size={20} />} />
        <StatCard label="Issues Resolved" value={stats.resolved.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Avg Resolution" value={`${stats.avgTime}m`} icon={<Wrench size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Troubleshooting Guides</H3><Body className="text-muted">Troubleshooting guides will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
