'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';
import { useAdvancingRequests } from '@ghxstship/config';
import type { ProductionAdvance, AdvanceStatus } from '@ghxstship/config/types/advancing';

const formatCurrency = (amount: number | null) => {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusBadgeVariant = (status: AdvanceStatus): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case 'approved':
    case 'in_progress':
    case 'fulfilled':
      return 'solid';
    case 'rejected':
    case 'cancelled':
      return 'ghost';
    default:
      return 'outline';
  }
};

const columns: ListPageColumn<ProductionAdvance>[] = [
  { key: 'activation_name', label: 'Request', accessor: (r) => r.team_workspace || r.activation_name || 'Untitled', sortable: true },
  { key: 'project', label: 'Project', accessor: (r) => r.project?.name || '—' },
  { key: 'submitter', label: 'Submitter', accessor: (r) => r.submitter?.full_name || 'Unknown' },
  { key: 'submitted_at', label: 'Submitted', accessor: (r) => formatDate(r.submitted_at), sortable: true },
  { key: 'estimated_cost', label: 'Est. Cost', accessor: (r) => formatCurrency(r.estimated_cost), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusBadgeVariant(v as AdvanceStatus)}>{String(v).replace('_', ' ')}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'fulfilled', label: 'Fulfilled' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
];

export default function AdvancingPage() {
  const router = useRouter();
  const { data: requestsData, isLoading, refetch } = useAdvancingRequests({ limit: 100 });
  const requests = (requestsData?.data || []) as ProductionAdvance[];
  
  const [selectedRequest, setSelectedRequest] = useState<ProductionAdvance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalValue = requests.reduce((sum, r) => sum + (r.estimated_cost || 0), 0);
  const pendingCount = requests.filter(r => r.status === 'submitted' || r.status === 'under_review').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const _inProgressCount = requests.filter(r => r.status === 'in_progress').length;

  const rowActions: ListPageAction<ProductionAdvance>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedRequest(r); setDrawerOpen(true); } },
    { id: 'review', label: 'Review', icon: '✅', onClick: (r) => router.push(`/advancing/requests/${r.id}`) },
  ];

  const stats = [
    { label: 'Total Requests', value: requests.length },
    { label: 'Pending Review', value: pendingCount },
    { label: 'Approved', value: approvedCount },
    { label: 'Total Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedRequest ? [
    { id: 'overview', title: 'Request Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Request:</strong> {selectedRequest.team_workspace || selectedRequest.activation_name || 'Untitled'}</div>
        <div><strong>Status:</strong> {selectedRequest.status.replace('_', ' ')}</div>
        <div><strong>Project:</strong> {selectedRequest.project?.name || '—'}</div>
        <div><strong>Submitter:</strong> {selectedRequest.submitter?.full_name || 'Unknown'}</div>
        <div><strong>Estimated Cost:</strong> {formatCurrency(selectedRequest.estimated_cost)}</div>
        <div><strong>Submitted:</strong> {formatDate(selectedRequest.submitted_at)}</div>
        <div><strong>Items:</strong> {selectedRequest.items?.length || 0}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<ProductionAdvance>
        title="Production Advancing"
        subtitle="Manage production advance requests and catalog items"
        data={requests}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search advance requests..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => router.push(`/advancing/requests/${r.id}`)}
        onExport={() => router.push('/advancing/export')}
        stats={stats}
        emptyMessage="No advance requests found"
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Advancing' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRequest}
        title={(r) => r.team_workspace || r.activation_name || 'Advance Request'}
        subtitle={(r) => r.project?.name || ''}
        sections={detailSections}
        actions={[{ id: 'review', label: 'Review Request', icon: '✅' }]}
        onAction={(id, r) => { if (id === 'review') router.push(`/advancing/requests/${r.id}`); setDrawerOpen(false); }}
      />
    </>
  );
}
