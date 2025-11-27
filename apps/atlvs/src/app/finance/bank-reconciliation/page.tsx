"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

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

const mockTransactions: BankTransaction[] = [
  { id: "BNK-001", date: "2024-11-25", description: "Wire Transfer - Client ABC", amount: 45000, type: "Credit", status: "Matched", matchedTo: "INV-2024-089", bankAccount: "Operating" },
  { id: "BNK-002", date: "2024-11-25", description: "ACH Payment - Vendor XYZ", amount: -12500, type: "Debit", status: "Matched", matchedTo: "PO-2024-156", bankAccount: "Operating" },
  { id: "BNK-003", date: "2024-11-24", description: "Check #4521", amount: -3200, type: "Debit", status: "Unmatched", bankAccount: "Operating" },
  { id: "BNK-004", date: "2024-11-24", description: "Deposit", amount: 28750, type: "Credit", status: "Pending", bankAccount: "Operating" },
  { id: "BNK-005", date: "2024-11-23", description: "Wire Transfer - Client DEF", amount: 67500, type: "Credit", status: "Reconciled", matchedTo: "INV-2024-085", bankAccount: "Operating" },
  { id: "BNK-006", date: "2024-11-23", description: "Payroll", amount: -89000, type: "Debit", status: "Reconciled", matchedTo: "PAY-2024-047", bankAccount: "Payroll" },
];

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
  const [transactions, setTransactions] = useState<BankTransaction[]>(mockTransactions);
  const [selectedTxn, setSelectedTxn] = useState<BankTransaction | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const unmatchedCount = transactions.filter(t => t.status === "Unmatched").length;
  const pendingCount = transactions.filter(t => t.status === "Pending").length;
  const totalCredits = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  const rowActions: ListPageAction<BankTransaction>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedTxn(r); setDrawerOpen(true); } },
    { id: 'match', label: 'Match', icon: '🔗', onClick: (r) => console.log('Match', r.id) },
  ];

  const stats = [
    { label: 'Unmatched', value: unmatchedCount },
    { label: 'Pending Review', value: pendingCount },
    { label: 'Total Credits', value: `$${(totalCredits / 1000).toFixed(0)}K` },
    { label: 'Transactions', value: transactions.length },
  ];

  const detailSections: DetailSection[] = selectedTxn ? [
    { id: 'overview', title: 'Transaction Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Date:</strong> {selectedTxn.date}</div>
        <div><strong>Account:</strong> {selectedTxn.bankAccount}</div>
        <div><strong>Description:</strong> {selectedTxn.description}</div>
        <div><strong>Type:</strong> {selectedTxn.type}</div>
        <div><strong>Amount:</strong> {selectedTxn.amount > 0 ? '+' : ''}${Math.abs(selectedTxn.amount).toLocaleString()}</div>
        <div><strong>Status:</strong> {selectedTxn.status}</div>
        {selectedTxn.matchedTo && <div><strong>Matched To:</strong> {selectedTxn.matchedTo}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
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
        onCreate={() => console.log('Import')}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No transactions found"
        header={<CreatorNavigationAuthenticated />}
      />
      {selectedTxn && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedTxn}
          title={(r) => r.description}
          subtitle={(r) => `${r.bankAccount} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'match', label: 'Find Match', icon: '🔗' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
