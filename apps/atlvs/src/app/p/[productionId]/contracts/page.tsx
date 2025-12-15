"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Box, Spinner, EmptyState, StatCard, Grid } from "@ghxstship/ui";
import { FileCheck, Plus, Upload, AlertCircle, DollarSign, Clock, CheckCircle } from "lucide-react";
import { useContracts } from "../../../../hooks/useContracts";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

const demoContracts = [
  { id: "1", title: "Venue Rental Agreement", vendor: { name: "Central Park Events" }, value: 40000, status: "active" as const },
  { id: "2", title: "Headliner Performance", vendor: { name: "Artist Management LLC" }, value: 50000, status: "active" as const },
  { id: "3", title: "Audio Equipment Rental", vendor: { name: "Pro Audio Inc" }, value: 5000, status: "draft" as const },
  { id: "4", title: "Security Services", vendor: { name: "SecureEvent Co" }, value: 8000, status: "draft" as const },
];

export default function ProductionContractsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiContracts, isLoading, error, refetch } = useContracts();

  // Use API data if available, fallback to demo data
  const contracts = apiContracts && apiContracts.length > 0 ? apiContracts : demoContracts;
  const contractStats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    draft: contracts.filter(c => c.status === 'draft').length,
    totalValue: contracts.reduce((sum, c) => sum + (c.value || 0), 0),
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    active: "success", draft: "solid", expired: "error", terminated: "error",
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading contracts...</Body>
      </Stack>
    );
  }

  if (error && contracts.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load contracts"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={productionName}
          title="Contracts"
          description="Manage agreements and legal documents"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            New Contract
          </Button>
          <Button variant="outline" size="sm">
            <Upload size={16} className="mr-2" />
            Upload
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Contracts" value={contractStats.total.toString()} icon={<FileCheck size={20} />} inverted />
        <StatCard label="Active" value={contractStats.active.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
        <StatCard label="Draft" value={contractStats.draft.toString()} icon={<Clock size={20} />} inverted />
        <StatCard label="Total Value" value={`$${(contractStats.totalValue / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {contracts.length === 0 ? (
              <EmptyState
                icon={<FileCheck size={48} />}
                title="No contracts yet"
                description="Create your first contract to get started"
                action={{ label: "New Contract", onClick: () => {} }}
              />
            ) : (
              contracts.map((contract, index) => (
                <Box key={contract.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < contracts.length - 1 ? "border-b" : ""}`}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <FileCheck size={20} className="text-primary" />
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">{contract.title}</Body>
                      <Body size="sm" className=" text-on-dark-muted">{contract.vendor?.name || 'No vendor'} · ${contract.value.toLocaleString()}</Body>
                    </Stack>
                  </Stack>
                  <Badge variant={statusColors[contract.status]}>{contract.status.toUpperCase()}</Badge>
                </Box>
              ))
            )}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
