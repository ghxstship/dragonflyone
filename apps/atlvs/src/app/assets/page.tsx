"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Upload, Wrench, Trash2, Download } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
  } from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

interface Asset {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  value: number;
  condition: string;
  lastMaintenance: string;
  nextMaintenance: string;
  utilization: number;
  projects: number;
}

import { DEMO_ASSETS } from '../../lib/demo-data';

const mockAssets = DEMO_ASSETS as Asset[];


const columns: ListPageColumn<Asset>[] = [
  { key: 'name', label: 'Asset', accessor: 'name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'location', label: 'Location', accessor: 'location' },
  { key: 'value', label: 'Value', accessor: (r) => `$${(r.value / 1000).toFixed(0)}K`, sortable: true },
  { key: 'condition', label: 'Condition', accessor: 'condition' },
  { key: 'utilization', label: 'Utilization', accessor: (r) => `${(r.utilization * 100).toFixed(0)}%`, sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'Available' ? 'solid' : 'outline'}>{String(v)}</Badge> },
  { key: 'nextMaintenance', label: 'Next Maint.', accessor: 'nextMaintenance', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Available', label: 'Available' }, { value: 'In Use', label: 'In Use' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Reserved', label: 'Reserved' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Asset Name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
  { name: 'location', label: 'Location', type: 'text', required: true },
  { name: 'value', label: 'Value ($)', type: 'number', required: true },
  { name: 'condition', label: 'Condition', type: 'select', options: [{ value: 'Excellent', label: 'Excellent' }, { value: 'Good', label: 'Good' }, { value: 'Fair', label: 'Fair' }, { value: 'Poor', label: 'Poor' }] },
  { name: 'nextMaintenance', label: 'Next Maintenance', type: 'date' },
];

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      setAssets(mockAssets);
      setLoading(false);
    }, 300);
  }, []);

  const rowActions: ListPageAction<Asset>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedAsset(r); setDrawerOpen(true); } },
    { id: 'checkout', label: 'Check Out', icon: <Upload className="size-4" />, onClick: (r) => router.push(`/assets/${r.id}/checkout`) },
    { id: 'maintenance', label: 'Schedule Maintenance', icon: <Wrench className="size-4" />, onClick: (r) => router.push(`/assets/${r.id}/maintenance`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setAssetToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'maintenance', label: 'Schedule Maintenance', icon: <Wrench className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newAsset: Asset = {
      id: `AST-${String(assets.length + 1).padStart(3, '0')}`,
      name: String(data.name || ''),
      category: String(data.category || 'Audio'),
      location: String(data.location || ''),
      status: 'Available',
      value: Number(data.value) || 0,
      condition: String(data.condition || 'Good'),
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: String(data.nextMaintenance || ''),
      utilization: 0,
      projects: 0,
    };
    setAssets(prev => [...prev, newAsset]);
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (assetToDelete) {
      setAssets(prev => prev.filter(a => a.id !== assetToDelete.id));
      setDeleteConfirmOpen(false);
      setAssetToDelete(null);
    }
  };

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
  const avgUtilization = assets.length > 0 ? assets.reduce((sum, a) => sum + a.utilization, 0) / assets.length : 0;

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'assets',
    requiredFields: ['name', 'category'],
    onImport: async (records) => {
      for (const record of records) {
        const newAsset: Asset = {
          id: `AST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: String(record.name || ''),
          category: String(record.category || 'Audio'),
          location: String(record.location || ''),
          status: 'Available',
          value: Number(record.value) || 0,
          condition: String(record.condition || 'Good'),
          lastMaintenance: new Date().toISOString().split('T')[0],
          nextMaintenance: '',
          utilization: 0,
          projects: 0,
        };
        setAssets(prev => [...prev, newAsset]);
      }
    },
  });

  const importTemplates = getImportTemplates('assets').length > 0 
    ? getImportTemplates('assets') 
    : [{ id: 'default', name: 'Asset Import', mapping: { name: 'name', category: 'category', location: 'location', value: 'value', condition: 'condition' } }];

  const stats = [
    { label: 'Total Assets', value: assets.length },
    { label: 'Total Value', value: `$${(totalValue / 1000).toFixed(0)}K` },
    { label: 'Avg Utilization', value: `${(avgUtilization * 100).toFixed(0)}%` },
    { label: 'Available', value: assets.filter(a => a.status === 'Available').length },
  ];

  const detailSections: DetailSection[] = selectedAsset ? [
    { id: 'overview', title: 'Asset Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Category:</strong> {selectedAsset.category}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedAsset.status}</Body>
        <Body size="sm"><strong>Location:</strong> {selectedAsset.location}</Body>
        <Body size="sm"><strong>Value:</strong> ${selectedAsset.value.toLocaleString()}</Body>
        <Body size="sm"><strong>Condition:</strong> {selectedAsset.condition}</Body>
        <Body size="sm"><strong>Utilization:</strong> {(selectedAsset.utilization * 100).toFixed(0)}%</Body>
        <Body size="sm"><strong>Last Maintenance:</strong> {selectedAsset.lastMaintenance}</Body>
        <Body size="sm"><strong>Next Maintenance:</strong> {selectedAsset.nextMaintenance}</Body>
        <Body size="sm"><strong>Projects Used:</strong> {selectedAsset.projects}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Asset>
        title="Asset Management"
        subtitle="Production equipment, AV gear, staging, and technical inventory"
        data={assets}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={refetch}
        searchPlaceholder="Search assets..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (id, ids) => {
          if (id === 'export') {
            const exportData = assets.filter(a => ids.includes(a.id));
            const headers = Object.keys(exportData[0] || {}).join(',');
            const rows = exportData.map(a => Object.values(a).map(v => `"${v}"`).join(','));
            const csv = [headers, ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
          } else if (id === 'maintenance') {
            router.push(`/assets/maintenance/schedule?ids=${ids.join(',')}`);
          } else if (id === 'delete') {
            setAssets(prev => prev.filter(a => !ids.includes(a.id)));
          }
        }}
        onRowClick={(r) => { setSelectedAsset(r); setDrawerOpen(true); }}
        createLabel="Add Asset"
        onCreate={() => setCreateModalOpen(true)}
        entityType="assets"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'category', 'location', 'value', 'condition']}
        onExport={createExportHandler({
          filename: "assets",
          getData: () => assets.map(a => ({
            id: a.id,
            name: a.name,
            category: a.category,
            location: a.location,
            status: a.status,
            value: a.value || 0,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No assets found"
        emptyAction={{ label: 'Add Asset', onClick: () => setCreateModalOpen(true) }}
showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Asset" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedAsset} title={(a) => a.name} subtitle={(a) => a.id} sections={detailSections} onEdit={(a) => router.push(`/assets/${a.id}/edit`)} onDelete={(a) => { setAssetToDelete(a); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Asset" message={`Delete "${assetToDelete?.name}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setAssetToDelete(null); }} />
    </AtlvsAppLayout>
  );
}
