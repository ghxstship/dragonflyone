'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, ClipboardList, Wrench, Trash2, Download } from 'lucide-react';
// Layout provided by route group
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body, useToast,
  type ListPageAction, type ListPageBulkAction, type ListPageColumn, type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, PlatformRole, useEntityConfig } from '@ghxstship/config';
import { ErrorBoundary } from '../../../components/error-boundaries';

// Roles that can manage equipment (COMPVSS has no SUPER_ADMIN, only ADMIN)
const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];
import { useEquipment } from '@/hooks/useEquipment';

interface Equipment {
  id: string;
  name?: string;
  tag: string;
  type?: string;
  category?: string;
  status?: string;
  state?: string;
  location?: string;
  serial_number?: string;
  last_maintenance?: string;
  assigned_to?: string;
  project_id?: string;
  projects?: { name: string };
}

// SSOT: Columns, filters, and formFields are provided by useEntityConfig

export default function EquipmentPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: equipment, isLoading, error, refetch } = useEquipment({});

  // SSOT: Get columns, filters, and formFields from entity registry
  const { columns, filters, formFields } = useEntityConfig<Equipment>({ entityName: 'equipment' });

  // RBAC: Check if user has admin access for manage operations
  const canManageEquipment = ADMIN_ROLES.some(role => hasRole(role));
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  const equipmentList = (equipment || []) as unknown as Equipment[];

  const rowActions: ListPageAction<Equipment>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedEquipment(row); setDrawerOpen(true); } },
    ...(canManageEquipment ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row: Equipment) => router.push(`/equipment/${row.id}/edit`) },
      { id: 'assign', label: 'Assign', icon: <ClipboardList className="size-4" />, onClick: (row: Equipment) => router.push(`/equipment/${row.id}/assign`) },
      { id: 'maintenance', label: 'Log Maintenance', icon: <Wrench className="size-4" />, onClick: (row: Equipment) => router.push(`/equipment/${row.id}/maintenance`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (row: Equipment) => { setEquipmentToDelete(row); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  const bulkActions: ListPageBulkAction[] = [
    ...(canManageEquipment ? [
      { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" /> },
      { id: 'maintenance', label: 'Schedule Maintenance', icon: <Wrench className="size-4" /> },
    ] : []),
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    ...(canManageEquipment ? [
      { id: 'retire', label: 'Retire', icon: <Trash2 className="size-4" />, variant: 'danger' as const },
    ] : []),
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setCreateModalOpen(false);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (equipmentToDelete) {
      await fetch(`/api/equipment/${equipmentToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setEquipmentToDelete(null);
      refetch();
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'export') {
      const selected = equipmentList.filter(e => selectedIds.includes(e.id));
      const csv = [
        ['ID', 'Tag', 'Type', 'Status', 'Location'].join(','),
        ...selected.map(e => [e.id, e.tag, e.type || e.category, e.status || e.state, e.location || ''].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'equipment-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Equipment, 'id'>>({
    entityType: 'equipment',
    requiredFields: ['tag', 'category'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('equipment');

  // Schema: status enum from API: ['available', 'checked_out', 'maintenance', 'repair', 'retired', 'lost']
  const stats = [
    { label: 'Total Items', value: equipmentList.length },
    { label: 'Available', value: equipmentList.filter(e => (e.status || e.state) === 'available').length },
    { label: 'Checked Out', value: equipmentList.filter(e => (e.status || e.state) === 'checked_out').length },
    { label: 'Maintenance', value: equipmentList.filter(e => (e.status || e.state) === 'maintenance').length },
  ];

  const detailSections: DetailSection[] = selectedEquipment ? [
    {
      id: 'overview',
      title: 'Equipment Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}><Body className="font-display">Tag</Body><Body>{selectedEquipment.tag}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Category</Body><Body>{selectedEquipment.type || selectedEquipment.category}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Serial</Body><Body>{selectedEquipment.serial_number || '—'}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Location</Body><Body>{selectedEquipment.location || '—'}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedEquipment.status || selectedEquipment.state}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Assigned</Body><Body>{selectedEquipment.assigned_to || selectedEquipment.projects?.name || '—'}</Body></Stack>
        </Grid>
      ),
    },
    {
      id: 'maintenance',
      title: 'Maintenance History',
      content: (
        <Stack gap={1}>
          <Body className="font-display">Last Maintenance</Body>
          <Body>{selectedEquipment.last_maintenance || 'No records'}</Body>
        </Stack>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Equipment>
        title="Equipment Inventory"
        subtitle="Track and manage production equipment"
        data={equipmentList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search equipment..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedEquipment(row); setDrawerOpen(true); }}
        createLabel={canManageEquipment ? "Add Equipment" : undefined}
        onCreate={canManageEquipment ? () => setCreateModalOpen(true) : undefined}
        entityType="equipment"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'tag', 'category', 'type', 'status', 'location', 'serial_number']}
        templateDownloadUrl="/templates/production-planning/equipment-checklist-template.csv"
        onExport={createExportHandler({
          filename: "equipment",
          getData: () => equipmentList.map(e => ({
            id: e.id,
            tag: e.tag,
            type: e.type || e.category,
            status: e.status || e.state,
            location: e.location || '',
            assigned_to: e.assigned_to || '',
          })),
        })}
        stats={stats}
        emptyMessage="No equipment found"
        emptyAction={canManageEquipment ? { label: 'Add Equipment', onClick: () => setCreateModalOpen(true) } : undefined}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Equipment"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedEquipment}
        title={(e) => e.name || e.tag}
        subtitle={(e) => e.type || e.category}
        sections={detailSections}
        onEdit={(e) => router.push(`/equipment/${e.id}/edit`)}
        onDelete={(e) => { setEquipmentToDelete(e); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'assign', label: 'Assign', icon: <ClipboardList className="size-4" /> },
          { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="size-4" /> },
        ]}
        onAction={(actionId, eq) => {
          if (actionId === 'assign') router.push(`/equipment/${eq.id}/assign`);
          if (actionId === 'maintenance') router.push(`/equipment/${eq.id}/maintenance`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Equipment"
        message={`Are you sure you want to delete "${equipmentToDelete?.name || equipmentToDelete?.tag}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setEquipmentToDelete(null); }}
      />
    </>
  );
}
