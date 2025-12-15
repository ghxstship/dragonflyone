'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Zap, DollarSign, ClipboardList, Package } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useIdleAssets, type IdleAsset } from '@ghxstship/config';
import { DEMO_IDLE_ASSETS } from '../../../lib/demo-data';

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

const getRecVariant = (rec: string): 'solid' | 'outline' | 'ghost' => {
  switch (rec) { case 'Sell': return 'solid'; case 'Rent Out': return 'outline'; case 'Redeploy': return 'outline'; case 'Monitor': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<IdleAsset>[] = [
  { key: 'name', label: 'Asset', accessor: (r) => `${r.name} (${r.id})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'idleDays', label: 'Idle Days', accessor: 'idleDays', sortable: true },
  { key: 'lastUsed', label: 'Last Used', accessor: 'lastUsed', sortable: true },
  { key: 'value', label: 'Value', accessor: (r) => formatCurrency(r.value), sortable: true },
  { key: 'monthlyCarryCost', label: 'Carry Cost', accessor: (r) => `${formatCurrency(r.monthlyCarryCost)}/mo` },
  { key: 'recommendation', label: 'Recommendation', accessor: 'recommendation', sortable: true, render: (v) => <Badge variant={getRecVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Rigging', label: 'Rigging' }, { value: 'Staging', label: 'Staging' }] },
  { key: 'recommendation', label: 'Recommendation', options: [{ value: 'Sell', label: 'Sell' }, { value: 'Rent Out', label: 'Rent Out' }, { value: 'Redeploy', label: 'Redeploy' }, { value: 'Monitor', label: 'Monitor' }] },
];

export default function IdleAnalysisPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<IdleAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real API integration with demo fallback
  const { assets: apiData, isLoading, error, deleteAssetsAsync, refetch } = useIdleAssets();
  const data: IdleAsset[] = apiData.length > 0 ? apiData : (DEMO_IDLE_ASSETS as unknown as IdleAsset[]);

  const totalIdleValue = data.reduce((s, a) => s + a.value, 0);
  const totalCarryCost = data.reduce((s, a) => s + a.monthlyCarryCost, 0);
  const avgIdleDays = data.length > 0 ? Math.round(data.reduce((s, a) => s + a.idleDays, 0) / data.length) : 0;

  const rowActions: ListPageAction<IdleAsset>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'action', label: 'Take Action', icon: <Zap className="size-4" />, onClick: (r) => router.push(`/assets/idle-analysis/${r.id}/action`) },
  ];

  const stats = [
    { label: 'Idle Assets', value: data.length },
    { label: 'Idle Value', value: formatCurrency(totalIdleValue) },
    { label: 'Monthly Carry Cost', value: formatCurrency(totalCarryCost) },
    { label: 'Avg Idle Days', value: avgIdleDays },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Idle Asset Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Asset:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Idle Days:</strong> {selected.idleDays}</Body>
        <Body size="sm"><strong>Last Used:</strong> {selected.lastUsed}</Body>
        <Body size="sm"><strong>Location:</strong> {selected.location}</Body>
        <Body size="sm"><strong>Value:</strong> {formatCurrency(selected.value)}</Body>
        <Body size="sm"><strong>Monthly Carry:</strong> {formatCurrency(selected.monthlyCarryCost)}</Body>
        <Body size="sm"><strong>Recommendation:</strong> {selected.recommendation}</Body>
        <Body size="sm" className="col-span-2"><strong>Annual Carry Cost:</strong> {formatCurrency(selected.monthlyCarryCost * 12)}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<IdleAsset, 'id'>>({

    entityType: 'idle-assets',

    requiredFields: ['name', 'category', 'idleDays'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/idle-assets', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('idle-assets');


  return (
    <AtlvsAppLayout>
      <ListPage<IdleAsset>
        title="Idle Asset Analysis"
        subtitle="Asset utilization rates and idle time analysis"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search idle assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="idle-assets"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'category', 'idleDays', 'lastUsed', 'value', 'monthlyCarryCost', 'recommendation']}
        onExport={createExportHandler({
          filename: "idle-assets",
          getData: () => data.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category,
            idleDays: a.idleDays,
            lastUsed: a.lastUsed,
            location: a.location,
            status: a.status,
            monthlyDepreciation: a.monthlyDepreciation,
          })),
        })}
        stats={stats}
        emptyMessage="No idle assets found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteAssetsAsync(ids);
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
          subtitle={(r) => `${r.category} • ${r.idleDays} days idle • ${r.recommendation}`}
          sections={detailSections}
          actions={[{ id: 'sell', label: 'List for Sale', icon: <DollarSign className="size-4" /> }, { id: 'rent', label: 'List for Rental', icon: <ClipboardList className="size-4" /> }, { id: 'assign', label: 'Assign to Project', icon: <Package className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'sell') router.push(`/assets/${r.id}/sell`);
            if (id === 'rent') router.push(`/assets/${r.id}/rental`);
            if (id === 'assign') router.push(`/assets/${r.id}/assign`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
