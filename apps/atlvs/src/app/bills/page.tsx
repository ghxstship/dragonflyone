'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, DollarSign, CheckCircle, Trash2, Download } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useBillsData, type Bill } from '@/hooks/useBills';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  pending: 'warning',
  approved: 'info',
  partial: 'info',
  paid: 'success',
  cancelled: 'error',
};

const formatCurrency = (amount?: number) => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const columns: ListPageColumn<Bill>[] = [
  { key: 'bill_number', label: 'Bill #', accessor: 'bill_number', sortable: true },
  { key: 'vendor', label: 'Vendor', accessor: (r) => r.vendor?.name || '—', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'amount', label: 'Amount', accessor: 'amount', sortable: true, render: (v) => formatCurrency(Number(v)) },
  { key: 'amount_paid', label: 'Paid', accessor: 'amount_paid', render: (v) => formatCurrency(Number(v)) },
  { key: 'due_date', label: 'Due Date', accessor: 'due_date', sortable: true, render: (v) => formatDate(String(v)) },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (v) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge>
  },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [], colSpan: 2 },
  { name: 'description', label: 'Description', type: 'text', required: true, colSpan: 2 },
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'currency', label: 'Currency', type: 'select', options: [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
  ]},
  { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date', required: true },
  { name: 'category', label: 'Category', type: 'select', options: [
    { value: 'equipment', label: 'Equipment' },
    { value: 'labor', label: 'Labor' },
    { value: 'materials', label: 'Materials' },
    { value: 'services', label: 'Services' },
    { value: 'venue', label: 'Venue' },
    { value: 'catering', label: 'Catering' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'reference_number', label: 'Reference #', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function BillsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const {
    bills,
    summary,
    isLoading,
    error,
    createBill,
    approveBill,
    deleteBill,
    refetch,
  } = useBillsData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [billToApprove, setBillToApprove] = useState<Bill | null>(null);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createBill({
        vendor_id: String(data.vendor_id || ''),
        description: String(data.description || ''),
        amount: Number(data.amount || 0),
        currency: String(data.currency || 'USD'),
        issue_date: String(data.issue_date || ''),
        due_date: String(data.due_date || ''),
        category: data.category ? String(data.category) : undefined,
        reference_number: data.reference_number ? String(data.reference_number) : undefined,
        notes: data.notes ? String(data.notes) : undefined,
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Bill Created', message: 'New bill has been created successfully.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Failed to create bill' });
    }
  };

  const handleApprove = async () => {
    if (billToApprove) {
      try {
        await approveBill(billToApprove.id);
        setApproveConfirmOpen(false);
        setBillToApprove(null);
        addNotification({ type: 'success', title: 'Bill Approved', message: `Bill ${billToApprove.bill_number} has been approved.` });
      } catch (err) {
        addNotification({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Failed to approve bill' });
      }
    }
  };

  const handleDelete = async () => {
    if (billToDelete) {
      try {
        await deleteBill(billToDelete.id);
        setDeleteConfirmOpen(false);
        setBillToDelete(null);
        addNotification({ type: 'success', title: 'Bill Deleted', message: `Bill ${billToDelete.bill_number} has been deleted.` });
      } catch (err) {
        addNotification({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Failed to delete bill' });
      }
    }
  };

  const rowActions: ListPageAction<Bill>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedBill(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/bills/${row.id}/edit`) },
    { id: 'payment', label: 'Record Payment', icon: <DollarSign className="size-4" />, onClick: (row) => router.push(`/bills/${row.id}/payment`) },
    { id: 'approve', label: 'Approve', icon: <CheckCircle className="size-4" />, onClick: (row) => { setBillToApprove(row); setApproveConfirmOpen(true); } },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setBillToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'approve', label: 'Approve Selected', icon: <CheckCircle className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'approve') {
      for (const id of selectedIds) {
        await approveBill(id).catch(() => {});
      }
      refetch();
      addNotification({ type: 'success', title: 'Bills Approved', message: `${selectedIds.length} bills approved.` });
    } else if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteBill(id).catch(() => {});
      }
      refetch();
      addNotification({ type: 'success', title: 'Bills Deleted', message: `${selectedIds.length} bills deleted.` });
    }
  };

  const stats = [
    { label: 'Total Bills', value: summary?.total || 0 },
    { label: 'Total Billed', value: formatCurrency(summary?.total_billed) },
    { label: 'Outstanding', value: formatCurrency(summary?.total_outstanding) },
    { label: 'Overdue', value: formatCurrency(summary?.overdue_amount) },
  ];

  const detailSections: DetailSection[] = selectedBill ? [
    {
      id: 'overview',
      title: 'Bill Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Bill #:</strong> {selectedBill.bill_number}</Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedBill.status]}>{selectedBill.status.toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Vendor:</strong> {selectedBill.vendor?.name || '—'}</Body>
          <Body size="sm"><strong>Project:</strong> {selectedBill.project?.name || '—'}</Body>
          <Body size="sm"><strong>Amount:</strong> {formatCurrency(selectedBill.amount)}</Body>
          <Body size="sm"><strong>Paid:</strong> {formatCurrency(selectedBill.amount_paid)}</Body>
          <Body size="sm"><strong>Due:</strong> {formatCurrency(selectedBill.amount - selectedBill.amount_paid)}</Body>
          <Body size="sm"><strong>Due Date:</strong> {formatDate(selectedBill.due_date)}</Body>
          {selectedBill.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedBill.description}</Body>}
          {selectedBill.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedBill.notes}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Bill>
        title="Bill Management"
        subtitle="Track and manage vendor bills and payments"
        data={bills}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search bills..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedBill(row); setDrawerOpen(true); }}
        createLabel="Add Bill"
        onCreate={() => setCreateModalOpen(true)}
        onExport={createExportHandler({
          filename: 'bills',
          getData: () => bills.map(b => ({
            id: b.id,
            bill_number: b.bill_number,
            vendor: b.vendor?.name || '',
            description: b.description,
            amount: b.amount,
            amount_paid: b.amount_paid,
            due_date: b.due_date,
            status: b.status,
          })),
        })}
        stats={stats}
        emptyMessage="No bills found"
        emptyAction={{ label: 'Add First Bill', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Bill"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ currency: 'USD', issue_date: new Date().toISOString().split('T')[0] }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedBill}
        title={(b) => `Bill ${b.bill_number}`}
        subtitle={(b) => b.vendor?.name || 'Unknown Vendor'}
        sections={detailSections}
        onEdit={(b) => router.push(`/bills/${b.id}/edit`)}
        onDelete={(b) => { setBillToDelete(b); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'payment', label: 'Record Payment', icon: <DollarSign className="size-4" /> },
          { id: 'approve', label: 'Approve', icon: <CheckCircle className="size-4" /> },
        ]}
        onAction={(actionId, b) => {
          if (actionId === 'payment') router.push(`/bills/${b.id}/payment`);
          if (actionId === 'approve') { setBillToApprove(b); setApproveConfirmOpen(true); setDrawerOpen(false); }
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Bill"
        message={`Are you sure you want to delete bill "${billToDelete?.bill_number}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setBillToDelete(null); }}
      />

      <ConfirmDialog
        open={approveConfirmOpen}
        title="Approve Bill"
        message={`Approve bill "${billToApprove?.bill_number}" for ${formatCurrency(billToApprove?.amount)}?`}
        variant="info"
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => { setApproveConfirmOpen(false); setBillToApprove(null); }}
      />
    </AtlvsAppLayout>
  );
}
