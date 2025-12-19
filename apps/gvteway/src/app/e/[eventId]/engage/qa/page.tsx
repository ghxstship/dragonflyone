"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Button, Spinner, EmptyState } from "@ghxstship/ui";
import { Plus } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function QAPage() {
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
        <SectionHeader kicker={event.name} title="Q&A" description="Ask questions and get answers" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Ask Question</Button>
      </Stack>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Questions</H3><Body className="text-on-dark-muted">Q&A will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
