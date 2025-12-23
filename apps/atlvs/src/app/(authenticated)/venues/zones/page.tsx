'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
// Layout provided by route group
import { useVenueZones, useVenues, useCreateVenueZone, useDeleteVenueZone, type VenueZone } from '../../../../hooks/useVenues';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  Select,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

const zoneTypeLabels: Record<string, string> = {
  stage: 'Stage',
  audience: 'Audience',
  backstage: 'Backstage',
  vip: 'VIP',
  vendor: 'Vendor',
  parking: 'Parking',
  loading: 'Loading',
  storage: 'Storage',
  other: 'Other',
};

const accessLevelLabels: Record<string, string> = {
  public: 'Public',
  restricted: 'Restricted',
  staff_only: 'Staff Only',
  vip_only: 'VIP Only',
};

const accessLevelColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  public: 'success',
  restricted: 'warning',
  staff_only: 'error',
  vip_only: 'info',
};

const columns: ListPageColumn<VenueZone>[] = [
  { 
    key: 'name', 
    label: 'Zone', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'venue', 
    label: 'Venue', 
    accessor: (row) => row.venue?.name || '—',
    sortable: true,
  },
  { 
    key: 'zone_type', 
    label: 'Type', 
    accessor: 'zone_type', 
    render: (value) => zoneTypeLabels[String(value)] || String(value)
  },
  { 
    key: 'capacity', 
    label: 'Capacity', 
    accessor: 'capacity', 
    sortable: true,
    render: (value) => value ? Number(value).toLocaleString() : '—'
  },
  { 
    key: 'access_level', 
    label: 'Access', 
    accessor: 'access_level', 
    render: (value) => (
      <Badge variant={accessLevelColors[String(value)] || 'ghost'}>
        {accessLevelLabels[String(value)] || String(value)}
      </Badge>
    )
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
];

function VenueZonesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const venueIdParam = searchParams.get('venue');
  
  const [selectedVenueId, setSelectedVenueId] = useState(venueIdParam || '');
  const { data: zones, isLoading, error, refetch } = useVenueZones(selectedVenueId ? { venueId: selectedVenueId } : undefined);
  const { data: venues } = useVenues();
  const createMutation = useCreateVenueZone();
  const deleteMutation = useDeleteVenueZone();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<VenueZone | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<VenueZone | null>(null);

  const formFields: FormFieldConfig[] = [
    { name: 'name', label: 'Zone Name', type: 'text', required: true, placeholder: 'e.g., Main Stage', colSpan: 2 },
    { name: 'venue_id', label: 'Venue', type: 'select', required: true, options: venues?.map(v => ({ value: v.id, label: v.name })) || [] },
    { name: 'zone_type', label: 'Zone Type', type: 'select', required: true, options: Object.entries(zoneTypeLabels).map(([value, label]) => ({ value, label })) },
    { name: 'access_level', label: 'Access Level', type: 'select', required: true, options: Object.entries(accessLevelLabels).map(([value, label]) => ({ value, label })) },
    { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '0' },
    { name: 'square_footage', label: 'Square Footage', type: 'number', placeholder: '0' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Zone description...' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'zone_type', 
      label: 'Type', 
      options: Object.entries(zoneTypeLabels).map(([value, label]) => ({ value, label }))
    },
    { 
      key: 'access_level', 
      label: 'Access', 
      options: Object.entries(accessLevelLabels).map(([value, label]) => ({ value, label }))
    },
    { 
      key: 'is_active', 
      label: 'Status', 
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ]
    },
  ];

  const rowActions: ListPageAction<VenueZone>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/venues/zones/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedZone(row); setDrawerOpen(true); } 
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setZoneToDelete(row); setDeleteDialogOpen(true); }
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      venue_id: data.venue_id as string,
      name: data.name as string,
      zone_type: data.zone_type as VenueZone['zone_type'],
      access_level: data.access_level as VenueZone['access_level'],
      capacity: data.capacity as number | undefined,
      square_footage: data.square_footage as number | undefined,
      description: data.description as string | undefined,
      is_active: data.is_active as boolean ?? true,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (zoneToDelete) {
      await deleteMutation.mutateAsync(zoneToDelete.id);
      setDeleteDialogOpen(false);
      setZoneToDelete(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Zones', value: zones?.length || 0 },
    { label: 'Active', value: zones?.filter(z => z.is_active).length || 0 },
    { label: 'Total Capacity', value: (zones?.reduce((sum, z) => sum + (z.capacity || 0), 0) || 0).toLocaleString() },
    { label: 'Venues', value: new Set(zones?.map(z => z.venue_id)).size },
  ];

  const detailSections: DetailSection[] = selectedZone ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Venue</Body>
            <Body>{selectedZone.venue?.name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Type</Body>
            <Body>{zoneTypeLabels[selectedZone.zone_type] || selectedZone.zone_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Access Level</Body>
            <Badge variant={accessLevelColors[selectedZone.access_level] || 'ghost'}>
              {accessLevelLabels[selectedZone.access_level] || selectedZone.access_level}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={selectedZone.is_active ? 'success' : 'ghost'}>
              {selectedZone.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'capacity',
      title: 'Capacity & Size',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Capacity</Body>
            <Body>{selectedZone.capacity?.toLocaleString() || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Square Footage</Body>
            <Body>{selectedZone.square_footage?.toLocaleString() || '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedZone.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <>
      <ListPage<VenueZone>
        title="Venue Zones"
        subtitle="Manage zones and areas within venues"
        data={zones || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search zones..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/venues/zones/${row.id}`)}
        createLabel="Add Zone"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No zones yet"
        emptyAction={{ label: 'Add First Zone', onClick: () => setCreateModalOpen(true) }}
        headerContent={
          <Select
            value={selectedVenueId}
            onChange={(e) => {
              setSelectedVenueId(e.target.value);
              const params = new URLSearchParams();
              if (e.target.value) params.set('venue', e.target.value);
              router.push(`/venues/zones${params.toString() ? `?${params.toString()}` : ''}`);
            }}
            className="w-48 border-2 border-grey-300 px-3 py-2"
          >
            <option value="">All Venues</option>
            {venues?.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </Select>
        }
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/venues/zones/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Zone"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ 
          is_active: true, 
          zone_type: 'other', 
          access_level: 'public',
          venue_id: selectedVenueId || undefined,
        }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedZone(null); }}
        record={selectedZone}
        title={(z) => z.name}
        subtitle={(z) => zoneTypeLabels[z.zone_type] || z.zone_type}
        sections={detailSections}
        onEdit={(z) => router.push(`/venues/zones/${z.id}`)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Zone"
        message={`Are you sure you want to delete "${zoneToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setZoneToDelete(null); }}
      />
    </>
  );
}

export default function VenueZonesPage() {
  return (
    <Suspense fallback={<Stack className="flex min-h-screen items-center justify-center"><Body>Loading...</Body></Stack>}>
      <VenueZonesPageContent />
    </Suspense>
  );
}
