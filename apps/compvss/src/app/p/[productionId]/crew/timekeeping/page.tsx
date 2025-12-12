"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Clock, Plus, Users } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function TimekeepingPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const timeEntries = [
    { id: "1", name: "John Smith", clockIn: "06:00", clockOut: "18:00", hours: 12, status: "approved" },
    { id: "2", name: "Sarah Jones", clockIn: "06:00", clockOut: "20:00", hours: 14, status: "approved" },
    { id: "3", name: "Mike Wilson", clockIn: "07:00", clockOut: "-", hours: 8, status: "active" },
    { id: "4", name: "Emily Brown", clockIn: "07:00", clockOut: "-", hours: 8, status: "active" },
    { id: "5", name: "Tom Davis", clockIn: "08:00", clockOut: "-", hours: 7, status: "active" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    approved: "success", pending: "warning", active: "info",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Timekeeping"
          description="Track crew hours and attendance"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Manual Entry
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {timeEntries.map((entry, index) => (
              <div key={entry.id} className={`flex items-center justify-between border-grey-200 p-4 ${index < timeEntries.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Users size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{entry.name}</Body>
                    <Body size="sm" className=" text-grey-500">
                      {entry.clockIn} - {entry.clockOut}
                    </Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Stack direction="horizontal" gap={1} className="items-center">
                    <Clock size={14} className="text-grey-400" />
                    <Body className="font-weight-bold">{entry.hours}h</Body>
                  </Stack>
                  <Badge variant={statusColors[entry.status]}>{entry.status.toUpperCase()}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
