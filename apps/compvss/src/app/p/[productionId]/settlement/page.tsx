"use client";

/**
 * Production Settlement Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { DollarSign, CheckCircle, Clock, FileText, Download, List, Calculator } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, StatCard, ProgressBar, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

interface SettlementItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "paid";
}

const DEMO_SETTLEMENTS: SettlementItem[] = [
  { id: "1", category: "Crew", description: "Stage crew labor", amount: 15000, status: "paid" },
  { id: "2", category: "Crew", description: "Technical crew labor", amount: 12000, status: "approved" },
  { id: "3", category: "Vendors", description: "Staging rental", amount: 25000, status: "paid" },
  { id: "4", category: "Vendors", description: "Lighting rental", amount: 18000, status: "pending" },
  { id: "5", category: "Misc", description: "Catering", amount: 5000, status: "approved" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", variant: "warning" as const },
  approved: { label: "Approved", variant: "info" as const },
  paid: { label: "Paid", variant: "success" as const },
};

export default function ProductionSettlementPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [category, setCategory] = useState("all");

  const { data: settlements = [], isLoading, error, refetch } = useQuery<SettlementItem[]>({
    queryKey: ["production-settlement", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/settlement`);
      if (!response.ok) return DEMO_SETTLEMENTS;
      const data = await response.json();
      return data.items?.length ? data.items : DEMO_SETTLEMENTS;
    },
  });

  const categories: string[] = ["all", ...Array.from(new Set(settlements.map((s: SettlementItem) => s.category)))];
  const filteredSettlements = category === "all" ? settlements : settlements.filter((item: SettlementItem) => item.category === category);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);

  const stats = {
    total: settlements.reduce((sum: number, s: SettlementItem) => sum + s.amount, 0),
    paid: settlements.filter((s: SettlementItem) => s.status === "paid").reduce((sum: number, s: SettlementItem) => sum + s.amount, 0),
    pending: settlements.filter((s: SettlementItem) => s.status === "pending").reduce((sum: number, s: SettlementItem) => sum + s.amount, 0),
  };
  const progress = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;

  const tabs = [
    {
      id: "settlement",
      label: "Settlement",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total" value={formatCurrency(stats.total)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Paid" value={formatCurrency(stats.paid)} icon={<CheckCircle className="size-5" />} />
            <StatCard label="Pending" value={formatCurrency(stats.pending)} icon={<Clock className="size-5" />} />
            <StatCard label="Progress" value={`${Math.round(progress)}%`} icon={<Calculator className="size-5" />} />
          </Grid>

          <Card className="p-6 mb-6">
            <div className="flex justify-between mb-2">
              <Body className="font-weight-medium">Settlement Progress</Body>
              <Body className="font-weight-bold">{Math.round(progress)}%</Body>
            </div>
            <ProgressBar value={progress} size="lg" />
          </Card>

          <div className="flex gap-2 mb-6">
            {categories.map((cat) => (
              <Button key={cat} variant={category === cat ? "solid" : "outline"} size="sm" onClick={() => setCategory(cat)}>
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredSettlements.map((item: SettlementItem) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-card ${item.status === "paid" ? "bg-success/20" : item.status === "approved" ? "bg-info/20" : "bg-grey-800"}`}>
                      <DollarSign className="size-4" />
                    </div>
                    <div>
                      <Body className="font-weight-medium">{item.description}</Body>
                      <Body size="sm" className="text-on-dark-muted">{item.category}</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Body className="font-weight-bold">{formatCurrency(item.amount)}</Body>
                    <Badge variant={STATUS_CONFIG[item.status].variant}>{STATUS_CONFIG[item.status].label}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "reports",
      label: "Reports",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Settlement Reports" description="Download settlement reports" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
            <Card className="p-6">
              <FileText className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Settlement Summary</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">Complete settlement breakdown</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download PDF</Button>
            </Card>
            <Card className="p-6">
              <Calculator className="size-8 text-primary mb-4" />
              <Body className="font-weight-bold mb-2">Detailed Breakdown</Body>
              <Body size="sm" className="text-on-dark-muted mb-4">Line-by-line expense report</Body>
              <Button variant="outline" icon={<Download className="size-4" />} iconPosition="left">Download XLSX</Button>
            </Card>
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Settlement", description: "Financial settlement and payments" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
