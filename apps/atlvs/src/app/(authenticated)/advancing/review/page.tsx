'use client';

/**
 * Advancing Review Queue Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text} from '@ghxstship/ui';
import { useAdvanceReviewQueue, type AdvanceRequest } from '@/hooks/useAdvanceReview';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  submitted: 'info',
  under_review: 'warning',
  approved: 'success',
  rejected: 'error',
  fulfilled: 'success',
  cancelled: 'outline',
  in_progress: 'info',
};

export default function AdvancingReviewPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const canReview = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data, isLoading, error, refetch } = useAdvanceReviewQueue();
  const advances = data?.advances || [];

  const formatCurrency = (amount: number | null | undefined) => amount != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount) : '$0.00';
  const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const columns: ListPageColumn<AdvanceRequest>[] = [
    {
      key: 'activation_name', label: 'Request', accessor: 'activation_name', sortable: true,
      render: (_, adv) => (
        <Box>
          <Text className="font-weight-medium">{adv.activation_name || 'Advance Request'}</Text>
          {adv.team_workspace && <Body size="sm" className="text-muted-foreground">{adv.team_workspace}</Body>}
        </Box>
      ),
    },
    { key: 'project', label: 'Project', accessor: (adv) => adv.project?.name || 'N/A' },
    { key: 'submitter', label: 'Submitter', accessor: (adv) => adv.submitter?.full_name || 'Unknown' },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, adv) => (
        <Badge variant={STATUS_COLORS[adv.status] || 'outline'}>
          <Stack direction="horizontal" gap={1} className="items-center">
            {adv.status === 'approved' && <CheckCircle className="h-3 w-3" />}
            {adv.status === 'rejected' && <XCircle className="h-3 w-3" />}
            {adv.status === 'submitted' && <Clock className="h-3 w-3" />}
            {adv.status}
          </Stack>
        </Badge>
      ),
    },
    {
      key: 'estimated_cost', label: 'Amount', accessor: 'estimated_cost', sortable: true,
      render: (_, adv) => <Text className="font-weight-medium">{formatCurrency(adv.estimated_cost)}</Text>,
    },
    {
      key: 'created_at', label: 'Requested', accessor: 'created_at', sortable: true,
      render: (_, adv) => <Text>{formatDate(adv.created_at)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'submitted', label: 'Submitted' },
      { value: 'under_review', label: 'Under Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'fulfilled', label: 'Fulfilled' },
    ]},
  ];

  const rowActions: ListPageAction<AdvanceRequest>[] = [
    { id: 'review', label: 'Review', icon: <Eye className="h-4 w-4" />, onClick: (adv) => router.push(`/advancing/review/${adv.id}`) },
  ];

  return (
    <ListPage<AdvanceRequest>
      title="Advance Review Queue"
      subtitle="Review and approve advance requests from productions"
      data={advances}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search advances..."
      filters={filters}
      rowActions={canReview ? rowActions : []}
      onRowClick={(adv) => router.push(`/advancing/review/${adv.id}`)}
      emptyMessage="No advance requests to review"
      entityType="advances"
      breadcrumbs={[{ label: 'Advancing', href: '/advancing' }, { label: 'Review Queue' }]}
      showFavorite
      showSettings
    />
  );
}
