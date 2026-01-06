"use client";

/**
 * Vendor Portal Page
 * Portal for vendors to manage contracts and invoices
 * Uses DetailPage template for consistent layout
 */

import { Building2, FileText, DollarSign, Clock, CheckCircle, List, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface Contract {
  id: string;
  production: string;
  value: number;
  status: "active" | "pending" | "completed";
  start_date: string;
  end_date: string;
}

const DEMO_CONTRACTS: Contract[] = [
  { id: "1", production: "Summer Festival 2024", value: 45000, status: "active", start_date: "2024-12-01", end_date: "2024-12-25" },
  { id: "2", production: "Corporate Gala", value: 25000, status: "pending", start_date: "2025-01-15", end_date: "2025-01-20" },
  { id: "3", production: "Music Awards", value: 60000, status: "completed", start_date: "2024-10-01", end_date: "2024-10-15" },
];

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const },
  pending: { label: "Pending", variant: "warning" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function VendorPortalPage() {

  const { data: contracts = [], isLoading, error, refetch } = useQuery({
    queryKey: ["vendor-contracts"],
    queryFn: async () => {
      const response = await fetch("/api/portal/vendor/contracts");
      if (!response.ok) return DEMO_CONTRACTS;
      const data = await response.json();
      return data.contracts?.length ? data.contracts : DEMO_CONTRACTS;
    },
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const totalValue = contracts.reduce((sum: number, c: Contract) => sum + c.value, 0);
  const activeContracts = contracts.filter((c: Contract) => c.status === "active").length;

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Contracts" value={contracts.length.toString()} icon={<FileText className="size-5" />} />
            <StatCard label="Active" value={activeContracts.toString()} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Total Value" value={formatCurrency(totalValue)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Pending" value={contracts.filter((c: Contract) => c.status === "pending").length.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          <SectionHeader title="Contracts" />
          <Stack gap={4} className="mt-4">
            {contracts.map((contract: Contract) => (
              <Card key={contract.id} className="p-6">
                <Box className="flex items-start justify-between">
                  <Box>
                    <Body className="font-weight-bold font-weight-medium">{contract.production}</Body>
                    <Body size="sm" className="text-text-muted mt-1">{formatDate(contract.start_date)} - {formatDate(contract.end_date)}</Body>
                  </Box>
                  <Box className="text-right">
                    <Body className="font-weight-bold">{formatCurrency(contract.value)}</Body>
                    <Badge variant={STATUS_CONFIG[contract.status].variant} className="mt-2">{STATUS_CONFIG[contract.status].label}</Badge>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
    {
      id: "profile",
      label: "Company Profile",
      icon: <Settings className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Company Profile" description="Manage your company information" />
          <Card className="p-6 mt-4">
            <Box className="flex items-center gap-6 mb-6">
              <Box className="size-24 bg-primary rounded-avatar flex items-center justify-center">
                <Building2 className="size-12 text-text-primary" />
              </Box>
              <Box>
                <Body className="font-weight-bold font-weight-bold">Vendor Company</Body>
                <Body className="text-text-muted">Category: Staging & Equipment</Body>
                <Badge variant="success" className="mt-2">Verified</Badge>
              </Box>
            </Box>
            <Button variant="outline">Edit Profile</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Portal", title: "Vendor Dashboard", description: "Manage your contracts and invoices" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
