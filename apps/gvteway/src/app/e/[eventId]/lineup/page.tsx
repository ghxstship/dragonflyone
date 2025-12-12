"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Badge, Grid } from "@ghxstship/ui";
import { Music, Star } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventLineupPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const lineup = [
    { id: "1", name: "Headliner", genre: "Electronic", setTime: "18:30", isHeadliner: true },
    { id: "2", name: "Support Act 1", genre: "Indie Rock", setTime: "17:00", isHeadliner: false },
    { id: "3", name: "Support Act 2", genre: "Pop", setTime: "16:00", isHeadliner: false },
    { id: "4", name: "Opening DJ", genre: "House", setTime: "15:00", isHeadliner: false },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={event?.name || "Event"}
        title="Lineup"
        description="Artists performing at this event"
        colorScheme="on-dark"
      />

      <Grid cols={2} gap={4}>
        {lineup.map((artist) => (
          <Card key={artist.id} variant="elevated" inverted className={artist.isHeadliner ? "border-primary" : ""}>
            <CardBody>
              <Stack direction="horizontal" gap={4} className="items-center">
                <Box className="flex size-16 items-center justify-center rounded bg-ink-800">
                  <Music size={32} className={artist.isHeadliner ? "text-primary" : "text-on-dark-muted"} />
                </Box>
                <Stack gap={1} className="flex-1">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body className="font-weight-bold text-white">{artist.name}</Body>
                    {artist.isHeadliner && <Star size={16} className="text-warning" />}
                  </Stack>
                  <Body size="sm" className=" text-on-dark-muted">{artist.genre}</Body>
                  <Badge variant="info">{artist.setTime}</Badge>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
