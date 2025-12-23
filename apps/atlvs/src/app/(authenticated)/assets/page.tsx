"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Upload, Wrench, Trash2, Download } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
  } from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useAssets, useDeleteAsset, type Asset as APIAsset } from "../../../hooks/useAssets";
import { DEMO_ASSETS } from '../../../lib/demo-data';

// Display type for UI
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

// Normalize API asset to display format
function normalizeAsset(a: APIAsset): Asset {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    location: a.location || 'Unknown',
    status: a.status === 'active' ? 'Available' : a.status === 'maintenance' ? 'Maintenance' : a.status,
    value: a.value,
    condition: 'Good',
    lastMaintenance: a.updated_at || '',
    nextMaintenance: '',
    utilization: 0.75,
    projects: 0,
  };
}


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
  const { addNotification } = useNotifications();
  const { data: apiAssets, isLoading, error, refetch } = useAssets();
  const deleteMutation = useDeleteAsset();
  
  // Use API data if available, fallback to demo data
  const rawAssets = apiAssets && apiAssets.length > 0 ? apiAssets : DEMO_ASSETS;
  const assets: Asset[] = Array.isArray(rawAssets) 
    ? rawAssets.map((a: APIAsset | Asset) => 'purchase_date' in a ? normalizeAsset(a as APIAsset) : a as Asset)
    : [];
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

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
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.name || ''),
          category: String(data.category || 'Audio'),
          location: String(data.location || ''),
          status: 'active',
          value: Number(data.value) || 0,
          purchase_date: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create asset');
      }
      setCreateModalOpen(false);
      addNotification({
        type: 'success',
        title: 'Asset Created',
        message: `Asset "${data.name}" has been created successfully.`,
      });
      refetch();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Asset',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  const handleDelete = async () => {
    if (assetToDelete) {
      try {
        await deleteMutation.mutateAsync(assetToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({
          type: 'success',
          title: 'Asset Deleted',
          message: `Asset "${assetToDelete.name}" has been deleted.`,
        });
        setAssetToDelete(null);
      } catch (err) {
        addNotification({
          type: 'error',
          title: 'Failed to Delete Asset',
          message: err instanceof Error ? err.message : 'An unexpected error occurred',
        });
      }
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
        await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: String(record.name || ''),
            category: String(record.category || 'Audio'),
            location: String(record.location || ''),
            status: 'active',
            value: Number(record.value) || 0,
            purchase_date: new Date().toISOString(),
          }),
        });
      }
      refetch();
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
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    <>
      <ListPage<Asset>
        title="Asset Management"
        subtitle="Production equipment, AV gear, staging, and technical inventory"
        data={assets}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
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
            await Promise.all(ids.map(assetId => deleteMutation.mutateAsync(assetId)));
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
    </>
  );
}
