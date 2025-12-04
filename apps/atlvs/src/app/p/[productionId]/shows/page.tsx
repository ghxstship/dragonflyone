"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid } from "@ghxstship/ui";
import { Play, ListOrdered, Zap, Clock, Plus } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionShowsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production?.name || "Production"}
        title="Shows"
        description="Manage run of show, cues, and set times"
        colorScheme="on-dark"
      />

      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/shows/run-of-show`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <ListOrdered size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Run of Show</Body>
                <Body className="text-body-sm text-on-dark-muted">Event timeline and sequence</Body>
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
                <Body className="text-body-sm text-on-dark-muted">Lighting, audio, and video cues</Body>
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
                <Body className="text-body-sm text-on-dark-muted">Artist and act schedules</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
