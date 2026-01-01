'use client';

/**
 * Unified People Page
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
  usePeopleQuery,
  useDeletePerson,
  type Person,
} from '@/hooks/usePeopleQuery';

export default function PeoplePage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  const columns = getEntityColumns<Person>('people');
  const filters = getEntityFilters('people');

  const canManagePeople = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: people = [], isLoading, error, refetch } = usePeopleQuery({});
  const deleteMutation = useDeletePerson();

  const handleDelete = async (person: Person) => {
    if (!confirm(`Are you sure you want to delete ${person.display_name}?`)) return;
    try {
      await deleteMutation.mutateAsync(person.id);
      toast.success("Person Deleted", `${person.display_name} has been deleted.`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete person');
    }
  };

  const handleExport = async () => {
    const csv = [
      ['Name', 'Email', 'Phone', 'Title', 'Type', 'Status'].join(','),
      ...people.map(p => [p.display_name, p.email || '', p.phone || '', p.title || '', p.primary_type, p.status].map(v => `"${v}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `people-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rowActions: ListPageAction<Person>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (p) => router.push(`/people/${p.id}`) },
    ...(canManagePeople ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (p: Person) => router.push(`/people/${p.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (p: Person) => handleDelete(p) },
    ] : []),
  ];

  return (
    <ListPage<Person>
      title="People"
      subtitle="Unified directory of contacts, employees, crew, artists, and more"
      data={people}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search by name, email, or title..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(p) => router.push(`/people/${p.id}`)}
      createLabel="Add Person"
      onCreate={canManagePeople ? () => router.push('/people/new') : undefined}
      onExport={handleExport}
      emptyMessage="No people yet"
      emptyAction={canManagePeople ? { label: 'Add Person', onClick: () => router.push('/people/new') } : undefined}
      entityType="people"
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
