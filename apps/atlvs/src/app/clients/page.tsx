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
import { useClients, useCreateClient, useDeleteClient, type Client } from '@/hooks/useClients';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  prospect: 'info',
  churned: 'error',
};

const columns: ListPageColumn<Client>[] = [
  { key: 'company_name', label: 'Company', accessor: 'company_name', sortable: true },
  { key: 'contact_name', label: 'Contact', accessor: 'contact_name' },
  { key: 'email', label: 'Email', accessor: 'email' },
  { key: 'phone', label: 'Phone', accessor: 'phone' },
  { key: 'industry', label: 'Industry', accessor: 'industry' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'churned', label: 'Churned' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'company_name', label: 'Company Name', type: 'text', required: true, colSpan: 2 },
  { name: 'contact_name', label: 'Primary Contact', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'industry', label: 'Industry', type: 'select', options: [
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'nonprofit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'education', label: 'Education' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'prospect', label: 'Prospect' },
  ]},
  { name: 'address', label: 'Address', type: 'text', colSpan: 2 },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'postal_code', label: 'Postal Code', type: 'text' },
  { name: 'website', label: 'Website', type: 'text', colSpan: 2 },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function ClientsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: clients, isLoading, error, refetch } = useClients();
  const createMutation = useCreateClient();
  const deleteMutation = useDeleteClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const clientList = (clients || []) as Client[];

  const stats = [
    { label: 'Total Clients', value: clientList.length },
    { label: 'Active', value: clientList.filter(c => c.status === 'active').length },
    { label: 'Prospects', value: clientList.filter(c => c.status === 'prospect').length },
    { label: 'Inactive', value: clientList.filter(c => c.status === 'inactive').length },
  ];

  const rowActions: ListPageAction<Client>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedClient(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/clients/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setClientToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        company_name: String(data.company_name || ''),
        contact_name: data.contact_name ? String(data.contact_name) : undefined,
        email: data.email ? String(data.email) : undefined,
        phone: data.phone ? String(data.phone) : undefined,
        address: data.address ? String(data.address) : undefined,
        city: data.city ? String(data.city) : undefined,
        state: data.state ? String(data.state) : undefined,
        country: data.country ? String(data.country) : undefined,
        postal_code: data.postal_code ? String(data.postal_code) : undefined,
        website: data.website ? String(data.website) : undefined,
        industry: data.industry ? String(data.industry) : undefined,
        status: String(data.status || 'active'),
        notes: data.notes ? String(data.notes) : undefined,
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Client Created', message: `Client "${data.company_name}" has been created.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Client', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const handleDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteMutation.mutateAsync(clientToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({ type: 'success', title: 'Client Deleted', message: `Client "${clientToDelete.company_name}" has been deleted.` });
        setClientToDelete(null);
      } catch (err) {
        addNotification({ type: 'error', title: 'Failed to Delete Client', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
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

  const detailSections: DetailSection[] = selectedClient ? [
    {
      id: 'overview',
      title: 'Client Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Company:</strong> {selectedClient.company_name}</Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedClient.status]}>{selectedClient.status.toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Contact:</strong> {selectedClient.contact_name || '—'}</Body>
          <Body size="sm"><strong>Email:</strong> {selectedClient.email || '—'}</Body>
          <Body size="sm"><strong>Phone:</strong> {selectedClient.phone || '—'}</Body>
          <Body size="sm"><strong>Industry:</strong> {selectedClient.industry || '—'}</Body>
          <Body size="sm"><strong>Address:</strong> {selectedClient.address || '—'}</Body>
          <Body size="sm"><strong>City:</strong> {selectedClient.city || '—'}</Body>
          <Body size="sm"><strong>Website:</strong> {selectedClient.website || '—'}</Body>
          {selectedClient.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedClient.notes}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Client>
        title="Client Management"
        subtitle="Manage clients and customer relationships"
        data={clientList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search clients..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedClient(row); setDrawerOpen(true); }}
        createLabel="Add Client"
        onCreate={() => setCreateModalOpen(true)}
        onExport={createExportHandler({
          filename: 'clients',
          getData: () => clientList.map(c => ({
            company: c.company_name,
            contact: c.contact_name,
            email: c.email,
            phone: c.phone,
            industry: c.industry,
            status: c.status,
          })),
        })}
        stats={stats}
        emptyMessage="No clients yet"
        emptyAction={{ label: 'Add First Client', onClick: () => setCreateModalOpen(true) }}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Client"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedClient}
        title={(client) => client.company_name}
        subtitle={(client) => client.industry || 'Client'}
        sections={detailSections}
        onEdit={(client) => router.push(`/clients/${client.id}/edit`)}
        onDelete={(client) => { setClientToDelete(client); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Client"
        message={`Delete client "${clientToDelete?.company_name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setClientToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
