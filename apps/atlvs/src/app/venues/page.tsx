'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, MapPin, Building2, DollarSign, Trash2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useVenues, useVenueStats, useDeleteVenue } from '../../hooks/useVenues';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Venue {
  id: string;
  name: string;
  venue_type: string;
  address?: string;
  city?: string;
  state?: string;
  capacity?: number;
  rental_cost?: number;
  status: string;
  contact_name?: string;
  contact_email?: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  contracted: 'success',
  confirmed: 'warning',
  prospective: 'info',
  completed: 'default',
};

const venueTypeLabels: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  hybrid: 'Hybrid',
};

const columns: ListPageColumn<Venue>[] = [
  { 
    key: 'name', 
    label: 'Venue', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'venue_type', 
    label: 'Type', 
    accessor: 'venue_type', 
    render: (value) => venueTypeLabels[String(value)] || String(value)
  },
  { 
    key: 'location', 
    label: 'Location', 
    accessor: (row) => row.city && row.state ? `${row.city}, ${row.state}` : row.city || row.state || '—',
  },
  { 
    key: 'capacity', 
    label: 'Capacity', 
    accessor: 'capacity', 
    sortable: true,
    render: (value) => value ? Number(value).toLocaleString() : '—'
  },
  { 
    key: 'rental_cost', 
    label: 'Rental Cost', 
    accessor: 'rental_cost', 
    sortable: true,
    render: (value) => value ? `$${Number(value).toLocaleString()}` : '—'
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'default'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Venue Name', type: 'text', required: true, placeholder: 'e.g., Convention Center', colSpan: 2 },
  { name: 'venue_type', label: 'Venue Type', type: 'select', required: true, options: [
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'hybrid', label: 'Hybrid' },
  ]},
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'prospective', label: 'Prospective' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'contracted', label: 'Contracted' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ]},
  { name: 'address', label: 'Address', type: 'text', colSpan: 2, placeholder: '123 Main Street' },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Los Angeles' },
  { name: 'state', label: 'State', type: 'text', placeholder: 'CA' },
  { name: 'country', label: 'Country', type: 'text', placeholder: 'USA' },
  { name: 'postal_code', label: 'Postal Code', type: 'text', placeholder: '90001' },
  { name: 'capacity', label: 'Capacity', type: 'number', placeholder: '0' },
  { name: 'square_footage', label: 'Square Footage', type: 'number', placeholder: '0' },
  { name: 'rental_cost', label: 'Rental Cost', type: 'number', placeholder: '0.00' },
  { name: 'deposit_amount', label: 'Deposit Amount', type: 'number', placeholder: '0.00' },
  { name: 'contact_name', label: 'Contact Name', type: 'text', placeholder: 'John Smith' },
  { name: 'contact_email', label: 'Contact Email', type: 'email', placeholder: 'john@venue.com' },
  { name: 'contact_phone', label: 'Contact Phone', type: 'text', placeholder: '+1 (555) 000-0000' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
];

export default function VenuesPage() {
  const router = useRouter();
  const { data: venues, isLoading, error, refetch } = useVenues();
  const { data: stats } = useVenueStats();
  const deleteMutation = useDeleteVenue();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'prospective', label: 'Prospective' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'contracted', label: 'Contracted' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
      ]
    },
    { 
      key: 'venue_type', 
      label: 'Type', 
      options: [
        { value: 'indoor', label: 'Indoor' },
        { value: 'outdoor', label: 'Outdoor' },
        { value: 'hybrid', label: 'Hybrid' },
      ]
    },
  ];

  const rowActions: ListPageAction<Venue>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/venues/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedVenue(row); setDrawerOpen(true); } 
    },
    { 
      id: 'zones', 
      label: 'Manage Zones', 
      icon: <MapPin className="size-4" />, 
      onClick: (row) => router.push(`/venues/zones?venue=${row.id}`) 
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setVenueToDelete(row); setDeleteDialogOpen(true); }
    },
  ];

  const handleCreate = async (_data: Record<string, unknown>) => {
    // TODO: Implement create
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (venueToDelete) {
      await deleteMutation.mutateAsync(venueToDelete.id);
      setDeleteDialogOpen(false);
      setVenueToDelete(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Venues', value: stats?.total || 0 },
    { label: 'Confirmed', value: stats?.confirmed || 0 },
    { label: 'Total Capacity', value: (stats?.totalCapacity || 0).toLocaleString() },
    { label: 'Total Rental', value: `$${(stats?.totalRentalCost || 0).toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedVenue ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{venueTypeLabels[selectedVenue.venue_type] || selectedVenue.venue_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedVenue.status] || 'default'}>
              {selectedVenue.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Location</Body>
            <Body>{selectedVenue.city && selectedVenue.state ? `${selectedVenue.city}, ${selectedVenue.state}` : '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Capacity</Body>
            <Body>{selectedVenue.capacity?.toLocaleString() || '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Contact Name</Body>
            <Body>{selectedVenue.contact_name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Email</Body>
            <Body>{selectedVenue.contact_email || '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Venue>
        title="Venues"
        subtitle="Manage production venues and locations"
        data={venues || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search venues..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/venues/${row.id}`)}
        createLabel="Add Venue"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No venues yet"
        emptyAction={{ label: 'Add First Venue', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Venues' }]}
        quickActions={[
          { id: 'zones', label: 'All Zones', icon: <MapPin className="size-4" />, onClick: () => router.push('/venues/zones') },
          { id: 'maps', label: 'Venue Maps', icon: <Building2 className="size-4" />, onClick: () => router.push('/venues/maps') },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Venue"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ status: 'prospective', venue_type: 'indoor' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedVenue}
        title={(v) => v.name}
        subtitle={(v) => venueTypeLabels[v.venue_type] || v.venue_type}
        sections={detailSections}
        onEdit={(v) => router.push(`/venues/${v.id}`)}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Venue"
        message={`Are you sure you want to delete "${venueToDelete?.name}"? This will also delete all associated zones.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setVenueToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
