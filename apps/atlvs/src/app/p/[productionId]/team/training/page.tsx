"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Box, Grid } from "@ghxstship/ui";
import { Plus, GraduationCap } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function TeamTrainingPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const training = [
    { id: "1", name: "Safety Orientation", required: true, completed: 18, total: 24 },
    { id: "2", name: "Emergency Procedures", required: true, completed: 20, total: 24 },
    { id: "3", name: "Equipment Handling", required: false, completed: 12, total: 24 },
    { id: "4", name: "Customer Service", required: false, completed: 8, total: 24 },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Team Training"
          description="Training requirements and completion tracking"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Training
        </Button>
      </Stack>

      <Grid cols={1} gap={4} className="md:grid-cols-2">
        {training.map((item) => (
          <Card key={item.id} variant="elevated" inverted>
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={3} className="items-center justify-between">
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                      <GraduationCap size={20} className="text-primary" />
                    </Box>
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">{item.name}</Body>
                      <Body size="sm" className=" text-on-dark-muted">{item.completed}/{item.total} completed</Body>
                    </Stack>
                  </Stack>
                  {item.required && <Badge variant="error">REQUIRED</Badge>}
                </Stack>
                <Box className="h-2 w-full overflow-hidden rounded bg-ink-800">
                  <Box className="h-full bg-primary" style={{ width: `${(item.completed / item.total) * 100}%` }} />
                </Box>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
