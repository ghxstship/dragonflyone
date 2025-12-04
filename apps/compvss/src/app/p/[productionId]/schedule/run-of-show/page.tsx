"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, Clock } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function RunOfShowPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const runOfShow = [
    { id: "1", time: "06:00", item: "Crew Call - Load In", duration: "2 hrs", type: "setup" },
    { id: "2", time: "08:00", item: "Stage Build Begins", duration: "4 hrs", type: "setup" },
    { id: "3", time: "12:00", item: "Lunch Break", duration: "1 hr", type: "break" },
    { id: "4", time: "13:00", item: "Sound Check - Support", duration: "1 hr", type: "technical" },
    { id: "5", time: "14:00", item: "Sound Check - Headliner", duration: "2 hrs", type: "technical" },
    { id: "6", time: "16:00", item: "Doors Open", duration: "-", type: "event" },
    { id: "7", time: "17:00", item: "Support Act", duration: "45 min", type: "performance" },
    { id: "8", time: "18:00", item: "Changeover", duration: "30 min", type: "technical" },
    { id: "9", time: "18:30", item: "Headliner", duration: "2 hrs", type: "performance" },
    { id: "10", time: "20:30", item: "Show End - Strike Begins", duration: "-", type: "setup" },
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
          description="Complete production timeline"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Item
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {runOfShow.map((item, index) => (
              <div key={item.id} className={`flex items-center gap-4 border-grey-200 p-4 ${index < runOfShow.length - 1 ? "border-b" : ""}`}>
                <div className="flex w-20 items-center gap-2">
                  <Clock size={14} className="text-grey-400" />
                  <Body className="font-weight-bold">{item.time}</Body>
                </div>
                <div className="flex-1">
                  <Body className="font-weight-medium">{item.item}</Body>
                </div>
                <Body className="text-body-sm text-grey-500">{item.duration}</Body>
                <Badge variant={typeColors[item.type]}>{item.type.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
