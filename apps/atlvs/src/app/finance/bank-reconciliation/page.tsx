"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Link } from "lucide-react";
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
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "Credit" | "Debit";
  status: "Matched" | "Unmatched" | "Pending" | "Reconciled";
  matchedTo?: string;
  bankAccount: string;
  [key: string]: unknown;
}

import { DEMO_BANK_TRANSACTIONS } from '../../../lib/demo-data';

const mockTransactions = DEMO_BANK_TRANSACTIONS as BankTransaction[];


const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<BankTransaction>[] = [
  { key: 'date', label: 'Date', accessor: 'date', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description', sortable: true },
  { key: 'bankAccount', label: 'Account', accessor: 'bankAccount', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'amount', label: 'Amount', accessor: (r) => `${r.amount > 0 ? '+' : ''}$${Math.abs(r.amount).toLocaleString()}`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'matchedTo', label: 'Matched To', accessor: (r) => r.matchedTo || '—' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Matched', label: 'Matched' }, { value: 'Unmatched', label: 'Unmatched' }, { value: 'Pending', label: 'Pending' }, { value: 'Reconciled', label: 'Reconciled' }] },
  { key: 'bankAccount', label: 'Account', options: [{ value: 'Operating', label: 'Operating' }, { value: 'Payroll', label: 'Payroll' }, { value: 'Reserve', label: 'Reserve' }] },
];

export default function BankReconciliationPage() {
  const router = useRouter();
  const [transactions] = useState<BankTransaction[]>(mockTransactions);
  const [selectedTxn, setSelectedTxn] = useState<BankTransaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unmatchedCount = transactions.filter(t => t.status === "Unmatched").length;
  const pendingCount = transactions.filter(t => t.status === "Pending").length;
  const totalCredits = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const rowActions: ListPageAction<BankTransaction>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedTxn(r); setDrawerOpen(true); } },
    { id: 'match', label: 'Match', icon: <Link className="size-4" />, onClick: (r) => router.push(`/finance/bank-reconciliation/${r.id}/match`) },
  ];

  const stats = [
    { label: 'Unmatched', value: unmatchedCount },
    { label: 'Pending Review', value: pendingCount },
    { label: 'Total Credits', value: `$${(totalCredits / 1000).toFixed(0)}K` },
    { label: 'Transactions', value: transactions.length },
  ];

  const detailSections: DetailSection[] = selectedTxn ? [
    { id: 'overview', title: 'Transaction Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Date:</strong> {selectedTxn.date}</Body>
        <Body size="sm"><strong>Account:</strong> {selectedTxn.bankAccount}</Body>
        <Body size="sm"><strong>Description:</strong> {selectedTxn.description}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedTxn.type}</Body>
        <Body size="sm"><strong>Amount:</strong> {selectedTxn.amount > 0 ? '+' : ''}${Math.abs(selectedTxn.amount).toLocaleString()}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedTxn.status}</Body>
        {selectedTxn.matchedTo && <Body size="sm"><strong>Matched To:</strong> {selectedTxn.matchedTo}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<BankTransaction, 'id'>>({

    entityType: 'bank-transactions',

    requiredFields: ['date', 'description', 'bankAccount'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/bank-transactions', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('bank-transactions');


  return (
    <AtlvsAppLayout>
      <ListPage<BankTransaction>
        title="Bank Reconciliation"
        subtitle="Automated bank statement matching and reconciliation"
        data={transactions}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search transactions..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedTxn(r); setDrawerOpen(true); }}
        createLabel="Import Statement"
        onCreate={() => router.push('/finance/bank-reconciliation/import')}
        entityType="bank-transactions"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['date', 'description', 'bankAccount', 'amount', 'status', 'matchedTo']}
        onExport={createExportHandler({
          filename: "bank-transactions",
          getData: () => transactions.map(t => ({
            id: t.id,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            status: t.status,
            matchedEntry: t.matchedEntry || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No transactions found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/finance/bank-transactions/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'reconcile') {
            await fetch('/api/finance/bank-transactions/bulk-reconcile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'reconcile', label: 'Reconcile Selected', variant: 'default' },
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
          title={(r) => r.description}
          subtitle={(r) => `${r.bankAccount} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'match', label: 'Find Match', icon: <Link className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'match') router.push(`/finance/bank-reconciliation/${r.id}/match`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
