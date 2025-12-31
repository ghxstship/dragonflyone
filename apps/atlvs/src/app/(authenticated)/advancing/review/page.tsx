'use client';

/**
 * Advancing Review Queue Page
 * 
 * SSOT-compliant: Uses entity registry for status colors and formatters.
 */

import { useRouter } from 'next/navigation';
import { Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  DOCUMENT_STATUS_COLORS,
  formatCurrency,
  formatDate,
  useEntityConfig,
} from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text,
  type ListPageAction,
} from "@ghxstship/ui";
import { useAdvanceReviewQueue, type AdvanceRequest } from '@/hooks/useAdvanceReview';

export default function AdvancingReviewPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const canReview = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  // SSOT: Get filters from entity registry (columns have custom renders)
  const { filters } = useEntityConfig<AdvanceRequest>({ entityName: 'advancing' });

  const { data, isLoading, error, refetch } = useAdvanceReviewQueue();
  const advances = data?.advances || [];

  // Custom columns with complex renders
  const columns: { key: string; label: string; accessor: string | ((adv: AdvanceRequest) => string); sortable?: boolean; render?: (value: unknown, adv: AdvanceRequest) => React.ReactNode }[] = [
    {
      key: 'activation_name', label: 'Request', accessor: 'activation_name', sortable: true,
      render: (_value: unknown, adv) => (
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
      render: (_value: unknown, adv) => (
        <Badge variant={DOCUMENT_STATUS_COLORS[adv.status] || 'outline'}>
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
      render: (_value: unknown, adv) => <Text className="font-weight-medium">{formatCurrency(adv.estimated_cost ?? 0)}</Text>,
    },
    {
      key: 'created_at', label: 'Requested', accessor: 'created_at', sortable: true,
      render: (_value: unknown, adv) => <Text>{formatDate(adv.created_at)}</Text>,
    },
  ];

  // SSOT: Filters are provided by useEntityConfig

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
