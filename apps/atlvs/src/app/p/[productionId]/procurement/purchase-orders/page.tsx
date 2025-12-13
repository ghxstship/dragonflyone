"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, Download } from "lucide-react";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { usePurchaseOrders, useDeletePurchaseOrder, useCreatePurchaseOrder } from "@/hooks/usePurchaseOrders";

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor?: { id: string; name: string };
  status: string;
  category: string;
  priority: string;
  total_amount: number;
  created_at: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'solid'> = {
  draft: 'solid',
  pending_approval: 'warning',
  approved: 'info',
  ordered: 'info',
  partially_received: 'warning',
  received: 'success',
  cancelled: 'error',
};

const columns: ListPageColumn<PurchaseOrder>[] = [
  { key: 'po_number', label: 'PO #', accessor: 'po_number', sortable: true },
  { key: 'vendor', label: 'Vendor', accessor: (row) => row.vendor?.name || '—' },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'priority', label: 'Priority', accessor: 'priority' },
  { key: 'total_amount', label: 'Amount', accessor: 'total_amount', sortable: true, render: (v) => `$${Number(v || 0).toLocaleString()}` },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={statusColors[String(v)] || 'solid'}>{String(v).replace(/_/g, ' ').toUpperCase()}</Badge> },
  { key: 'created_at', label: 'Created', accessor: 'created_at', render: (v) => new Date(String(v)).toLocaleDateString() },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { key: 'category', label: 'Category', options: [
    { value: 'equipment', label: 'Equipment' },
    { value: 'staging', label: 'Staging' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'audio', label: 'Audio' },
    { value: 'catering', label: 'Catering' },
    { value: 'other', label: 'Other' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [] },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'equipment', label: 'Equipment' },
    { value: 'staging', label: 'Staging' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'audio', label: 'Audio' },
    { value: 'catering', label: 'Catering' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'priority', label: 'Priority', type: 'select', options: [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]},
  { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function ProcurementPurchaseOrdersPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const { addNotification } = useNotifications();
  
  const { data: purchaseOrders, isLoading, error, refetch } = usePurchaseOrders({ projectId: productionId });
  const deleteMutation = useDeletePurchaseOrder();
  const createMutation = useCreatePurchaseOrder();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [poToDelete, setPOToDelete] = useState<PurchaseOrder | null>(null);

  const poList = (purchaseOrders || []) as unknown as PurchaseOrder[];

  const stats = [
    { label: 'Draft', value: poList.filter(po => po.status === 'draft').length },
    { label: 'Pending', value: poList.filter(po => po.status === 'pending_approval').length },
    { label: 'Approved', value: poList.filter(po => po.status === 'approved').length },
    { label: 'Received', value: poList.filter(po => po.status === 'received').length },
  ];

  const rowActions: ListPageAction<PurchaseOrder>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedPO(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/p/${productionId}/procurement/purchase-orders/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setPOToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({ ...data, project_id: productionId } as Parameters<typeof createMutation.mutateAsync>[0]);
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Success', message: 'Purchase order created' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create purchase order' });
    }
  };

  const handleDelete = async () => {
    if (poToDelete) {
      try {
        await deleteMutation.mutateAsync(poToDelete.id);
        setDeleteConfirmOpen(false);
        setPOToDelete(null);
      } catch {
        addNotification({ type: 'error', title: 'Error', message: 'Failed to delete purchase order' });
      }
    }
  };

  const detailSections: DetailSection[] = selectedPO ? [
    {
      id: 'overview',
      title: 'PO Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>PO #:</strong> {selectedPO.po_number}</Body>
          <Body size="sm"><strong>Vendor:</strong> {selectedPO.vendor?.name || '—'}</Body>
          <Body size="sm"><strong>Category:</strong> {selectedPO.category}</Body>
          <Body size="sm"><strong>Priority:</strong> {selectedPO.priority}</Body>
          <Body size="sm"><strong>Amount:</strong> ${selectedPO.total_amount?.toLocaleString()}</Body>
          <Stack gap={1}>
            <Body size="sm"><strong>Status:</strong></Body>
            <Badge variant={statusColors[selectedPO.status] || 'solid'}>{selectedPO.status.replace(/_/g, ' ').toUpperCase()}</Badge>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<PurchaseOrder>
        title="Purchase Orders"
        subtitle="Create and track purchase orders for this production"
        data={poList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search purchase orders..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/p/${productionId}/procurement/purchase-orders/${row.id}`)}
        createLabel="New PO"
        onCreate={() => setCreateModalOpen(true)}
        stats={stats}
        emptyMessage="No purchase orders yet"
        emptyAction={{ label: 'Create First PO', onClick: () => setCreateModalOpen(true) }}
        bulkActions={[
          { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
          { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            for (const id of ids) {
              await deleteMutation.mutateAsync(id);
            }
            refetch();
          }
        }}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Purchase Order"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedPO}
        title={(po) => po.po_number}
        subtitle={(po) => po.vendor?.name || 'No vendor'}
        sections={detailSections}
        onEdit={(po) => router.push(`/p/${productionId}/procurement/purchase-orders/${po.id}/edit`)}
        onDelete={(po) => { setPOToDelete(po); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Purchase Order"
        message={`Delete PO "${poToDelete?.po_number}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setPOToDelete(null); }}
      />
    </>
  );
}
