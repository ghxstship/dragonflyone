"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge } from "@ghxstship/ui";
import { Building, Plus } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionVendorsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const vendors = [
    { id: "1", name: "Pro Audio Inc", category: "Audio", status: "active", rating: 4.8 },
    { id: "2", name: "Lighting Solutions", category: "Lighting", status: "active", rating: 4.5 },
    { id: "3", name: "Stage Builders LLC", category: "Staging", status: "active", rating: 4.7 },
    { id: "4", name: "Catering Excellence", category: "Catering", status: "pending", rating: 4.2 },
    { id: "5", name: "SecureEvent Co", category: "Security", status: "active", rating: 4.6 },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    active: "success", pending: "warning", inactive: "solid",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Vendors"
          description="Manage vendor relationships for this production"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Add Vendor
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/vendors/contracts`)}>
            Contracts
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/vendors/rate-cards`)}>
            Rate Cards
          </Button>
        </Stack>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {vendors.map((vendor, index) => (
              <div key={vendor.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < vendors.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <Building size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{vendor.name}</Body>
                    <Body size="sm" className=" text-on-dark-muted">{vendor.category} · Rating: {vendor.rating}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[vendor.status]}>{vendor.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
