"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3 } from "@ghxstship/ui";
import { BarChart, CheckCircle, Clock } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function PollsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Polls" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Polls" description="Vote and see results" colorScheme="on-dark" />
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Active Polls</H3><Body className="text-on-dark-muted">Polls will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
