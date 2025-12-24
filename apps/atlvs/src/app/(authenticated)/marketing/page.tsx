"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, BarChart3 } from "lucide-react";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "social" | "paid" | "event";
  status: "draft" | "active" | "paused" | "completed";
  start_date: string;
  end_date: string | null;
  budget: number;
  spent: number;
  impressions: number;
  conversions: number;
  roi: number;
}

const mockCampaigns: Campaign[] = [
  { id: "1", name: "Summer Festival Launch", type: "email", status: "active", start_date: "2025-01-01", end_date: "2025-01-31", budget: 5000, spent: 3200, impressions: 45000, conversions: 1250, roi: 3.2 },
  { id: "2", name: "Early Bird Tickets", type: "social", status: "active", start_date: "2025-01-05", end_date: null, budget: 8000, spent: 4500, impressions: 125000, conversions: 890, roi: 2.8 },
  { id: "3", name: "VIP Experience Promo", type: "paid", status: "paused", start_date: "2025-01-10", end_date: "2025-02-10", budget: 15000, spent: 7800, impressions: 250000, conversions: 2100, roi: 4.1 },
  { id: "4", name: "Partner Announcement", type: "event", status: "completed", start_date: "2024-12-01", end_date: "2024-12-15", budget: 3000, spent: 2800, impressions: 18000, conversions: 450, roi: 2.1 },
  { id: "5", name: "New Year Newsletter", type: "email", status: "draft", start_date: "2025-01-15", end_date: null, budget: 2000, spent: 0, impressions: 0, conversions: 0, roi: 0 },
];

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const getStatusVariant = (status: Campaign["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "active": return "solid";
    case "paused": return "outline";
    case "completed": return "ghost";
    default: return "outline";
  }
};

const columns: ListPageColumn<Campaign>[] = [
  { key: "name", label: "Campaign", accessor: "name", sortable: true },
  { key: "type", label: "Type", accessor: "type", sortable: true, render: (v) => <Badge variant="outline" className="capitalize">{String(v)}</Badge> },
  { key: "status", label: "Status", accessor: "status", sortable: true, render: (v) => <Badge variant={getStatusVariant(v as Campaign["status"])} className="capitalize">{String(v)}</Badge> },
  { key: "budget", label: "Budget", accessor: (r) => formatCurrency(r.budget), sortable: true },
  { key: "spent", label: "Spent", accessor: (r) => formatCurrency(r.spent), sortable: true },
  { key: "impressions", label: "Impressions", accessor: (r) => formatNumber(r.impressions), sortable: true },
  { key: "conversions", label: "Conversions", accessor: (r) => formatNumber(r.conversions), sortable: true },
  { key: "roi", label: "ROI", accessor: (r) => `${r.roi}x`, sortable: true },
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
  ]},
  { key: "type", label: "Type", options: [
    { value: "email", label: "Email" },
    { value: "social", label: "Social" },
    { value: "paid", label: "Paid" },
    { value: "event", label: "Event" },
  ]},
];

export default function MarketingPage() {
  const router = useRouter();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalBudget = mockCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = mockCampaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalConversions = mockCampaigns.reduce((sum, c) => sum + c.conversions, 0);
  const activeCount = mockCampaigns.filter(c => c.status === "active").length;

  const rowActions: ListPageAction<Campaign>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedCampaign(r); setDrawerOpen(true); } },
    { id: "analytics", label: "View Analytics", icon: <BarChart3 className="size-4" />, onClick: (r) => router.push(`/analytics/campaigns/${r.id}`) },
  ];

  const stats = [
    { label: "Total Campaigns", value: mockCampaigns.length },
    { label: "Active", value: activeCount },
    { label: "Total Budget", value: formatCurrency(totalBudget) },
    { label: "Total Spent", value: formatCurrency(totalSpent) },
    { label: "Total Conversions", value: formatNumber(totalConversions) },
  ];

  const detailSections: DetailSection[] = selectedCampaign ? [
    { id: "overview", title: "Campaign Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selectedCampaign.name}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedCampaign.type}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedCampaign.status}</Body>
        <Body size="sm"><strong>Start Date:</strong> {formatDate(selectedCampaign.start_date)}</Body>
        <Body size="sm"><strong>Budget:</strong> {formatCurrency(selectedCampaign.budget)}</Body>
        <Body size="sm"><strong>Spent:</strong> {formatCurrency(selectedCampaign.spent)}</Body>
        <Body size="sm"><strong>Impressions:</strong> {formatNumber(selectedCampaign.impressions)}</Body>
        <Body size="sm"><strong>Conversions:</strong> {formatNumber(selectedCampaign.conversions)}</Body>
        <Body size="sm"><strong>ROI:</strong> {selectedCampaign.roi}x</Body>
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<Campaign>
        title="Marketing"
        subtitle="Marketing campaigns and analytics"
        data={mockCampaigns}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search campaigns..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCampaign(r); setDrawerOpen(true); }}
        entityType="campaigns"
        onExport={createExportHandler({
          filename: "marketing-campaigns",
          getData: () => mockCampaigns.map(c => ({
            name: c.name,
            type: c.type,
            status: c.status,
            budget: c.budget,
            spent: c.spent,
            impressions: c.impressions,
            conversions: c.conversions,
            roi: c.roi,
          })),
        })}
        stats={stats}
        emptyMessage="No campaigns found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedCampaign}
        title={(r) => r.name}
        subtitle={(r) => `${r.type} campaign`}
        sections={detailSections}
        actions={[
          { id: "analytics", label: "View Analytics", icon: <BarChart3 className="size-4" /> },
        ]}
        onAction={(id, r) => {
          if (id === "analytics") router.push(`/analytics/campaigns/${r.id}`);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
