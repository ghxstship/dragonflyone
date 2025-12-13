'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, MapPin } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useLocations, useCreateLocation, useDeleteLocation, type Location } from '../../hooks/useLocations';
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
} from '@ghxstship/ui';

const typeColors: Record<string, 'success' | 'warning' | 'info' | 'solid' | 'outline'> = {
  warehouse: 'solid',
  venue: 'info',
  popup: 'warning',
  virtual: 'outline',
  storage: 'solid',
  office: 'info',
};

const columns: ListPageColumn<Location>[] = [
  {
    key: 'name',
    label: 'Location Name',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'type',
    label: 'Type',
    accessor: 'type',
    render: (value) => (
      <Badge variant={typeColors[String(value)] || 'outline'}>
        {String(value).toUpperCase()}
      </Badge>
    ),
  },
  {
    key: 'address',
    label: 'Address',
    accessor: 'address',
    render: (value) => value || '—',
  },
  {
    key: 'capacity',
    label: 'Capacity',
    accessor: 'capacity',
    render: (value) => value ? Number(value).toLocaleString() : '—',
  },
  {
    key: 'is_active',
    label: 'Status',
    accessor: 'is_active',
    render: (value) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'type',
    label: 'Type',
    options: [
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'venue', label: 'Venue' },
      { value: 'popup', label: 'Pop-up' },
      { value: 'virtual', label: 'Virtual' },
      { value: 'storage', label: 'Storage' },
      { value: 'office', label: 'Office' },
    ],
  },
  {
    key: 'is_active',
    label: 'Status',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Location Name', type: 'text', required: true, colSpan: 2 },
  {
    name: 'type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'venue', label: 'Venue' },
      { value: 'popup', label: 'Pop-up' },
      { value: 'virtual', label: 'Virtual' },
      { value: 'storage', label: 'Storage' },
      { value: 'office', label: 'Office' },
    ],
  },
  { name: 'capacity', label: 'Capacity', type: 'number' },
  { name: 'address', label: 'Address', type: 'textarea', colSpan: 2 },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function LocationsPage() {
  const router = useRouter();
  const { data: locations, isLoading, error, refetch } = useLocations();
  const createMutation = useCreateLocation();
  const deleteMutation = useDeleteLocation();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  const rowActions: ListPageAction<Location>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedLocation(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => router.push(`/locations/${row.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setLocationToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      organization_id: 'default-org',
      name: String(data.name),
      type: (data.type as Location['type']) || 'warehouse',
      address: data.address ? String(data.address) : undefined,
      capacity: data.capacity ? Number(data.capacity) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
      is_active: Boolean(data.is_active ?? true),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (locationToDelete) {
      await deleteMutation.mutateAsync(locationToDelete.id);
      setDeleteConfirmOpen(false);
      setLocationToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Locations', value: locations?.length || 0 },
    { label: 'Active', value: locations?.filter(l => l.is_active).length || 0 },
    { label: 'Warehouses', value: locations?.filter(l => l.type === 'warehouse').length || 0 },
    { label: 'Venues', value: locations?.filter(l => l.type === 'venue').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedLocation
    ? [
        {
          id: 'overview',
          title: 'Location Details',
          content: (
            <Grid cols={2} gap={4}>
              <Body size="sm"><strong>Name:</strong> {selectedLocation.name}</Body>
              <Body size="sm"><strong>Type:</strong> {selectedLocation.type}</Body>
              <Body size="sm"><strong>Address:</strong> {selectedLocation.address || '—'}</Body>
              <Body size="sm"><strong>Capacity:</strong> {selectedLocation.capacity?.toLocaleString() || '—'}</Body>
              <Body size="sm"><strong>Status:</strong> {selectedLocation.is_active ? 'Active' : 'Inactive'}</Body>
              <Body size="sm"><strong>Notes:</strong> {selectedLocation.notes || '—'}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <AtlvsAppLayout>
      <ListPage
        title="Locations"
        description="Manage warehouses, venues, and storage locations"
        icon={<MapPin className="size-6" />}
        data={locations || []}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        stats={stats}
        loading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Add Location"
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Location"
        fields={formFields}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedLocation?.name || 'Location Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Location"
        message={`Are you sure you want to delete "${locationToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
