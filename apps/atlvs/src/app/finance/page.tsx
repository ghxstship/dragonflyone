"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import { supabase } from "@/lib/supabase";
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
import { createExportHandler, createImportHandler, getImportTemplates, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface Transaction {
  id: string;
  type: string;
  entity: string;
  amount: number;
  status: string;
  date: string;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data: ledger, error: fetchError } = await supabase
        .from('ledger_entries')
        .select(`id, amount, side, entry_date, memo, ledger_accounts(name, account_type)`)
        .order('entry_date', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      interface LedgerEntry { id: string; side: string; memo?: string; ledger_accounts?: { name?: string }; amount: string | number; entry_date: string }
      const formatted = ledger?.map((entry: LedgerEntry) => ({
        id: entry.id.substring(0, 8).toUpperCase(),
        type: entry.side === 'credit' ? 'Invoice' : 'Expense',
        entity: entry.memo || entry.ledger_accounts?.name || 'N/A',
        amount: entry.side === 'credit' ? parseFloat(String(entry.amount)) : -parseFloat(String(entry.amount)),
        status: entry.side === 'credit' ? 'Paid' : 'Approved',
        date: entry.entry_date,
      })) || [];

      setTransactions(formatted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totalRevenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netProfit = totalRevenue - totalExpenses;

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

      refetch();

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
        onRetry={fetchTransactions}
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
