"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Mail, Trash2 } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
  } from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useInvoicesData } from "@/hooks/useInvoices";

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

// Summary calculated from invoice data
interface InvoiceSummary {
  total: number;
  by_status: Record<string, number>;
  total_invoiced: number;
  total_paid: number;
  total_outstanding: number;
  overdue_amount: number;
}

// Calculate summary from invoices
function calculateSummary(invoices: Invoice[]): InvoiceSummary {
  const byStatus: Record<string, number> = {};
  let totalPaid = 0;
  let totalOutstanding = 0;

  invoices.forEach(inv => {
    byStatus[inv.status] = (byStatus[inv.status] || 0) + 1;
    totalPaid += inv.amount_paid || 0;
    totalOutstanding += inv.amount_due || 0;
  });

  return {
    total: invoices.length,
    by_status: byStatus,
    total_invoiced: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    total_paid: totalPaid,
    total_outstanding: totalOutstanding,
    overdue_amount: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + (inv.amount_due || 0), 0),
  };
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
  const {
    invoices: invoiceData,
    isLoading: loading,
    error,
    createInvoice,
    sendInvoice,
    deleteInvoice,
    refetch,
  } = useInvoicesData();

  // Cast to local Invoice type for compatibility
  const invoices = invoiceData as unknown as Invoice[];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedInvoice(r); setDrawerOpen(true); } },
    { id: 'send', label: 'Send', icon: <Mail className="size-4" />, onClick: async (r) => {
      try {
        await sendInvoice(r.id);
        addNotification({ type: 'success', title: 'Success', message: 'Invoice sent' });
      } catch { addNotification({ type: 'error', title: 'Error', message: 'Failed to send' }); }
    }},
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setInvoiceToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createInvoice(data);
      addNotification({ type: 'success', title: 'Success', message: 'Invoice created' });
      setCreateModalOpen(false);
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create invoice' });
    }
  };

  const handleDelete = async () => {
    if (invoiceToDelete) {
      try {
        await deleteInvoice(invoiceToDelete.id);
        setDeleteConfirmOpen(false);
        setInvoiceToDelete(null);
      } catch {
        addNotification({ type: 'error', title: 'Error', message: 'Failed to delete invoice' });
      }
    }
  };

  const summary = calculateSummary(invoices);

  const stats = [
    { label: 'Total Invoices', value: summary.total },
    { label: 'Outstanding', value: formatCurrency(summary.total_outstanding) },
    { label: 'Overdue', value: summary.by_status.overdue || 0 },
    { label: 'Total Paid', value: formatCurrency(summary.total_paid) },
  ];

  const detailSections: DetailSection[] = selectedInvoice ? [
    { id: 'overview', title: 'Invoice Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Invoice #:</strong> {selectedInvoice.invoice_number}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedInvoice.status}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedInvoice.client?.name || '—'}</Body>
        <Body size="sm"><strong>Project:</strong> {selectedInvoice.project?.name || '—'}</Body>
        <Body size="sm"><strong>Amount:</strong> {formatCurrency(selectedInvoice.total_amount)}</Body>
        <Body size="sm"><strong>Paid:</strong> {formatCurrency(selectedInvoice.amount_paid)}</Body>
        <Body size="sm"><strong>Due:</strong> {formatCurrency(selectedInvoice.amount_due)}</Body>
        <Body size="sm"><strong>Due Date:</strong> {selectedInvoice.due_date}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Invoice, 'id'>>({

    entityType: 'invoices',

    requiredFields: ['client_id', 'project_id', 'total_amount'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/invoices', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('invoices');


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
        onRetry={() => refetch()}
        searchPlaceholder="Search invoices..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedInvoice(r); setDrawerOpen(true); }}
        createLabel="Create Invoice"
        onCreate={() => setCreateModalOpen(true)}
        entityType="invoices"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['client_id', 'project_id', 'total_amount', 'issue_date', 'due_date', 'invoices', 'invoice_number']}
        onExport={createExportHandler({
          filename: "invoices",
          getData: () => invoices.map(inv => ({
            id: inv.id,
            invoice_number: inv.invoice_number,
            client: inv.client?.name || '',
            project: inv.project?.name || '',
            total_amount: inv.total_amount,
            amount_paid: inv.amount_paid,
            status: inv.status,
            due_date: inv.due_date,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No invoices found"
        emptyAction={{ label: 'Create Invoice', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/billing/invoices/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            fetchInvoices();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Create Invoice" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedInvoice} title={(i) => i.invoice_number} subtitle={(i) => i.client?.name || 'No client'} sections={detailSections} onEdit={(i) => router.push(`/billing/invoices/${i.id}/edit`)} onDelete={(i) => { setInvoiceToDelete(i); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Invoice" message={`Delete invoice "${invoiceToDelete?.invoice_number}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setInvoiceToDelete(null); }} />
    </>
  );
}
