"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useLedgerData, type LedgerTransaction } from "@/hooks/useFinance";

interface Transaction extends LedgerTransaction {
  [key: string]: unknown;
}

const formatCurrency = (amount: number) => {
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const columns: ListPageColumn<Transaction>[] = [
  { key: 'id', label: 'Transaction', accessor: 'id', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'entity', label: 'Party', accessor: 'entity' },
  { key: 'amount', label: 'Amount', accessor: (r) => `$${Math.abs(r.amount).toLocaleString()}`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={String(v) === "Paid" ? "solid" : "outline"}>{String(v)}</Badge> },
  { key: 'date', label: 'Date', accessor: 'date', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'invoice', label: 'Invoices' }, { value: 'expense', label: 'Expenses' }] },
  { key: 'status', label: 'Status', options: [{ value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }] },
];

export default function FinancePage() {
  const router = useRouter();
  const {
    transactions: ledgerTransactions,
    totalRevenue,
    totalExpenses,
    netProfit,
    isLoading: loading,
    error,
    refetch,
  } = useLedgerData();

  // Cast to Transaction type for compatibility with ListPage
  const transactions = ledgerTransactions as Transaction[];

  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<Transaction>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedTxn(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses) },
    { label: 'Net Profit', value: formatCurrency(netProfit) },
    { label: 'Transactions', value: transactions.length },
  ];

  const detailSections: DetailSection[] = selectedTxn ? [
    { id: 'overview', title: 'Transaction Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>ID:</strong> {selectedTxn.id}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedTxn.type}</Body>
        <Body size="sm"><strong>Party:</strong> {selectedTxn.entity}</Body>
        <Body size="sm"><strong>Amount:</strong> ${Math.abs(selectedTxn.amount).toLocaleString()}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedTxn.status}</Body>
        <Body size="sm"><strong>Date:</strong> {selectedTxn.date}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Transaction, 'id'>>({

    entityType: 'transactions',

    requiredFields: ['transactions', 'type', 'entity'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/transactions', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      await refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('transactions');


  return (
    <AtlvsAppLayout>
      <ListPage<Transaction>
        title="Finance Management"
        subtitle="Track revenue, expenses, and financial transactions"
        data={transactions}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search transactions..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedTxn(r); setDrawerOpen(true); }}
        createLabel="Add Transaction"
        onCreate={() => router.push('/finance/new')}
        entityType="transactions"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['transactions', 'type', 'entity', 'amount', 'status', 'date']}
        onExport={createExportHandler({
          filename: "transactions",
          getData: () => transactions.map(t => ({
            id: t.id,
            type: t.type,
            entity: t.entity,
            amount: t.amount,
            date: t.date,
            status: t.status,
            category: t.category,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No transactions found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/finance/transactions/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedTxn && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedTxn}
          title={(t) => t.id}
          subtitle={(t) => `${t.type} • ${t.status}`}
          sections={detailSections}
        />
      )}
    </AtlvsAppLayout>
  );
}
