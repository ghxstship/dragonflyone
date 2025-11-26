'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
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
} from '@ghxstship/ui';
import { useContacts } from '@/hooks/useContacts';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  type?: string;
  status?: string;
  created_at?: string;
}

const columns: ListPageColumn<Contact>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    accessor: (row) => `${row.first_name} ${row.last_name}`,
    sortable: true 
  },
  { key: 'email', label: 'Email', accessor: 'email', sortable: true },
  { key: 'phone', label: 'Phone', accessor: 'phone' },
  { key: 'company', label: 'Company', accessor: 'company', sortable: true },
  { key: 'title', label: 'Title', accessor: 'title' },
  { 
    key: 'type', 
    label: 'Type', 
    accessor: 'type',
    render: (value) => value ? <Badge>{String(value).toUpperCase()}</Badge> : '—'
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'type', 
    label: 'Type', 
    options: [
      { value: 'client', label: 'Client' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'partner', label: 'Partner' },
      { value: 'lead', label: 'Lead' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'company', label: 'Company', type: 'text' },
  { name: 'title', label: 'Job Title', type: 'text' },
  { name: 'type', label: 'Contact Type', type: 'select', options: [
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'partner', label: 'Partner' },
    { value: 'lead', label: 'Lead' },
  ]},
];

export default function ContactsPage() {
  const router = useRouter();
  const { data: contacts, isLoading, error, refetch } = useContacts();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const rowActions: ListPageAction<Contact>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedContact(row); setDrawerOpen(true); } },
    { id: 'email', label: 'Send Email', icon: '✉️', onClick: (row) => window.location.href = `mailto:${row.email}` },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/contacts/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setContactToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'tag', label: 'Add Tag', icon: '🏷️' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: 'default-org', ...data }),
    });
    if (response.ok) {
      setCreateModalOpen(false);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (contactToDelete) {
      await fetch(`/api/contacts/${contactToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setContactToDelete(null);
      refetch();
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
  };

  const stats = [
    { label: 'Total Contacts', value: contacts?.length || 0 },
    { label: 'Clients', value: contacts?.filter(c => c.type === 'client').length || 0 },
    { label: 'Vendors', value: contacts?.filter(c => c.type === 'vendor').length || 0 },
    { label: 'Leads', value: contacts?.filter(c => c.type === 'lead').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedContact ? [
    {
      id: 'contact',
      title: 'Contact Information',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Email:</strong> {selectedContact.email}</div>
          <div><strong>Phone:</strong> {selectedContact.phone || '—'}</div>
          <div><strong>Company:</strong> {selectedContact.company || '—'}</div>
          <div><strong>Title:</strong> {selectedContact.title || '—'}</div>
          <div><strong>Type:</strong> {selectedContact.type || '—'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Contact>
        title="Contacts"
        subtitle="Manage your business contacts and relationships"
        data={contacts || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search contacts..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedContact(row); setDrawerOpen(true); }}
        createLabel="New Contact"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export contacts')}
        stats={stats}
        emptyMessage="No contacts yet"
        emptyAction={{ label: 'Add Contact', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="New Contact"
        fields={formFields}
        onSubmit={handleCreate}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedContact}
        title={(c) => `${c.first_name} ${c.last_name}`}
        subtitle={(c) => c.company || c.email}
        sections={detailSections}
        onEdit={(c) => router.push(`/contacts/${c.id}/edit`)}
        onDelete={(c) => { setContactToDelete(c); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[{ id: 'email', label: 'Send Email', icon: '✉️' }]}
        onAction={(actionId, contact) => {
          if (actionId === 'email') window.location.href = `mailto:${contact.email}`;
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Contact"
        message={`Are you sure you want to delete "${contactToDelete?.first_name} ${contactToDelete?.last_name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setContactToDelete(null); }}
      />
    </>
  );
}
