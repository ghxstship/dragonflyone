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
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  project_id?: string;
  project_name?: string;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  issue_date: string;
  due_date: string;
  status: string;
  notes?: string;
}

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const columns: ListPageColumn<Invoice>[] = [
  { key: 'invoice_number', label: 'Invoice #', accessor: 'invoice_number', sortable: true },
  { key: 'client_name', label: 'Client', accessor: 'client_name', sortable: true },
  { key: 'project_name', label: 'Project', accessor: (row) => row.project_name || '—' },
  { 
    key: 'total_amount', 
    label: 'Amount', 
    accessor: 'total_amount', 
    sortable: true,
    render: (value) => formatCurrency(Number(value))
  },
  { 
    key: 'due_date', 
    label: 'Due Date', 
    accessor: 'due_date', 
    sortable: true,
    render: (value) => formatDate(String(value))
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'paid' ? 'solid' : value === 'overdue' ? 'solid' : 'outline'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'viewed', label: 'Viewed' },
      { value: 'partial', label: 'Partial' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'client_id', label: 'Client', type: 'select', required: true, options: [], colSpan: 2 },
  { name: 'project_id', label: 'Project', type: 'select', options: [] },
  { name: 'payment_terms', label: 'Payment Terms', type: 'select', options: [
    { value: 'net_15', label: 'Net 15' },
    { value: 'net_30', label: 'Net 30' },
    { value: 'net_45', label: 'Net 45' },
    { value: 'net_60', label: 'Net 60' },
    { value: 'due_on_receipt', label: 'Due on Receipt' },
  ]},
  { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
  { name: 'due_date', label: 'Due Date', type: 'date', required: true },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function InvoicesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.invoices || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send`, { method: "POST" });
      if (response.ok) {
        addNotification({ type: "success", title: "Success", message: "Invoice sent successfully" });
        fetchInvoices();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to send invoice" });
    }
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await fetch(`/api/invoices/${invoiceToDelete.id}`, { method: "DELETE" });
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
      fetchInvoices();
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to delete invoice" });
    }
  };

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View', icon: '👁️', onClick: (row) => { setSelectedInvoice(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/invoices/${row.id}/edit`) },
    { id: 'send', label: 'Send', icon: '📧', onClick: handleSendInvoice },
    { id: 'payment', label: 'Record Payment', icon: '💰', onClick: (row) => router.push(`/invoices/${row.id}/payment`) },
    { id: 'duplicate', label: 'Duplicate', icon: '📋', onClick: (row) => router.push(`/invoices/new?from=${row.id}`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setInvoiceToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'send', label: 'Send', icon: '📧' },
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'remind', label: 'Send Reminders', icon: '🔔' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setCreateModalOpen(false);
      fetchInvoices();
      addNotification({ type: "success", title: "Success", message: "Invoice created" });
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
    if (actionId === 'remind') {
      addNotification({ type: 'info', title: 'Sending', message: 'Payment reminders being sent' });
    }
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.amount_due, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  const stats = [
    { label: 'Total Invoices', value: invoices.length },
    { label: 'Total Invoiced', value: formatCurrency(totalInvoiced) },
    { label: 'Outstanding', value: formatCurrency(totalOutstanding) },
    { label: 'Overdue', value: overdueCount },
  ];

  const detailSections: DetailSection[] = selectedInvoice ? [
    {
      id: 'overview',
      title: 'Invoice Details',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div><strong>Invoice #:</strong> {selectedInvoice.invoice_number}</div>
          <div><strong>Client:</strong> {selectedInvoice.client_name}</div>
          <div><strong>Project:</strong> {selectedInvoice.project_name || '—'}</div>
          <div><strong>Status:</strong> {selectedInvoice.status}</div>
          <div><strong>Total:</strong> {formatCurrency(selectedInvoice.total_amount)}</div>
          <div><strong>Paid:</strong> {formatCurrency(selectedInvoice.amount_paid)}</div>
          <div><strong>Due:</strong> {formatCurrency(selectedInvoice.amount_due)}</div>
          <div><strong>Due Date:</strong> {formatDate(selectedInvoice.due_date)}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Invoice>
        title="Invoice Management"
        subtitle="Create, send, and track invoices for all client projects"
        data={invoices}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error}
        onRetry={fetchInvoices}
        searchPlaceholder="Search invoices..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedInvoice(row); setDrawerOpen(true); }}
        createLabel="Create Invoice"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push('/invoices/export')}
        stats={stats}
        emptyMessage="No invoices found"
        emptyAction={{ label: 'Create Invoice', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Invoice"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedInvoice}
        title={(inv) => `Invoice ${inv.invoice_number}`}
        subtitle={(inv) => inv.client_name}
        sections={detailSections}
        onEdit={(inv) => router.push(`/invoices/${inv.id}/edit`)}
        onDelete={(inv) => { setInvoiceToDelete(inv); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'send', label: 'Send', icon: '📧' },
          { id: 'payment', label: 'Payment', icon: '💰' },
        ]}
        onAction={(actionId, inv) => {
          if (actionId === 'send') handleSendInvoice(inv);
          if (actionId === 'payment') router.push(`/invoices/${inv.id}/payment`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice "${invoiceToDelete?.invoice_number}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setInvoiceToDelete(null); }}
      />
    </>
  );
}
