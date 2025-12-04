"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, StatCard, Grid } from "@ghxstship/ui";
import { Handshake, Plus, DollarSign } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionSponsorsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const sponsorStats = { total: 8, confirmed: 6, pending: 2, revenue: 150000 };

  const sponsors = [
    { id: "1", name: "TechCorp", tier: "Platinum", value: 50000, status: "confirmed" },
    { id: "2", name: "MediaGroup", tier: "Gold", value: 30000, status: "confirmed" },
    { id: "3", name: "BrandCo", tier: "Gold", value: 25000, status: "confirmed" },
    { id: "4", name: "StartupX", tier: "Silver", value: 15000, status: "pending" },
    { id: "5", name: "LocalBiz", tier: "Bronze", value: 10000, status: "confirmed" },
  ];

  const tierColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    Platinum: "info", Gold: "warning", Silver: "solid", Bronze: "solid",
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    confirmed: "success", pending: "warning", declined: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Sponsors"
          description="Manage sponsorship relationships and deliverables"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Add Sponsor
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/sponsors/tiers`)}>
            Tiers
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/sponsors/deliverables`)}>
            Deliverables
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Sponsors" value={sponsorStats.total.toString()} icon={<Handshake size={20} />} inverted />
        <StatCard label="Confirmed" value={sponsorStats.confirmed.toString()} icon={<Handshake size={20} />} trend="up" inverted />
        <StatCard label="Pending" value={sponsorStats.pending.toString()} icon={<Handshake size={20} />} inverted />
        <StatCard label="Revenue" value={`$${(sponsorStats.revenue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} trend="up" inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {sponsors.map((sponsor, index) => (
              <Box key={sponsor.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < sponsors.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <Handshake size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{sponsor.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">${sponsor.value.toLocaleString()}</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Badge variant={tierColors[sponsor.tier]}>{sponsor.tier}</Badge>
                  <Badge variant={statusColors[sponsor.status]}>{sponsor.status.toUpperCase()}</Badge>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
