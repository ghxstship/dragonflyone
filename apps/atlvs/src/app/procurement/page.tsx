'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { usePurchaseOrders, useCreatePurchaseOrder, useDeletePurchaseOrder } from '@/hooks/useProcurement';

interface PurchaseOrder {
  id: string;
  vendor: string;
  vendor_id?: string;
  description: string;
  amount: number;
  status: string;
  requestedBy?: string;
  requested_by?: string;
  dueDate?: string;
  due_date?: string;
  category: string;
  notes?: string;
  created_at?: string;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const columns: ListPageColumn<PurchaseOrder>[] = [
  { key: 'id', label: 'PO Number', accessor: 'id', sortable: true },
  { key: 'vendor', label: 'Vendor', accessor: 'vendor', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'category', label: 'Category', accessor: 'category', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'amount', label: 'Amount', accessor: (r) => formatCurrency(r.amount), sortable: true },
  { key: 'dueDate', label: 'Due Date', accessor: (r) => r.dueDate || r.due_date ? new Date(r.dueDate || r.due_date || '').toLocaleDateString() : '—', sortable: true },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (v) => {
      const variant = v === 'active' ? 'solid' : v === 'completed' ? 'solid' : 'outline';
      return <Badge variant={variant}>{String(v).toUpperCase()}</Badge>;
    }
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ]
  },
  {
    key: 'category',
    label: 'Category',
    options: [
      { value: 'Equipment', label: 'Equipment' },
      { value: 'Staging', label: 'Staging' },
      { value: 'Lighting', label: 'Lighting' },
      { value: 'Audio', label: 'Audio' },
      { value: 'Video', label: 'Video' },
      { value: 'Services', label: 'Services' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'vendor', label: 'Vendor', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'text', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Staging', label: 'Staging' },
    { value: 'Lighting', label: 'Lighting' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Video', label: 'Video' },
    { value: 'Services', label: 'Services' },
  ]},
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ]},
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'PO-2024-001', vendor: 'ProAV Systems', description: 'LED Wall Panels - 100 units', amount: 125000, status: 'active', requestedBy: 'John Smith', dueDate: '2024-12-15', category: 'Equipment' },
  { id: 'PO-2024-002', vendor: 'Elite Staging Co', description: 'Stage Platforms and Risers', amount: 45000, status: 'pending', requestedBy: 'Sarah Johnson', dueDate: '2024-12-20', category: 'Staging' },
  { id: 'PO-2024-003', vendor: 'Lumina Lighting', description: 'Moving Head Fixtures - 50 units', amount: 89000, status: 'completed', requestedBy: 'Mike Peters', dueDate: '2024-11-30', category: 'Lighting' },
];

export default function ProcurementPage() {
  const router = useRouter();
  const { data: purchaseOrders, isLoading, error, refetch } = usePurchaseOrders();
  const createPOMutation = useCreatePurchaseOrder();
  const deletePOMutation = useDeletePurchaseOrder();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [poToDelete, setPOToDelete] = useState<PurchaseOrder | null>(null);

  const poList = (purchaseOrders || mockPurchaseOrders) as PurchaseOrder[];

  const rowActions: ListPageAction<PurchaseOrder>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedPO(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/procurement/${row.id}/edit`) },
    { id: 'approve', label: 'Approve', icon: '✅', onClick: (row) => router.push(`/procurement/${row.id}/approve`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setPOToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'approve', label: 'Bulk Approve', icon: '✅' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'export') {
      router.push('/procurement/export');
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    await createPOMutation.mutateAsync(data as Parameters<typeof createPOMutation.mutateAsync>[0]);
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (poToDelete) {
      await deletePOMutation.mutateAsync(poToDelete.id);
      setDeleteConfirmOpen(false);
      setPOToDelete(null);
      refetch();
    }
  };

  const totalSpend = poList.reduce((sum, po) => sum + po.amount, 0);
  const avgValue = poList.length > 0 ? totalSpend / poList.length : 0;

  const stats = [
    { label: 'Total POs', value: poList.length },
    { label: 'Active', value: poList.filter(po => po.status === 'active').length },
    { label: 'Total Spend', value: formatCurrency(totalSpend) },
    { label: 'Avg Value', value: formatCurrency(avgValue) },
  ];

  const detailSections: DetailSection[] = selectedPO ? [
    {
      id: 'overview',
      title: 'Purchase Order Details',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>PO Number:</strong> {selectedPO.id}</div>
          <div><strong>Vendor:</strong> {selectedPO.vendor}</div>
          <div><strong>Description:</strong> {selectedPO.description}</div>
          <div><strong>Category:</strong> {selectedPO.category}</div>
          <div><strong>Amount:</strong> {formatCurrency(selectedPO.amount)}</div>
          <div><strong>Status:</strong> {selectedPO.status.toUpperCase()}</div>
          <div><strong>Requested By:</strong> {selectedPO.requestedBy || selectedPO.requested_by || '—'}</div>
          <div><strong>Due Date:</strong> {selectedPO.dueDate || selectedPO.due_date ? new Date(selectedPO.dueDate || selectedPO.due_date || '').toLocaleDateString() : '—'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<PurchaseOrder>
        title="Procurement"
        subtitle="Purchase orders and vendor management"
        data={poList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search purchase orders..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedPO(row); setDrawerOpen(true); }}
        createLabel="New Purchase Order"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push('/procurement/export')}
        stats={stats}
        emptyMessage="No purchase orders found"
        emptyAction={{ label: 'Create Purchase Order', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Procurement' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="New Purchase Order"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedPO}
        title={(po) => po.id}
        subtitle={(po) => `${po.vendor} • ${po.category}`}
        sections={detailSections}
        onEdit={(po) => router.push(`/procurement/${po.id}/edit`)}
        onDelete={(po) => { setPOToDelete(po); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'approve', label: 'Approve', icon: '✅' },
        ]}
        onAction={(actionId, po) => {
          if (actionId === 'approve') router.push(`/procurement/${po.id}/approve`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete "${poToDelete?.id}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setPOToDelete(null); }}
      />
    </>
  );
}
