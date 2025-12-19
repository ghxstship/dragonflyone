'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Wrench } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useAssetPerformance, type AssetPerformance } from '@ghxstship/config';
import { DEMO_ASSET_PERFORMANCE } from '../../../lib/demo-data';

const getHealthVariant = (score: number): 'solid' | 'outline' | 'ghost' => {
  if (score >= 90) return 'solid';
  if (score >= 70) return 'outline';
  return 'ghost';
};

const columns: ListPageColumn<AssetPerformance>[] = [
  { key: 'name', label: 'Asset', accessor: (r) => `${r.name} (${r.id})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'utilizationRate', label: 'Utilization', accessor: (r) => `${r.utilizationRate}%`, sortable: true },
  { key: 'uptime', label: 'Uptime', accessor: (r) => `${r.uptime}%`, sortable: true },
  { key: 'mtbf', label: 'MTBF', accessor: (r) => `${r.mtbf}h` },
  { key: 'healthScore', label: 'Health', accessor: 'healthScore', sortable: true, render: (v) => <Badge variant={getHealthVariant(Number(v))}>{String(v)}</Badge> },
  { key: 'predictedFailure', label: 'Prediction', accessor: (r) => r.predictedFailure || '—' },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Rigging', label: 'Rigging' }] },
];

export default function AssetPerformancePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AssetPerformance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real API integration with demo fallback
  const { performance: apiData, isLoading, error, deletePerformanceAsync, refetch } = useAssetPerformance();
  const data: AssetPerformance[] = apiData.length > 0 ? apiData : (DEMO_ASSET_PERFORMANCE as unknown as AssetPerformance[]);

  const avgUtilization = data.length > 0 ? Math.round(data.reduce((s, a) => s + a.utilizationRate, 0) / data.length) : 0;
  const avgUptime = data.length > 0 ? (data.reduce((s, a) => s + a.uptime, 0) / data.length).toFixed(1) : '0';
  const totalFailures = data.reduce((s, a) => s + a.failureCount, 0);
  const atRiskCount = data.filter(a => a.predictedFailure).length;

  const rowActions: ListPageAction<AssetPerformance>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'maintenance', label: 'Schedule Maintenance', icon: <Wrench className="size-4" />, onClick: (r) => router.push(`/assets/maintenance?asset=${r.id}`) },
  ];

  const stats = [
    { label: 'Avg Utilization', value: `${avgUtilization}%` },
    { label: 'Avg Uptime', value: `${avgUptime}%` },
    { label: 'Total Failures (YTD)', value: totalFailures },
    { label: 'At Risk Assets', value: atRiskCount },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Performance Metrics', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Asset:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Utilization:</strong> {selected.utilizationRate}%</Body>
        <Body size="sm"><strong>Uptime:</strong> {selected.uptime}%</Body>
        <Body size="sm"><strong>MTBF:</strong> {selected.mtbf} hours</Body>
        <Body size="sm"><strong>MTTR:</strong> {selected.mttr} hours</Body>
        <Body size="sm"><strong>Health Score:</strong> {selected.healthScore}</Body>
        <Body size="sm"><strong>Failures (YTD):</strong> {selected.failureCount}</Body>
        <Body size="sm"><strong>Last Maintenance:</strong> {selected.lastMaintenance}</Body>
        {selected.predictedFailure && <Body size="sm"><strong>Predicted Failure:</strong> {selected.predictedFailure}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<AssetPerformance, 'id'>>({

    entityType: 'asset-performance',

    requiredFields: ['name', 'category', 'utilizationRate'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/asset-performance', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('asset-performance');


  return (
    <AtlvsAppLayout>
      <ListPage<AssetPerformance>
        title="Asset Performance Analytics"
        subtitle="Performance metrics and failure prediction for all assets"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="asset-performance"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'category', 'utilizationRate', 'uptime', 'mtbf', 'healthScore', 'predictedFailure']}
        onExport={createExportHandler({
          filename: "asset-performance",
          getData: () => data.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category,
            utilizationRate: a.utilizationRate,
            uptime: a.uptime,
            mtbf: a.mtbf,
            mttr: a.mttr,
            status: a.status,
          })),
        })}
        stats={stats}
        emptyMessage="No performance data found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deletePerformanceAsync(ids);
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.category} • Health: ${r.healthScore} • Uptime: ${r.uptime}%`}
          sections={detailSections}
          actions={[{ id: 'maintenance', label: 'Schedule Maintenance', icon: <Wrench className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'maintenance') router.push(`/assets/maintenance?asset=${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
