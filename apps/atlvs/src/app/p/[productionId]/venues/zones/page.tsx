"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, Layers } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function VenueZonesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const zones = [
    { id: "1", name: "Front of House", access: "Public", capacity: 3000 },
    { id: "2", name: "VIP Section", access: "VIP Only", capacity: 500 },
    { id: "3", name: "Backstage", access: "Crew Only", capacity: 150 },
    { id: "4", name: "Production Office", access: "Staff Only", capacity: 30 },
    { id: "5", name: "Loading Dock", access: "Crew Only", capacity: 50 },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Venue Zones"
          description="Access zones and capacity management"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Zone
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {zones.map((zone, index) => (
              <div key={zone.id} className={`flex items-center justify-between border-ink-700 p-4 ${index < zones.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Layers size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{zone.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">Capacity: {zone.capacity}</Body>
                  </Stack>
                </Stack>
                <Badge variant="info">{zone.access}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
