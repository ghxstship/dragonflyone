'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useTickets, useCreateTicket, useDeleteTicket, type Ticket as TicketType } from '@/hooks/useTickets';

const typeColors: Record<string, 'success' | 'warning' | 'info' | 'solid' | 'outline'> = {
  general: 'outline',
  vip: 'success',
  early_bird: 'warning',
  group: 'info',
  student: 'solid',
  senior: 'solid',
  member: 'info',
};

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  active: 'success',
  paused: 'warning',
  sold_out: 'error',
  draft: 'outline',
  ended: 'info',
};

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

const columns: ListPageColumn<TicketType>[] = [
  { key: 'name', label: 'Ticket Name', accessor: 'name', sortable: true },
  { key: 'event', label: 'Event', accessor: (r) => r.events?.name || '—' },
  { key: 'ticket_type', label: 'Type', accessor: 'ticket_type', render: (v) => <Badge variant={typeColors[String(v)] || 'outline'}>{String(v).replace('_', ' ').toUpperCase()}</Badge> },
  { key: 'price', label: 'Price', accessor: (r) => formatCurrency(r.price, r.currency), sortable: true },
  { key: 'sold', label: 'Sold', accessor: (r) => `${r.quantity_sold || 0} / ${r.quantity_available || '∞'}` },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'sold_out', label: 'Sold Out' },
    { value: 'draft', label: 'Draft' },
    { value: 'ended', label: 'Ended' },
  ]},
  { key: 'ticket_type', label: 'Type', options: [
    { value: 'general', label: 'General' },
    { value: 'vip', label: 'VIP' },
    { value: 'early_bird', label: 'Early Bird' },
    { value: 'group', label: 'Group' },
    { value: 'student', label: 'Student' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Ticket Name', type: 'text', required: true, colSpan: 2 },
  { name: 'event_id', label: 'Event ID', type: 'text', required: true },
  { name: 'ticket_type', label: 'Type', type: 'select', required: true, options: [
    { value: 'general', label: 'General Admission' },
    { value: 'vip', label: 'VIP' },
    { value: 'early_bird', label: 'Early Bird' },
    { value: 'group', label: 'Group' },
    { value: 'student', label: 'Student' },
    { value: 'senior', label: 'Senior' },
    { value: 'member', label: 'Member' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
  ]},
  { name: 'price', label: 'Price', type: 'number', required: true },
  { name: 'currency', label: 'Currency', type: 'select', options: [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
  ]},
  { name: 'quantity_available', label: 'Quantity Available', type: 'number' },
  { name: 'max_per_order', label: 'Max Per Order', type: 'number' },
  { name: 'sale_start', label: 'Sale Start', type: 'datetime' },
  { name: 'sale_end', label: 'Sale End', type: 'datetime' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
];

export default function TicketsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: tickets, isLoading, error, refetch } = useTickets();
  const createMutation = useCreateTicket();
  const deleteMutation = useDeleteTicket();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<TicketType | null>(null);

  const ticketList = (tickets || []) as TicketType[];

  const totalSold = ticketList.reduce((sum, t) => sum + (t.quantity_sold || 0), 0);
  const totalRevenue = ticketList.reduce((sum, t) => sum + ((t.quantity_sold || 0) * (t.price || 0)), 0);

  const stats = [
    { label: 'Total Tickets', value: ticketList.length },
    { label: 'Active', value: ticketList.filter(t => t.status === 'active').length },
    { label: 'Total Sold', value: totalSold },
    { label: 'Revenue', value: formatCurrency(totalRevenue) },
  ];

  const rowActions: ListPageAction<TicketType>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedTicket(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/tickets/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setTicketToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        event_id: String(data.event_id || ''),
        ticket_type: String(data.ticket_type || 'general'),
        name: String(data.name || ''),
        description: String(data.description || ''),
        price: Number(data.price || 0),
        currency: String(data.currency || 'USD'),
        quantity_available: data.quantity_available ? Number(data.quantity_available) : undefined,
        max_per_order: Number(data.max_per_order || 10),
        sale_start: data.sale_start ? String(data.sale_start) : undefined,
        sale_end: data.sale_end ? String(data.sale_end) : undefined,
        status: String(data.status || 'draft'),
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Ticket Created', message: `Ticket "${data.name}" has been created.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Ticket', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const handleDelete = async () => {
    if (ticketToDelete) {
      try {
        await deleteMutation.mutateAsync(ticketToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({ type: 'success', title: 'Ticket Deleted', message: `Ticket "${ticketToDelete.name}" has been deleted.` });
        setTicketToDelete(null);
      } catch (err) {
        addNotification({ type: 'error', title: 'Failed to Delete Ticket', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
      }
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      refetch();
    }
  };

  const detailSections: DetailSection[] = selectedTicket ? [
    {
      id: 'overview',
      title: 'Ticket Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {selectedTicket.name}</Body>
          <Body size="sm"><strong>Type:</strong> {selectedTicket.ticket_type}</Body>
          <Body size="sm"><strong>Price:</strong> {formatCurrency(selectedTicket.price, selectedTicket.currency)}</Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedTicket.status]}>{selectedTicket.status.toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Sold:</strong> {selectedTicket.quantity_sold || 0}</Body>
          <Body size="sm"><strong>Available:</strong> {selectedTicket.quantity_available || 'Unlimited'}</Body>
          <Body size="sm"><strong>Max Per Order:</strong> {selectedTicket.max_per_order}</Body>
          <Body size="sm"><strong>Event:</strong> {selectedTicket.events?.name || '—'}</Body>
          {selectedTicket.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedTicket.description}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<TicketType>
        title="Ticket Management"
        subtitle="Manage event tickets and pricing"
        data={ticketList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search tickets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedTicket(row); setDrawerOpen(true); }}
        createLabel="Create Ticket"
        onCreate={() => setCreateModalOpen(true)}
        onExport={createExportHandler({
          filename: 'tickets',
          getData: () => ticketList.map(t => ({
            id: t.id,
            name: t.name,
            type: t.ticket_type,
            price: t.price,
            currency: t.currency,
            sold: t.quantity_sold,
            available: t.quantity_available,
            status: t.status,
          })),
        })}
        stats={stats}
        emptyMessage="No tickets yet"
        emptyAction={{ label: 'Create First Ticket', onClick: () => setCreateModalOpen(true) }}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Ticket"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedTicket}
        title={(ticket) => ticket.name}
        subtitle={(ticket) => formatCurrency(ticket.price, ticket.currency)}
        sections={detailSections}
        onEdit={(ticket) => router.push(`/tickets/${ticket.id}/edit`)}
        onDelete={(ticket) => { setTicketToDelete(ticket); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Ticket"
        message={`Delete ticket "${ticketToDelete?.name}"? This cannot be undone if tickets have been sold.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setTicketToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
