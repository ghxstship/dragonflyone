'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Check } from 'lucide-react';
// Layout provided by route group
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection} from "@ghxstship/ui";
import { useAdvancingRequests, createExportHandler, createImportHandler, getImportTemplates, useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import type { ProductionAdvance, AdvanceStatus } from '@ghxstship/config/types/advancing';

// Roles that can approve/delete advancing requests

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
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v: unknown) => <Badge variant={getStatusBadgeVariant(v as AdvanceStatus)}>{String(v).replace('_', ' ')}</Badge> },
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
  const { hasRole } = useAuthContext();
  const { data: requestsData, isLoading, error, refetch } = useAdvancingRequests({ limit: 100 });
  const requests = (requestsData?.data || []) as ProductionAdvance[];
  
  const [selectedRequest, setSelectedRequest] = useState<ProductionAdvance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // RBAC: Check if user has admin access for approve/delete operations
  const canManageAdvancing = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const totalValue = requests.reduce((sum, r) => sum + (r.estimated_cost || 0), 0);
  const pendingCount = requests.filter(r => r.status === 'submitted' || r.status === 'under_review').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;

  const rowActions: ListPageAction<ProductionAdvance>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRequest(r); setDrawerOpen(true); } },
    { id: 'review', label: 'Review', icon: <Check className="size-4" />, onClick: (r) => router.push(`/advancing/requests/${r.id}`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'advancing',
    requiredFields: ['activation_name'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/advancing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch?.();
    },
  });

  const importTemplates = getImportTemplates('advancing').length > 0 
    ? getImportTemplates('advancing') 
    : [{ id: 'default', name: 'Advancing Import', mapping: { activation_name: 'activation_name', estimated_cost: 'estimated_cost', status: 'status' } }];

  const stats = [
    { label: 'Total Requests', value: requests.length },
    { label: 'Pending Review', value: pendingCount },
    { label: 'In Progress', value: inProgressCount },
    { label: 'Approved', value: approvedCount },
    { label: 'Total Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedRequest ? [
    { id: 'overview', title: 'Request Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Request:</strong> {selectedRequest.team_workspace || selectedRequest.activation_name || 'Untitled'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedRequest.status.replace('_', ' ')}</Body>
        <Body size="sm"><strong>Project:</strong> {selectedRequest.project?.name || '—'}</Body>
        <Body size="sm"><strong>Submitter:</strong> {selectedRequest.submitter?.full_name || 'Unknown'}</Body>
        <Body size="sm"><strong>Estimated Cost:</strong> {formatCurrency(selectedRequest.estimated_cost)}</Body>
        <Body size="sm"><strong>Submitted:</strong> {formatDate(selectedRequest.submitted_at)}</Body>
        <Body size="sm"><strong>Items:</strong> {selectedRequest.items?.length || 0}</Body>
      </Grid>
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
        error={error}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search advance requests..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => router.push(`/advancing/requests/${r.id}`)}
        entityType="advancing"
        onImport={canManageAdvancing ? handleImport : undefined}
        importTemplates={importTemplates}
        importSampleFields={['activation_name', 'estimated_cost', 'status']}
        templateDownloadUrl="/templates/advancing/artist-advance-form.csv"
        onExport={createExportHandler({
          filename: "advancing-requests",
          getData: () => requests.map(r => ({
            id: r.id,
            activation_name: r.activation_name || '',
            team_workspace: r.team_workspace || '',
            project: r.project?.name || '',
            status: r.status,
            estimated_cost: r.estimated_cost || '',
            created_at: r.created_at,
          })),
        })}
        stats={stats}
        emptyMessage="No advance requests found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/advancing/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'approve') {
            await fetch('/api/advancing/bulk-approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={canManageAdvancing ? [
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ] : []}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedRequest}
        title={(r) => r.team_workspace || r.activation_name || 'Advance Request'}
        subtitle={(r) => r.project?.name || ''}
        sections={detailSections}
        actions={[{ id: 'review', label: 'Review Request', icon: <Check className="size-4" /> }]}
        onAction={(id, r) => { if (id === 'review') router.push(`/advancing/requests/${r.id}`); setDrawerOpen(false); }}
      />
    </>
  );
}
