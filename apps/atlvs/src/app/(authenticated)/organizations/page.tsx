'use client';

/**
 * Unified Organizations Page
 * Consolidates: vendors, sponsors, clients, partners, agencies
 * Single source of truth aligned with legend_organizations table
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Building2, Mail, Phone, Users, Briefcase, Heart, Handshake, Building, Eye, Pencil, Trash2} from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useNotifications} from '@ghxstship/ui';
import {
  useOrganizationsQuery,
  useDeleteOrganization,
  type Organization,
  type OrgType,
} from '@/hooks/useOrganizationsQuery';

const TYPE_CONFIG: Record<OrgType, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All Organizations', icon: <Building2 className="h-4 w-4" />, color: 'outline' },
  vendor: { label: 'Vendors', icon: <Briefcase className="h-4 w-4" />, color: 'info' },
  sponsor: { label: 'Sponsors', icon: <Heart className="h-4 w-4" />, color: 'success' },
  client: { label: 'Clients', icon: <Users className="h-4 w-4" />, color: 'warning' },
  partner: { label: 'Partners', icon: <Handshake className="h-4 w-4" />, color: 'info' },
  agency: { label: 'Agencies', icon: <Building className="h-4 w-4" />, color: 'outline' },
  subsidiary: { label: 'Subsidiaries', icon: <Building2 className="h-4 w-4" />, color: 'outline' },
  other: { label: 'Other', icon: <Building2 className="h-4 w-4" />, color: 'outline' },
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  pending: 'warning',
  archived: 'error',
  draft: 'outline',
};

export default function OrganizationsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();

  const canManageOrgs = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  // Fetch all organizations - ListPage handles client-side filtering
  const { 
    data: organizations = [], 
    isLoading, 
    error,
    refetch,
  } = useOrganizationsQuery({});

  const deleteMutation = useDeleteOrganization();

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete ${org.name}?`)) return;
    
    try {
      await deleteMutation.mutateAsync(org.id);
      addNotification({
        type: 'success',
        title: 'Organization Deleted',
        message: `${org.name} has been deleted.`,
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete organization',
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['Name', 'Type', 'Email', 'Phone', 'Website', 'Industry', 'Status'].join(','),
      ...organizations.map(o => [
        o.name,
        o.org_type,
        o.email || '',
        o.phone || '',
        o.website || '',
        o.industry || '',
        o.status,
      ].map(v => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Define columns for ListPage
  const columns: ListPageColumn<Organization>[] = [
    {
      key: 'name',
      label: 'Organization',
      accessor: 'name',
      sortable: true,
      render: (_, org) => (
        <Stack direction="horizontal" gap={3} className="items-center">
          <Box className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center overflow-hidden">
            {org.logo_url ? (
              <Image src={org.logo_url} alt={org.name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-5 w-5 text-primary" />
            )}
          </Box>
          <Stack gap={0}>
            <Text className="font-weight-medium">{org.name}</Text>
            {org.legal_name && org.legal_name !== org.name && (
              <Body size="xs" className="text-muted-foreground">{org.legal_name}</Body>
            )}
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'email',
      label: 'Contact Info',
      accessor: 'email',
      render: (_, org) => (
        <Stack gap={1}>
          {org.email && (
            <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
              <Mail className="h-3 w-3" /><Text size="xs">{org.email}</Text>
            </Stack>
          )}
          {org.phone && (
            <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
              <Phone className="h-3 w-3" /><Text size="xs">{org.phone}</Text>
            </Stack>
          )}
        </Stack>
      ),
    },
    { key: 'industry', label: 'Industry', accessor: 'industry', sortable: true },
    {
      key: 'org_type',
      label: 'Type',
      accessor: 'org_type',
      sortable: true,
      render: (_, org) => (
        <Badge variant={STATUS_COLORS[TYPE_CONFIG[org.org_type]?.color] || 'outline'} className="capitalize">
          {org.org_type}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, org) => <Badge variant={STATUS_COLORS[org.status] || 'outline'}>{org.status.toUpperCase()}</Badge>,
    },
    {
      key: 'updated_at',
      label: 'Updated',
      accessor: 'updated_at',
      sortable: true,
      render: (_, org) => <Text size="sm" className="text-muted-foreground">{formatDate(org.updated_at)}</Text>,
    },
  ];

  // Define filters for ListPage (no type property - just key, label, options)
  const filters: ListPageFilter[] = [
    {
      key: 'org_type',
      label: 'Type',
      options: (Object.keys(TYPE_CONFIG) as OrgType[]).map((type) => ({
        value: type,
        label: TYPE_CONFIG[type].label,
      })),
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ];

  // Define row actions for ListPage (variant is 'danger' not 'destructive')
  const rowActions: ListPageAction<Organization>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: (org) => router.push(`/organizations/${org.id}`) },
    ...(canManageOrgs ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (org: Organization) => router.push(`/organizations/${org.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (org: Organization) => handleDelete(org) },
    ] : []),
  ];

  return (
    <ListPage<Organization>
      title="Organizations"
      subtitle="Unified directory of vendors, sponsors, clients, partners, and more"
      data={organizations}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search by name, email, or industry..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(org) => router.push(`/organizations/${org.id}`)}
      createLabel="Add Organization"
      onCreate={canManageOrgs ? () => router.push('/organizations/new') : undefined}
      onExport={handleExport ? async () => handleExport() : undefined}
      emptyMessage="No organizations yet"
      emptyAction={canManageOrgs ? { label: 'Add Organization', onClick: () => router.push('/organizations/new') } : undefined}
      entityType="organizations"
      showFavorite
      showSettings
    />
  );
}
