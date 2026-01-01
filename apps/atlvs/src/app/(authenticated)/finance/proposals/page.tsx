'use client';

/**
 * Proposals List Page
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
import { useProposals, useDeleteProposal, type Proposal } from '@/hooks/useProposals';

export default function ProposalsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data, isLoading, error, refetch } = useProposals({});
  const proposals = data?.proposals || [];
  const deleteMutation = useDeleteProposal();

  const handleDelete = async (proposal: Proposal) => {
    if (!confirm(`Delete proposal "${proposal.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(proposal.id);
      toast.success("Proposal Deleted", `${proposal.name} has been deleted`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete proposal');
    }
  };

  const columns = getEntityColumns<Proposal>('proposals');
  const filters = getEntityFilters('proposals');

  const rowActions: ListPageAction<Proposal>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (p) => router.push(`/finance/proposals/${p.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (p: Proposal) => router.push(`/finance/proposals/${p.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (p: Proposal) => handleDelete(p) },
    ] : []),
  ];

  return (
    <ListPage<Proposal>
      title="Proposals"
      subtitle="Create and manage client proposals"
      data={proposals}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search proposals..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(p) => router.push(`/finance/proposals/${p.id}`)}
      createLabel="New Proposal"
      onCreate={canManage ? () => router.push('/finance/proposals/new') : undefined}
      emptyMessage="No proposals yet"
      emptyAction={canManage ? { label: 'Create Proposal', onClick: () => router.push('/finance/proposals/new') } : undefined}
      entityType="proposals"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Proposals' }]}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
