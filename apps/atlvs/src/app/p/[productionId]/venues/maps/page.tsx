"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid } from "@ghxstship/ui";
import { Map, Upload, Download } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function VenueMapsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const maps = [
    { id: "1", name: "Site Overview", type: "CAD", updated: "2025-06-01" },
    { id: "2", name: "Stage Layout", type: "PDF", updated: "2025-06-05" },
    { id: "3", name: "Emergency Exits", type: "PDF", updated: "2025-06-03" },
    { id: "4", name: "Power Distribution", type: "CAD", updated: "2025-06-02" },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Venue Maps"
          description="Site plans, layouts, and technical drawings"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Upload size={16} className="mr-2" />
            Upload Map
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="md:grid-cols-2">
        {maps.map((map) => (
          <Card key={map.id} variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary">
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <Map size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{map.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{map.type} · Updated {map.updated}</Body>
                  </Stack>
                </Stack>
                <Button variant="outline" size="sm">
                  <Download size={14} className="mr-2" />
                  Download
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
