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
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

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

const mockAssets: Asset[] = [
  { id: "AST-001", name: "Meyer Sound LEO Family Line Array", category: "Audio", location: "Warehouse A - Bay 3", status: "Available", value: 285000, condition: "Excellent", lastMaintenance: "2024-10-15", nextMaintenance: "2025-01-15", utilization: 0.82, projects: 47 },
  { id: "AST-002", name: "Robe MegaPointe Lighting Fixtures (24x)", category: "Lighting", location: "Warehouse A - Bay 1", status: "In Use", value: 156000, condition: "Good", lastMaintenance: "2024-09-20", nextMaintenance: "2024-12-20", utilization: 0.91, projects: 52 },
  { id: "AST-003", name: "disguise gx 2c Media Server", category: "Video", location: "Tech Room 2", status: "Maintenance", value: 48000, condition: "Fair", lastMaintenance: "2024-11-18", nextMaintenance: "2024-12-01", utilization: 0.75, projects: 38 },
  { id: "AST-004", name: "Staging Deck System (60x8 modules)", category: "Staging", location: "Warehouse B - Ground", status: "Available", value: 95000, condition: "Excellent", lastMaintenance: "2024-10-01", nextMaintenance: "2025-04-01", utilization: 0.68, projects: 41 },
  { id: "AST-005", name: "Chain Motor Hoists (20x 2-ton)", category: "Rigging", location: "Warehouse A - Bay 4", status: "Available", value: 42000, condition: "Good", lastMaintenance: "2024-11-01", nextMaintenance: "2025-02-01", utilization: 0.79, projects: 56 },
];

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

  const refetch = useCallback(() => setAssets(mockAssets), []);

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
    console.log('Create asset:', data);
    setCreateModalOpen(false);
    refetch();
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

  const stats = [
    { label: 'Total Assets', value: assets.length },
    { label: 'Total Value', value: `$${(totalValue / 1000).toFixed(0)}K` },
    { label: 'Avg Utilization', value: `${(avgUtilization * 100).toFixed(0)}%` },
    { label: 'Available', value: assets.filter(a => a.status === 'Available').length },
  ];

  const detailSections: DetailSection[] = selectedAsset ? [
    { id: 'overview', title: 'Asset Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Category:</strong> {selectedAsset.category}</div>
        <div><strong>Status:</strong> {selectedAsset.status}</div>
        <div><strong>Location:</strong> {selectedAsset.location}</div>
        <div><strong>Value:</strong> ${selectedAsset.value.toLocaleString()}</div>
        <div><strong>Condition:</strong> {selectedAsset.condition}</div>
        <div><strong>Utilization:</strong> {(selectedAsset.utilization * 100).toFixed(0)}%</div>
        <div><strong>Last Maintenance:</strong> {selectedAsset.lastMaintenance}</div>
        <div><strong>Next Maintenance:</strong> {selectedAsset.nextMaintenance}</div>
        <div><strong>Projects Used:</strong> {selectedAsset.projects}</div>
      </div>
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
        onBulkAction={(id, ids) => console.log('Bulk:', id, ids)}
        onRowClick={(r) => { setSelectedAsset(r); setDrawerOpen(true); }}
        createLabel="Add Asset"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No assets found"
        emptyAction={{ label: 'Add Asset', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Assets' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Asset" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedAsset} title={(a) => a.name} subtitle={(a) => a.id} sections={detailSections} onEdit={(a) => router.push(`/assets/${a.id}/edit`)} onDelete={(a) => { setAssetToDelete(a); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Asset" message={`Delete "${assetToDelete?.name}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setAssetToDelete(null); }} />
    </AtlvsAppLayout>
  );
}
