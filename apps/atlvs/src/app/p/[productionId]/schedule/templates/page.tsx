"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid } from "@ghxstship/ui";
import { FileText, Plus, Copy } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function ProductionTemplatesPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const templates = [
    { id: "1", title: "Festival Setup Checklist", tasks: 24, category: "Setup" },
    { id: "2", title: "Sound Check Protocol", tasks: 12, category: "Audio" },
    { id: "3", title: "Security Briefing Tasks", tasks: 8, category: "Safety" },
    { id: "4", title: "Vendor Coordination", tasks: 15, category: "Logistics" },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Task Templates"
          description="Reusable task templates for common workflows"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          New Template
        </Button>
      </Stack>

      <Grid cols={1} gap={4} className="md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary">
            <CardBody>
              <Stack gap={4}>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <FileText size={20} className="text-secondary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{template.title}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{template.tasks} tasks · {template.category}</Body>
                  </Stack>
                </Stack>
                <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/schedule/tasks/new?template=${template.id}`)}>
                  <Copy size={14} className="mr-2" />
                  Use Template
                </Button>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}
