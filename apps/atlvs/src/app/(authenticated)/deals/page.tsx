'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download, Archive } from 'lucide-react';
// Layout provided by route group
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type ListPageBulkAction, type FormFieldConfig, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import { useDeals } from '../../../hooks/useDeals';

// Roles that can create/edit/delete deals

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
  { key: 'stage', label: 'Stage', accessor: (r) => r.stage || '—', render: (v: unknown) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'probability', label: 'Probability', accessor: (r) => r.probability ? `${r.probability}%` : '—' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v: unknown) => <Badge variant={v === 'won' ? 'solid' : v === 'lost' ? 'ghost' : 'outline'}>{String(v)}</Badge> },
];

// Schema: Aligned with API createDealSchema status enum
const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ]},
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
  const { hasRole } = useAuthContext();
  const { data: dealsData, isLoading, error, refetch } = useDeals();
  const deals = (dealsData || []) as Deal[];
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // RBAC: Check if user has admin access for create/edit/delete operations
  const canManageDeals = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  // Schema: Calculate stats using API-compliant status values
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  // Active deals = lead + qualified + proposal (not won/lost)
  const activeDeals = deals.filter(d => ['lead', 'qualified', 'proposal'].includes(d.status)).length;
  const wonDeals = deals.filter(d => d.status === 'won').length;

  // Build row actions based on user permissions
  const rowActions: ListPageAction<Deal>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedDeal(r); setDrawerOpen(true); } },
    ...(canManageDeals ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r: Deal) => router.push(`/deals/${r.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (r: Deal) => { setDealToDelete(r); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch?.();
  };

  const handleDelete = async () => {
    if (dealToDelete) {
      await fetch(`/api/deals/${dealToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setDealToDelete(null);
      refetch?.();
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'deals',
    requiredFields: ['title'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch?.();
    },
  });

  const importTemplates = getImportTemplates('deals').length > 0 
    ? getImportTemplates('deals') 
    : [{ id: 'default', name: 'Deal Import', mapping: { title: 'title', status: 'status', value: 'value', client: 'client', stage: 'stage' } }];

  // Build bulk actions based on user permissions
  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    ...(canManageDeals ? [
      { id: 'archive', label: 'Archive', icon: <Archive className="size-4" /> },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const },
    ] : []),
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'delete') {
      await Promise.all(selectedIds.map(id => fetch(`/api/deals/${id}`, { method: 'DELETE' })));
      refetch?.();
    } else if (actionId === 'archive') {
      await Promise.all(selectedIds.map(id =>
        fetch(`/api/deals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' }),
        })
      ));
      refetch?.();
    }
  };

  // Schema: Stats use API-compliant status values
  const stats = [
    { label: 'Total Deals', value: deals.length },
    { label: 'Active', value: activeDeals },
    { label: 'Won', value: wonDeals },
    { label: 'Pipeline Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedDeal ? [
    { id: 'overview', title: 'Deal Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selectedDeal.title}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedDeal.status}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedDeal.client || '—'}</Body>
        <Body size="sm"><strong>Value:</strong> {formatCurrency(selectedDeal.value)}</Body>
        <Body size="sm"><strong>Stage:</strong> {selectedDeal.stage || '—'}</Body>
        <Body size="sm"><strong>Probability:</strong> {selectedDeal.probability ? `${selectedDeal.probability}%` : '—'}</Body>
        <Body size="sm"><strong>Close Date:</strong> {selectedDeal.closeDate || '—'}</Body>
      </Grid>
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
        error={error}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search deals..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(r) => { setSelectedDeal(r); setDrawerOpen(true); }}
        createLabel="New Deal"
        onCreate={canManageDeals ? () => setCreateModalOpen(true) : undefined}
        entityType="deals"
        onImport={canManageDeals ? handleImport : undefined}
        importTemplates={importTemplates}
        importSampleFields={['title', 'status', 'value', 'client', 'stage']}
        templateDownloadUrl="/templates/financial/deal-memo-template.md"
        onExport={createExportHandler({
          filename: "deals",
          getData: () => deals.map(d => ({
            id: d.id,
            title: d.title,
            client: d.client || '',
            value: d.value || 0,
            stage: d.stage || '',
            probability: d.probability || 0,
            status: d.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No deals yet"
        emptyAction={{ label: 'Create Deal', onClick: () => setCreateModalOpen(true) }}
enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="New Deal" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedDeal} title={(d) => d.title} subtitle={(d) => d.client || 'No client'} sections={detailSections} onEdit={(d) => router.push(`/deals/${d.id}/edit`)} onDelete={(d) => { setDealToDelete(d); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Deal" message={`Delete deal "${dealToDelete?.title}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setDealToDelete(null); }} />
    </>
  );
}
