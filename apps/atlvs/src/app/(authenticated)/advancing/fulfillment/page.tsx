"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Truck, CheckCircle, Clock, Package } from "lucide-react";
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
import { useAdvancingRequests, createExportHandler, useFulfillAdvance } from "@ghxstship/config";
import type { ProductionAdvance, FulfillmentStatus } from "@ghxstship/config/types/advancing";

interface FulfillmentItem {
  id: string;
  request_id: string;
  request_name: string;
  item_name: string;
  quantity_requested: number;
  quantity_fulfilled: number;
  fulfillment_status: FulfillmentStatus;
  assigned_to: string | null;
  project_name: string | null;
  due_date: string | null;
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

const getStatusBadgeVariant = (status: FulfillmentStatus): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "complete":
      return "solid";
    case "partial":
      return "outline";
    default:
      return "ghost";
  }
};

const getStatusIcon = (status: FulfillmentStatus) => {
  switch (status) {
    case "complete":
      return <CheckCircle className="size-3" />;
    case "partial":
      return <Clock className="size-3" />;
    default:
      return <Package className="size-3" />;
  }
};

const columns: ListPageColumn<FulfillmentItem>[] = [
  { key: "request_name", label: "Request", accessor: "request_name", sortable: true },
  { key: "item_name", label: "Item", accessor: "item_name", sortable: true },
  { key: "project_name", label: "Project", accessor: (r) => r.project_name || "—" },
  { key: "quantity_requested", label: "Requested", accessor: "quantity_requested", sortable: true },
  { key: "quantity_fulfilled", label: "Fulfilled", accessor: "quantity_fulfilled", sortable: true },
  { key: "assigned_to", label: "Assigned To", accessor: (r) => r.assigned_to || "Unassigned" },
  { key: "due_date", label: "Due Date", accessor: (r) => formatDate(r.due_date), sortable: true },
  {
    key: "fulfillment_status",
    label: "Status",
    accessor: "fulfillment_status",
    sortable: true,
    render: (v) => (
      <Badge variant={getStatusBadgeVariant(v as FulfillmentStatus)} className="gap-1">
        {getStatusIcon(v as FulfillmentStatus)}
        {String(v)}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: "fulfillment_status",
    label: "Status",
    options: [
      { value: "pending", label: "Pending" },
      { value: "partial", label: "Partial" },
      { value: "complete", label: "Complete" },
    ],
  },
];

export default function AdvancingFulfillmentPage() {
  const router = useRouter();
  const { data: requestsData, isLoading, error, refetch } = useAdvancingRequests({ 
    status: "approved",
    limit: 100 
  });
  const fulfillMutation = useFulfillAdvance();
  
  // Transform approved requests into fulfillment items
  const fulfillmentItems: FulfillmentItem[] = (requestsData?.data || []).flatMap((request: ProductionAdvance) =>
    (request.items || []).map((item, idx) => ({
      id: `${request.id}-${idx}`,
      request_id: request.id,
      request_name: request.team_workspace || request.activation_name || "Untitled Request",
      item_name: item.item_name || item.catalog_item?.item_name || "Unknown Item",
      quantity_requested: item.quantity || 1,
      quantity_fulfilled: item.quantity_fulfilled || 0,
      fulfillment_status: item.fulfillment_status,
      assigned_to: request.submitter?.full_name || null,
      project_name: request.project?.name || null,
      due_date: request.submitted_at,
      created_at: request.created_at,
    }))
  );

  const [selectedItem, setSelectedItem] = useState<FulfillmentItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingCount = fulfillmentItems.filter((f) => f.fulfillment_status === "pending").length;
  const partialCount = fulfillmentItems.filter((f) => f.fulfillment_status === "partial").length;
  const completeCount = fulfillmentItems.filter((f) => f.fulfillment_status === "complete").length;
  const fulfillmentRate = fulfillmentItems.length > 0 
    ? Math.round((completeCount / fulfillmentItems.length) * 100) 
    : 0;

  const rowActions: ListPageAction<FulfillmentItem>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="size-4" />,
      onClick: (r) => {
        setSelectedItem(r);
        setDrawerOpen(true);
      },
    },
    {
      id: "fulfill",
      label: "Fulfill",
      icon: <Truck className="size-4" />,
      onClick: (r) => router.push(`/advancing/requests/${r.request_id}`),
    },
  ];

  const stats = [
    { label: "Total Items", value: fulfillmentItems.length },
    { label: "Pending", value: pendingCount },
    { label: "Partial", value: partialCount },
    { label: "Complete", value: completeCount },
    { label: "Fulfillment Rate", value: `${fulfillmentRate}%` },
  ];

  const detailSections: DetailSection[] = selectedItem
    ? [
        {
          id: "overview",
          title: "Fulfillment Details",
          content: (
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Body size="sm"><strong>Request:</strong> {selectedItem.request_name}</Body>
              <Body size="sm"><strong>Item:</strong> {selectedItem.item_name}</Body>
              <Body size="sm"><strong>Project:</strong> {selectedItem.project_name || "—"}</Body>
              <Body size="sm"><strong>Status:</strong> {selectedItem.fulfillment_status}</Body>
              <Body size="sm"><strong>Requested:</strong> {selectedItem.quantity_requested}</Body>
              <Body size="sm"><strong>Fulfilled:</strong> {selectedItem.quantity_fulfilled}</Body>
              <Body size="sm"><strong>Assigned To:</strong> {selectedItem.assigned_to || "Unassigned"}</Body>
              <Body size="sm"><strong>Due Date:</strong> {formatDate(selectedItem.due_date)}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <>
      <ListPage<FulfillmentItem>
        title="Advancing Fulfillment"
        subtitle="Track and manage fulfillment of approved advancing requests"
        data={fulfillmentItems}
        columns={columns}
        rowKey="id"
        loading={isLoading || fulfillMutation.isPending}
        error={error}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search fulfillment items..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => {
          setSelectedItem(r);
          setDrawerOpen(true);
        }}
        entityType="fulfillment"
        onExport={createExportHandler({
          filename: "advancing-fulfillment",
          getData: () =>
            fulfillmentItems.map((f) => ({
              request_name: f.request_name,
              item_name: f.item_name,
              project_name: f.project_name || "",
              quantity_requested: f.quantity_requested,
              quantity_fulfilled: f.quantity_fulfilled,
              fulfillment_status: f.fulfillment_status,
              assigned_to: f.assigned_to || "",
              due_date: f.due_date || "",
            })),
        })}
        stats={stats}
        emptyMessage="No items pending fulfillment"
        onBulkAction={async (action, ids) => {
          if (action === "mark_complete") {
            for (const id of ids) {
              const [requestId] = id.split("-");
              await fulfillMutation.mutateAsync({
                id: requestId,
                payload: {
                  items: [{ item_id: id, quantity_fulfilled: 1 }],
                },
              });
            }
            refetch?.();
          }
        }}
        bulkActions={[
          { id: "mark_complete", label: "Mark Complete", variant: "default" },
        ]}
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedItem}
        title={(r) => r.item_name}
        subtitle={(r) => r.request_name}
        sections={detailSections}
        actions={[
          { id: "fulfill", label: "Process Fulfillment", icon: <Truck className="size-4" /> },
        ]}
        onAction={(id, r) => {
          if (id === "fulfill") router.push(`/advancing/requests/${r.request_id}`);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
