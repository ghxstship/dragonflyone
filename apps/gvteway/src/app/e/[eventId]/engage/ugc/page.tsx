"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Button, Spinner, EmptyState } from "@ghxstship/ui";
import { Plus } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function UGCPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return <Stack gap={4} className="flex items-center justify-center py-20"><Spinner variant="grey" size="lg" text="Loading..." /></Stack>;
  }

  if (error || !event) {
    return <Stack gap={4}><EmptyState title="Event Not Found" description="Unable to load event data" inverted /></Stack>;
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={event.name} title="Share Content" description="Share your photos and videos" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Upload</Button>
      </Stack>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Community Content</H3><Body className="text-on-dark-muted">User-generated content will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
