'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Rocket, Pencil } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal, Grid, Stack, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig, } from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_ASSET_KITS,
  type DemoAssetKit as AssetKit,
} from '../../../lib/demo-data';

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
  const [data, setData] = useState<AssetKit[]>(DEMO_ASSET_KITS);
  const [selected, setSelected] = useState<AssetKit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalValue = data.reduce((s, k) => s + k.totalValue, 0);
  const availableKits = data.filter(k => k.status === 'Available').length;

  const rowActions: ListPageAction<AssetKit>[] = [
    { id: 'view', label: 'View Contents', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'deploy', label: 'Deploy Kit', icon: <Rocket className="size-4" />, onClick: (r) => setData(prev => prev.map(k => k.id === r.id ? { ...k, status: 'Deployed' as const } : k)) },
    { id: 'edit', label: 'Edit Kit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/assets/kits/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Kits', value: data.length },
    { label: 'Available', value: availableKits },
    { label: 'Total Value', value: formatCurrency(totalValue) },
    { label: 'Categories', value: 5 },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    const newKit: AssetKit = {
      id: `KIT-${String(data.length + 1).padStart(3, '0')}`,
      name: String(formData.name || ''),
      category: String(formData.category || 'Audio'),
      itemCount: 0,
      totalValue: 0,
      status: 'Available',
      description: String(formData.description || ''),
      items: [],
    };
    setData(prev => [...prev, newKit]);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Kit Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Item Count:</strong> {selected.itemCount}</Body>
        <Body size="sm"><strong>Total Value:</strong> {formatCurrency(selected.totalValue)}</Body>
        <Body size="sm"><strong>Last Used:</strong> {selected.lastUsed || 'Never'}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selected.description}</Body>
      </Grid>
    )},
    { id: 'contents', title: 'Kit Contents', content: (
      <Stack>
        {selected.items.map((item, idx) => (
          <Body key={idx} size="sm" className="border-b border-ink-700 py-2">
            <strong>{item.name}</strong> ({item.category}) - Qty: {item.quantity}
          </Body>
        ))}
      </Stack>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<AssetKit, 'id'>>({

    entityType: 'asset-kits',

    requiredFields: ['grandMA3', 'name', 'category'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/asset-kits', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('asset-kits');


  return (
    <AtlvsAppLayout>
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
        entityType="asset-kits"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['grandMA3', 'name', 'category', 'description', 'itemCount', 'totalValue', 'status']}
        onExport={createExportHandler({
          filename: "asset-kits",
          getData: () => data.map(kit => ({
            id: kit.id,
            name: kit.name,
            category: kit.category,
            itemCount: kit.itemCount,
            totalValue: kit.totalValue,
            status: kit.status,
            lastUsed: kit.lastUsed || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No kits found"
        emptyAction={{ label: 'Create Kit', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setData(prev => prev.filter(k => !ids.includes(k.id)));
          } else if (action === 'deploy') {
            setData(prev => prev.map(k => ids.includes(k.id) ? { ...k, status: 'Deployed' as const } : k));
          }
        }}
        bulkActions={[
          { id: 'deploy', label: 'Deploy Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
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
          actions={[{ id: 'deploy', label: 'Deploy Kit', icon: <Rocket className="size-4" /> }, { id: 'edit', label: 'Edit Kit', icon: <Pencil className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'deploy') setData(prev => prev.map(k => k.id === r.id ? { ...k, status: 'Deployed' as const } : k));
            if (id === 'edit') router.push(`/assets/kits/${r.id}/edit`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
