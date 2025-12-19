'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
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
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useCrew, useCreateCrewMember, useDeleteCrewMember, type CrewMember } from '@/hooks/useCrew';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  pending: 'warning',
  on_leave: 'info',
};

const formatCurrency = (amount?: number) => {
  if (!amount) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const columns: ListPageColumn<CrewMember>[] = [
  { key: 'name', label: 'Name', accessor: (r) => `${r.first_name} ${r.last_name}`, sortable: true },
  { key: 'email', label: 'Email', accessor: 'email' },
  { key: 'phone', label: 'Phone', accessor: 'phone' },
  { key: 'role', label: 'Role', accessor: 'role' },
  { key: 'department', label: 'Department', accessor: 'department' },
  { key: 'day_rate', label: 'Day Rate', accessor: (r) => formatCurrency(r.day_rate) },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).replace('_', ' ').toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'on_leave', label: 'On Leave' },
  ]},
  { key: 'department', label: 'Department', options: [
    { value: 'audio', label: 'Audio' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'video', label: 'Video' },
    { value: 'staging', label: 'Staging' },
    { value: 'rigging', label: 'Rigging' },
    { value: 'production', label: 'Production' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'role', label: 'Role', type: 'text' },
  { name: 'department', label: 'Department', type: 'select', options: [
    { value: 'audio', label: 'Audio' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'video', label: 'Video' },
    { value: 'staging', label: 'Staging' },
    { value: 'rigging', label: 'Rigging' },
    { value: 'production', label: 'Production' },
    { value: 'backline', label: 'Backline' },
    { value: 'catering', label: 'Catering' },
  ]},
  { name: 'hourly_rate', label: 'Hourly Rate', type: 'number' },
  { name: 'day_rate', label: 'Day Rate', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'on_leave', label: 'On Leave' },
  ]},
  { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
  { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function CrewPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: crew, isLoading, error, refetch } = useCrew();
  const createMutation = useCreateCrewMember();
  const deleteMutation = useDeleteCrewMember();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CrewMember | null>(null);

  const crewList = (crew || []) as CrewMember[];

  const stats = [
    { label: 'Total Crew', value: crewList.length },
    { label: 'Active', value: crewList.filter(c => c.status === 'active').length },
    { label: 'On Leave', value: crewList.filter(c => c.status === 'on_leave').length },
    { label: 'Pending', value: crewList.filter(c => c.status === 'pending').length },
  ];

  const rowActions: ListPageAction<CrewMember>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedMember(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/crew/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setMemberToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        first_name: String(data.first_name || ''),
        last_name: String(data.last_name || ''),
        email: data.email ? String(data.email) : undefined,
        phone: data.phone ? String(data.phone) : undefined,
        role: data.role ? String(data.role) : undefined,
        department: data.department ? String(data.department) : undefined,
        hourly_rate: data.hourly_rate ? Number(data.hourly_rate) : undefined,
        day_rate: data.day_rate ? Number(data.day_rate) : undefined,
        status: String(data.status || 'active'),
        emergency_contact_name: data.emergency_contact_name ? String(data.emergency_contact_name) : undefined,
        emergency_contact_phone: data.emergency_contact_phone ? String(data.emergency_contact_phone) : undefined,
        notes: data.notes ? String(data.notes) : undefined,
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Crew Member Created', message: `Crew member "${data.first_name} ${data.last_name}" has been created.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Crew Member', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      try {
        await deleteMutation.mutateAsync(memberToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({ type: 'success', title: 'Crew Member Deleted', message: `Crew member "${memberToDelete.first_name} ${memberToDelete.last_name}" has been deleted.` });
        setMemberToDelete(null);
      } catch (err) {
        addNotification({ type: 'error', title: 'Failed to Delete Crew Member', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
      }
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      refetch();
    }
  };

  const detailSections: DetailSection[] = selectedMember ? [
    {
      id: 'overview',
      title: 'Crew Member Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {selectedMember.first_name} {selectedMember.last_name}</Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedMember.status]}>{selectedMember.status.replace('_', ' ').toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Email:</strong> {selectedMember.email || '—'}</Body>
          <Body size="sm"><strong>Phone:</strong> {selectedMember.phone || '—'}</Body>
          <Body size="sm"><strong>Role:</strong> {selectedMember.role || '—'}</Body>
          <Body size="sm"><strong>Department:</strong> {selectedMember.department || '—'}</Body>
          <Body size="sm"><strong>Hourly Rate:</strong> {formatCurrency(selectedMember.hourly_rate)}</Body>
          <Body size="sm"><strong>Day Rate:</strong> {formatCurrency(selectedMember.day_rate)}</Body>
          <Body size="sm"><strong>Emergency Contact:</strong> {selectedMember.emergency_contact_name || '—'}</Body>
          <Body size="sm"><strong>Emergency Phone:</strong> {selectedMember.emergency_contact_phone || '—'}</Body>
          {selectedMember.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedMember.notes}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<CrewMember>
        title="Crew Management"
        subtitle="Manage production crew members"
        data={crewList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search crew..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedMember(row); setDrawerOpen(true); }}
        createLabel="Add Crew Member"
        onCreate={() => setCreateModalOpen(true)}
        onExport={createExportHandler({
          filename: 'crew-members',
          getData: () => crewList.map(c => ({
            name: `${c.first_name} ${c.last_name}`,
            email: c.email,
            phone: c.phone,
            role: c.role,
            department: c.department,
            day_rate: c.day_rate,
            status: c.status,
          })),
        })}
        stats={stats}
        emptyMessage="No crew members yet"
        emptyAction={{ label: 'Add First Crew Member', onClick: () => setCreateModalOpen(true) }}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Crew Member"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedMember}
        title={(member) => `${member.first_name} ${member.last_name}`}
        subtitle={(member) => member.role || member.department || 'Crew Member'}
        sections={detailSections}
        onEdit={(member) => router.push(`/crew/${member.id}/edit`)}
        onDelete={(member) => { setMemberToDelete(member); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Crew Member"
        message={`Delete crew member "${memberToDelete?.first_name} ${memberToDelete?.last_name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setMemberToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
