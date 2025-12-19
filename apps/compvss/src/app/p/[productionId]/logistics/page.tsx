"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid } from "@ghxstship/ui";
import { Truck, Package, PackageCheck, Building, MapPin, Key, PenTool } from "lucide-react";
import { useProject } from "../../../../hooks/useProjects";

export default function ProductionLogisticsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const { data: production } = useProject(productionId);

  const sections = [
    { id: "equipment", name: "Equipment", description: "Gear and inventory", icon: Package, href: `/p/${productionId}/logistics/equipment` },
    { id: "deliveries", name: "Deliveries", description: "Incoming shipments", icon: PackageCheck, href: `/p/${productionId}/logistics/deliveries` },
    { id: "vendors", name: "Vendors", description: "Supplier management", icon: Truck, href: `/p/${productionId}/logistics/vendors` },
    { id: "venues", name: "Venue Info", description: "Venue details", icon: Building, href: `/p/${productionId}/logistics/venues` },
    { id: "site-surveys", name: "Site Surveys", description: "Location assessments", icon: MapPin, href: `/p/${productionId}/logistics/site-surveys` },
    { id: "site-access", name: "Site Access", description: "Access credentials", icon: Key, href: `/p/${productionId}/logistics/site-access` },
    { id: "drawings", name: "Drawings", description: "CAD and layouts", icon: PenTool, href: `/p/${productionId}/logistics/drawings` },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production?.name || "Production"}
        title="Logistics"
        description="Equipment, deliveries, and venue management"
        colorScheme="on-light"
      />

      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
