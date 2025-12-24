"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Package, CheckCircle, Clock, AlertTriangle } from "lucide-react";
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
import type { ProductionAdvance } from "@ghxstship/config/types/advancing";

interface AllocationItem {
  id: string;
  request_id: string;
  request_name: string;
  item_name: string;
  category: string;
  quantity_requested: number;
  quantity_allocated: number;
  status: "pending" | "partial" | "fulfilled" | "unavailable";
  assigned_to: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusBadgeVariant = (status: AllocationItem["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "fulfilled":
      return "solid";
    case "partial":
      return "outline";
    case "unavailable":
      return "ghost";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: AllocationItem["status"]) => {
  switch (status) {
    case "fulfilled":
      return <CheckCircle className="size-3" />;
    case "partial":
      return <Clock className="size-3" />;
    case "unavailable":
      return <AlertTriangle className="size-3" />;
    default:
      return <Package className="size-3" />;
  }
};

const columns: ListPageColumn<AllocationItem>[] = [
  { key: "request_name", label: "Request", accessor: "request_name", sortable: true },
  { key: "item_name", label: "Item", accessor: "item_name", sortable: true },
  { key: "category", label: "Category", accessor: "category", sortable: true },
  { key: "quantity_requested", label: "Requested", accessor: "quantity_requested", sortable: true },
  { key: "quantity_allocated", label: "Allocated", accessor: "quantity_allocated", sortable: true },
  { key: "assigned_to", label: "Assigned To", accessor: (r) => r.assigned_to || "Unassigned" },
  { key: "due_date", label: "Due Date", accessor: (r) => formatDate(r.due_date), sortable: true },
  {
    key: "status",
    label: "Status",
    accessor: "status",
    sortable: true,
    render: (v) => (
      <Badge variant={getStatusBadgeVariant(v as AllocationItem["status"])} className="gap-1">
        {getStatusIcon(v as AllocationItem["status"])}
        {String(v).replace("_", " ")}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: "status",
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "partial", label: "Partial" },
      { value: "fulfilled", label: "Fulfilled" },
      { value: "unavailable", label: "Unavailable" },
    ],
  },
  {
    key: "category",
    label: "Category",
    options: [
      { value: "equipment", label: "Equipment" },
      { value: "personnel", label: "Personnel" },
      { value: "materials", label: "Materials" },
      { value: "services", label: "Services" },
    ],
  },
];

export default function AdvancingAllocationsPage() {
  const router = useRouter();
  const { data: requestsData, isLoading, error, refetch } = useAdvancingRequests({ limit: 100 });
  
  // Transform advancing requests into allocation items
  const allocations: AllocationItem[] = (requestsData?.data || []).flatMap((request: ProductionAdvance) =>
    (request.items || []).map((item, idx) => ({
      id: `${request.id}-${idx}`,
      request_id: request.id,
      request_name: request.team_workspace || request.activation_name || "Untitled Request",
      item_name: item.item_name || item.catalog_item?.item_name || "Unknown Item",
      category: item.catalog_item?.category || "uncategorized",
      quantity_requested: item.quantity || 1,
      quantity_allocated: item.quantity_fulfilled || 0,
      status: item.quantity_fulfilled === item.quantity ? "fulfilled" : 
              item.quantity_fulfilled > 0 ? "partial" : 
              request.status === "rejected" ? "unavailable" : "pending",
      assigned_to: request.submitter?.full_name || null,
      due_date: request.submitted_at,
      notes: item.notes || null,
      created_at: request.created_at,
    }))
  );

  const [selectedAllocation, setSelectedAllocation] = useState<AllocationItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingCount = allocations.filter((a) => a.status === "pending").length;
  const partialCount = allocations.filter((a) => a.status === "partial").length;
  const fulfilledCount = allocations.filter((a) => a.status === "fulfilled").length;
  const totalRequested = allocations.reduce((sum, a) => sum + a.quantity_requested, 0);
  const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity_allocated, 0);

  const rowActions: ListPageAction<AllocationItem>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="size-4" />,
      onClick: (r) => {
        setSelectedAllocation(r);
        setDrawerOpen(true);
      },
    },
    {
      id: "allocate",
      label: "Allocate",
      icon: <Package className="size-4" />,
      onClick: (r) => router.push(`/advancing/requests/${r.request_id}`),
    },
  ];

  const stats = [
    { label: "Total Items", value: allocations.length },
    { label: "Pending", value: pendingCount },
    { label: "Partial", value: partialCount },
    { label: "Fulfilled", value: fulfilledCount },
    { label: "Allocation Rate", value: totalRequested > 0 ? `${Math.round((totalAllocated / totalRequested) * 100)}%` : "0%" },
  ];

  const detailSections: DetailSection[] = selectedAllocation
    ? [
        {
          id: "overview",
          title: "Allocation Details",
          content: (
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Body size="sm"><strong>Request:</strong> {selectedAllocation.request_name}</Body>
              <Body size="sm"><strong>Item:</strong> {selectedAllocation.item_name}</Body>
              <Body size="sm"><strong>Category:</strong> {selectedAllocation.category}</Body>
              <Body size="sm"><strong>Status:</strong> {selectedAllocation.status}</Body>
              <Body size="sm"><strong>Requested:</strong> {selectedAllocation.quantity_requested}</Body>
              <Body size="sm"><strong>Allocated:</strong> {selectedAllocation.quantity_allocated}</Body>
              <Body size="sm"><strong>Assigned To:</strong> {selectedAllocation.assigned_to || "Unassigned"}</Body>
              <Body size="sm"><strong>Due Date:</strong> {formatDate(selectedAllocation.due_date)}</Body>
              {selectedAllocation.notes && (
                <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedAllocation.notes}</Body>
              )}
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <>
      <ListPage<AllocationItem>
        title="Advancing Allocations"
        subtitle="Manage resource allocations for advancing requests"
        data={allocations}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search allocations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => {
          setSelectedAllocation(r);
          setDrawerOpen(true);
        }}
        entityType="allocations"
        onExport={createExportHandler({
          filename: "advancing-allocations",
          getData: () =>
            allocations.map((a) => ({
              request_name: a.request_name,
              item_name: a.item_name,
              category: a.category,
              quantity_requested: a.quantity_requested,
              quantity_allocated: a.quantity_allocated,
              status: a.status,
              assigned_to: a.assigned_to || "",
              due_date: a.due_date || "",
            })),
        })}
        stats={stats}
        emptyMessage="No allocations found"
        onBulkAction={async (action, ids) => {
          if (action === "fulfill") {
            await fetch("/api/advancing/bulk-fulfill", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids }),
            });
            refetch?.();
          }
        }}
        bulkActions={[
          { id: "fulfill", label: "Mark Fulfilled", variant: "default" },
        ]}
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedAllocation}
        title={(r) => r.item_name}
        subtitle={(r) => r.request_name}
        sections={detailSections}
        actions={[
          { id: "allocate", label: "Allocate Resources", icon: <Package className="size-4" /> },
        ]}
        onAction={(id, r) => {
          if (id === "allocate") router.push(`/advancing/requests/${r.request_id}`);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
