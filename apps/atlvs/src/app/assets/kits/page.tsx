'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface AssetKit {
  id: string;
  name: string;
  category: string;
  itemCount: number;
  totalValue: number;
  status: 'Available' | 'Deployed' | 'Partial';
  lastUsed?: string;
  description: string;
  items: { name: string; quantity: number; category: string }[];
  [key: string]: unknown;
}

const mockData: AssetKit[] = [
  { id: 'KIT-001', name: 'Festival Main Stage Audio', category: 'Audio', itemCount: 48, totalValue: 425000, status: 'Available', lastUsed: '2024-11-15', description: 'Complete L-Acoustics K2 system with subs and processing', items: [{ name: 'L-Acoustics K2', quantity: 24, category: 'Speakers' }, { name: 'KS28 Subs', quantity: 16, category: 'Speakers' }, { name: 'LA12X Amps', quantity: 8, category: 'Amplifiers' }] },
  { id: 'KIT-002', name: 'Corporate Event Lighting', category: 'Lighting', itemCount: 32, totalValue: 85000, status: 'Deployed', lastUsed: '2024-11-20', description: 'Versatile lighting package for corporate events', items: [{ name: 'Clay Paky Sharpy', quantity: 12, category: 'Moving Lights' }, { name: 'ETC Source Four', quantity: 16, category: 'Conventionals' }, { name: 'grandMA3', quantity: 1, category: 'Consoles' }] },
  { id: 'KIT-003', name: 'Video Wall 20x10', category: 'Video', itemCount: 200, totalValue: 320000, status: 'Available', description: 'ROE CB5 LED wall configuration', items: [{ name: 'ROE CB5 Panels', quantity: 200, category: 'LED' }, { name: 'Brompton Processors', quantity: 4, category: 'Processing' }] },
  { id: 'KIT-004', name: 'Outdoor Stage Package', category: 'Staging', itemCount: 156, totalValue: 175000, status: 'Partial', description: '40x32 outdoor stage with roof system', items: [{ name: 'Stage Decks', quantity: 80, category: 'Decking' }, { name: 'Roof Sections', quantity: 24, category: 'Roof' }, { name: 'Legs 4ft', quantity: 52, category: 'Support' }] },
];

const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<AssetKit>[] = [
  { key: 'name', label: 'Kit Name', accessor: 'name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'itemCount', label: 'Items', accessor: 'itemCount', sortable: true },
  { key: 'totalValue', label: 'Value', accessor: (r) => formatCurrency(r.totalValue), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'lastUsed', label: 'Last Used', accessor: (r) => r.lastUsed || 'Never', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Available', label: 'Available' }, { value: 'Deployed', label: 'Deployed' }, { value: 'Partial', label: 'Partial' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Kit Name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }] },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
];

export default function AssetKitsPage() {
  const router = useRouter();
  const [data] = useState<AssetKit[]>(mockData);
  const [selected, setSelected] = useState<AssetKit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalValue = data.reduce((s, k) => s + k.totalValue, 0);
  const availableKits = data.filter(k => k.status === 'Available').length;

  const rowActions: ListPageAction<AssetKit>[] = [
    { id: 'view', label: 'View Contents', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'deploy', label: 'Deploy Kit', icon: '🚀', onClick: (r) => console.log('Deploy', r.id) },
    { id: 'edit', label: 'Edit Kit', icon: '✏️', onClick: (r) => console.log('Edit', r.id) },
  ];

  const stats = [
    { label: 'Total Kits', value: data.length },
    { label: 'Available', value: availableKits },
    { label: 'Total Value', value: formatCurrency(totalValue) },
    { label: 'Categories', value: 5 },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    console.log('Create kit:', formData);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Kit Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selected.name}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Item Count:</strong> {selected.itemCount}</div>
        <div><strong>Total Value:</strong> {formatCurrency(selected.totalValue)}</div>
        <div><strong>Last Used:</strong> {selected.lastUsed || 'Never'}</div>
        <div className="col-span-2"><strong>Description:</strong> {selected.description}</div>
      </div>
    )},
    { id: 'contents', title: 'Kit Contents', content: (
      <div>
        {selected.items.map((item, idx) => (
          <div key={idx} className="py-2 border-b border-ink-700">
            <strong>{item.name}</strong> ({item.category}) - Qty: {item.quantity}
          </div>
        ))}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<AssetKit>
        title="Asset Kits"
        subtitle="Pre-configured equipment bundles and packages"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search kits..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        createLabel="Create Kit"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No kits found"
        emptyAction={{ label: 'Create Kit', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Assets', href: '/assets' }, { label: 'Kits' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Create Kit" fields={formFields} onSubmit={handleCreate} />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.category} • ${r.itemCount} items • ${formatCurrency(r.totalValue)}`}
          sections={detailSections}
          actions={[{ id: 'deploy', label: 'Deploy Kit', icon: '🚀' }, { id: 'edit', label: 'Edit Kit', icon: '✏️' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
