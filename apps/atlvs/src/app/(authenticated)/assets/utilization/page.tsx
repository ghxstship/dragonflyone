'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, BarChart3 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useAssetUtilization, type AssetUtilization } from '@ghxstship/config';
import { DEMO_ASSET_UTILIZATION } from '../../../../lib/demo-data';

const getUtilizationVariant = (rate: number): 'solid' | 'outline' | 'ghost' => {
  if (rate >= 0.8) return 'solid';
  if (rate >= 0.6) return 'outline';
  return 'ghost';
};

const formatCurrency = (amount: number) => `$${(amount / 1000).toFixed(0)}K`;

const columns: ListPageColumn<AssetUtilization>[] = [
  { key: 'name', label: 'Asset', accessor: (r) => `${r.name} (${r.id})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'currentValue', label: 'Value', accessor: (r) => formatCurrency(r.currentValue), sortable: true },
  { key: 'totalRevenue', label: 'Revenue', accessor: (r) => formatCurrency(r.totalRevenue), sortable: true },
  { key: 'utilizationRate', label: 'Utilization', accessor: (r) => `${(r.utilizationRate * 100).toFixed(0)}%`, sortable: true, render: (v, r) => <Badge variant={getUtilizationVariant(r.utilizationRate)}>{String(v)}</Badge> },
  { key: 'projectCount', label: 'Projects', accessor: 'projectCount', sortable: true },
  { key: 'roi', label: 'ROI', accessor: (r) => `${r.roi}%`, sortable: true, render: (v, r) => <Badge variant={r.roi > 50 ? 'solid' : 'outline'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
];

export default function AssetUtilizationPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<AssetUtilization | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real API integration with demo fallback
  const { utilization: apiData, isLoading, error, deleteUtilizationAsync, refetch } = useAssetUtilization();
  const data: AssetUtilization[] = apiData.length > 0 ? apiData : (DEMO_ASSET_UTILIZATION as unknown as AssetUtilization[]);

  const totalAssetValue = data.reduce((sum, a) => sum + a.currentValue, 0);
  const totalRevenue = data.reduce((sum, a) => sum + a.totalRevenue, 0);
  const avgUtilization = data.length > 0 ? data.reduce((sum, a) => sum + a.utilizationRate, 0) / data.length : 0;
  const overallROI = totalAssetValue > 0 ? ((totalRevenue / totalAssetValue) * 100).toFixed(1) : '0';

  const rowActions: ListPageAction<AssetUtilization>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'history', label: 'View History', icon: <BarChart3 className="size-4" />, onClick: (r) => router.push(`/assets/${r.id}/history`) },
  ];

  const stats = [
    { label: 'Total Asset Value', value: formatCurrency(totalAssetValue) },
    { label: 'YTD Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Avg Utilization', value: `${(avgUtilization * 100).toFixed(0)}%` },
    { label: 'Overall ROI', value: `${overallROI}%` },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Utilization Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Asset:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Purchase Price:</strong> ${selected.purchasePrice.toLocaleString()}</Body>
        <Body size="sm"><strong>Current Value:</strong> ${selected.currentValue.toLocaleString()}</Body>
        <Body size="sm"><strong>Total Revenue:</strong> ${selected.totalRevenue.toLocaleString()}</Body>
        <Body size="sm"><strong>Utilization Rate:</strong> {(selected.utilizationRate * 100).toFixed(0)}%</Body>
        <Body size="sm"><strong>Days Deployed:</strong> {selected.daysDeployed}</Body>
        <Body size="sm"><strong>Project Count:</strong> {selected.projectCount}</Body>
        <Body size="sm"><strong>ROI:</strong> {selected.roi}%</Body>
        <Body size="sm"><strong>Cost Per Day:</strong> ${selected.costPerDay}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<AssetUtilization, 'id'>>({

    entityType: 'asset-utilization',

    requiredFields: ['name', 'category', 'currentValue'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/asset-utilization', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('asset-utilization');


  return (
    <AtlvsAppLayout>
      <ListPage<AssetUtilization>
        title="Asset Utilization & ROI"
        subtitle="Performance analytics, utilization rates, and return on investment"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="asset-utilization"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'category', 'currentValue', 'totalRevenue', 'utilizationRate', 'projectCount', 'roi']}
        onExport={createExportHandler({
          filename: "asset-utilization",
          getData: () => data.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category,
            utilizationRate: a.utilizationRate,
            hoursUsed: a.hoursUsed,
            hoursAvailable: a.hoursAvailable,
            status: a.status,
            trend: a.trend,
          })),
        })}
        stats={stats}
        emptyMessage="No utilization data found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteUtilizationAsync(ids);
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
          subtitle={(r) => `${r.category} • ${(r.utilizationRate * 100).toFixed(0)}% utilized • ${r.roi}% ROI`}
          sections={detailSections}
          actions={[{ id: 'history', label: 'View History', icon: <BarChart3 className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'history') router.push(`/assets/${r.id}/history`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
