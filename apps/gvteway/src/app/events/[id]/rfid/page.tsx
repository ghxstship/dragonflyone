"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye, CreditCard } from "lucide-react";
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
import { createExportHandler } from "@ghxstship/config";

interface RFIDWristband {
  id: string;
  wristbandId: string;
  guestName: string;
  email: string;
  ticketType: string;
  balance: number;
  status: "Active" | "Inactive" | "Lost" | "Replaced";
  registeredAt: string;
  lastUsed?: string;
  transactions: number;
  [key: string]: unknown;
}

const mockWristbands: RFIDWristband[] = [
  { id: "WB-001", wristbandId: "RFID-A1B2C3", guestName: "John Smith", email: "john@email.com", ticketType: "VIP", balance: 125.50, status: "Active", registeredAt: "2024-11-24T14:00:00Z", lastUsed: "2024-11-24T20:15:00Z", transactions: 8 },
  { id: "WB-002", wristbandId: "RFID-D4E5F6", guestName: "Sarah Johnson", email: "sarah@email.com", ticketType: "GA", balance: 45.00, status: "Active", registeredAt: "2024-11-24T15:30:00Z", lastUsed: "2024-11-24T19:45:00Z", transactions: 3 },
  { id: "WB-003", wristbandId: "RFID-G7H8I9", guestName: "Mike Davis", email: "mike@email.com", ticketType: "VIP", balance: 0, status: "Active", registeredAt: "2024-11-24T13:00:00Z", lastUsed: "2024-11-24T21:00:00Z", transactions: 12 },
  { id: "WB-004", wristbandId: "RFID-J1K2L3", guestName: "Emily Chen", email: "emily@email.com", ticketType: "GA", balance: 75.25, status: "Lost", registeredAt: "2024-11-24T16:00:00Z", transactions: 2 },
];

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "Active": return "solid";
    case "Lost": return "ghost";
    default: return "outline";
  }
};

const columns: ListPageColumn<RFIDWristband>[] = [
  { key: 'wristbandId', label: 'Wristband', accessor: 'wristbandId', sortable: true },
  { key: 'guestName', label: 'Guest', accessor: 'guestName', sortable: true },
  { key: 'email', label: 'Email', accessor: 'email' },
  { key: 'ticketType', label: 'Ticket', accessor: 'ticketType', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'balance', label: 'Balance', accessor: (r) => `$${r.balance.toFixed(2)}`, sortable: true },
  { key: 'transactions', label: 'Transactions', accessor: 'transactions', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Lost', label: 'Lost' }, { value: 'Replaced', label: 'Replaced' }] },
  { key: 'ticketType', label: 'Ticket', options: [{ value: 'VIP', label: 'VIP' }, { value: 'GA', label: 'General Admission' }] },
];

export default function RFIDPage() {
  const router = useRouter();
  const params = useParams();
  const [wristbands] = useState<RFIDWristband[]>(mockWristbands);
  const [selectedWristband, setSelectedWristband] = useState<RFIDWristband | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalBalance = wristbands.reduce((sum, w) => sum + w.balance, 0);
  const activeCount = wristbands.filter(w => w.status === "Active").length;
  const totalTxns = wristbands.reduce((sum, w) => sum + w.transactions, 0);

  const rowActions: ListPageAction<RFIDWristband>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedWristband(r); setDrawerOpen(true); } },
    { id: 'topup', label: 'Top Up', icon: <CreditCard className="size-4" />, onClick: (r) => router.push(`/events/${params.id}/rfid/${r.id}/topup`) },
  ];

  const stats = [
    { label: 'Active Wristbands', value: activeCount },
    { label: 'Total Balance', value: `$${totalBalance.toFixed(2)}` },
    { label: 'Transactions', value: totalTxns },
    { label: 'Avg Balance', value: `$${(totalBalance / (activeCount || 1)).toFixed(2)}` },
  ];

  const detailSections: DetailSection[] = selectedWristband ? [
    { id: 'overview', title: 'Wristband Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Wristband ID:</strong> {selectedWristband.wristbandId}</Body>
        <Body size="sm"><strong>Guest:</strong> {selectedWristband.guestName}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedWristband.email}</Body>
        <Body size="sm"><strong>Ticket Type:</strong> {selectedWristband.ticketType}</Body>
        <Body size="sm"><strong>Balance:</strong> ${selectedWristband.balance.toFixed(2)}</Body>
        <Body size="sm"><strong>Transactions:</strong> {selectedWristband.transactions}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedWristband.status}</Body>
        <Body size="sm"><strong>Registered:</strong> {new Date(selectedWristband.registeredAt).toLocaleString()}</Body>
        {selectedWristband.lastUsed && <Body size="sm"><strong>Last Used:</strong> {new Date(selectedWristband.lastUsed).toLocaleString()}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<RFIDWristband>
        title="RFID Wristbands"
        subtitle="Cashless payment and access control system"
        data={wristbands}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search by name, email, or wristband ID..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedWristband(r); setDrawerOpen(true); }}
        createLabel="Scan Wristband"
        onCreate={() => router.push(`/events/${params.id}/rfid/scan`)}
        entityType="rfid-wristbands"
        onExport={createExportHandler({
          filename: "rfid-wristbands",
          getData: () => wristbands.map(w => ({
            id: w.id,
            wristbandId: w.wristbandId,
            guestName: w.guestName,
            email: w.email,
            ticketType: w.ticketType,
            balance: w.balance,
            status: w.status,
            transactions: w.transactions,
          })),
        })}
        stats={stats}
        emptyMessage="No wristbands registered"
      />
      {selectedWristband && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedWristband}
          title={(w) => w.guestName}
          subtitle={(w) => `${w.wristbandId} • $${w.balance.toFixed(2)}`}
          sections={detailSections}
          actions={[
            { id: 'topup', label: 'Top Up', icon: <CreditCard className="size-4" /> },
            { id: 'refund', label: 'Refund', icon: <CreditCard className="size-4" /> },
          ]}
          onAction={(id, w) => {
            if (id === 'topup') router.push(`/events/${params.id}/rfid/${w.id}/topup`);
            if (id === 'refund') router.push(`/events/${params.id}/rfid/${w.id}/refund`);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
