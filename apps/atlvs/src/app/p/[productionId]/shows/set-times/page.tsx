"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, Clock, Music } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function SetTimesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const setTimes = [
    { id: "1", artist: "Opening DJ", stage: "Main Stage", start: "15:00", end: "15:45", status: "confirmed" },
    { id: "2", artist: "Local Band", stage: "Side Stage", start: "15:30", end: "16:15", status: "confirmed" },
    { id: "3", artist: "Featured Artist", stage: "Main Stage", start: "16:00", end: "17:00", status: "confirmed" },
    { id: "4", artist: "Headliner", stage: "Main Stage", start: "17:30", end: "19:00", status: "pending" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    confirmed: "success", pending: "warning", cancelled: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Set Times"
          description="Artist and performance schedules"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Set
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {setTimes.map((set, index) => (
              <div key={set.id} className={`flex items-center gap-4 border-ink-700 p-4 ${index < setTimes.length - 1 ? "border-b" : ""}`}>
                <div className="flex w-24 items-center gap-2">
                  <Clock size={14} className="text-on-dark-muted" />
                  <Body className="font-weight-bold text-white">{set.start}</Body>
                </div>
                <div className="flex size-10 items-center justify-center rounded bg-ink-800">
                  <Music size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <Body className="font-weight-medium text-white">{set.artist}</Body>
                  <Body className="text-body-sm text-on-dark-muted">{set.stage} · {set.start} - {set.end}</Body>
                </div>
                <Badge variant={statusColors[set.status]}>{set.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
