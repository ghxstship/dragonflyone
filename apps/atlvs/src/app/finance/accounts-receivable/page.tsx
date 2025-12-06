"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, DollarSign, Mail } from "lucide-react";
import { AtlvsAppLayout } from "../../../components/app-layout";
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
import { getBadgeVariant, createExportHandler } from "@ghxstship/config";

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: "Draft" | "Sent" | "Viewed" | "Paid" | "Overdue" | "Partial";
  paidAmount: number;
  project?: string;
  daysPastDue?: number;
  [key: string]: unknown;
}

const mockInvoices: Invoice[] = [
  { id: "INV-001", invoiceNumber: "INV-2024-0156", client: "TechCorp Events", clientEmail: "ap@techcorp.com", amount: 45000, dueDate: "2024-11-15", issueDate: "2024-10-15", status: "Overdue", paidAmount: 0, project: "Annual Conference", daysPastDue: 9 },
  { id: "INV-002", invoiceNumber: "INV-2024-0157", client: "Festival Productions", clientEmail: "billing@festprod.com", amount: 125000, dueDate: "2024-11-30", issueDate: "2024-11-01", status: "Partial", paidAmount: 62500, project: "Summer Fest 2024" },
  { id: "INV-003", invoiceNumber: "INV-2024-0158", client: "Corporate Events Inc", clientEmail: "accounts@corpevents.com", amount: 28500, dueDate: "2024-12-01", issueDate: "2024-11-01", status: "Sent", paidAmount: 0, project: "Holiday Gala" },
  { id: "INV-004", invoiceNumber: "INV-2024-0159", client: "StartUp Ventures", clientEmail: "finance@startup.io", amount: 15000, dueDate: "2024-10-30", issueDate: "2024-10-01", status: "Overdue", paidAmount: 0, project: "Product Launch", daysPastDue: 25 },
  { id: "INV-005", invoiceNumber: "INV-2024-0160", client: "Media Group LLC", clientEmail: "ap@mediagroup.com", amount: 67500, dueDate: "2024-11-20", issueDate: "2024-10-20", status: "Paid", paidAmount: 67500, project: "Awards Show" },
];

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Invoice>[] = [
  { key: 'invoiceNumber', label: 'Invoice', accessor: 'invoiceNumber', sortable: true },
  { key: 'client', label: 'Client', accessor: 'client', sortable: true },
  { key: 'project', label: 'Project', accessor: (r) => r.project || '—' },
  { key: 'amount', label: 'Amount', accessor: (r) => `$${r.amount.toLocaleString()}`, sortable: true },
  { key: 'dueDate', label: 'Due Date', accessor: 'dueDate', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'balance', label: 'Balance', accessor: (r) => `$${(r.amount - r.paidAmount).toLocaleString()}` },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Sent', label: 'Sent' }, { value: 'Overdue', label: 'Overdue' }, { value: 'Partial', label: 'Partial' }, { value: 'Paid', label: 'Paid' }] },
];

export default function AccountsReceivablePage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalOutstanding = invoices.filter(i => i.status !== "Paid").reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
  const overdueAmount = invoices.filter(i => i.status === "Overdue").reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
  const overdueCount = invoices.filter(i => i.status === "Overdue").length;

  const handleMarkPaid = (invoice: Invoice) => {
    setInvoices(invoices.map(i => 
      i.id === invoice.id 
        ? { ...i, status: 'Paid' as const, paidAmount: i.amount }
        : i
    ));
  };

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedInvoice(r); setDrawerOpen(true); } },
    { id: 'payment', label: 'Record Payment', icon: <DollarSign className="size-4" />, onClick: (r) => router.push(`/finance/accounts-receivable/${r.id}/payment`) },
    { id: 'markPaid', label: 'Mark as Paid', icon: <DollarSign className="size-4" />, onClick: handleMarkPaid },
    { id: 'reminder', label: 'Send Reminder', icon: <Mail className="size-4" />, onClick: (r) => window.location.href = `mailto:${r.clientEmail}?subject=Payment Reminder: ${r.invoiceNumber}` },
  ];

  const stats = [
    { label: 'Total Outstanding', value: `$${(totalOutstanding / 1000).toFixed(0)}K` },
    { label: 'Overdue Amount', value: `$${(overdueAmount / 1000).toFixed(0)}K` },
    { label: 'Overdue Invoices', value: overdueCount },
    { label: 'Avg Days to Pay', value: '28' },
  ];

  const detailSections: DetailSection[] = selectedInvoice ? [
    { id: 'overview', title: 'Invoice Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedInvoice.status}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedInvoice.client}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedInvoice.clientEmail}</Body>
        <Body size="sm"><strong>Project:</strong> {selectedInvoice.project || '—'}</Body>
        <Body size="sm"><strong>Issue Date:</strong> {selectedInvoice.issueDate}</Body>
        <Body size="sm"><strong>Due Date:</strong> {selectedInvoice.dueDate}</Body>
        {selectedInvoice.daysPastDue && <Body size="sm"><strong>Days Overdue:</strong> {selectedInvoice.daysPastDue}</Body>}
        <Body size="sm"><strong>Total:</strong> ${selectedInvoice.amount.toLocaleString()}</Body>
        <Body size="sm"><strong>Paid:</strong> ${selectedInvoice.paidAmount.toLocaleString()}</Body>
        <Body size="sm"><strong>Balance:</strong> ${(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString()}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Invoice>
        title="Accounts Receivable"
        subtitle="Invoice tracking, collections, and payment management"
        data={invoices}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search invoices..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedInvoice(r); setDrawerOpen(true); }}
        createLabel="Create Invoice"
        onCreate={() => router.push('/finance/accounts-receivable/new')}
        entityType="invoices"
        onExport={createExportHandler({
          filename: "accounts-receivable",
          getData: () => invoices.map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            client: inv.client,
            amount: inv.amount,
            dueDate: inv.dueDate,
            daysOverdue: inv.daysOverdue,
            status: inv.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No invoices found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setInvoices(prev => prev.filter(i => !ids.includes(i.id)));
          } else if (action === 'reminder') {
            await fetch('/api/finance/invoices/bulk-reminder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'reminder', label: 'Send Reminders', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedInvoice && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedInvoice}
          title={(r) => r.invoiceNumber}
          subtitle={(r) => `${r.client} • $${(r.amount - r.paidAmount).toLocaleString()} balance`}
          sections={detailSections}
          actions={[{ id: 'payment', label: 'Record Payment', icon: <DollarSign className="size-4" /> }, { id: 'reminder', label: 'Send Reminder', icon: <Mail className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'payment') router.push(`/finance/accounts-receivable/${r.id}/payment`);
            if (id === 'reminder') window.location.href = `mailto:${r.clientEmail}?subject=Payment Reminder: ${r.invoiceNumber}`;
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
