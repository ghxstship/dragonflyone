"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid, StatCard, Spinner, EmptyState, Button } from "@ghxstship/ui";
import { ListOrdered, Zap, Clock, Calendar, Users, DollarSign, AlertCircle, Plus } from "lucide-react";
import { useShows, useShowStats } from "../../../../hooks/useShows";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionShowsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiShows, isLoading, error, refetch } = useShows({ productionId });
  const { data: showStats } = useShowStats(productionId);

  // Use API stats if available, fallback to demo stats
  const stats = showStats || {
    total: apiShows?.length || 4,
    scheduled: 2,
    confirmed: 1,
    completed: 1,
    totalRevenue: 125000,
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading shows...</Body>
      </Stack>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load shows"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={productionName}
          title="Shows"
          description="Manage run of show, cues, and set times"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm" onClick={() => router.push(`/p/${productionId}/shows/new`)}>
          <Plus size={16} className="mr-2" />
          New Show
        </Button>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Shows" value={stats.total.toString()} icon={<Calendar size={20} />} inverted />
        <StatCard label="Confirmed" value={stats.confirmed.toString()} icon={<Users size={20} />} trend="up" inverted />
        <StatCard label="Scheduled" value={stats.scheduled.toString()} icon={<Clock size={20} />} inverted />
        <StatCard label="Revenue" value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
      </Grid>

      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/shows/run-of-show`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <ListOrdered size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Run of Show</Body>
                <Body size="sm" className=" text-on-dark-muted">Event timeline and sequence</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/shows/cues`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Zap size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Cues</Body>
                <Body size="sm" className=" text-on-dark-muted">Lighting, audio, and video cues</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/shows/set-times`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Clock size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Set Times</Body>
                <Body size="sm" className=" text-on-dark-muted">Artist and act schedules</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {apiShows && apiShows.length > 0 && (
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Body className="font-weight-bold text-white">Upcoming Shows</Body>
              <Stack gap={2}>
                {apiShows.slice(0, 5).map((show) => (
                  <Box key={show.id} className="flex items-center justify-between rounded border-2 border-ink-700 p-3">
                    <Stack gap={1}>
                      <Body className="text-white">{show.title}</Body>
                      <Body size="sm" className="text-on-dark-muted">{show.show_date} at {show.start_time}</Body>
                    </Stack>
                    <Body className="text-on-dark-muted capitalize">{show.status}</Body>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
