'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';

interface AssetPerformance {
  id: string;
  name: string;
  category: string;
  utilizationRate: number;
  uptime: number;
  failureCount: number;
  mtbf: number;
  mttr: number;
  healthScore: number;
  predictedFailure?: string;
  lastMaintenance: string;
  [key: string]: unknown;
}

const mockData: AssetPerformance[] = [
  { id: 'AST-001', name: 'L-Acoustics K2 Array', category: 'Audio', utilizationRate: 78, uptime: 99.2, failureCount: 1, mtbf: 2400, mttr: 4, healthScore: 92, lastMaintenance: '2024-10-15' },
  { id: 'AST-002', name: 'Clay Paky Sharpy Plus', category: 'Lighting', utilizationRate: 85, uptime: 98.5, failureCount: 3, mtbf: 1800, mttr: 2, healthScore: 88, predictedFailure: '2025-02-15', lastMaintenance: '2024-11-01' },
  { id: 'AST-003', name: 'ROE Visual CB5 Panels', category: 'Video', utilizationRate: 62, uptime: 99.8, failureCount: 0, mtbf: 3200, mttr: 1, healthScore: 98, lastMaintenance: '2024-09-20' },
  { id: 'AST-004', name: 'CM Lodestar 1T Hoists', category: 'Rigging', utilizationRate: 71, uptime: 99.5, failureCount: 2, mtbf: 2100, mttr: 6, healthScore: 85, predictedFailure: '2025-01-20', lastMaintenance: '2024-10-25' },
  { id: 'AST-005', name: 'DiGiCo SD12 Console', category: 'Audio', utilizationRate: 92, uptime: 100, failureCount: 0, mtbf: 4000, mttr: 0, healthScore: 100, lastMaintenance: '2024-11-10' },
];

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
  const [data] = useState<AssetPerformance[]>(mockData);
  const [selected, setSelected] = useState<AssetPerformance | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const avgUtilization = Math.round(data.reduce((s, a) => s + a.utilizationRate, 0) / data.length);
  const avgUptime = (data.reduce((s, a) => s + a.uptime, 0) / data.length).toFixed(1);
  const totalFailures = data.reduce((s, a) => s + a.failureCount, 0);
  const atRiskCount = data.filter(a => a.predictedFailure).length;

  const rowActions: ListPageAction<AssetPerformance>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'maintenance', label: 'Schedule Maintenance', icon: '🔧', onClick: (r) => router.push(`/assets/maintenance?asset=${r.id}`) },
  ];

  const stats = [
    { label: 'Avg Utilization', value: `${avgUtilization}%` },
    { label: 'Avg Uptime', value: `${avgUptime}%` },
    { label: 'Total Failures (YTD)', value: totalFailures },
    { label: 'At Risk Assets', value: atRiskCount },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Performance Metrics', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Asset:</strong> {selected.name}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Utilization:</strong> {selected.utilizationRate}%</div>
        <div><strong>Uptime:</strong> {selected.uptime}%</div>
        <div><strong>MTBF:</strong> {selected.mtbf} hours</div>
        <div><strong>MTTR:</strong> {selected.mttr} hours</div>
        <div><strong>Health Score:</strong> {selected.healthScore}</div>
        <div><strong>Failures (YTD):</strong> {selected.failureCount}</div>
        <div><strong>Last Maintenance:</strong> {selected.lastMaintenance}</div>
        {selected.predictedFailure && <div><strong>Predicted Failure:</strong> {selected.predictedFailure}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<AssetPerformance>
        title="Asset Performance Analytics"
        subtitle="Performance metrics and failure prediction for all assets"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No performance data found"
        header={<Navigation />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.category} • Health: ${r.healthScore} • Uptime: ${r.uptime}%`}
          sections={detailSections}
          actions={[{ id: 'maintenance', label: 'Schedule Maintenance', icon: '🔧' }]}
          onAction={(id, r) => { if (id === 'maintenance') router.push(`/assets/maintenance?asset=${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
