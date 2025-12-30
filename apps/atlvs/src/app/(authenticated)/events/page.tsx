'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
// Layout provided by route group
import { useEvents, useEventStats, useCreateEvent, useDeleteEvent } from '../../../hooks/useEvents';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body} from '@ghxstship/ui';

// Roles that can create/edit/delete events

interface Event {
  id: string;
  name: string;
  event_type: string;
  venue_name?: string;
  venue_city?: string;
  start_date: string;
  end_date?: string;
  status: string;
  capacity?: number;
  tickets_sold?: number;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  on_sale: 'success',
  scheduled: 'info',
  draft: 'ghost',
  sold_out: 'warning',
  completed: 'ghost',
  cancelled: 'error',
};

const typeLabels: Record<string, string> = {
  concert: 'Concert',
  festival: 'Festival',
  corporate: 'Corporate',
  theater: 'Theater',
  sports: 'Sports',
  conference: 'Conference',
  other: 'Other',
};

const columns: ListPageColumn<Event>[] = [
  {
    key: 'name',
    label: 'Event',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'event_type',
    label: 'Type',
    accessor: 'event_type',
    render: (value) => typeLabels[String(value)] || String(value),
  },
  {
    key: 'venue',
    label: 'Venue',
    accessor: (row) => row.venue_name || '—',
  },
  {
    key: 'location',
    label: 'Location',
    accessor: (row) => row.venue_city || '—',
  },
  {
    key: 'start_date',
    label: 'Date',
    accessor: 'start_date',
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
  {
    key: 'capacity',
    label: 'Capacity',
    accessor: 'capacity',
    render: (value) => value ? Number(value).toLocaleString() : '—',
  },
  {
    key: 'tickets_sold',
    label: 'Sold',
    accessor: 'tickets_sold',
    render: (value) => value ? Number(value).toLocaleString() : '0',
  },
  {
    key: 'status',
    label: 'Status',
    accessor: 'status',
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'ghost'}>
        {String(value).replace('_', ' ').toUpperCase()}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'on_sale', label: 'On Sale' },
      { value: 'sold_out', label: 'Sold Out' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  {
    key: 'event_type',
    label: 'Type',
    options: [
      { value: 'concert', label: 'Concert' },
      { value: 'festival', label: 'Festival' },
      { value: 'corporate', label: 'Corporate' },
      { value: 'theater', label: 'Theater' },
      { value: 'sports', label: 'Sports' },
      { value: 'conference', label: 'Conference' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Event Name', type: 'text', required: true },
  { name: 'event_type', label: 'Event Type', type: 'select', required: true, options: [
    { value: 'concert', label: 'Concert' },
    { value: 'festival', label: 'Festival' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'theater', label: 'Theater' },
    { value: 'sports', label: 'Sports' },
    { value: 'conference', label: 'Conference' },
  ]},
  { name: 'venue_name', label: 'Venue Name', type: 'text' },
  { name: 'venue_city', label: 'City', type: 'text' },
  { name: 'venue_state', label: 'State', type: 'text' },
  { name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { name: 'end_date', label: 'End Date', type: 'date' },
  { name: 'capacity', label: 'Capacity', type: 'number' },
  { name: 'description', label: 'Description', type: 'textarea' },
];

export default function EventsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: eventsData, isLoading, error, refetch } = useEvents();
  const { data: stats } = useEventStats();
  const createMutation = useCreateEvent();
  const deleteMutation = useDeleteEvent();

  const events = eventsData?.events || [];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // RBAC: Check if user has admin access for create/edit/delete operations
  const canManageEvents = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const rowActions: ListPageAction<Event>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedEvent(row);
        setDrawerOpen(true);
      },
    },
    ...(canManageEvents ? [
      {
        id: 'edit',
        label: 'Edit',
        icon: <Pencil className="size-4" />,
        onClick: (row: Event) => router.push(`/events/${row.id}/edit`),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="size-4" />,
        variant: 'danger' as const,
        onClick: (row: Event) => {
          setEventToDelete(row);
          setDeleteConfirmOpen(true);
        },
      },
    ] : []),
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      organization_id: 'default-org',
      name: String(data.name),
      event_type: data.event_type as Event['event_type'],
      venue_name: data.venue_name ? String(data.venue_name) : undefined,
      venue_city: data.venue_city ? String(data.venue_city) : undefined,
      venue_state: data.venue_state ? String(data.venue_state) : undefined,
      start_date: String(data.start_date),
      end_date: data.end_date ? String(data.end_date) : undefined,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      description: data.description ? String(data.description) : undefined,
      status: 'draft',
      visibility: 'public',
    });
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (eventToDelete) {
      await deleteMutation.mutateAsync(eventToDelete.id);
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    }
  };

  const pageStats = [
    { label: 'Total Events', value: stats?.total || 0 },
    { label: 'Total Capacity', value: stats?.total_capacity?.toLocaleString() || '0' },
    { label: 'Tickets Sold', value: stats?.total_tickets_sold?.toLocaleString() || '0' },
    { label: 'On Sale', value: stats?.by_status?.on_sale || 0 },
  ];

  const detailSections: DetailSection[] = selectedEvent ? [
    {
      id: 'overview',
      title: 'Event Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {selectedEvent.name}</Body>
          <Body size="sm"><strong>Type:</strong> {typeLabels[selectedEvent.event_type] || selectedEvent.event_type}</Body>
          <Body size="sm"><strong>Venue:</strong> {selectedEvent.venue_name || '—'}</Body>
          <Body size="sm"><strong>Location:</strong> {selectedEvent.venue_city || '—'}</Body>
          <Body size="sm"><strong>Date:</strong> {new Date(selectedEvent.start_date).toLocaleDateString()}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedEvent.status}</Body>
          <Body size="sm"><strong>Capacity:</strong> {selectedEvent.capacity?.toLocaleString() || '—'}</Body>
          <Body size="sm"><strong>Tickets Sold:</strong> {selectedEvent.tickets_sold?.toLocaleString() || '0'}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Event>
        title="Events"
        subtitle="Manage all events and shows"
        data={events}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search events..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => {
          setSelectedEvent(row);
          setDrawerOpen(true);
        }}
        createLabel="Create Event"
        onCreate={canManageEvents ? () => setCreateModalOpen(true) : undefined}
        stats={pageStats}
        emptyMessage="No events found"
        emptyAction={canManageEvents ? { label: 'Create Event', onClick: () => setCreateModalOpen(true) } : undefined}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Event"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedEvent?.name || 'Event Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </>
  );
}
