'use client';

import { useState } from 'react';
import { Eye, Send, Download, Trash2 } from 'lucide-react';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import {
  useMyInvoices,
  type Invoice,
} from '../../../hooks/useMyInvoices';
// Layout provided by route group

export default function MyInvoicesPage() {
  const { data: invoices = [], isLoading, error, refetch } = useMyInvoices();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const columns: ListPageColumn<Invoice>[] = [
    { key: 'id', label: 'Invoice #', accessor: 'id', sortable: true },
    { key: 'production', label: 'Production', accessor: 'production', sortable: true },
    { 
      key: 'date', 
      label: 'Date', 
      accessor: 'date', 
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString()
    },
    { 
      key: 'dueDate', 
      label: 'Due Date', 
      accessor: 'dueDate', 
      sortable: true,
      render: (value) => new Date(String(value)).toLocaleDateString()
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      accessor: 'amount', 
      sortable: true,
      render: (value) => `$${Number(value).toLocaleString()}`
    },
    { 
      key: 'status', 
      label: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (value) => {
        const variant = value === 'paid' ? 'success' : value === 'approved' ? 'success' : value === 'submitted' ? 'warning' : value === 'overdue' ? 'error' : 'info';
        return <Badge variant={variant}>{String(value).toUpperCase()}</Badge>;
      }
    },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' },
      ]
    },
  ];

  const formFields: FormFieldConfig[] = [
    { name: 'production', label: 'Production', type: 'text', required: true },
    { name: 'date', label: 'Invoice Date', type: 'date', required: true },
    { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
    { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedInvoice(row); setDrawerOpen(true); } },
    { id: 'download', label: 'Download', icon: <Download className="size-4" />, onClick: () => {} },
    { id: 'submit', label: 'Submit', icon: <Send className="size-4" />, onClick: () => {}, disabled: (row) => row.status !== 'draft' },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedInvoice(row); setDeleteConfirmOpen(true); }, disabled: (row) => row.status !== 'draft' },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'submit', label: 'Submit Selected', icon: <Send className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async () => {
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setSelectedInvoice(null);
    refetch();
  };

  const totalPending = invoices
    .filter(i => i.status === 'submitted' || i.status === 'approved')
    .reduce((acc, i) => acc + i.amount, 0);
  const totalPaid = invoices
    .filter(i => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const stats = [
    { label: 'Pending Payment', value: `$${totalPending.toLocaleString()}` },
    { label: 'Paid (YTD)', value: `$${totalPaid.toLocaleString()}` },
    { label: 'Overdue', value: overdueCount },
    { label: 'Total Invoices', value: invoices.length },
  ];

  const detailSections: DetailSection[] = selectedInvoice ? [
    {
      id: 'overview',
      title: 'Invoice Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Invoice #:</strong> {selectedInvoice.id}</Body>
          <Body size="sm"><strong>Production:</strong> {selectedInvoice.production}</Body>
          <Body size="sm"><strong>Date:</strong> {new Date(selectedInvoice.date).toLocaleDateString()}</Body>
          <Body size="sm"><strong>Due Date:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</Body>
          <Body size="sm"><strong>Amount:</strong> ${selectedInvoice.amount.toLocaleString()}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedInvoice.status.toUpperCase()}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Invoice>
        title="My Invoices"
        subtitle="Submit and track your invoices"
        data={invoices}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search invoices..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'export') {
            const selected = invoices.filter(i => selectedIds.includes(i.id));
            const csv = [
              ['Invoice #', 'Production', 'Date', 'Due Date', 'Amount', 'Status'].join(','),
              ...selected.map(i => [i.id, i.production, i.date, i.dueDate, i.amount, i.status].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'invoices-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(row) => { setSelectedInvoice(row); setDrawerOpen(true); }}
        createLabel="New Invoice"
        onCreate={() => setCreateModalOpen(true)}
        entityType="invoices"
        onExport={createExportHandler({
          filename: "invoices",
          getData: () => invoices.map(i => ({
            id: i.id,
            production: i.production,
            date: i.date,
            dueDate: i.dueDate,
            amount: i.amount,
            status: i.status,
          })),
        })}
        stats={stats}
        emptyMessage="No invoices found"
        emptyAction={{ label: 'Create Invoice', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="New Invoice"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedInvoice}
        title={(i) => `Invoice ${i.id}`}
        subtitle={(i) => i.production}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setSelectedInvoice(null); }}
      />
    </>
  );
}
