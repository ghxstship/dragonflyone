'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, BarChart3 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface AssetUtilization {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currentValue: number;
  totalRevenue: number;
  utilizationRate: number;
  daysDeployed: number;
  projectCount: number;
  roi: number;
  costPerDay: number;
  [key: string]: unknown;
}

const mockData: AssetUtilization[] = [
  { id: 'AST-001', name: 'Meyer Sound LEO Line Array', category: 'Audio', purchasePrice: 285000, currentValue: 228000, totalRevenue: 142500, utilizationRate: 0.82, daysDeployed: 299, projectCount: 47, roi: 50, costPerDay: 780 },
  { id: 'AST-002', name: 'Robe MegaPointe (24x)', category: 'Lighting', purchasePrice: 156000, currentValue: 124800, totalRevenue: 98400, utilizationRate: 0.91, daysDeployed: 332, projectCount: 52, roi: 63, costPerDay: 427 },
  { id: 'AST-003', name: 'disguise gx 2c Media Server', category: 'Video', purchasePrice: 48000, currentValue: 38400, totalRevenue: 28500, utilizationRate: 0.75, daysDeployed: 274, projectCount: 38, roi: 59, costPerDay: 131 },
  { id: 'AST-004', name: 'Staging Deck System', category: 'Staging', purchasePrice: 95000, currentValue: 76000, totalRevenue: 51300, utilizationRate: 0.68, daysDeployed: 248, projectCount: 41, roi: 54, costPerDay: 260 },
  { id: 'AST-005', name: 'Chain Motor Hoists (20x)', category: 'Rigging', purchasePrice: 42000, currentValue: 33600, totalRevenue: 33600, utilizationRate: 0.79, daysDeployed: 288, projectCount: 56, roi: 80, costPerDay: 115 },
];

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
  const [data] = useState<AssetUtilization[]>(mockData);
  const [selected, setSelected] = useState<AssetUtilization | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalAssetValue = data.reduce((sum, a) => sum + a.currentValue, 0);
  const totalRevenue = data.reduce((sum, a) => sum + a.totalRevenue, 0);
  const avgUtilization = data.reduce((sum, a) => sum + a.utilizationRate, 0) / data.length;
  const overallROI = ((totalRevenue / totalAssetValue) * 100).toFixed(1);

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
      <Grid cols={2} gap={4}>
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

      refetch();

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
        loading={false}
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
            await fetch('/api/assets/utilization/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
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
