'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { useAdvanceReviewQueue } from '@/hooks/useAdvanceReview';
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';

interface Advance {
  id: string;
  activation_name?: string;
  status: string;
  estimated_cost?: number;
  organization?: { name: string };
  project?: { name: string };
  team_workspace?: string;
  submitter?: { full_name: string };
  items?: unknown[];
  submitted_at?: string;
  created_at: string;
}

const formatCurrency = (amount?: number) => amount ? `$${amount.toLocaleString()}` : '—';

const getPriorityLabel = (cost: number) => {
  if (cost >= 10000) return 'High';
  if (cost >= 1000) return 'Medium';
  return 'Low';
};

const columns: ListPageColumn<Advance>[] = [
  { key: 'activation_name', label: 'Advance', accessor: (r) => r.activation_name || r.project?.name || 'Untitled', sortable: true },
  { key: 'organization', label: 'Organization', accessor: (r) => r.organization?.name || '—' },
  { key: 'estimated_cost', label: 'Cost', accessor: (r) => formatCurrency(r.estimated_cost), sortable: true },
  { key: 'priority', label: 'Priority', accessor: (r) => getPriorityLabel(r.estimated_cost || 0), render: (v) => <Badge variant={v === 'High' ? 'solid' : v === 'Medium' ? 'outline' : 'ghost'}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant="outline">{String(v).replace('_', ' ')}</Badge> },
  { key: 'submitted_at', label: 'Submitted', accessor: (r) => new Date(r.submitted_at || r.created_at).toLocaleDateString(), sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'priority', label: 'Priority', options: [{ value: 'high', label: 'High ($10k+)' }, { value: 'medium', label: 'Medium ($1k-$10k)' }, { value: 'low', label: 'Low (<$1k)' }] },
  { key: 'status', label: 'Status', options: [{ value: 'submitted', label: 'Submitted' }, { value: 'approved', label: 'Approved' }, { value: 'in_progress', label: 'In Progress' }, { value: 'fulfilled', label: 'Fulfilled' }] },
];

export default function AdvanceReviewQueuePage() {
  const router = useRouter();
  const { data, isLoading, refetch } = useAdvanceReviewQueue({ limit: 50 });
  const advances = (data?.advances || []) as Advance[];
  
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const highPriority = advances.filter(a => (a.estimated_cost || 0) >= 10000).length;
  const totalValue = advances.reduce((sum, a) => sum + (a.estimated_cost || 0), 0);

  const rowActions: ListPageAction<Advance>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedAdvance(r); setDrawerOpen(true); } },
    { id: 'review', label: 'Review', icon: '✅', onClick: (r) => router.push(`/advances/${r.id}`) },
  ];

  const stats = [
    { label: 'Pending Review', value: advances.length },
    { label: 'High Priority', value: highPriority },
    { label: 'Total Value', value: formatCurrency(totalValue) },
    { label: 'Avg Value', value: formatCurrency(advances.length ? totalValue / advances.length : 0) },
  ];

  const detailSections: DetailSection[] = selectedAdvance ? [
    { id: 'overview', title: 'Advance Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selectedAdvance.activation_name || selectedAdvance.project?.name || 'Untitled'}</div>
        <div><strong>Status:</strong> {selectedAdvance.status}</div>
        <div><strong>Organization:</strong> {selectedAdvance.organization?.name || '—'}</div>
        <div><strong>Project:</strong> {selectedAdvance.project?.name || '—'}</div>
        <div><strong>Estimated Cost:</strong> {formatCurrency(selectedAdvance.estimated_cost)}</div>
        <div><strong>Priority:</strong> {getPriorityLabel(selectedAdvance.estimated_cost || 0)}</div>
        <div><strong>Submitter:</strong> {selectedAdvance.submitter?.full_name || '—'}</div>
        <div><strong>Items:</strong> {selectedAdvance.items?.length || 0}</div>
        <div><strong>Submitted:</strong> {new Date(selectedAdvance.submitted_at || selectedAdvance.created_at).toLocaleString()}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Advance>
        title="Production Advance Review Queue"
        subtitle="Review and approve production advance requests from COMPVSS"
        data={advances}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search advances..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => router.push(`/advances/${r.id}`)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No advances pending review"
        header={<Navigation />}
      />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedAdvance} title={(a) => a.activation_name || 'Advance'} subtitle={(a) => a.organization?.name || ''} sections={detailSections} actions={[{ id: 'review', label: 'Review', icon: '✅' }]} onAction={(id, a) => id === 'review' && router.push(`/advances/${a.id}`)} />
    </>
  );
}
