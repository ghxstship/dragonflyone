"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useRisks } from "../../hooks/useRisks";
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

export default function RisksPage() {
  const router = useRouter();
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: risks, isLoading, error, refetch } = useRisks({ severity: filterSeverity, status: filterStatus });

  const filteredRisks = risks || [];
  const highSeverity = (risks || []).filter((r: any) => r.severity === "high" || r.severity === "critical").length;
  const activeRisks = (risks || []).filter((r: any) => r.status === "identified" || r.status === "analyzing" || r.status === "mitigating").length;
  const mitigatedRisks = (risks || []).filter((r: any) => r.status === "mitigated").length;

  if (isLoading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading risks..." />
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
            title="Error Loading Risks"
            description={error instanceof Error ? error.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Risk Management</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={filteredRisks.length}
              label="Total Risks"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={activeRisks}
              label="Active"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={highSeverity}
              label="High Severity"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={mitigatedRisks}
              label="Mitigated"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Stack gap={4} direction="horizontal">
            <Select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black text-white border-grey-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="monitoring">Monitoring</option>
              <option value="mitigated">Mitigated</option>
            </Select>
          </Stack>

          {filteredRisks.length === 0 ? (
            <EmptyState
              title="No Risks Found"
              description={filterSeverity !== "all" || filterStatus !== "all" ? "Try adjusting your filters" : "No risks have been reported yet"}
              action={{ label: "Report New Risk", onClick: () => router.push("/risks/new") }}
            />
          ) : (
            <Table variant="bordered" className="bg-black">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRisks.map((risk: any) => (
                  <TableRow key={risk.id} className="bg-black text-white hover:bg-grey-900">
                    <TableCell className="font-mono text-white">{risk.id.substring(0, 12).toUpperCase()}</TableCell>
                    <TableCell className="text-white">{risk.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{risk.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(risk.severity === "high" || risk.severity === "critical") ? "solid" : "outline"}>
                        {risk.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-grey-400">{risk.status}</TableCell>
                    <TableCell className="text-grey-400">{risk.owner?.name || "Unassigned"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/risks/new")}>
              Report New Risk
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/risks/export")}>
              Export Risk Register
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
