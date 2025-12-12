"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Badge, Box } from "@ghxstship/ui";
import { Clock, Music, MapPin } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventProgramPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const program = [
    { id: "1", time: "14:00", title: "Doors Open", type: "event", stage: "Main Entrance" },
    { id: "2", time: "15:00", title: "DJ Set - Opening", type: "performance", stage: "Main Stage" },
    { id: "3", time: "16:00", title: "Support Act 2", type: "performance", stage: "Main Stage" },
    { id: "4", time: "17:00", title: "Support Act 1", type: "performance", stage: "Main Stage" },
    { id: "5", time: "18:30", title: "Headliner", type: "performance", stage: "Main Stage" },
    { id: "6", time: "20:30", title: "Encore", type: "performance", stage: "Main Stage" },
    { id: "7", time: "21:00", title: "Event End", type: "event", stage: "-" },
  ];

  const typeColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    event: "info", performance: "success",
  };

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={event?.name || "Event"}
        title="Program"
        description="Event schedule and set times"
        colorScheme="on-dark"
      />

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {program.map((item, index) => (
              <Stack key={item.id} direction="horizontal" gap={4} className={`items-center border-ink-700 p-4 ${index < program.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={2} className="w-20 items-center">
                  <Clock size={14} className="text-on-dark-muted" />
                  <Body className="font-weight-bold text-white">{item.time}</Body>
                </Stack>
                <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                  {item.type === "performance" ? (
                    <Music size={16} className="text-primary" />
                  ) : (
                    <MapPin size={16} className="text-secondary" />
                  )}
                </Box>
                <Stack gap={0} className="flex-1">
                  <Body className="font-weight-medium text-white">{item.title}</Body>
                  <Body size="sm" className=" text-on-dark-muted">{item.stage}</Body>
                </Stack>
                <Badge variant={typeColors[item.type]}>{item.type.toUpperCase()}</Badge>
              </Stack>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
