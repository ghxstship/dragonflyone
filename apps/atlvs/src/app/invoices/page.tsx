"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Mail, DollarSign, ClipboardList, Trash2, Download, Bell } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useInvoicesData, type Invoice } from "@/hooks/useInvoices";

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
  const {
    invoices,
    isLoading: loading,
    error,
    createInvoice,
    sendInvoice,
    deleteInvoice,
    sendReminder,
    refetch,
  } = useInvoicesData();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await sendInvoice(invoice.id);
      addNotification({ type: "success", title: "Success", message: "Invoice sent successfully" });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to send invoice" });
    }
  };

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      await deleteInvoice(invoiceToDelete.id);
      setDeleteConfirmOpen(false);
      setInvoiceToDelete(null);
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to delete invoice" });
    }
  };

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedInvoice(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/invoices/${row.id}/edit`) },
    { id: 'send', label: 'Send', icon: <Mail className="size-4" />, onClick: handleSendInvoice },
    { id: 'payment', label: 'Record Payment', icon: <DollarSign className="size-4" />, onClick: (row) => router.push(`/invoices/${row.id}/payment`) },
    { id: 'duplicate', label: 'Duplicate', icon: <ClipboardList className="size-4" />, onClick: (row) => router.push(`/invoices/new?from=${row.id}`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setInvoiceToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'send', label: 'Send', icon: <Mail className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'remind', label: 'Send Reminders', icon: <Bell className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createInvoice(data);
      setCreateModalOpen(false);
      addNotification({ type: "success", title: "Success", message: "Invoice created" });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to create invoice" });
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'remind') {
      await Promise.all(selectedIds.map(id => sendReminder(id)));
      addNotification({ type: 'info', title: 'Sending', message: 'Payment reminders being sent' });
    } else if (actionId === 'export') {
      const selected = invoices.filter(inv => selectedIds.includes(inv.id));
      const csv = [
        ['ID', 'Number', 'Client', 'Amount', 'Due', 'Status', 'Date'].join(','),
        ...selected.map(inv => [inv.id, inv.invoice_number, inv.client_name, inv.total_amount, inv.amount_due, inv.status, inv.issue_date].join(','))
      ].join('\\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Invoice, 'id'>>({
    entityType: 'invoices',
    requiredFields: ['invoice_number', 'client_name', 'total_amount'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      await refetch();
      addNotification({ type: 'success', title: 'Import Complete', message: `${records.length} invoices imported` });
    },
  });

  const importTemplates = getImportTemplates('invoices').length > 0 
    ? getImportTemplates('invoices') 
    : [{ id: 'default', name: 'Invoice Import', mapping: { invoice_number: 'invoice_number', client_name: 'client_name', total_amount: 'total_amount', due_date: 'due_date', status: 'status' } }];

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
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Invoice #:</strong> {selectedInvoice.invoice_number}</Body>
          <Body size="sm"><strong>Client:</strong> {selectedInvoice.client_name}</Body>
          <Body size="sm"><strong>Project:</strong> {selectedInvoice.project_name || '—'}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedInvoice.status}</Body>
          <Body size="sm"><strong>Total:</strong> {formatCurrency(selectedInvoice.total_amount)}</Body>
          <Body size="sm"><strong>Paid:</strong> {formatCurrency(selectedInvoice.amount_paid)}</Body>
          <Body size="sm"><strong>Due:</strong> {formatCurrency(selectedInvoice.amount_due)}</Body>
          <Body size="sm"><strong>Due Date:</strong> {formatDate(selectedInvoice.due_date)}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Invoice>
        title="Invoice Management"
        subtitle="Create, send, and track invoices for all client projects"
        data={invoices}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        searchPlaceholder="Search invoices..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedInvoice(row); setDrawerOpen(true); }}
        createLabel="Create Invoice"
        onCreate={() => setCreateModalOpen(true)}
        entityType="invoices"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['invoice_number', 'client_name', 'total_amount', 'due_date', 'status']}
        onExport={createExportHandler({
          filename: "invoices",
          getData: () => (invoices || []).map(i => ({
            id: i.id,
            invoice_number: i.invoice_number,
            client_name: i.client_name,
            total_amount: i.total_amount,
            amount_paid: i.amount_paid,
            status: i.status,
            issue_date: i.issue_date,
            due_date: i.due_date,
          })),
        })}
        stats={stats}
        emptyMessage="No invoices found"
        emptyAction={{ label: 'Create Invoice', onClick: () => setCreateModalOpen(true) }}
showFavorite
        showSettings
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
          { id: 'send', label: 'Send', icon: <Mail className="size-4" /> },
          { id: 'payment', label: 'Payment', icon: <DollarSign className="size-4" /> },
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
    </AtlvsAppLayout>
  );
}
