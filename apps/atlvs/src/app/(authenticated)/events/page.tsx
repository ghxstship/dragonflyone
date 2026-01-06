'use client';

/**
 * Events Page - SSOT Compliant
 * 
 * Uses useEntityConfig for columns, filters, and form fields from entity registry.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useEvents, useEventStats, useCreateEvent, useDeleteEvent, type Event as EventsHookEvent } from '../../../hooks/useEvents';
import { useAuthContext, ATLVS_ADMIN_ROLES, useEntityConfig, useEntityData } from '@ghxstship/config';
import {
  ListPage, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body,
  type ListPageRowAction, type DetailSection,
} from '@ghxstship/ui';

type Event = EventsHookEvent & Record<string, unknown>;

export default function EventsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: eventsData, isLoading, error, refetch } = useEvents();
  const { data: stats } = useEventStats();
  const createMutation = useCreateEvent();
  const deleteMutation = useDeleteEvent();

  // SSOT: Get columns, filters, and formFields from entity registry
  const { columns, filters, formFields, names } = useEntityConfig({ entityName: 'events' });

  const events = eventsData?.events || [];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);

  const {
    entityIds,
    entityType,
    entitySelector,
    isLoading: entityLoading,
    error: entityError,
    refetch: entityRefetch,
  } = useEntityData<Event>({
    entityType: 'events',
    data: events,
    isLoading,
    error: error ?? null,
    refetch,
  });

  const selectedEvent = selectedEventId ? entitySelector(selectedEventId) : null;
  const eventToDelete = eventToDeleteId ? entitySelector(eventToDeleteId) : null;

  // RBAC: Check if user has admin access for create/edit/delete operations
  const canManageEvents = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const rowActions: ListPageRowAction<Event>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (id) => {
        setSelectedEventId(id);
        setDrawerOpen(true);
      },
    },
    ...(canManageEvents ? [
      {
        id: 'edit',
        label: 'Edit',
        icon: <Pencil className="size-4" />,
        onClick: (_id: string, row: Event) => router.push(`/events/${row.id}/edit`),
      },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="size-4" />,
        variant: 'danger' as const,
        onClick: (id: string) => {
          setEventToDeleteId(id);
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
    entityRefetch();
  };

  const handleDelete = async () => {
    if (eventToDeleteId) {
      await deleteMutation.mutateAsync(eventToDeleteId);
      setDeleteConfirmOpen(false);
      setEventToDeleteId(null);
      entityRefetch();
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
          <Body size="sm"><strong>Type:</strong> {selectedEvent.event_type}</Body>
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
        title={names.plural}
        subtitle={`Manage all ${names.plural.toLowerCase()}`}
        entityType={entityType}
        entityIds={entityIds}
        entitySelector={entitySelector}
        isLoading={entityLoading}
        error={entityError}
        onRetry={entityRefetch}
        searchPlaceholder={`Search ${names.plural.toLowerCase()}...`}
        filters={filters}
        rowActions={rowActions}
        createLabel={`Create ${names.singular}`}
        onCreate={canManageEvents ? () => setCreateModalOpen(true) : undefined}
        stats={pageStats}
        emptyMessage={`No ${names.plural.toLowerCase()} found`}
        emptyAction={canManageEvents ? { label: `Create ${names.singular}`, onClick: () => setCreateModalOpen(true) } : undefined}
        tableConfig={{ columns: columns as unknown[] }}
        onEntityClick={(id) => {
          setSelectedEventId(id);
          setDrawerOpen(true);
        }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Create ${names.singular}`}
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Create"
        mode="create"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedEvent?.name || `${names.singular} Details`}
        sections={detailSections}
        record={selectedEvent}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title={`Delete ${names.singular}`}
        message={eventToDelete ? `Delete ${eventToDelete.name}? This action cannot be undone.` : `Are you sure you want to delete this ${names.singular.toLowerCase()}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        variant="danger"
      />
    </>
  );
}
