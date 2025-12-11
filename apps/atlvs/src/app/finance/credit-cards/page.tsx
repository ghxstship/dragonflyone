"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Paperclip, AlertTriangle } from "lucide-react";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, } from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

import {
  DEMO_CREDIT_CARD_TXNS,
  type DemoCreditCardTxn as CreditCardTxn,
} from "../../../lib/demo-data";

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<CreditCardTxn>[] = [
  { key: 'date', label: 'Date', accessor: 'date', sortable: true },
  { key: 'merchant', label: 'Merchant', accessor: 'merchant', sortable: true },
  { key: 'cardHolder', label: 'Card Holder', accessor: 'cardHolder' },
  { key: 'lastFour', label: 'Card', accessor: (r) => `••••${r.lastFour}` },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'amount', label: 'Amount', accessor: (r) => `$${r.amount.toLocaleString()}`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'receipt', label: 'Receipt', accessor: (r) => r.receipt ? '✓' : '✗' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Posted', label: 'Posted' }, { value: 'Pending', label: 'Pending' }, { value: 'Disputed', label: 'Disputed' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Equipment', label: 'Equipment' }, { value: 'Travel', label: 'Travel' }, { value: 'Supplies', label: 'Supplies' }] },
];

export default function CreditCardsPage() {
  const router = useRouter();
  const [data, setData] = useState<CreditCardTxn[]>(DEMO_CREDIT_CARD_TXNS);
  const [selected, setSelected] = useState<CreditCardTxn | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSpend = data.reduce((s, t) => s + t.amount, 0);
  const pendingCount = data.filter(t => t.status === "Pending").length;
  const missingReceipts = data.filter(t => t.status === "Posted" && !t.receipt).length;

  const rowActions: ListPageAction<CreditCardTxn>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'receipt', label: 'Upload Receipt', icon: <Paperclip className="size-4" />, onClick: (r) => router.push(`/finance/credit-cards/${r.id}/receipt`) },
  ];

  const stats = [
    { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}` },
    { label: 'Transactions', value: data.length },
    { label: 'Pending', value: pendingCount },
    { label: 'Missing Receipts', value: missingReceipts },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Transaction Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Merchant:</strong> {selected.merchant}</Body>
        <Body size="sm"><strong>Amount:</strong> ${selected.amount.toLocaleString()}</Body>
        <Body size="sm"><strong>Date:</strong> {selected.date}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Card Holder:</strong> {selected.cardHolder}</Body>
        <Body size="sm"><strong>Card:</strong> ••••{selected.lastFour}</Body>
        <Body size="sm"><strong>Department:</strong> {selected.department}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Receipt:</strong> {selected.receipt ? 'Uploaded' : 'Missing'}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<CreditCardTxn, 'id'>>({

    entityType: 'credit-card-transactions',

    requiredFields: ['date', 'merchant', 'cardHolder'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/credit-card-transactions', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('credit-card-transactions');


  return (
    <AtlvsAppLayout>
      <ListPage<CreditCardTxn>
        title="Credit Card Management"
        subtitle="Corporate credit card integration and reconciliation"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search transactions..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="credit-card-transactions"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['date', 'merchant', 'cardHolder', 'lastFour', 'category', 'amount', 'status']}
        onExport={createExportHandler({
          filename: "credit-card-transactions",
          getData: () => data.map(t => ({
            id: t.id,
            cardHolder: t.cardHolder,
            lastFour: t.lastFour,
            merchant: t.merchant,
            amount: t.amount,
            date: t.date,
            category: t.category,
            status: t.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No transactions found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setData(prev => prev.filter(t => !ids.includes(t.id)));
          } else if (action === 'approve') {
            setData(prev => prev.map(t => ids.includes(t.id) ? { ...t, status: 'Posted' as const } : t));
          }
        }}
        bulkActions={[
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.merchant}
          subtitle={(r) => `$${r.amount.toLocaleString()} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'receipt', label: 'Upload Receipt', icon: <Paperclip className="size-4" /> }, { id: 'dispute', label: 'Dispute', icon: <AlertTriangle className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'receipt') router.push(`/finance/credit-cards/${r.id}/receipt`);
            if (id === 'dispute') {
              setData(prev => prev.map(t => t.id === r.id ? { ...t, status: 'Disputed' as const } : t));
            }
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
