"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, Phone, Users } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function ShowCallPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const showCalls = [
    { id: "1", department: "Production", callTime: "06:00", headCount: 4, location: "Loading Dock" },
    { id: "2", department: "Audio", callTime: "07:00", headCount: 6, location: "FOH/Stage" },
    { id: "3", department: "Lighting", callTime: "07:00", headCount: 4, location: "Stage" },
    { id: "4", department: "Video", callTime: "08:00", headCount: 3, location: "Control Room" },
    { id: "5", department: "Stage Hands", callTime: "06:00", headCount: 12, location: "Stage" },
    { id: "6", department: "Security", callTime: "15:00", headCount: 20, location: "All Areas" },
    { id: "7", department: "Catering", callTime: "10:00", headCount: 6, location: "Green Room" },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Show Call"
          description="Department call times and crew assignments"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Department
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {showCalls.map((call, index) => (
              <div key={call.id} className={`flex items-center justify-between border-grey-200 p-4 ${index < showCalls.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Phone size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{call.department}</Body>
                    <Body className="text-body-sm text-grey-500">{call.location}</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Stack direction="horizontal" gap={1} className="items-center">
                    <Users size={14} className="text-grey-400" />
                    <Body className="text-body-sm">{call.headCount}</Body>
                  </Stack>
                  <Badge variant="info">{call.callTime}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
