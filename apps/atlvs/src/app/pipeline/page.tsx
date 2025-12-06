"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import { useDeals } from "@/hooks/useDeals";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

interface Deal {
  id: string;
  name: string;
  client: string;
  value: number;
  probability: number;
  stage: string;
  owner: string;
  closeDate?: string;
  description?: string;
  [key: string]: unknown;
}

const stages = ["Lead", "Qualification", "Discovery", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const columns: ListPageColumn<Deal>[] = [
  { key: 'name', label: 'Opportunity', accessor: 'name', sortable: true },
  { key: 'client', label: 'Client', accessor: 'client', sortable: true },
  { key: 'value', label: 'Value', accessor: (r) => formatCurrency(r.value || 0), sortable: true },
  { key: 'probability', label: 'Probability', accessor: (r) => `${r.probability}%`, sortable: true },
  { key: 'stage', label: 'Stage', accessor: 'stage', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'owner', label: 'Owner', accessor: 'owner' },
  { key: 'closeDate', label: 'Close Date', accessor: (r) => r.closeDate ? new Date(r.closeDate).toLocaleDateString() : '—', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'stage', label: 'Stage', options: stages.map(s => ({ value: s, label: s })) },
  { key: 'owner', label: 'Owner', options: [{ value: 'Sarah', label: 'Sarah Chen' }, { value: 'Michael', label: 'Michael Torres' }, { value: 'David', label: 'David Kim' }] },
];

export default function PipelinePage() {
  const router = useRouter();
  const { data: deals, isLoading, error, refetch } = useDeals();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const dealData = (deals || []) as unknown as Deal[];
  const totalValue = dealData.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedValue = dealData.reduce((sum, d) => sum + ((d.value || 0) * (d.probability || 0) / 100), 0);
  const wonDeals = dealData.filter(d => d.stage === 'Closed Won').length;
  const winRate = dealData.length > 0 ? Math.round((wonDeals / dealData.length) * 100) : 0;

  const rowActions: ListPageAction<Deal>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedDeal(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/pipeline/${r.id}`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'pipeline',
    requiredFields: ['name', 'client', 'value'],
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

  const importTemplates = getImportTemplates('pipeline').length > 0 
    ? getImportTemplates('pipeline') 
    : [{ id: 'default', name: 'Pipeline Import', mapping: { name: 'name', client: 'client', value: 'value', probability: 'probability', stage: 'stage' } }];

  const stats = [
    { label: 'Active Deals', value: dealData.length },
    { label: 'Total Value', value: formatCurrency(totalValue) },
    { label: 'Weighted Value', value: formatCurrency(weightedValue) },
    { label: 'Win Rate', value: `${winRate}%` },
  ];

  const detailSections: DetailSection[] = selectedDeal ? [
    { id: 'overview', title: 'Deal Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Opportunity:</strong> {selectedDeal.name}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedDeal.client}</Body>
        <Body size="sm"><strong>Value:</strong> {formatCurrency(selectedDeal.value || 0)}</Body>
        <Body size="sm"><strong>Probability:</strong> {selectedDeal.probability}%</Body>
        <Body size="sm"><strong>Stage:</strong> {selectedDeal.stage}</Body>
        <Body size="sm"><strong>Owner:</strong> {selectedDeal.owner}</Body>
        <Body size="sm"><strong>Close Date:</strong> {selectedDeal.closeDate ? new Date(selectedDeal.closeDate).toLocaleDateString() : '—'}</Body>
        {selectedDeal.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedDeal.description}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Deal>
        title="Sales Pipeline"
        subtitle="Track and manage sales opportunities"
        data={dealData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error instanceof Error ? error : undefined}
        onRetry={refetch}
        searchPlaceholder="Search deals..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedDeal(r); setDrawerOpen(true); }}
        createLabel="Add Deal"
        onCreate={() => router.push('/pipeline/new')}
        entityType="deals"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'client', 'value', 'probability', 'stage']}
        onExport={createExportHandler({
          filename: "deals",
          getData: () => (deals || []).map((d: Deal) => ({
            id: d.id,
            name: d.name,
            client: d.client,
            value: d.value,
            stage: d.stage,
            probability: d.probability,
            close_date: d.closeDate || '',
          })),
        })}
        stats={stats}
        emptyMessage="No deals found"
        emptyAction={{ label: 'Add Deal', onClick: () => router.push('/pipeline/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/pipeline/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch?.();
          } else if (action === 'archive') {
            await fetch('/api/pipeline/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch?.();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedDeal && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedDeal}
          title={(d) => d.name}
          subtitle={(d) => `${d.client} • ${formatCurrency(d.value || 0)}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Deal', icon: <Pencil className="size-4" /> }]}
          onAction={(id, d) => { if (id === 'edit') router.push(`/pipeline/${d.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
