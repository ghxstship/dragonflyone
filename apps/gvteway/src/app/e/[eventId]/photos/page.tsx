"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid } from "@ghxstship/ui";
import { Camera, Upload, Image } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventPhotosPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const photos = [
    { id: "1", url: "/placeholder.jpg", caption: "Main Stage" },
    { id: "2", url: "/placeholder.jpg", caption: "Crowd Shot" },
    { id: "3", url: "/placeholder.jpg", caption: "Artist Performance" },
    { id: "4", url: "/placeholder.jpg", caption: "VIP Area" },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={event?.name || "Event"}
          title="Photos"
          description="Event photos and memories"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Upload size={16} className="mr-2" />
          Upload Photo
        </Button>
      </Stack>

      <Grid cols={2} gap={4}>
        {photos.map((photo) => (
          <Card key={photo.id} variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary">
            <CardBody>
              <Stack gap={3}>
                <Box className="flex aspect-video items-center justify-center rounded bg-ink-800">
                  <Image size={48} className="text-on-dark-muted" />
                </Box>
                <Body className="text-body-sm text-on-dark-muted">{photo.caption}</Body>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
