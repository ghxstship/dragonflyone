"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useShipments } from "@/hooks/useLogistics";
import {
  H1,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Section,
} from "@ghxstship/ui";

export default function LogisticsPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: shipments, isLoading, error, refetch } = useShipments();

  if (isLoading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading logistics data..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Logistics"
            description={error instanceof Error ? error.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        </Container>
      </Section>
    );
  }

  const displayShipments = shipments || [];
  const filteredShipments = displayShipments.filter((s: any) =>
    filterStatus === "all" || s.status.toLowerCase().replace(" ", "-") === filterStatus
  );

  const inTransitCount = displayShipments.filter((s: any) => s.status === "in-transit").length;
  const deliveredCount = displayShipments.filter((s: any) => s.status === "delivered").length;

  const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "solid";
      case "in-transit":
        return "outline";
      default:
        return "ghost";
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || status;
  };

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Logistics & Transportation</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={displayShipments.length}
              label="Active Shipments"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={inTransitCount}
              label="In Transit"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={deliveredCount}
              label="Delivered"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value="96%"
              label="On-Time Rate"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="loading">Loading</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </Select>
          </Stack>

          {filteredShipments.length === 0 ? (
            <EmptyState
              title="No Shipments Found"
              description="Schedule your first shipment to get started"
              action={{ label: "Schedule Shipment", onClick: () => router.push("/logistics/new") }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((shipment: any) => (
                  <TableRow key={shipment.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="font-mono text-white">{shipment.id}</TableCell>
                    <TableCell className="text-white">{shipment.equipment}</TableCell>
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="text-grey-300">{shipment.origin} →</Body>
                        <Body className="text-grey-300">{shipment.destination}</Body>
                      </Stack>
                    </TableCell>
                    <TableCell className="text-white">{shipment.driver}</TableCell>
                    <TableCell className="font-mono text-grey-400">{shipment.truck}</TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(shipment.status)}>
                        {formatStatus(shipment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/logistics/${shipment.id}`)}>
                        Track
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/logistics/new")}>
              Schedule Shipment
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/logistics/fleet")}>
              Track Fleet
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
