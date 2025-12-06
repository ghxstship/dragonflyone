"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Button } from "@ghxstship/ui";
import { Plus } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function QAPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Q&A" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={event.name} title="Q&A" description="Ask questions and get answers" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Ask Question</Button>
      </Stack>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Questions</H3><Body className="text-on-dark-muted">Q&A will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
