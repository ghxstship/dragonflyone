"use client";

import { useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, Badge, Button, H3, Grid, Box } from "@ghxstship/ui";
import { FolderKanban, Calendar, Users, Plus, ArrowRight } from "lucide-react";
import { atlvsDemoProductions } from "../../data/atlvs";

export default function ProductionsPage() {
  const router = useRouter();

  const stats = {
    total: atlvsDemoProductions.length,
    active: atlvsDemoProductions.filter(p => p.status === "active").length,
    upcoming: atlvsDemoProductions.filter(p => p.status === "upcoming").length,
    past: atlvsDemoProductions.filter(p => p.status === "past").length,
  };

  const statusColors: Record<string, "success" | "warning" | "info" | "solid"> = {
    active: "success",
    planning: "warning",
    completed: "info",
    draft: "solid",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker="Platform"
          title="Productions"
          description="Manage all your productions across the platform"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm" onClick={() => router.push("/productions/new")}>
          <Plus size={16} className="mr-2" />
          New Production
        </Button>
      </Stack>

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
            <Stack gap={3}>
              {atlvsDemoProductions.map((production) => (
                <Box
                  key={production.id}
                  className="flex cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-4 transition-all hover:border-ink-600 hover:bg-ink-800/50"
                  onClick={() => router.push(`/p/${production.id}/overview`)}
                >
                  <Stack gap={1}>
                    <Body className="font-weight-bold text-white">{production.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">
                      {production.venue} | {production.startDate} - {production.endDate}
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
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
