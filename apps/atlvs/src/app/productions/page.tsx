"use client";

import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../components/app-layout";
import { EnterprisePageHeader, MainContent, Container, Card, CardBody, Stack, StatCard, Body, Badge, H3, Grid, Box, EmptyState, Spinner } from "@ghxstship/ui";
import { FolderKanban, Calendar, Users, Plus, ArrowRight, AlertCircle } from "lucide-react";
import { useProductions, type Production } from "../../hooks/useProductions";
import { atlvsDemoProductions, type ProductionContext } from "../../data/atlvs";

// Unified production display type
interface DisplayProduction {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
}

// Normalize API production to display format
function normalizeProduction(p: Production | ProductionContext): DisplayProduction {
  if ('title' in p) {
    // API production
    return {
      id: p.id,
      name: p.title,
      status: p.status,
      startDate: p.opening_date,
      endDate: p.closing_date,
      venue: p.venue_name,
    };
  }
  // Demo production
  return {
    id: p.id,
    name: p.name,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
    venue: p.venue,
  };
}

export default function ProductionsPage() {
  const router = useRouter();
  const { data: apiProductions, isLoading, error, refetch } = useProductions();
  
  // Use API data if available, fallback to demo data, normalize to display format
  const rawProductions = apiProductions && apiProductions.length > 0 ? apiProductions : atlvsDemoProductions;
  const productions: DisplayProduction[] = rawProductions.map(normalizeProduction);

  const stats = {
    total: productions.length,
    active: productions.filter(p => p.status === "active").length,
    upcoming: productions.filter(p => p.status === "upcoming").length,
    past: productions.filter(p => p.status === "past" || p.status === "completed").length,
  };

  const statusColors: Record<string, "success" | "warning" | "info" | "solid"> = {
    active: "success",
    planning: "warning",
    completed: "info",
    draft: "solid",
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Productions"
        subtitle="Manage all your productions across the platform"
        primaryAction={{
          label: "New Production",
          onClick: () => router.push("/productions/new"),
          icon: <Plus size={16} />,
        }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>
            <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Total Productions" value={stats.total.toString()} icon={<FolderKanban size={20} />} inverted />
        <StatCard label="Active" value={stats.active.toString()} icon={<Calendar size={20} />} trend="up" inverted />
        <StatCard label="Upcoming" value={stats.upcoming.toString()} icon={<Users size={20} />} inverted />
        <StatCard label="Past" value={stats.past.toString()} icon={<FolderKanban size={20} />} inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">All Productions</H3>
            {isLoading ? (
              <Stack className="items-center justify-center py-8">
                <Spinner size="lg" />
                <Body className="text-on-dark-muted">Loading productions...</Body>
              </Stack>
            ) : error ? (
              <EmptyState
                icon={<AlertCircle size={48} />}
                title="Failed to load productions"
                description={error.message}
                action={{ label: "Retry", onClick: () => refetch() }}
              />
            ) : productions.length === 0 ? (
              <EmptyState
                icon={<FolderKanban size={48} />}
                title="No productions yet"
                description="Create your first production to get started"
                action={{ label: "New Production", onClick: () => router.push("/productions/new") }}
              />
            ) : (
              <Stack gap={3}>
                {productions.map((production) => (
                  <Box
                    key={production.id}
                    className="flex cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-4 transition-all hover:border-ink-600 hover:bg-ink-800/50"
                    onClick={() => router.push(`/p/${production.id}/overview`)}
                  >
                    <Stack gap={1}>
                      <Body className="font-weight-bold text-white">{production.name}</Body>
                      <Body size="sm" className=" text-on-dark-muted">
                        {production.venue || 'No venue'} | {production.startDate || 'TBD'} - {production.endDate || 'TBD'}
                      </Body>
                    </Stack>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      <Badge variant={statusColors[production.status] || "solid"}>
                        {production.status.toUpperCase()}
                      </Badge>
                      <ArrowRight size={16} className="text-on-dark-muted" />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </CardBody>
      </Card>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
