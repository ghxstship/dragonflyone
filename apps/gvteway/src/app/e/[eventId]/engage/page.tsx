"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box } from "@ghxstship/ui";
import { MessageCircle, BarChart, Trophy, Camera } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventEngagePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Engage" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Engage" description="Interact with the event and community" colorScheme="on-dark" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/qa`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <MessageCircle size={24} className="text-primary" />
              </Box>
              <Body className="font-weight-bold text-white">Q&A</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/polls`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <BarChart size={24} className="text-secondary" />
              </Box>
              <Body className="font-weight-bold text-white">Polls</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/challenges`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Trophy size={24} className="text-accent" />
              </Box>
              <Body className="font-weight-bold text-white">Challenges</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/ugc`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Camera size={24} className="text-warning" />
              </Box>
              <Body className="font-weight-bold text-white">Share Content</Body>
            </Stack>
          </CardBody>
        </Card>
      </div>
    </Stack>
  );
}
