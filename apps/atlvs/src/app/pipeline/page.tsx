"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import { useDeals } from "@/hooks/useDeals";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

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
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedDeal(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/pipeline/${r.id}`) },
  ];

  const stats = [
    { label: 'Active Deals', value: dealData.length },
    { label: 'Total Value', value: formatCurrency(totalValue) },
    { label: 'Weighted Value', value: formatCurrency(weightedValue) },
    { label: 'Win Rate', value: `${winRate}%` },
  ];

  const detailSections: DetailSection[] = selectedDeal ? [
    { id: 'overview', title: 'Deal Details', content: (
      <div className="grid grid-cols-2 gap-spacing-4">
        <div><strong>Opportunity:</strong> {selectedDeal.name}</div>
        <div><strong>Client:</strong> {selectedDeal.client}</div>
        <div><strong>Value:</strong> {formatCurrency(selectedDeal.value || 0)}</div>
        <div><strong>Probability:</strong> {selectedDeal.probability}%</div>
        <div><strong>Stage:</strong> {selectedDeal.stage}</div>
        <div><strong>Owner:</strong> {selectedDeal.owner}</div>
        <div><strong>Close Date:</strong> {selectedDeal.closeDate ? new Date(selectedDeal.closeDate).toLocaleDateString() : '—'}</div>
        {selectedDeal.description && <div className="col-span-2"><strong>Description:</strong> {selectedDeal.description}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => router.push('/pipeline/forecast')}
        stats={stats}
        emptyMessage="No deals found"
        emptyAction={{ label: 'Add Deal', onClick: () => router.push('/pipeline/new') }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Pipeline' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      {selectedDeal && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedDeal}
          title={(d) => d.name}
          subtitle={(d) => `${d.client} • ${formatCurrency(d.value || 0)}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Deal', icon: '✏️' }]}
          onAction={(id, d) => { if (id === 'edit') router.push(`/pipeline/${d.id}`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
