'use client';

/**
 * Bills Page
 * 
 * SSOT-compliant: Uses entity registry for status colors and formatters.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, DollarSign, CheckCircle, Trash2, Download } from 'lucide-react';
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body, useToast,
  type ListPageAction, type ListPageBulkAction, type DetailSection,
} from "@ghxstship/ui";
import { 
  createExportHandler,
  FINANCIAL_STATUS_COLORS,
  formatCurrency,
  formatDate,
  useEntityConfig,
} from '@ghxstship/config';
import { useBillsData, type Bill } from '@/hooks/useBills';

const statusColors = FINANCIAL_STATUS_COLORS;

// SSOT: Columns, filters, and formFields are provided by useEntityConfig

export default function BillsPage() {
  const router = useRouter();
  const toast = useToast();

  // SSOT: Get columns, filters, and formFields from entity registry
  const { columns, filters, formFields } = useEntityConfig<Bill>({ entityName: 'bills' });

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
      toast.success('Bill Created', 'New bill has been created successfully.');
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'Failed to create bill');
    }
  };

  const handleApprove = async () => {
    if (billToApprove) {
      try {
        await approveBill(billToApprove.id);
        setApproveConfirmOpen(false);
        setBillToApprove(null);
        toast.success("Bill Approved", `Bill ${billToApprove.bill_number} has been approved.`);
      } catch (err) {
        toast.error('Error', err instanceof Error ? err.message : 'Failed to approve bill');
      }
    }
  };

  const handleDelete = async () => {
    if (billToDelete) {
      try {
        await deleteBill(billToDelete.id);
        setDeleteConfirmOpen(false);
        setBillToDelete(null);
        toast.success("Bill Deleted", `Bill ${billToDelete.bill_number} has been deleted.`);
      } catch (err) {
        toast.error('Error', err instanceof Error ? err.message : 'Failed to delete bill');
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
        await approveBill(id).catch((err) => toast.error("Approval Failed", err instanceof Error ? err.message : 'Failed to approve bill'));
      }
      refetch();
      toast.success("Bills Approved", `${selectedIds.length} bills approved.`);
    } else if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteBill(id).catch((err) => toast.error("Delete Failed", err instanceof Error ? err.message : 'Failed to delete bill'));
      }
      refetch();
      toast.success("Bills Deleted", `${selectedIds.length} bills deleted.`);
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
    <>
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
    </>
  );
}
