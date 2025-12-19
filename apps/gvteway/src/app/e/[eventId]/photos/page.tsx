"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid, Spinner } from "@ghxstship/ui";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventPhotosPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading photos..." />
      </Stack>
    );
  }

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
                  <ImageIcon size={48} className="text-on-dark-muted" />
                </Box>
                <Body size="sm" className=" text-on-dark-muted">{photo.caption}</Body>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
