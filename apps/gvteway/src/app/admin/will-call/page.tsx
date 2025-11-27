"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface WillCallTicket {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone?: string;
  eventName: string;
  ticketType: string;
  quantity: number;
  status: "Pending" | "Ready" | "Picked Up" | "No Show";
  notes?: string;
  idRequired: boolean;
  pickedUpAt?: string;
  pickedUpBy?: string;
}

const mockTickets: WillCallTicket[] = [
  { id: "WC-001", orderNumber: "ORD-2024-1234", customerName: "John Smith", email: "john@email.com", phone: "+1 555-0101", eventName: "Summer Fest 2024", ticketType: "VIP", quantity: 2, status: "Ready", idRequired: true },
  { id: "WC-002", orderNumber: "ORD-2024-1235", customerName: "Sarah Johnson", email: "sarah@email.com", eventName: "Summer Fest 2024", ticketType: "GA", quantity: 4, status: "Ready", idRequired: true, notes: "Guest may send alternate pickup" },
  { id: "WC-003", orderNumber: "ORD-2024-1236", customerName: "Mike Davis", email: "mike@email.com", phone: "+1 555-0103", eventName: "Summer Fest 2024", ticketType: "VIP", quantity: 1, status: "Picked Up", idRequired: true, pickedUpAt: "2024-11-24 18:30", pickedUpBy: "Mike Davis" },
  { id: "WC-004", orderNumber: "ORD-2024-1237", customerName: "Emily Chen", email: "emily@email.com", eventName: "Summer Fest 2024", ticketType: "GA", quantity: 2, status: "Pending", idRequired: true },
  { id: "WC-005", orderNumber: "ORD-2024-1238", customerName: "Chris Wilson", email: "chris@email.com", phone: "+1 555-0105", eventName: "Summer Fest 2024", ticketType: "Meet & Greet", quantity: 2, status: "Ready", idRequired: true },
];

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
  const router = useRouter();
  const [tickets, setTickets] = useState<WillCallTicket[]>(mockTickets);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<WillCallTicket | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = useState(false);
  const [ticketToRelease, setTicketToRelease] = useState<WillCallTicket | null>(null);

  const readyCount = tickets.filter(t => t.status === "Ready").length;
  const pickedUpCount = tickets.filter(t => t.status === "Picked Up").length;
  const pendingCount = tickets.filter(t => t.status === "Pending").length;

  const rowActions: ListPageAction<WillCallTicket>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedTicket(r); setDrawerOpen(true); } },
    { id: 'release', label: 'Release Tickets', icon: '✅', onClick: (r) => { setTicketToRelease(r); setReleaseConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Add will-call:', data);
    setCreateModalOpen(false);
  };

  const handleRelease = async () => {
    if (ticketToRelease) {
      setTickets(prev => prev.map(t => t.id === ticketToRelease.id ? { ...t, status: 'Picked Up' as const, pickedUpAt: new Date().toISOString() } : t));
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
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Order:</strong> {selectedTicket.orderNumber}</div>
        <div><strong>Status:</strong> {selectedTicket.status}</div>
        <div><strong>Customer:</strong> {selectedTicket.customerName}</div>
        <div><strong>Email:</strong> {selectedTicket.email}</div>
        <div><strong>Phone:</strong> {selectedTicket.phone || '—'}</div>
        <div><strong>Event:</strong> {selectedTicket.eventName}</div>
        <div><strong>Tickets:</strong> {selectedTicket.quantity}x {selectedTicket.ticketType}</div>
        <div><strong>ID Required:</strong> {selectedTicket.idRequired ? 'Yes' : 'No'}</div>
        {selectedTicket.pickedUpAt && <div><strong>Picked Up:</strong> {selectedTicket.pickedUpAt}</div>}
        {selectedTicket.pickedUpBy && <div><strong>Picked Up By:</strong> {selectedTicket.pickedUpBy}</div>}
        {selectedTicket.notes && <div className="col-span-2"><strong>Notes:</strong> {selectedTicket.notes}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No will-call tickets found"
        emptyAction={{ label: 'Add Will Call', onClick: () => setCreateModalOpen(true) }}
        header={<ConsumerNavigationPublic />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Will Call Entry" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedTicket} title={(t) => t.customerName} subtitle={(t) => t.orderNumber} sections={detailSections} actions={[{ id: 'release', label: 'Release Tickets', icon: '✅' }]} onAction={(id, t) => { if (id === 'release') { setTicketToRelease(t); setReleaseConfirmOpen(true); setDrawerOpen(false); } }} />
      <ConfirmDialog open={releaseConfirmOpen} title="Release Tickets" message={`Release ${ticketToRelease?.quantity} ticket(s) to ${ticketToRelease?.customerName}? Verify government-issued photo ID before releasing.`} confirmLabel="Confirm Release" onConfirm={handleRelease} onCancel={() => { setReleaseConfirmOpen(false); setTicketToRelease(null); }} />
    </>
  );
}
