"use client";

import { useParams } from "next/navigation";
import { Map, MapPin, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Card, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Location { id: string; name: string; type: string; description: string; }
const DEMO_LOCATIONS: Location[] = [
  { id: "1", name: "Main Stage", type: "Stage", description: "Primary performance area" },
  { id: "2", name: "Food Court", type: "Food", description: "Various food vendors" },
  { id: "3", name: "VIP Lounge", type: "VIP", description: "Exclusive VIP area" },
];

export default function EventMapPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: locations = [], isLoading, error, refetch } = useQuery({
    queryKey: ["event-map", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/map`);
      if (!response.ok) return DEMO_LOCATIONS;
      return (await response.json()).locations?.length ? (await response.json()).locations : DEMO_LOCATIONS;
    },
  });

  const tabs = [{
    id: "map", label: "Map", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="h-64 bg-surface-elevated flex items-center justify-center mb-6">
          <Box className="text-center">
            <Map className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="text-on-dark-muted">Interactive map coming soon</Body>
          </Box>
        </Card>
        <SectionHeader title="Locations" description="Key points of interest" />
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4">
          {locations.map((loc: Location) => (
            <Card key={loc.id} className="p-4">
              <Box className="flex items-start gap-3">
                <MapPin className="size-5 text-primary mt-1" />
                <Box>
                  <Body className="font-weight-bold">{loc.name}</Body>
                  <Body size="sm" className="text-on-dark-muted">{loc.type}</Body>
                  <Body size="sm" className="text-on-dark-disabled mt-1">{loc.description}</Body>
                </Box>
              </Box>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Event", title: "Map", description: "Navigate the venue" }} backButton={{ label: "Event", href: `/e/${eventId}` }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
