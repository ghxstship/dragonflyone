"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface CreditCardTxn {
  id: string;
  cardId: string;
  lastFour: string;
  cardHolder: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  status: "Pending" | "Posted" | "Disputed";
  receipt?: boolean;
  department: string;
  [key: string]: unknown;
}

const mockData: CreditCardTxn[] = [
  { id: "TXN-001", cardId: "CC-001", lastFour: "4521", cardHolder: "John Smith", merchant: "Audio Equipment Co", amount: 2450, date: "2024-11-24", category: "Equipment", status: "Posted", receipt: true, department: "Production" },
  { id: "TXN-002", cardId: "CC-002", lastFour: "7832", cardHolder: "Sarah Johnson", merchant: "Delta Airlines", amount: 1890, date: "2024-11-23", category: "Travel", status: "Posted", receipt: true, department: "Executive" },
  { id: "TXN-003", cardId: "CC-001", lastFour: "4521", cardHolder: "John Smith", merchant: "Staples", amount: 156, date: "2024-11-23", category: "Office Supplies", status: "Pending", department: "Production" },
  { id: "TXN-004", cardId: "CC-003", lastFour: "9156", cardHolder: "Mike Davis", merchant: "Hilton Hotels", amount: 890, date: "2024-11-22", category: "Travel", status: "Posted", receipt: false, department: "Operations" },
  { id: "TXN-005", cardId: "CC-002", lastFour: "7832", cardHolder: "Sarah Johnson", merchant: "Amazon Business", amount: 567, date: "2024-11-22", category: "Supplies", status: "Disputed", department: "Executive" },
];

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
  const [data, setData] = useState<CreditCardTxn[]>(mockData);
  const [selected, setSelected] = useState<CreditCardTxn | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalSpend = data.reduce((s, t) => s + t.amount, 0);
  const pendingCount = data.filter(t => t.status === "Pending").length;
  const missingReceipts = data.filter(t => t.status === "Posted" && !t.receipt).length;

  const rowActions: ListPageAction<CreditCardTxn>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'receipt', label: 'Upload Receipt', icon: '📎', onClick: (r) => console.log('Upload receipt', r.id) },
  ];

  const stats = [
    { label: 'Total Spend', value: `$${totalSpend.toLocaleString()}` },
    { label: 'Transactions', value: data.length },
    { label: 'Pending', value: pendingCount },
    { label: 'Missing Receipts', value: missingReceipts },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Transaction Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Merchant:</strong> {selected.merchant}</div>
        <div><strong>Amount:</strong> ${selected.amount.toLocaleString()}</div>
        <div><strong>Date:</strong> {selected.date}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Card Holder:</strong> {selected.cardHolder}</div>
        <div><strong>Card:</strong> ••••{selected.lastFour}</div>
        <div><strong>Department:</strong> {selected.department}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Receipt:</strong> {selected.receipt ? 'Uploaded' : 'Missing'}</div>
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No transactions found"
        header={<CreatorNavigationAuthenticated />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.merchant}
          subtitle={(r) => `$${r.amount.toLocaleString()} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'receipt', label: 'Upload Receipt', icon: '📎' }, { id: 'dispute', label: 'Dispute', icon: '⚠️' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
