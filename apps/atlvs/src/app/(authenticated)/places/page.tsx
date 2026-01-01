'use client';

/**
 * Unified Places Page
 * 
 * SSOT-compliant: Uses entity registry for columns and filters.
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  getEntityColumns,
  getEntityFilters,
} from '@ghxstship/config';
import {
  ListPage, useToast,
  type ListPageAction,
} from "@ghxstship/ui";
import {
  usePlacesQuery,
  useDeletePlace,
  type Place,
} from '@/hooks/usePlacesQuery';

export default function PlacesPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  const columns = getEntityColumns<Place>('places');
  const filters = getEntityFilters('places');

  const canManagePlaces = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: places = [], isLoading, error, refetch } = usePlacesQuery({});
  const deleteMutation = useDeletePlace();

  const handleDelete = async (place: Place) => {
    if (!confirm(`Are you sure you want to delete ${place.name}?`)) return;
    try {
      await deleteMutation.mutateAsync(place.id);
      toast.success("Place Deleted", `${place.name} has been deleted.`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete place');
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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
