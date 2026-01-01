'use client';

/**
 * Advancing Review Queue Page
 * 
 * SSOT-compliant: Uses entity registry for status colors and formatters.
 */

import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  getEntityColumns,
  getEntityFilters,
} from '@ghxstship/config';
import {
  ListPage,
  type ListPageAction,
} from "@ghxstship/ui";
import { useAdvanceReviewQueue, type AdvanceRequest } from '@/hooks/useAdvanceReview';

export default function AdvancingReviewPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const canReview = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data, isLoading, error, refetch } = useAdvanceReviewQueue();
  const advances = data?.advances || [];

  const columns = getEntityColumns<AdvanceRequest>('advancing');
  const filters = getEntityFilters('advancing');

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
