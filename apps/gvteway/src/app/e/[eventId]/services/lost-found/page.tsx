"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Button } from "@ghxstship/ui";
import { Plus } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function LostFoundPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Lost & Found" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={event.name} title="Lost & Found" description="Report or find lost items" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Report Lost Item</Button>
      </Stack>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Found Items</H3><Body className="text-on-dark-muted">Found items will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
