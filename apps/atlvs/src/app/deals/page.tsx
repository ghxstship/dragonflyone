'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { useDeals } from '../../hooks/useDeals';

interface Deal {
  id: string;
  title: string;
  status: string;
  value?: number;
  client?: string;
  stage?: string;
  probability?: number;
  closeDate?: string;
}

const formatCurrency = (amount?: number) => amount ? `$${amount.toLocaleString()}` : '—';

const columns: ListPageColumn<Deal>[] = [
  { key: 'title', label: 'Deal', accessor: 'title', sortable: true },
  { key: 'client', label: 'Client', accessor: (r) => r.client || '—' },
  { key: 'value', label: 'Value', accessor: (r) => formatCurrency(r.value), sortable: true },
  { key: 'stage', label: 'Stage', accessor: (r) => r.stage || '—', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'probability', label: 'Probability', accessor: (r) => r.probability ? `${r.probability}%` : '—' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'won' ? 'solid' : v === 'lost' ? 'ghost' : 'outline'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'open', label: 'Open' }, { value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }] },
  { key: 'stage', label: 'Stage', options: [{ value: 'prospecting', label: 'Prospecting' }, { value: 'qualification', label: 'Qualification' }, { value: 'proposal', label: 'Proposal' }, { value: 'negotiation', label: 'Negotiation' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Deal Title', type: 'text', required: true },
  { name: 'client', label: 'Client', type: 'text', required: true },
  { name: 'value', label: 'Value', type: 'number', required: true },
  { name: 'stage', label: 'Stage', type: 'select', required: true, options: [{ value: 'prospecting', label: 'Prospecting' }, { value: 'qualification', label: 'Qualification' }, { value: 'proposal', label: 'Proposal' }, { value: 'negotiation', label: 'Negotiation' }] },
  { name: 'probability', label: 'Probability (%)', type: 'number' },
  { name: 'closeDate', label: 'Expected Close', type: 'date' },
];

export default function DealsPage() {
  const router = useRouter();
  const { data: dealsData, isLoading, refetch } = useDeals();
  const deals = (dealsData || []) as Deal[];
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const openDeals = deals.filter(d => d.status === 'open').length;
  const wonDeals = deals.filter(d => d.status === 'won').length;

  const rowActions: ListPageAction<Deal>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedDeal(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/deals/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setDealToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create deal:', data);
    setCreateModalOpen(false);
    refetch?.();
  };

  const handleDelete = async () => {
    if (dealToDelete) {
      console.log('Delete:', dealToDelete.id);
      setDeleteConfirmOpen(false);
      setDealToDelete(null);
      refetch?.();
    }
  };

  const stats = [
    { label: 'Total Deals', value: deals.length },
    { label: 'Open', value: openDeals },
    { label: 'Won', value: wonDeals },
    { label: 'Pipeline Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedDeal ? [
    { id: 'overview', title: 'Deal Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedDeal.title}</div>
        <div><strong>Status:</strong> {selectedDeal.status}</div>
        <div><strong>Client:</strong> {selectedDeal.client || '—'}</div>
        <div><strong>Value:</strong> {formatCurrency(selectedDeal.value)}</div>
        <div><strong>Stage:</strong> {selectedDeal.stage || '—'}</div>
        <div><strong>Probability:</strong> {selectedDeal.probability ? `${selectedDeal.probability}%` : '—'}</div>
        <div><strong>Close Date:</strong> {selectedDeal.closeDate || '—'}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Deal>
        title="Deals"
        subtitle="Manage your sales pipeline and opportunities"
        data={deals}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search deals..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedDeal(r); setDrawerOpen(true); }}
        createLabel="New Deal"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No deals yet"
        emptyAction={{ label: 'Create Deal', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="New Deal" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedDeal} title={(d) => d.title} subtitle={(d) => d.client || 'No client'} sections={detailSections} onEdit={(d) => router.push(`/deals/${d.id}/edit`)} onDelete={(d) => { setDealToDelete(d); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Deal" message={`Delete deal "${dealToDelete?.title}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setDealToDelete(null); }} />
    </>
  );
}
