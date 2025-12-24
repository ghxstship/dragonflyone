"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, History, CheckCircle, XCircle, Clock } from "lucide-react";
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
import { useAdvancingRequests, createExportHandler } from "@ghxstship/config";
import type { ProductionAdvance, AdvanceStatus } from "@ghxstship/config/types/advancing";

const formatCurrency = (amount: number | null) => {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeVariant = (status: AdvanceStatus): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "approved":
    case "fulfilled":
      return "solid";
    case "rejected":
    case "cancelled":
      return "ghost";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: AdvanceStatus) => {
  switch (status) {
    case "approved":
    case "fulfilled":
      return <CheckCircle className="size-3" />;
    case "rejected":
    case "cancelled":
      return <XCircle className="size-3" />;
    default:
      return <Clock className="size-3" />;
  }
};

const columns: ListPageColumn<ProductionAdvance>[] = [
  { key: "activation_name", label: "Request", accessor: (r) => r.team_workspace || r.activation_name || "Untitled", sortable: true },
  { key: "project", label: "Project", accessor: (r) => r.project?.name || "—" },
  { key: "submitter", label: "Submitter", accessor: (r) => r.submitter?.full_name || "Unknown" },
  { key: "submitted_at", label: "Submitted", accessor: (r) => formatDate(r.submitted_at), sortable: true },
  { key: "reviewed_at", label: "Reviewed", accessor: (r) => formatDate(r.reviewed_at), sortable: true },
  { key: "actual_cost", label: "Actual Cost", accessor: (r) => formatCurrency(r.actual_cost), sortable: true },
  {
    key: "status",
    label: "Outcome",
    accessor: "status",
    sortable: true,
    render: (v) => (
      <Badge variant={getStatusBadgeVariant(v as AdvanceStatus)} className="gap-1">
        {getStatusIcon(v as AdvanceStatus)}
        {String(v).replace("_", " ")}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: "status",
    label: "Outcome",
    options: [
      { value: "approved", label: "Approved" },
      { value: "fulfilled", label: "Fulfilled" },
      { value: "rejected", label: "Rejected" },
      { value: "cancelled", label: "Cancelled" },
    ],
  },
];

export default function AdvancingHistoryPage() {
  const router = useRouter();
  const { data: requestsData, isLoading, error, refetch } = useAdvancingRequests({ limit: 100 });
  
  // Filter to only show completed requests (approved, fulfilled, rejected, cancelled)
  const completedStatuses: AdvanceStatus[] = ["approved", "fulfilled", "rejected", "cancelled"];
  const historicalRequests = ((requestsData?.data || []) as ProductionAdvance[]).filter(
    (r) => completedStatuses.includes(r.status)
  );

  const [selectedRequest, setSelectedRequest] = useState<ProductionAdvance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const approvedCount = historicalRequests.filter((r) => r.status === "approved" || r.status === "fulfilled").length;
  const rejectedCount = historicalRequests.filter((r) => r.status === "rejected").length;
  const cancelledCount = historicalRequests.filter((r) => r.status === "cancelled").length;
  const totalValue = historicalRequests.reduce((sum, r) => sum + (r.actual_cost || r.approved_cost || 0), 0);

  const rowActions: ListPageAction<ProductionAdvance>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="size-4" />,
      onClick: (r) => {
        setSelectedRequest(r);
        setDrawerOpen(true);
      },
    },
    {
      id: "resubmit",
      label: "Clone & Resubmit",
      icon: <History className="size-4" />,
      onClick: (r) => router.push(`/advancing/new?clone=${r.id}`),
    },
  ];

  const stats = [
    { label: "Total Requests", value: historicalRequests.length },
    { label: "Approved", value: approvedCount },
    { label: "Rejected", value: rejectedCount },
    { label: "Cancelled", value: cancelledCount },
    { label: "Total Value", value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedRequest
    ? [
        {
          id: "overview",
          title: "Request Details",
          content: (
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Body size="sm"><strong>Request:</strong> {selectedRequest.team_workspace || selectedRequest.activation_name || "Untitled"}</Body>
              <Body size="sm"><strong>Status:</strong> {selectedRequest.status.replace("_", " ")}</Body>
              <Body size="sm"><strong>Project:</strong> {selectedRequest.project?.name || "—"}</Body>
              <Body size="sm"><strong>Submitter:</strong> {selectedRequest.submitter?.full_name || "Unknown"}</Body>
              <Body size="sm"><strong>Submitted:</strong> {formatDate(selectedRequest.submitted_at)}</Body>
              <Body size="sm"><strong>Reviewed:</strong> {formatDate(selectedRequest.reviewed_at)}</Body>
              <Body size="sm"><strong>Estimated Cost:</strong> {formatCurrency(selectedRequest.estimated_cost)}</Body>
              <Body size="sm"><strong>Actual Cost:</strong> {formatCurrency(selectedRequest.actual_cost)}</Body>
              {selectedRequest.reviewer_notes && (
                <Body size="sm" className="col-span-2"><strong>Reviewer Notes:</strong> {selectedRequest.reviewer_notes}</Body>
              )}
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <>
      <ListPage<ProductionAdvance>
        title="Advancing History"
        subtitle="View historical advancing requests and outcomes"
        data={historicalRequests}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search historical requests..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => {
          setSelectedRequest(r);
          setDrawerOpen(true);
        }}
        entityType="advancing-history"
        onExport={createExportHandler({
          filename: "advancing-history",
          getData: () =>
            historicalRequests.map((r) => ({
              request_name: r.team_workspace || r.activation_name || "",
              project: r.project?.name || "",
              submitter: r.submitter?.full_name || "",
              submitted_at: r.submitted_at || "",
              reviewed_at: r.reviewed_at || "",
              status: r.status,
              estimated_cost: r.estimated_cost || "",
              actual_cost: r.actual_cost || "",
              reviewer_notes: r.reviewer_notes || "",
            })),
        })}
        stats={stats}
        emptyMessage="No historical requests found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRequest}
        title={(r) => r.team_workspace || r.activation_name || "Advance Request"}
        subtitle={(r) => r.project?.name || ""}
        sections={detailSections}
        actions={[
          { id: "clone", label: "Clone & Resubmit", icon: <History className="size-4" /> },
        ]}
        onAction={(id, r) => {
          if (id === "clone") router.push(`/advancing/new?clone=${r.id}`);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
