"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Box } from "@ghxstship/ui";
import { Plus, Zap } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function CuesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const cues = [
    { id: "1", number: "Q1", name: "House Lights Down", type: "lighting", trigger: "Manual" },
    { id: "2", number: "Q2", name: "Stage Wash - Blue", type: "lighting", trigger: "Follow Q1" },
    { id: "3", number: "Q3", name: "Intro Music", type: "audio", trigger: "Follow Q2" },
    { id: "4", number: "Q4", name: "Video Roll - Opening", type: "video", trigger: "With Q3" },
    { id: "5", number: "Q5", name: "Spot - Center Stage", type: "lighting", trigger: "Manual" },
  ];

  const typeColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    lighting: "warning", audio: "info", video: "error", pyro: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Cues"
          description="Lighting, audio, and video cue list"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Cue
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {cues.map((cue, index) => (
              <Box key={cue.id} className={`flex items-center gap-4 border-ink-700 p-4 ${index < cues.length - 1 ? "border-b" : ""}`}>
                <Box className="flex w-16 items-center gap-2">
                  <Zap size={14} className="text-warning" />
                  <Body className="font-weight-bold text-white">{cue.number}</Body>
                </Box>
                <Box className="flex-1">
                  <Body className="font-weight-medium text-white">{cue.name}</Body>
                </Box>
                <Body size="sm" className=" text-on-dark-muted">{cue.trigger}</Body>
                <Badge variant={typeColors[cue.type]}>{cue.type.toUpperCase()}</Badge>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
