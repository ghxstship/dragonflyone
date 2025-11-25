"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useMaintenance } from "../../hooks/useMaintenance";
import {
  H1,
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

export default function MaintenancePage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  
  const { data: maintenanceItems, isLoading, error, refetch } = useMaintenance();

  if (isLoading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading maintenance records..." />
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
            title="Error Loading Maintenance Data"
            description={error instanceof Error ? error.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        </Container>
      </Section>
    );
  }

  const filteredItems = (maintenanceItems || []).filter(item => {
    const matchesStatus = filterStatus === "all" || item.status.toLowerCase().replace(" ", "-") === filterStatus;
    const matchesPriority = filterPriority === "all" || item.priority.toLowerCase() === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const overdueCount = (maintenanceItems || []).filter(i => i.next_due && new Date(i.next_due) < new Date() && i.status !== "completed").length;
  const inProgressCount = (maintenanceItems || []).filter(i => i.status === "in-progress").length;
  const thisMonthCount = (maintenanceItems || []).filter(i => {
    const month = new Date().getMonth();
    const itemMonth = i.next_due ? new Date(i.next_due).getMonth() : -1;
    return itemMonth === month;
  }).length;

  const getPriorityVariant = (priority: string): "solid" | "outline" | "ghost" => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "critical":
        return "solid";
      case "medium":
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
          <H1>Equipment Maintenance</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={maintenanceItems?.length || 0}
              label="Total Items"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={inProgressCount}
              label="In Progress"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={overdueCount}
              label="Overdue"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={thisMonthCount}
              label="This Month"
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </Select>
            <Select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Stack>

          {filteredItems.length === 0 ? (
            <EmptyState
              title="No Maintenance Records Found"
              description="Schedule your first maintenance task to get started"
              action={{ label: "Schedule Maintenance", onClick: () => router.push("/maintenance/new") }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="text-white">{item.equipment_name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="ghost">{formatStatus(item.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {item.last_service ? new Date(item.last_service).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell className="font-mono text-grey-400">
                      {item.next_due ? new Date(item.next_due).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(item.priority)}>{item.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "completed" ? "solid" : "outline"}>
                        {formatStatus(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => router.push(`/maintenance/${item.id}`)}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/maintenance/new")}>
              Schedule Maintenance
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/maintenance/history")}>
              Service History
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
