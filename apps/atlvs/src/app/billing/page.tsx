"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Invoice {
  id: string;
  invoice_number: string;
  client?: { id: string; name: string; email: string };
  project?: { id: string; name: string; project_code: string };
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  issue_date: string;
  due_date: string;
  status: string;
}

interface InvoiceSummary {
  total: number;
  by_status: Record<string, number>;
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  overdue_amount: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const columns: ListPageColumn<Invoice>[] = [
  { key: 'invoice_number', label: 'Invoice', accessor: 'invoice_number', sortable: true },
  { key: 'client', label: 'Client', accessor: (r) => r.client?.name || '—' },
  { key: 'project', label: 'Project', accessor: (r) => r.project?.name || '—' },
  { key: 'total_amount', label: 'Amount', accessor: (r) => formatCurrency(r.total_amount || 0), sortable: true },
  { key: 'issue_date', label: 'Issued', accessor: (r) => r.issue_date ? new Date(r.issue_date).toLocaleDateString() : '—', sortable: true },
  { key: 'due_date', label: 'Due Date', accessor: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString() : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => {
    const variant = v === 'paid' ? 'solid' : v === 'overdue' ? 'solid' : 'outline';
    return <Badge variant={variant}>{String(v)}</Badge>;
  }},
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'client_id', label: 'Client', type: 'select', required: true, options: [] },
  { name: 'project_id', label: 'Project', type: 'select', options: [] },
  { name: 'total_amount', label: 'Amount', type: 'number', required: true },
  { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date', required: true },
];

export default function BillingPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data.invoices || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View', icon: '👁️', onClick: (r) => { setSelectedInvoice(r); setDrawerOpen(true); } },
    { id: 'send', label: 'Send', icon: '📧', onClick: async (r) => {
      try {
        const res = await fetch(`/api/invoices/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send' }) });
        if (res.ok) { addNotification({ type: 'success', title: 'Success', message: 'Invoice sent' }); fetchInvoices(); }
      } catch { addNotification({ type: 'error', title: 'Error', message: 'Failed to send' }); }
    }},
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setInvoiceToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create invoice:', data);
    setCreateModalOpen(false);
    fetchInvoices();
  };

  const handleDelete = async () => {
    if (invoiceToDelete) {
      setInvoices(prev => prev.filter(i => i.id !== invoiceToDelete.id));
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Invoices', value: summary?.total || invoices.length },
    { label: 'Outstanding', value: formatCurrency(summary?.total_outstanding || 0) },
    { label: 'Overdue', value: summary?.by_status?.overdue || 0 },
    { label: 'Total Paid', value: formatCurrency(summary?.total_paid || 0) },
  ];

  const detailSections: DetailSection[] = selectedInvoice ? [
    { id: 'overview', title: 'Invoice Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Invoice #:</strong> {selectedInvoice.invoice_number}</div>
        <div><strong>Status:</strong> {selectedInvoice.status}</div>
        <div><strong>Client:</strong> {selectedInvoice.client?.name || '—'}</div>
        <div><strong>Project:</strong> {selectedInvoice.project?.name || '—'}</div>
        <div><strong>Amount:</strong> {formatCurrency(selectedInvoice.total_amount)}</div>
        <div><strong>Paid:</strong> {formatCurrency(selectedInvoice.amount_paid)}</div>
        <div><strong>Due:</strong> {formatCurrency(selectedInvoice.amount_due)}</div>
        <div><strong>Due Date:</strong> {selectedInvoice.due_date}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Invoice>
        title="Client Billing"
        subtitle="Manage invoices and track payments"
        data={invoices}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error}
        onRetry={fetchInvoices}
        searchPlaceholder="Search invoices..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedInvoice(r); setDrawerOpen(true); }}
        createLabel="Create Invoice"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No invoices found"
        emptyAction={{ label: 'Create Invoice', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Create Invoice" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedInvoice} title={(i) => i.invoice_number} subtitle={(i) => i.client?.name || 'No client'} sections={detailSections} onEdit={(i) => router.push(`/billing/invoices/${i.id}/edit`)} onDelete={(i) => { setInvoiceToDelete(i); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Invoice" message={`Delete invoice "${invoiceToDelete?.invoice_number}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setInvoiceToDelete(null); }} />
    </>
  );
}
