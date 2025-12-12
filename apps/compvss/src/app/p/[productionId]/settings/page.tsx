"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid } from "@ghxstship/ui";
import { Settings, Users, Bell, Lock, Palette, Globe, Trash2 } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionSettingsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const settingsSections = [
    { id: "general", name: "General", description: "Basic production settings", icon: Settings },
    { id: "team", name: "Team Access", description: "Manage team permissions", icon: Users },
    { id: "notifications", name: "Notifications", description: "Alert preferences", icon: Bell },
    { id: "privacy", name: "Privacy", description: "Visibility and sharing", icon: Lock },
    { id: "branding", name: "Branding", description: "Colors and logos", icon: Palette },
    { id: "integrations", name: "Integrations", description: "Connected services", icon: Globe },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production?.name || "Production"}
        title="Settings"
        description="Configure production preferences and access"
        colorScheme="on-light"
      />

      <Grid cols={2} gap={4}>
        {settingsSections.map((section) => (
          <Card key={section.id} variant="elevated" className="cursor-pointer transition-all hover:border-primary">
            <CardBody>
              <Stack direction="horizontal" gap={4} className="items-center">
                <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                  <section.icon size={24} className="text-primary" />
                </Box>
                <Stack gap={1}>
                  <Body className="font-weight-bold">{section.name}</Body>
                  <Body size="sm" className=" text-grey-500">{section.description}</Body>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      <Card variant="elevated" className="border-error/30">
        <CardBody>
          <Stack direction="horizontal" gap={4} className="items-center justify-between">
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-error/20">
                <Trash2 size={24} className="text-error" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Danger Zone</Body>
                <Body size="sm" className=" text-grey-500">Archive or delete this production</Body>
              </Stack>
            </Stack>
            <Button variant="destructive" size="sm">Archive Production</Button>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
