"use client";

import { useState } from "react";
import { Eye, Check } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useWillCallData, type WillCallTicket } from '@/hooks/useWillCall';

const columns: ListPageColumn<WillCallTicket>[] = [
  { key: 'orderNumber', label: 'Order', accessor: 'orderNumber', sortable: true },
  { key: 'customerName', label: 'Customer', accessor: 'customerName', sortable: true },
  { key: 'email', label: 'Email', accessor: 'email' },
  { key: 'tickets', label: 'Tickets', accessor: (r) => `${r.quantity}x ${r.ticketType}` },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'Picked Up' ? 'solid' : v === 'Ready' ? 'outline' : 'ghost'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Ready', label: 'Ready' }, { value: 'Pending', label: 'Pending' }, { value: 'Picked Up', label: 'Picked Up' }, { value: 'No Show', label: 'No Show' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'ticketType', label: 'Ticket Type', type: 'select', required: true, options: [{ value: 'GA', label: 'General Admission' }, { value: 'VIP', label: 'VIP' }, { value: 'Meet & Greet', label: 'Meet & Greet' }] },
  { name: 'quantity', label: 'Quantity', type: 'number', required: true },
];

export default function WillCallPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WillCallTicket | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);
  const [ticketToRelease, setTicketToRelease] = useState<WillCallTicket | null>(null);

  const {
    tickets,
    refetch,
    releaseTicket,
    createTicket,
  } = useWillCallData();

  const readyCount = tickets.filter(t => t.status === "Ready").length;
  const pickedUpCount = tickets.filter(t => t.status === "Picked Up").length;
  const pendingCount = tickets.filter(t => t.status === "Pending").length;

  const rowActions: ListPageAction<WillCallTicket>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedTicket(r); setDrawerOpen(true); } },
    { id: 'release', label: 'Release Tickets', icon: <Check className="size-4" />, onClick: (r) => { setTicketToRelease(r); setReleaseConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createTicket({
      orderNumber: String(data.orderNumber || ''),
      customerName: String(data.customerName || ''),
      email: String(data.email || ''),
      phone: data.phone ? String(data.phone) : undefined,
      eventName: String(data.eventName || ''),
      ticketType: String(data.ticketType || 'General Admission'),
      quantity: Number(data.quantity) || 1,
      status: 'Pending',
      idRequired: Boolean(data.idRequired),
    });
    setCreateModalOpen(false);
  };

  const handleRelease = async () => {
    if (ticketToRelease) {
      await releaseTicket(ticketToRelease.id);
      refetch();
      setReleaseConfirmOpen(false);
      setTicketToRelease(null);
    }
  };

  const stats = [
    { label: 'Ready for Pickup', value: readyCount },
    { label: 'Picked Up', value: pickedUpCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Total Tickets', value: tickets.reduce((sum, t) => sum + t.quantity, 0) },
  ];

  const detailSections: DetailSection[] = selectedTicket ? [
    { id: 'overview', title: 'Ticket Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Order:</strong> {selectedTicket.orderNumber}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedTicket.status}</Body>
        <Body size="sm"><strong>Customer:</strong> {selectedTicket.customerName}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedTicket.email}</Body>
        <Body size="sm"><strong>Phone:</strong> {selectedTicket.phone || '—'}</Body>
        <Body size="sm"><strong>Event:</strong> {selectedTicket.eventName}</Body>
        <Body size="sm"><strong>Tickets:</strong> {selectedTicket.quantity}x {selectedTicket.ticketType}</Body>
        <Body size="sm"><strong>ID Required:</strong> {selectedTicket.idRequired ? 'Yes' : 'No'}</Body>
        {selectedTicket.pickedUpAt && <Body size="sm"><strong>Picked Up:</strong> {selectedTicket.pickedUpAt}</Body>}
        {selectedTicket.pickedUpBy && <Body size="sm"><strong>Picked Up By:</strong> {selectedTicket.pickedUpBy}</Body>}
        {selectedTicket.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedTicket.notes}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<WillCallTicket, 'id'>>({

    entityType: 'will-call',

    requiredFields: ['customerName', 'email', 'phone'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/will-call', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('will-call');


  return (
    <GvtewayAppLayout>
      <ListPage<WillCallTicket>
        title="Will Call Management"
        subtitle="Manage ticket pickups with ID verification"
        data={tickets}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search by name, order #, or email..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedTicket(r); setDrawerOpen(true); }}
        createLabel="Add Will Call"
        onCreate={() => setCreateModalOpen(true)}
        entityType="will-call"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['customerName', 'email', 'phone', 'ticketType', 'quantity', 'orderNumber', 'tickets']}
        onExport={createExportHandler({
          filename: "will-call",
          getData: () => tickets.map(t => ({
            id: t.id,
            orderNumber: t.orderNumber,
            customerName: t.customerName,
            email: t.email,
            phone: t.phone || '',
            eventName: t.eventName,
            ticketType: t.ticketType,
            quantity: t.quantity,
            status: t.status,
            idRequired: t.idRequired,
          })),
        })}
        stats={stats}
        emptyMessage="No will-call tickets found"
        emptyAction={{ label: 'Add Will Call', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/admin/will-call/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'release') {
            await fetch('/api/admin/will-call/bulk-release', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'release', label: 'Release Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Will Call Entry" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedTicket} title={(t) => t.customerName} subtitle={(t) => t.orderNumber} sections={detailSections} actions={[{ id: 'release', label: 'Release Tickets', icon: <Check className="size-4" /> }]} onAction={(id, t) => { if (id === 'release') { setTicketToRelease(t); setReleaseConfirmOpen(true); setDrawerOpen(false); } }} />
      <ConfirmDialog open={releaseConfirmOpen} title="Release Tickets" message={`Release ${ticketToRelease?.quantity} ticket(s) to ${ticketToRelease?.customerName}? Verify government-issued photo ID before releasing.`} confirmLabel="Confirm Release" onConfirm={handleRelease} onCancel={() => { setReleaseConfirmOpen(false); setTicketToRelease(null); }} />
    </GvtewayAppLayout>
  );
}
