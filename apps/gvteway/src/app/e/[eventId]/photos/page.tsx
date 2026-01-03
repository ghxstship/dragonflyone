"use client";

import { useParams } from "next/navigation";
import { Camera, Upload, Heart, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Photo { id: string; user: string; likes: number; }
const DEMO_PHOTOS: Photo[] = [
  { id: "1", user: "John", likes: 42 },
  { id: "2", user: "Sarah", likes: 28 },
  { id: "3", user: "Mike", likes: 15 },
];

export default function EventPhotosPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: photos = [], isLoading, error, refetch } = useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/photos`);
      if (!response.ok) return DEMO_PHOTOS;
      return (await response.json()).photos?.length ? (await response.json()).photos : DEMO_PHOTOS;
    },
  });

  const tabs = [{
    id: "photos", label: "Photos", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="p-6 mb-6 border-dashed text-center">
          <Upload className="size-12 text-text-disabled mx-auto mb-4" />
          <Body className="font-weight-medium mb-2">Share Your Photos</Body>
          <Body className="text-text-muted mb-4">Upload photos from the event</Body>
          <Button variant="outline" icon={<Camera className="size-4" />} iconPosition="left">Upload Photo</Button>
        </Card>
        <SectionHeader title="Community Photos" />
        <Grid cols={3} gap={4} className="grid-cols-2 md:grid-cols-3 mt-4">
          {photos.map((photo: Photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <Box className="h-40 bg-surface-elevated flex items-center justify-center"><Camera className="size-8 text-text-disabled" /></Box>
              <Box className="p-3 flex items-center justify-between">
                <Body size="sm" className="text-text-muted">@{photo.user}</Body>
                <Box className="flex items-center gap-1 text-text-muted"><Heart className="size-4" /><Body size="sm">{photo.likes}</Body></Box>
              </Box>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Event", title: "Photos", description: "Community photo gallery" }} backButton={{ label: "Event", href: `/e/${eventId}` }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
