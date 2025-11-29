'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, ClipboardList, Wrench, Trash2, Download } from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { useEquipment } from '@/hooks/useEquipment';

interface Equipment {
  id: string;
  name?: string;
  tag: string;
  type?: string;
  category: string;
  status?: string;
  state: 'available' | 'reserved' | 'deployed' | 'maintenance' | 'retired';
  location?: string;
  serial_number?: string;
  metadata: {
    location?: string;
    serial_number?: string;
    last_maintenance?: string;
  };
  project_id?: string;
  projects?: { name: string };
  assigned_to?: string;
}

const columns: ListPageColumn<Equipment>[] = [
  { key: 'name', label: 'Name', accessor: (row) => row.name || row.tag, sortable: true },
  { 
    key: 'category', 
    label: 'Category', 
    accessor: (row) => row.type || row.category,
    sortable: true,
    render: (value) => <Badge>{String(value).toUpperCase()}</Badge>
  },
  { key: 'serial', label: 'Serial #', accessor: (row) => row.serial_number || row.metadata?.serial_number || '—' },
  { key: 'location', label: 'Location', accessor: (row) => row.location || row.metadata?.location || '—' },
  { key: 'assigned', label: 'Assigned To', accessor: (row) => row.assigned_to || row.projects?.name || '—' },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: (row) => row.status || row.state,
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'available' ? 'solid' : 'outline'}>
        {String(value).replace('_', ' ').toUpperCase()}
      </Badge>
    )
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'available', label: 'Available' },
      { value: 'reserved', label: 'Reserved' },
      { value: 'deployed', label: 'Deployed' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'retired', label: 'Retired' },
    ]
  },
  {
    key: 'category',
    label: 'Category',
    options: [
      { value: 'audio', label: 'Audio' },
      { value: 'video', label: 'Video' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'staging', label: 'Staging' },
      { value: 'rigging', label: 'Rigging' },
      { value: 'power', label: 'Power' },
      { value: 'other', label: 'Other' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Equipment Name', type: 'text', required: true, colSpan: 2 },
  { name: 'tag', label: 'Asset Tag', type: 'text', required: true },
  { name: 'serial_number', label: 'Serial Number', type: 'text' },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'audio', label: 'Audio' },
    { value: 'video', label: 'Video' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'staging', label: 'Staging' },
    { value: 'rigging', label: 'Rigging' },
    { value: 'power', label: 'Power' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'state', label: 'Status', type: 'select', options: [
    { value: 'available', label: 'Available' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'maintenance', label: 'Maintenance' },
  ]},
  { name: 'location', label: 'Location', type: 'text' },
];

export default function EquipmentPage() {
  const router = useRouter();
  const { data: equipment, isLoading, refetch } = useEquipment({});
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  const equipmentList = (equipment || []) as unknown as Equipment[];

  const rowActions: ListPageAction<Equipment>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedEquipment(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/equipment/${row.id}/edit`) },
    { id: 'assign', label: 'Assign', icon: <ClipboardList className="size-4" />, onClick: (row) => router.push(`/equipment/${row.id}/assign`) },
    { id: 'maintenance', label: 'Log Maintenance', icon: <Wrench className="size-4" />, onClick: (row) => router.push(`/equipment/${row.id}/maintenance`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setEquipmentToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" /> },
    { id: 'maintenance', label: 'Schedule Maintenance', icon: <Wrench className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'retire', label: 'Retire', icon: <Trash2 className="size-4" />, variant: 'danger' },
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
    console.log('Bulk action:', actionId, selectedIds);
  };

  const stats = [
    { label: 'Total Items', value: equipmentList.length },
    { label: 'Available', value: equipmentList.filter(e => (e.status || e.state) === 'available').length },
    { label: 'Deployed', value: equipmentList.filter(e => (e.status || e.state) === 'deployed').length },
    { label: 'Maintenance', value: equipmentList.filter(e => (e.status || e.state) === 'maintenance').length },
  ];

  const detailSections: DetailSection[] = selectedEquipment ? [
    {
      id: 'overview',
      title: 'Equipment Details',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}><Body className="font-display">Tag</Body><Body>{selectedEquipment.tag}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Category</Body><Body>{selectedEquipment.type || selectedEquipment.category}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Serial</Body><Body>{selectedEquipment.serial_number || selectedEquipment.metadata?.serial_number || '—'}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Location</Body><Body>{selectedEquipment.location || selectedEquipment.metadata?.location || '—'}</Body></Stack>
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
          <Body>{selectedEquipment.metadata?.last_maintenance || 'No records'}</Body>
        </Stack>
      ),
    },
  ] : [];

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Equipment Inventory"
        subtitle="Track and manage production equipment"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Equipment' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        primaryAction={{ label: 'Add Equipment', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <ListPage<Equipment>
          title="Equipment Inventory"
          subtitle="Track and manage production equipment"
          data={equipmentList}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          onRetry={refetch}
          searchPlaceholder="Search equipment..."
          filters={filters}
          rowActions={rowActions}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          onRowClick={(row) => { setSelectedEquipment(row); setDrawerOpen(true); }}
          createLabel="Add Equipment"
          onCreate={() => setCreateModalOpen(true)}
          onExport={() => console.log('Export equipment')}
          stats={stats}
          emptyMessage="No equipment found"
          emptyAction={{ label: 'Add Equipment', onClick: () => setCreateModalOpen(true) }}
        />
      </MainContent>

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
          { id: 'assign', label: 'Assign', icon: '📋' },
          { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
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
    </CompvssAppLayout>
  );
}
