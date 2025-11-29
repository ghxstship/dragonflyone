'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';

interface IdleAsset {
  id: string;
  name: string;
  category: string;
  idleDays: number;
  lastUsed: string;
  location: string;
  value: number;
  monthlyCarryCost: number;
  recommendation: 'Sell' | 'Rent Out' | 'Redeploy' | 'Monitor';
  [key: string]: unknown;
}

const mockData: IdleAsset[] = [
  { id: 'AST-101', name: 'Meyer Sound LYON', category: 'Audio', idleDays: 45, lastUsed: '2024-10-10', location: 'Warehouse A', value: 85000, monthlyCarryCost: 850, recommendation: 'Rent Out' },
  { id: 'AST-102', name: 'Robe MegaPointe (12)', category: 'Lighting', idleDays: 62, lastUsed: '2024-09-23', location: 'Warehouse B', value: 48000, monthlyCarryCost: 480, recommendation: 'Redeploy' },
  { id: 'AST-103', name: 'Blackmagic ATEM 4K', category: 'Video', idleDays: 90, lastUsed: '2024-08-26', location: 'Warehouse A', value: 12000, monthlyCarryCost: 120, recommendation: 'Sell' },
  { id: 'AST-104', name: 'CM Lodestar 2T (8)', category: 'Rigging', idleDays: 30, lastUsed: '2024-10-25', location: 'Warehouse C', value: 32000, monthlyCarryCost: 320, recommendation: 'Monitor' },
  { id: 'AST-105', name: 'Stageline SL100', category: 'Staging', idleDays: 120, lastUsed: '2024-07-26', location: 'Yard', value: 95000, monthlyCarryCost: 1200, recommendation: 'Sell' },
];

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
  const [data] = useState<IdleAsset[]>(mockData);
  const [selected, setSelected] = useState<IdleAsset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalIdleValue = data.reduce((s, a) => s + a.value, 0);
  const totalCarryCost = data.reduce((s, a) => s + a.monthlyCarryCost, 0);
  const avgIdleDays = Math.round(data.reduce((s, a) => s + a.idleDays, 0) / data.length);

  const rowActions: ListPageAction<IdleAsset>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'action', label: 'Take Action', icon: '⚡', onClick: (r) => console.log('Action', r.id) },
  ];

  const stats = [
    { label: 'Idle Assets', value: data.length },
    { label: 'Idle Value', value: formatCurrency(totalIdleValue) },
    { label: 'Monthly Carry Cost', value: formatCurrency(totalCarryCost) },
    { label: 'Avg Idle Days', value: avgIdleDays },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Idle Asset Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Asset:</strong> {selected.name}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Idle Days:</strong> {selected.idleDays}</div>
        <div><strong>Last Used:</strong> {selected.lastUsed}</div>
        <div><strong>Location:</strong> {selected.location}</div>
        <div><strong>Value:</strong> {formatCurrency(selected.value)}</div>
        <div><strong>Monthly Carry:</strong> {formatCurrency(selected.monthlyCarryCost)}</div>
        <div><strong>Recommendation:</strong> {selected.recommendation}</div>
        <div className="col-span-2"><strong>Annual Carry Cost:</strong> {formatCurrency(selected.monthlyCarryCost * 12)}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<IdleAsset>
        title="Idle Asset Analysis"
        subtitle="Asset utilization rates and idle time analysis"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search idle assets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No idle assets found"
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: 'Idle Analysis' }]}
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
          title={(r) => r.name}
          subtitle={(r) => `${r.category} • ${r.idleDays} days idle • ${r.recommendation}`}
          sections={detailSections}
          actions={[{ id: 'sell', label: 'List for Sale', icon: '💰' }, { id: 'rent', label: 'List for Rental', icon: '📋' }, { id: 'assign', label: 'Assign to Project', icon: '📦' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
