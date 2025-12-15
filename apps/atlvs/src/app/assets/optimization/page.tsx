'use client';

import { useState } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Stack, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates, useOptimization, type OptimizationRecommendation } from '@ghxstship/config';
import { DEMO_OPTIMIZATION_RECOMMENDATIONS } from '../../../lib/demo-data';

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

const getPriorityVariant = (priority: string): 'solid' | 'outline' | 'ghost' => {
  switch (priority) { case 'high': return 'solid'; case 'medium': return 'outline'; case 'low': return 'ghost'; default: return 'ghost'; }
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<OptimizationRecommendation>[] = [
  { key: 'asset_name', label: 'Asset', accessor: 'asset_name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'type', label: 'Type', accessor: (r) => r.type.replace('_', ' '), render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'current_utilization', label: 'Utilization', accessor: (r) => `${r.current_utilization}% → ${r.target_utilization}%` },
  { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, render: (v) => <Badge variant={getPriorityVariant(String(v))}>{String(v)}</Badge> },
  { key: 'potential_savings', label: 'Savings', accessor: (r) => formatCurrency(r.potential_savings), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v).replace('_', ' ')}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'underutilized', label: 'Underutilized' }, { value: 'overutilized', label: 'Overutilized' }, { value: 'maintenance_due', label: 'Maintenance Due' }, { value: 'replacement', label: 'Replacement' }, { value: 'consolidation', label: 'Consolidation' }] },
  { key: 'priority', label: 'Priority', options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] },
  { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'in_progress', label: 'In Progress' }, { value: 'implemented', label: 'Implemented' }, { value: 'dismissed', label: 'Dismissed' }] },
];

export default function AssetOptimizationPage() {
  const [selected, setSelected] = useState<OptimizationRecommendation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real API integration with demo fallback
  const { recommendations: apiData, isLoading, error, updateStatusAsync, deleteRecommendationsAsync, bulkUpdateStatusAsync, refetch } = useOptimization();
  const data: OptimizationRecommendation[] = apiData.length > 0 ? apiData : (DEMO_OPTIMIZATION_RECOMMENDATIONS as unknown as OptimizationRecommendation[]);

  const pendingCount = data.filter(r => r.status === 'pending').length;
  const highPriorityCount = data.filter(r => r.priority === 'high' && r.status === 'pending').length;
  const totalSavings = data.filter(r => r.status !== 'dismissed').reduce((sum, r) => sum + r.potential_savings, 0);
  const avgUtilization = data.length > 0 ? Math.round(data.reduce((sum, r) => sum + r.current_utilization, 0) / data.length) : 0;

  const handleStatusChange = async (r: OptimizationRecommendation, status: string) => {
    try {
      await updateStatusAsync({ id: r.id, status });
      refetch();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const rowActions: ListPageAction<OptimizationRecommendation>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'implement', label: 'Implement', icon: <Check className="size-4" />, onClick: (r) => handleStatusChange(r, 'implemented') },
    { id: 'dismiss', label: 'Dismiss', icon: <X className="size-4" />, onClick: (r) => handleStatusChange(r, 'dismissed') },
  ];

  const stats = [
    { label: 'Pending Actions', value: pendingCount },
    { label: 'High Priority', value: highPriorityCount },
    { label: 'Potential Savings', value: `$${(totalSavings / 1000).toFixed(0)}K` },
    { label: 'Avg Utilization', value: `${avgUtilization}%` },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Recommendation Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Asset:</strong> {selected.asset_name}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Type:</strong> {selected.type.replace('_', ' ')}</Body>
        <Body size="sm"><strong>Priority:</strong> {selected.priority}</Body>
        <Body size="sm"><strong>Current Utilization:</strong> {selected.current_utilization}%</Body>
        <Body size="sm"><strong>Target Utilization:</strong> {selected.target_utilization}%</Body>
        <Body size="sm"><strong>Potential Savings:</strong> {formatCurrency(selected.potential_savings)}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status.replace('_', ' ')}</Body>
        <Body size="sm" className="col-span-2"><strong>Recommendation:</strong> {selected.recommendation}</Body>
      </Grid>
    )},
    { id: 'actions', title: 'Action Items', content: (
      <Stack>
        {selected.action_items.map((item, idx) => (
          <Body key={idx} size="sm" className="border-b border-ink-700 py-2">
            {idx + 1}. {item}
          </Body>
        ))}
      </Stack>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<OptimizationRecommendation, 'id'>>({

    entityType: 'optimization',

    requiredFields: ['asset_name', 'category', 'type'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/optimization', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('optimization');


  return (
    <AtlvsAppLayout>
      <ListPage<OptimizationRecommendation>
        title="Inventory Optimization"
        subtitle="Usage patterns and optimization recommendations"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search recommendations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="optimization"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['asset_name', 'category', 'type', 'current_utilization', 'priority', 'potential_savings', 'status']}
        onExport={createExportHandler({
          filename: "optimization-recommendations",
          getData: () => data.map(r => ({
            id: r.id,
            type: r.type,
            assetName: r.asset_name,
            category: r.category,
            priority: r.priority,
            status: r.status,
            potentialSavings: r.potential_savings,
            recommendation: r.recommendation,
          })),
        })}
        stats={stats}
        emptyMessage="No recommendations found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteRecommendationsAsync(ids);
            refetch();
          } else if (action === 'implement') {
            await bulkUpdateStatusAsync({ ids, status: 'implemented' });
            refetch();
          } else if (action === 'dismiss') {
            await bulkUpdateStatusAsync({ ids, status: 'dismissed' });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'implement', label: 'Implement Selected', variant: 'default' },
          { id: 'dismiss', label: 'Dismiss Selected', variant: 'default' },
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
          title={(r) => r.asset_name}
          subtitle={(r) => `${r.type.replace('_', ' ')} • ${r.priority} priority • ${formatCurrency(r.potential_savings)} savings`}
          sections={detailSections}
          actions={[{ id: 'implement', label: 'Implement', icon: <Check className="size-4" /> }, { id: 'dismiss', label: 'Dismiss', icon: <X className="size-4" /> }]}
          onAction={async (id, r) => {
            if (id === 'implement') await handleStatusChange(r, 'implemented');
            if (id === 'dismiss') await handleStatusChange(r, 'dismissed');
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
