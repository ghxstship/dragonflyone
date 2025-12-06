"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, StatCard, Grid } from "@ghxstship/ui";
import { Clock, ListOrdered, Phone, Hammer } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const scheduleStats = { runOfShow: 24, showCalls: 8, buildStrike: 12, soundchecks: 4 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Schedule"
          description="Run of show, show calls, and production timeline"
          colorScheme="on-light"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => router.push(`/p/${productionId}/schedule/run-of-show`)}>
            <ListOrdered size={16} className="mr-2" />
            Run of Show
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/schedule/show-call`)}>
            <Phone size={16} className="mr-2" />
            Show Call
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Run of Show Items" value={scheduleStats.runOfShow.toString()} icon={<ListOrdered size={20} />} />
        <StatCard label="Show Calls" value={scheduleStats.showCalls.toString()} icon={<Phone size={20} />} />
        <StatCard label="Build/Strike Tasks" value={scheduleStats.buildStrike.toString()} icon={<Hammer size={20} />} />
        <StatCard label="Soundchecks" value={scheduleStats.soundchecks.toString()} icon={<Clock size={20} />} />
      </div>

      <Grid cols={3} gap={4}>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/schedule/run-of-show`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                <ListOrdered size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Run of Show</Body>
                <Body className="text-body-sm text-grey-500">Event timeline</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/schedule/show-call`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                <Phone size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Show Call</Body>
                <Body className="text-body-sm text-grey-500">Call times</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/schedule/build-strike`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                <Hammer size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Build/Strike</Body>
                <Body className="text-body-sm text-grey-500">Setup and teardown</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
