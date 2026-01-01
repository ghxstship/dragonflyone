'use client';

/**
 * Unified Organizations Page
 * 
 * SSOT-compliant: Uses entity registry for columns and filters.
 */

import { useRouter } from 'next/navigation';
import { 
  Eye, Pencil, Trash2,
} from 'lucide-react';
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
  useOrganizationsQuery,
  useDeleteOrganization,
  type Organization,
} from '@/hooks/useOrganizationsQuery';

export default function OrganizationsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  const columns = getEntityColumns<Organization>('organizations');
  const filters = getEntityFilters('organizations');

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
      toast.success('Organization Deleted', `${org.name} has been deleted.`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete organization',);
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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
