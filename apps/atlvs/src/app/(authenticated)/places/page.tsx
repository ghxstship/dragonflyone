'use client';

/**
 * Unified Places Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Building2, Warehouse, Theater, Grid3X3, DoorOpen, Box as BoxIcon, Map, Briefcase, Eye, Pencil, Trash2, Users, Maximize } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge,
  Body,
  Box as UIBox,
  ListPage,
  Stack,
  Text,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from '@ghxstship/ui';
import {
  usePlacesQuery,
  useDeletePlace,
  type Place,
  type PlaceType,
} from '@/hooks/usePlacesQuery';

const TYPE_CONFIG: Record<PlaceType, { label: string; icon: React.ReactNode }> = {
  all: { label: 'All Places', icon: <MapPin className="h-4 w-4" /> },
  venue: { label: 'Venues', icon: <Building2 className="h-4 w-4" /> },
  warehouse: { label: 'Warehouses', icon: <Warehouse className="h-4 w-4" /> },
  stage: { label: 'Stages', icon: <Theater className="h-4 w-4" /> },
  zone: { label: 'Zones', icon: <Grid3X3 className="h-4 w-4" /> },
  room: { label: 'Rooms', icon: <DoorOpen className="h-4 w-4" /> },
  space: { label: 'Spaces', icon: <BoxIcon className="h-4 w-4" /> },
  site: { label: 'Sites', icon: <Map className="h-4 w-4" /> },
  office: { label: 'Offices', icon: <Briefcase className="h-4 w-4" /> },
  other: { label: 'Other', icon: <MapPin className="h-4 w-4" /> },
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  pending: 'warning',
  archived: 'error',
  draft: 'outline',
};

export default function PlacesPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canManagePlaces = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: places = [], isLoading, error, refetch } = usePlacesQuery({});
  const deleteMutation = useDeletePlace();

  const handleDelete = async (place: Place) => {
    if (!confirm(`Are you sure you want to delete ${place.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(place.id);
      addNotification({ type: 'success', title: 'Place Deleted', message: `${place.name} has been deleted.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Failed to delete place' });
    }
  };

  const handleExport = async () => {
    const csv = [
      ['Name', 'Code', 'Type', 'Capacity', 'Square Footage', 'Status'].join(','),
      ...places.map(p => [p.name, p.code || '', p.place_type, p.capacity?.toString() || '', p.square_footage?.toString() || '', p.status].map(v => `"${v}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `places-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatNumber = (num: number | null) => num === null ? '—' : new Intl.NumberFormat('en-US').format(num);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const columns: ListPageColumn<Place>[] = [
    {
      key: 'name', label: 'Place', accessor: 'name', sortable: true,
      render: (_, place) => (
        <Stack direction="horizontal" gap={3} className="items-center">
          <UIBox className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center overflow-hidden">
            {place.image_url ? (
              <Image src={place.image_url} alt={place.name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              TYPE_CONFIG[place.place_type]?.icon || <MapPin className="h-5 w-5 text-primary" />
            )}
          </UIBox>
          <Stack gap={0}>
            <Text className="font-weight-medium">{place.name}</Text>
            {place.code && <Body size="xs" className="text-muted-foreground font-mono">{place.code}</Body>}
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'place_type', label: 'Type', accessor: 'place_type', sortable: true,
      render: (_, place) => <Badge variant="outline" className="capitalize">{place.place_type}</Badge>,
    },
    {
      key: 'capacity', label: 'Capacity', accessor: 'capacity', sortable: true,
      render: (_, place) => place.capacity ? (
        <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
          <Users className="h-3 w-3" /><Text size="sm">{formatNumber(place.capacity)}</Text>
        </Stack>
      ) : <Text size="sm" className="text-muted-foreground">—</Text>,
    },
    {
      key: 'square_footage', label: 'Size', accessor: 'square_footage', sortable: true,
      render: (_, place) => place.square_footage ? (
        <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
          <Maximize className="h-3 w-3" /><Text size="sm">{formatNumber(place.square_footage)} sq ft</Text>
        </Stack>
      ) : <Text size="sm" className="text-muted-foreground">—</Text>,
    },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, place) => <Badge variant={STATUS_COLORS[place.status] || 'outline'}>{place.status.toUpperCase()}</Badge>,
    },
    {
      key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true,
      render: (_, place) => <Text size="sm" className="text-muted-foreground">{formatDate(place.updated_at)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'place_type', label: 'Type', options: (Object.keys(TYPE_CONFIG) as PlaceType[]).map((type) => ({ value: type, label: TYPE_CONFIG[type].label })) },
    { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }, { value: 'archived', label: 'Archived' }] },
  ];

  const rowActions: ListPageAction<Place>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (p) => router.push(`/places/${p.id}`) },
    ...(canManagePlaces ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (p: Place) => router.push(`/places/${p.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (p: Place) => handleDelete(p) },
    ] : []),
  ];

  return (
    <ListPage<Place>
      title="Places"
      subtitle="Unified directory of venues, warehouses, stages, and locations"
      data={places}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search by name or code..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(p) => router.push(`/places/${p.id}`)}
      createLabel="Add Place"
      onCreate={canManagePlaces ? () => router.push('/places/new') : undefined}
      onExport={handleExport}
      emptyMessage="No places yet"
      emptyAction={canManagePlaces ? { label: 'Add Place', onClick: () => router.push('/places/new') } : undefined}
      entityType="places"
      showFavorite
      showSettings
    />
  );
}
