"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Button } from "@ghxstship/ui";
import { Plus } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function UGCPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Share Content" title="Event Not Found" colorScheme="on-dark" /></Stack>;
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
