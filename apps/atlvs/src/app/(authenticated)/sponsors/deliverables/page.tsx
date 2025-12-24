"use client";

import { useState, useMemo } from "react";
import { Eye, CheckCircle, Clock, AlertTriangle as AlertTriangleIcon, Loader2 } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  DetailDrawer,
  EnterprisePageHeader,
  Grid,
  ListPage,
  Stack,
  type DetailSection,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler, useSponsorDeliverables, type SponsorDeliverable } from "@ghxstship/config";

interface Deliverable {
  id: string;
  title: string;
  sponsor: string;
  type: "logo_placement" | "social_post" | "signage" | "announcement" | "hospitality" | "custom";
  due_date: string;
  completed_date: string | null;
  status: "pending" | "in_progress" | "completed" | "overdue" | "blocked";
  value: number;
  notes: string;
}

const mapApiToDeliverable = (d: SponsorDeliverable): Deliverable => ({
  id: d.id,
  title: d.title,
  sponsor: d.sponsor?.company_name || "Unknown",
  type: (d.deliverable_type === "digital" ? "social_post" : d.deliverable_type) as Deliverable["type"],
  due_date: d.due_date || new Date().toISOString(),
  completed_date: d.completed_date || null,
  status: d.status === "approved" ? "completed" : d.status === "rejected" ? "blocked" : d.status as Deliverable["status"],
  value: d.value || 0,
  notes: d.notes || "",
});

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const getStatusVariant = (status: Deliverable["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "completed": return "solid";
    case "in_progress": return "outline";
    default: return "ghost";
  }
};

const getStatusIcon = (status: Deliverable["status"]) => {
  switch (status) {
    case "completed": return <CheckCircle className="size-3" />;
    case "overdue": case "blocked": return <AlertTriangleIcon className="size-3" />;
    default: return <Clock className="size-3" />;
  }
};

const columns: ListPageColumn<Deliverable>[] = [
  { key: "title", label: "Deliverable", accessor: "title", sortable: true },
  { key: "sponsor", label: "Sponsor", accessor: "sponsor", sortable: true },
  { key: "type", label: "Type", accessor: "type", render: (v) => <Badge variant="outline" className="capitalize">{String(v).replace("_", " ")}</Badge> },
  { key: "value", label: "Value", accessor: (r) => formatCurrency(r.value), sortable: true },
  { key: "due_date", label: "Due Date", accessor: (r) => formatDate(r.due_date), sortable: true },
  { key: "status", label: "Status", accessor: "status", render: (v) => (
    <Badge variant={getStatusVariant(v as Deliverable["status"])} className="gap-1 capitalize">
      {getStatusIcon(v as Deliverable["status"])}
      {String(v).replace("_", " ")}
    </Badge>
  )},
];

const filters: ListPageFilter[] = [
  { key: "status", label: "Status", options: [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "overdue", label: "Overdue" },
  ]},
  { key: "type", label: "Type", options: [
    { value: "logo_placement", label: "Logo Placement" },
    { value: "social_post", label: "Social Post" },
    { value: "signage", label: "Signage" },
    { value: "announcement", label: "Announcement" },
    { value: "hospitality", label: "Hospitality" },
  ]},
];

export default function SponsorDeliverablesPage() {
  const { deliverables: apiDeliverables, isLoading, error, refetch } = useSponsorDeliverables();
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const deliverables = useMemo(() => apiDeliverables.map(mapApiToDeliverable), [apiDeliverables]);

  const completedCount = deliverables.filter((d: Deliverable) => d.status === "completed").length;
  const overdueCount = deliverables.filter((d: Deliverable) => d.status === "overdue").length;
  const totalValue = deliverables.reduce((sum: number, d: Deliverable) => sum + d.value, 0);

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Sponsor Deliverables" subtitle="Track and manage sponsor deliverables" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading deliverables...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Sponsor Deliverables" subtitle="Track and manage sponsor deliverables" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangleIcon className="size-8 text-error" />
            <Body className="text-error">Failed to load deliverables</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const rowActions: ListPageAction<Deliverable>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedDeliverable(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: "Total Deliverables", value: deliverables.length },
    { label: "Completed", value: completedCount },
    { label: "Overdue", value: overdueCount },
    { label: "Total Value", value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedDeliverable ? [
    { id: "overview", title: "Deliverable Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selectedDeliverable.title}</Body>
        <Body size="sm"><strong>Sponsor:</strong> {selectedDeliverable.sponsor}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedDeliverable.type.replace("_", " ")}</Body>
        <Body size="sm"><strong>Value:</strong> {formatCurrency(selectedDeliverable.value)}</Body>
        <Body size="sm"><strong>Due Date:</strong> {formatDate(selectedDeliverable.due_date)}</Body>
        <Body size="sm"><strong>Completed:</strong> {selectedDeliverable.completed_date ? formatDate(selectedDeliverable.completed_date) : "Not completed"}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedDeliverable.status.replace("_", " ")}</Body>
        {selectedDeliverable.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedDeliverable.notes}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<Deliverable>
        title="Sponsor Deliverables"
        subtitle="Track and manage sponsor deliverables"
        data={deliverables}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search deliverables..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedDeliverable(r); setDrawerOpen(true); }}
        entityType="deliverables"
        onExport={createExportHandler({
          filename: "sponsor-deliverables",
          getData: () => deliverables.map((d: Deliverable) => ({
            title: d.title,
            sponsor: d.sponsor,
            type: d.type,
            value: d.value,
            due_date: d.due_date,
            status: d.status,
          })),
        })}
        stats={stats}
        emptyMessage="No deliverables found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedDeliverable}
        title={(r) => r.title}
        subtitle={(r) => r.sponsor}
        sections={detailSections}
      />
    </>
  );
}
