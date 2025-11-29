'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface OptimizationRecommendation {
  id: string;
  type: 'underutilized' | 'overutilized' | 'maintenance_due' | 'replacement' | 'consolidation' | 'reallocation';
  priority: 'high' | 'medium' | 'low';
  asset_id: string;
  asset_name: string;
  category: string;
  current_utilization: number;
  target_utilization: number;
  recommendation: string;
  potential_savings: number;
  action_items: string[];
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
  [key: string]: unknown;
}

const mockData: OptimizationRecommendation[] = [
  { id: 'REC-001', type: 'underutilized', priority: 'high', asset_id: 'AST-001', asset_name: 'LED Wall Panel Set A', category: 'Video', current_utilization: 15, target_utilization: 60, recommendation: 'Consider rental pooling or sale. Asset has been idle for 85% of the quarter.', potential_savings: 25000, action_items: ['List on rental marketplace', 'Get appraisal for sale', 'Review upcoming project needs'], status: 'pending' },
  { id: 'REC-002', type: 'overutilized', priority: 'medium', asset_id: 'AST-002', asset_name: 'Meyer Sound Line Array', category: 'Audio', current_utilization: 95, target_utilization: 75, recommendation: 'High demand asset. Consider purchasing additional units to reduce scheduling conflicts.', potential_savings: 15000, action_items: ['Request capital budget', 'Evaluate rental costs vs purchase', 'Review booking conflicts'], status: 'in_progress' },
  { id: 'REC-003', type: 'maintenance_due', priority: 'high', asset_id: 'AST-003', asset_name: 'Lighting Console grandMA3', category: 'Lighting', current_utilization: 70, target_utilization: 70, recommendation: 'Preventive maintenance overdue by 30 days. Schedule service to avoid downtime.', potential_savings: 5000, action_items: ['Schedule maintenance window', 'Arrange backup console', 'Update service records'], status: 'pending' },
  { id: 'REC-004', type: 'consolidation', priority: 'low', asset_id: 'AST-004', asset_name: 'Cable Inventory', category: 'Infrastructure', current_utilization: 40, target_utilization: 60, recommendation: 'Multiple cable types with low utilization. Consolidate to standard types.', potential_savings: 8000, action_items: ['Audit cable inventory', 'Identify redundant types', 'Create standardization plan'], status: 'pending' },
  { id: 'REC-005', type: 'replacement', priority: 'medium', asset_id: 'AST-005', asset_name: 'PTZ Camera Set', category: 'Video', current_utilization: 65, target_utilization: 70, recommendation: 'Asset approaching end of life. Plan replacement within 6 months.', potential_savings: 12000, action_items: ['Research replacement models', 'Get quotes', 'Plan transition timeline'], status: 'pending' },
];

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
  const router = useRouter();
  const [data, setData] = useState<OptimizationRecommendation[]>(mockData);
  const [selected, setSelected] = useState<OptimizationRecommendation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pendingCount = data.filter(r => r.status === 'pending').length;
  const highPriorityCount = data.filter(r => r.priority === 'high' && r.status === 'pending').length;
  const totalSavings = data.filter(r => r.status !== 'dismissed').reduce((sum, r) => sum + r.potential_savings, 0);
  const avgUtilization = Math.round(data.reduce((sum, r) => sum + r.current_utilization, 0) / data.length);

  const rowActions: ListPageAction<OptimizationRecommendation>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'implement', label: 'Implement', icon: '✅', onClick: (r) => setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'implemented' as const } : rec)) },
    { id: 'dismiss', label: 'Dismiss', icon: '❌', onClick: (r) => setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'dismissed' as const } : rec)) },
  ];

  const stats = [
    { label: 'Pending Actions', value: pendingCount },
    { label: 'High Priority', value: highPriorityCount },
    { label: 'Potential Savings', value: `$${(totalSavings / 1000).toFixed(0)}K` },
    { label: 'Avg Utilization', value: `${avgUtilization}%` },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Recommendation Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Asset:</strong> {selected.asset_name}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Type:</strong> {selected.type.replace('_', ' ')}</div>
        <div><strong>Priority:</strong> {selected.priority}</div>
        <div><strong>Current Utilization:</strong> {selected.current_utilization}%</div>
        <div><strong>Target Utilization:</strong> {selected.target_utilization}%</div>
        <div><strong>Potential Savings:</strong> {formatCurrency(selected.potential_savings)}</div>
        <div><strong>Status:</strong> {selected.status.replace('_', ' ')}</div>
        <div className="col-span-2"><strong>Recommendation:</strong> {selected.recommendation}</div>
      </div>
    )},
    { id: 'actions', title: 'Action Items', content: (
      <div>
        {selected.action_items.map((item, idx) => (
          <div key={idx} className="py-2 border-b border-ink-700">
            {idx + 1}. {item}
          </div>
        ))}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<OptimizationRecommendation>
        title="Inventory Optimization"
        subtitle="Usage patterns and optimization recommendations"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search recommendations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No recommendations found"
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: 'Optimization' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.asset_name}
          subtitle={(r) => `${r.type.replace('_', ' ')} • ${r.priority} priority • ${formatCurrency(r.potential_savings)} savings`}
          sections={detailSections}
          actions={[{ id: 'implement', label: 'Implement', icon: '✅' }, { id: 'dismiss', label: 'Dismiss', icon: '❌' }]}
          onAction={(id, r) => {
            if (id === 'implement') setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'implemented' as const } : rec));
            if (id === 'dismiss') setData(data.map(rec => rec.id === r.id ? { ...rec, status: 'dismissed' as const } : rec));
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
