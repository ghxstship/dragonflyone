'use client';

/**
 * Unified People Page
 * 
 * SSOT-compliant: Uses entity registry for status colors and formatters.
 */

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Mail, Phone, Users, Briefcase, Music, Heart, UserCheck, Eye, Pencil, Trash2 } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  PEOPLE_STATUS_COLORS,
  PEOPLE_TYPE_COLORS,
  formatDate,
  useEntityConfig,
} from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useToast,
  type ListPageColumn, type ListPageAction,
} from "@ghxstship/ui";
import {
  usePeopleQuery,
  useDeletePerson,
  type Person,
  type PersonType,
} from '@/hooks/usePeopleQuery';

const TYPE_CONFIG: Record<PersonType, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All People', icon: <Users className="h-4 w-4" />, color: 'outline' },
  contact: { label: 'Contacts', icon: <User className="h-4 w-4" />, color: 'info' },
  employee: { label: 'Employees', icon: <Briefcase className="h-4 w-4" />, color: 'success' },
  crew: { label: 'Crew', icon: <Users className="h-4 w-4" />, color: 'warning' },
  artist: { label: 'Artists', icon: <Music className="h-4 w-4" />, color: 'error' },
  volunteer: { label: 'Volunteers', icon: <Heart className="h-4 w-4" />, color: 'info' },
  candidate: { label: 'Candidates', icon: <UserCheck className="h-4 w-4" />, color: 'outline' },
};

export default function PeoplePage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  // SSOT: Get filters from entity registry (columns have custom renders)
  const { filters } = useEntityConfig<Person>({ entityName: 'people' });

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

  
  const columns: ListPageColumn<Person>[] = [
    {
      key: 'display_name', label: 'Name', accessor: 'display_name', sortable: true,
      render: (_value: unknown, person) => (
        <Stack direction="horizontal" gap={3} className="items-center">
          <Box className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center overflow-hidden">
            {person.avatar_url ? (
              <Image src={person.avatar_url} alt={person.display_name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <Text className="text-primary font-weight-medium">{person.first_name?.charAt(0)}{person.last_name?.charAt(0)}</Text>
            )}
          </Box>
          <Stack gap={0}>
            <Text className="font-weight-medium">{person.display_name}</Text>
            {person.preferred_name && <Body size="xs" className="text-muted-foreground">&ldquo;{person.preferred_name}&rdquo;</Body>}
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'email', label: 'Contact', accessor: 'email',
      render: (_value: unknown, person) => (
        <Stack gap={1}>
          {person.email && <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground"><Mail className="h-3 w-3" /><Text size="xs">{person.email}</Text></Stack>}
          {person.phone && <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground"><Phone className="h-3 w-3" /><Text size="xs">{person.phone}</Text></Stack>}
        </Stack>
      ),
    },
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    {
      key: 'primary_type', label: 'Type', accessor: 'primary_type', sortable: true,
      render: (_value: unknown, person) => (
        <Stack direction="horizontal" gap={1} className="flex-wrap">
          {person.person_types.slice(0, 2).map((type) => (
            <Badge key={type} variant={PEOPLE_TYPE_COLORS[type] || 'outline'} className="text-body-xs">
              {TYPE_CONFIG[type]?.label.replace('s', '') || type}
            </Badge>
          ))}
          {person.person_types.length > 2 && <Badge variant="outline" className="text-body-xs">+{person.person_types.length - 2}</Badge>}
        </Stack>
      ),
    },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_value: unknown, person) => <Badge variant={PEOPLE_STATUS_COLORS[person.status] || 'outline'}>{person.status.toUpperCase()}</Badge>,
    },
    {
      key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true,
      render: (_value: unknown, person) => <Text size="sm" className="text-muted-foreground">{formatDate(person.updated_at)}</Text>,
    },
  ];

  // SSOT: Filters are provided by useEntityConfig (line 47)

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
