"use client";

import { useParams, useRouter } from "next/navigation";
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  Body,
  Box,
  H3,
} from "@ghxstship/ui";
import {
  FastForward,
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertTriangle,
  Plus,
  History,
} from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

/**
 * Production Advancing Dashboard
 * Process advance requests from COMPVSS for this production
 */
export default function ProductionAdvancingPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return (
      <Stack gap={4}>
        <SectionHeader
          kicker="Advancing"
          title="Production Not Found"
          description="The requested production could not be found."
          colorScheme="on-dark"
        />
      </Stack>
    );
  }

  const advanceStats = {
    pending: 8,
    approved: 15,
    allocated: 12,
    fulfilled: 10,
    total: 35,
  };

  const pendingRequests = [
    { id: "ADV-001", type: "Production", requester: "Stage Manager", items: "LED Wall Panels (20)", priority: "high", submitted: "2 hours ago" },
    { id: "ADV-002", type: "Artist", requester: "Artist Relations", items: "Hospitality Rider Items", priority: "medium", submitted: "4 hours ago" },
    { id: "ADV-003", type: "Crew", requester: "Audio Lead", items: "Wireless Microphones (8)", priority: "high", submitted: "Yesterday" },
    { id: "ADV-004", type: "Venue", requester: "Site Manager", items: "Barricades (50)", priority: "low", submitted: "Yesterday" },
  ];

  const priorityColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    critical: "error",
    high: "warning",
    medium: "info",
    low: "solid",
  };

  return (
    <Stack gap={8}>
      {/* Header */}
      <Stack gap={4}>
        <SectionHeader
          kicker={production.name}
          title="Advancing"
          description="Process and manage advance requests from COMPVSS"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Create Request
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid cols={2} gap={4} className="lg:grid-cols-5">
        <StatCard
          label="Pending Review"
          value={advanceStats.pending.toString()}
          icon={<Clock size={20} />}
          trend={advanceStats.pending > 5 ? "down" : "neutral"}
          trendValue="Needs attention"
          inverted
        />
        <StatCard
          label="Approved"
          value={advanceStats.approved.toString()}
          icon={<CheckCircle size={20} />}
          trend="up"
          trendValue="Ready to allocate"
          inverted
        />
        <StatCard
          label="Allocated"
          value={advanceStats.allocated.toString()}
          icon={<Package size={20} />}
          trend="up"
          trendValue="Resources assigned"
          inverted
        />
        <StatCard
          label="Fulfilled"
          value={advanceStats.fulfilled.toString()}
          icon={<Truck size={20} />}
          trend="up"
          trendValue="Delivered"
          inverted
        />
        <StatCard
          label="Total Requests"
          value={advanceStats.total.toString()}
          icon={<FastForward size={20} />}
          trend="neutral"
          trendValue="This production"
          inverted
        />
      </Grid>

      {/* Quick Navigation */}
      <Grid cols={3} gap={4}>
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/advancing/allocations`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Package size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Allocations</Body>
                <Body className="text-body-sm text-on-dark-muted">Assign resources</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/advancing/fulfillment`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Truck size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Fulfillment</Body>
                <Body className="text-body-sm text-on-dark-muted">Track delivery</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card
          variant="elevated"
          inverted
          className="cursor-pointer transition-all hover:border-primary"
          onClick={() => router.push(`/p/${productionId}/advancing/history`)}
        >
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <History size={24} className="text-accent" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">History</Body>
                <Body className="text-body-sm text-on-dark-muted">Past requests</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Pending Requests */}
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Stack direction="horizontal" className="items-center justify-between">
              <H3 className="text-white">Pending Review</H3>
              <Badge variant="warning">
                <AlertTriangle size={12} className="mr-1" />
                {advanceStats.pending} Requests
              </Badge>
            </Stack>
            <Stack gap={3}>
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-3 transition-all hover:border-ink-600 hover:bg-ink-800/50"
                >
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{request.items}</Body>
                    <Body className="text-body-sm text-on-dark-muted">
                      {request.requester} - {request.type} - {request.submitted}
                    </Body>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant={priorityColors[request.priority] || "solid"}>
                      {request.priority.toUpperCase()}
                    </Badge>
                    <Button variant="outline" size="sm">Review</Button>
                  </Stack>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
