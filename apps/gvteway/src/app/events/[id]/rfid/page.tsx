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
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_RFID_WRISTBANDS,
  type DemoRFIDWristband as RFIDWristband,
} from "@/lib/demo-data";

const mockWristbands = DEMO_RFID_WRISTBANDS;

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
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<RFIDWristband, 'id'>>({

    entityType: 'rfid-wristbands',

    requiredFields: ['wristbandId', 'guestName', 'email'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/rfid-wristbands', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('rfid-wristbands');


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

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['wristbandId', 'guestName', 'email', 'ticketType', 'balance', 'transactions', 'status']}
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
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch(`/api/events/${params.id}/rfid/bulk`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'deactivate') {
            await fetch(`/api/events/${params.id}/rfid/bulk-deactivate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'deactivate', label: 'Deactivate Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
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
