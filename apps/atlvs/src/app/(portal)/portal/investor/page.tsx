"use client";

/**
 * Investor Portal Page
 * Portal for investors to track investments
 * Uses DetailPage template for consistent layout
 */

import { TrendingUp, DollarSign, PieChart, FileText, BarChart3, List, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface Investment {
  id: string;
  production: string;
  amount: number;
  returns: number;
  status: "active" | "completed";
  date: string;
}

const DEMO_INVESTMENTS: Investment[] = [
  { id: "1", production: "Summer Festival 2024", amount: 500000, returns: 75000, status: "active", date: "2024-06-01" },
  { id: "2", production: "Music Awards 2024", amount: 250000, returns: 45000, status: "completed", date: "2024-03-15" },
  { id: "3", production: "Tech Conference", amount: 150000, returns: 22500, status: "completed", date: "2024-01-10" },
];

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function InvestorPortalPage() {

  const { data: investments = [], isLoading, error, refetch } = useQuery({
    queryKey: ["investor-investments"],
    queryFn: async () => {
      const response = await fetch("/api/portal/investor/investments");
      if (!response.ok) return DEMO_INVESTMENTS;
      const data = await response.json();
      return data.investments?.length ? data.investments : DEMO_INVESTMENTS;
    },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const totalInvested = investments.reduce((sum: number, i: Investment) => sum + i.amount, 0);
  const totalReturns = investments.reduce((sum: number, i: Investment) => sum + i.returns, 0);
  const avgROI = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Invested" value={formatCurrency(totalInvested)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Total Returns" value={formatCurrency(totalReturns)} icon={<TrendingUp className="size-5" />} />
            <StatCard label="Avg ROI" value={`${avgROI.toFixed(1)}%`} icon={<PieChart className="size-5" />} />
            <StatCard label="Active" value={investments.filter((i: Investment) => i.status === "active").length.toString()} icon={<BarChart3 className="size-5" />} />
          </Grid>

          <SectionHeader title="Investments" />
          <Stack gap={4} className="mt-4">
            {investments.map((investment: Investment) => {
              const roi = (investment.returns / investment.amount) * 100;
              return (
                <Card key={investment.id} className="p-6">
                  <Box className="flex items-start justify-between">
                    <Box>
                      <Body className="font-weight-bold font-weight-medium">{investment.production}</Body>
                      <Body size="sm" className="text-on-dark-muted mt-1">Invested {formatDate(investment.date)}</Body>
                    </Box>
                    <Box className="text-right">
                      <Body className="font-weight-bold">{formatCurrency(investment.amount)}</Body>
                      <Box className="flex items-center gap-2 mt-2">
                        <Body size="sm" className="text-success">+{formatCurrency(investment.returns)} ({roi.toFixed(1)}%)</Body>
                        <Badge variant={STATUS_CONFIG[investment.status].variant}>{STATUS_CONFIG[investment.status].label}</Badge>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        </Section>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: <Download className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Investment Reports" description="Download your investment reports" />
          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2 mt-6">
            <Card className="p-6">
              <FileText className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Portfolio Summary</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">Overview of all your investments and returns</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
            <Card className="p-6">
              <BarChart3 className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Performance Report</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">Detailed performance metrics and analysis</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Portal", title: "Investor Dashboard", description: "Track your investments and returns" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
