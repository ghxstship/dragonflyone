"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid } from "@ghxstship/ui";
import { Monitor, Music, Crown, UtensilsCrossed, Plane } from "lucide-react";
import { useProject } from "../../../../hooks/useProjects";

export default function ProductionOperationsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const { data: production } = useProject(productionId);

  const sections = [
    { id: "stage-management", name: "Stage Management", description: "Stage operations and cues", icon: Monitor, href: `/p/${productionId}/operations/stage-management` },
    { id: "artists", name: "Artists", description: "Artist management and riders", icon: Music, href: `/p/${productionId}/operations/artists` },
    { id: "vip-management", name: "VIP Management", description: "VIP guests and hospitality", icon: Crown, href: `/p/${productionId}/operations/vip-management` },
    { id: "catering", name: "Catering", description: "Food and beverage", icon: UtensilsCrossed, href: `/p/${productionId}/operations/catering` },
    { id: "travel", name: "Travel", description: "Transportation and logistics", icon: Plane, href: `/p/${productionId}/operations/travel` },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production?.name || "Production"}
        title="Operations"
        description="Stage management, artists, and hospitality"
        colorScheme="on-light"
      />

      <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.id} variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(section.href)}>
            <CardBody>
              <Stack gap={4} className="items-center text-center">
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
    </Stack>
  );
}
