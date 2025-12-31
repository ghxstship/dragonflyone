'use client';

/**
 * Proposals List Page
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  PROPOSAL_STATUS_COLORS,
} from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useToast,
  type ListPageColumn, type ListPageFilter, type ListPageAction,
} from "@ghxstship/ui";
import { useProposals, useDeleteProposal, type Proposal, type ProposalStatus } from '@/hooks/useProposals';

const STATUS_COLORS = PROPOSAL_STATUS_COLORS;

const STATUS_ICONS: Record<ProposalStatus, React.ReactNode> = {
  draft: <FileText className="h-3 w-3" />,
  sent: <Send className="h-3 w-3" />,
  viewed: <Eye className="h-3 w-3" />,
  accepted: <CheckCircle className="h-3 w-3" />,
  declined: <XCircle className="h-3 w-3" />,
  expired: <Clock className="h-3 w-3" />,
};

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

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const columns: ListPageColumn<Proposal>[] = [
    {
      key: 'name', label: 'Proposal', accessor: 'name', sortable: true,
      render: (_value: unknown, p) => (
        <Box>
          <Text className="font-weight-medium">{p.name}</Text>
          <Body size="sm" className="text-muted-foreground">{p.proposal_number}</Body>
        </Box>
      ),
    },
    {
      key: 'client', label: 'Client', accessor: (p) => `${p.contact?.first_name || ''} ${p.contact?.last_name || ''}`.trim() || 'Unknown',
      render: (_value: unknown, p) => (
        <Box>
          <Text>{p.contact?.first_name} {p.contact?.last_name}</Text>
          {p.contact?.company && <Body size="sm" className="text-muted-foreground">{p.contact.company}</Body>}
        </Box>
      ),
    },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_value: unknown, p) => (
        <Badge variant={STATUS_COLORS[p.status]}>
          <Stack direction="horizontal" gap={1} className="items-center">
            {STATUS_ICONS[p.status]}
            {p.status}
          </Stack>
        </Badge>
      ),
    },
    {
      key: 'total', label: 'Amount', accessor: 'total', sortable: true,
      render: (_value: unknown, p) => <Text className="font-weight-medium">{formatCurrency(p.total)}</Text>,
    },
    {
      key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', sortable: true,
      render: (_value: unknown, p) => <Text>{formatDate(p.valid_until)}</Text>,
    },
    {
      key: 'created_at', label: 'Created', accessor: 'created_at', sortable: true,
      render: (_value: unknown, p) => <Text>{formatDate(p.created_at)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'viewed', label: 'Viewed' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'declined', label: 'Declined' },
      { value: 'expired', label: 'Expired' },
    ]},
  ];

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
