"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, Clock } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function RunOfShowPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const runOfShow = [
    { id: "1", time: "08:00", item: "Doors Open - Crew Call", duration: "30 min", type: "setup" },
    { id: "2", time: "09:00", item: "Sound Check - Main Stage", duration: "2 hrs", type: "technical" },
    { id: "3", time: "11:00", item: "Lighting Check", duration: "1 hr", type: "technical" },
    { id: "4", time: "12:00", item: "Lunch Break", duration: "1 hr", type: "break" },
    { id: "5", time: "14:00", item: "Doors Open - Public", duration: "-", type: "event" },
    { id: "6", time: "15:00", item: "Opening Act", duration: "45 min", type: "performance" },
    { id: "7", time: "16:00", item: "Main Act", duration: "2 hrs", type: "performance" },
    { id: "8", time: "18:00", item: "Encore", duration: "30 min", type: "performance" },
    { id: "9", time: "19:00", item: "Event End - Strike Begins", duration: "-", type: "setup" },
  ];

  const typeColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    setup: "solid", technical: "info", break: "warning", event: "success", performance: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Run of Show"
          description="Complete event timeline and sequence"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Item
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {runOfShow.map((item, index) => (
              <div key={item.id} className={`flex items-center gap-4 border-ink-700 p-4 ${index < runOfShow.length - 1 ? "border-b" : ""}`}>
                <div className="flex w-20 items-center gap-2">
                  <Clock size={14} className="text-on-dark-muted" />
                  <Body className="font-weight-bold text-white">{item.time}</Body>
                </div>
                <div className="flex-1">
                  <Body className="font-weight-medium text-white">{item.item}</Body>
                </div>
                <Body className="text-body-sm text-on-dark-muted">{item.duration}</Body>
                <Badge variant={typeColors[item.type]}>{item.type.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
