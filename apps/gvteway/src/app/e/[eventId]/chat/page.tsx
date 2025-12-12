"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Input } from "@ghxstship/ui";
import { Send, Users } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventChatPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const messages = [
    { id: "1", user: "Alex", message: "So excited for this event!", time: "2 min ago" },
    { id: "2", user: "Sam", message: "Anyone know what time doors open?", time: "5 min ago" },
    { id: "3", user: "Jordan", message: "14:00 according to the event page", time: "4 min ago" },
    { id: "4", user: "Taylor", message: "See you all there!", time: "1 min ago" },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={event?.name || "Event"}
          title="Event Chat"
          description="Connect with other attendees"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2} className="items-center">
          <Users size={16} className="text-on-dark-muted" />
          <Body size="sm" className=" text-on-dark-muted">42 people online</Body>
        </Stack>
      </Stack>

      <Card variant="elevated" inverted className="flex-1">
        <CardBody>
          <Stack gap={4}>
            {messages.map((msg) => (
              <Stack key={msg.id} direction="horizontal" gap={3} className="items-start">
                <Box className="flex size-8 items-center justify-center rounded-avatar bg-ink-800">
                  <Users size={14} className="text-on-dark-muted" />
                </Box>
                <Stack gap={1} className="flex-1">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body className="font-weight-medium text-white">{msg.user}</Body>
                    <Body size="sm" className=" text-on-dark-muted">{msg.time}</Body>
                  </Stack>
                  <Body className="text-on-dark-muted">{msg.message}</Body>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack direction="horizontal" gap={2}>
            <Input inverted placeholder="Type a message..." className="flex-1" />
            <Button variant="solid">
              <Send size={16} />
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
