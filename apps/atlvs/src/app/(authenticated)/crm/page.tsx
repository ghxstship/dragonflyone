'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Mail } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  } from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useContacts } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';

interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  type?: string;
  status?: string;
}

const formatCurrency = (amount: number) => amount >= 1000000 ? `$${(amount / 1000000).toFixed(1)}M` : `$${(amount / 1000).toFixed(0)}K`;

const columns: ListPageColumn<Contact>[] = [
  { key: 'name', label: 'Name', accessor: 'name', sortable: true },
  { key: 'email', label: 'Email', accessor: 'email' },
  { key: 'company', label: 'Company', accessor: (r) => r.company || '—' },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v || 'client').toUpperCase()}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'active' ? 'solid' : 'ghost'}>{String(v || 'active').toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'client', label: 'Client' }, { value: 'vendor', label: 'Vendor' }, { value: 'partner', label: 'Partner' }, { value: 'lead', label: 'Lead' }] },
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
];

export default function CRMPage() {
  const router = useRouter();
  const { data: contacts, isLoading: contactsLoading, error: contactsError, refetch } = useContacts();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  const error = contactsError;
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoading = contactsLoading || dealsLoading;
  const contactList = (contacts || []) as Contact[];
  const dealList = deals || [];

  const activeContacts = contactList.filter(c => c.status === 'active').length;
  const totalValue = dealList.reduce((sum: number, d: { value?: number }) => sum + (d.value || 0), 0);

  const rowActions: ListPageAction<Contact>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedContact(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/contacts/${r.id}/edit`) },
    { id: 'email', label: 'Send Email', icon: <Mail className="size-4" />, onClick: (r) => window.location.href = `mailto:${r.email}` },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'crm',
    requiredFields: ['name', 'email'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch?.();
    },
  });

  const importTemplates = getImportTemplates('crm').length > 0 
    ? getImportTemplates('crm') 
    : [{ id: 'default', name: 'CRM Import', mapping: { name: 'name', email: 'email', company: 'company', type: 'type', status: 'status' } }];

  const stats = [
    { label: 'Total Contacts', value: contactList.length },
    { label: 'Active Clients', value: activeContacts },
    { label: 'Total Deals', value: dealList.length },
    { label: 'Pipeline Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedContact ? [
    { id: 'overview', title: 'Contact Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selectedContact.name}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedContact.email}</Body>
        <Body size="sm"><strong>Company:</strong> {selectedContact.company || '—'}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedContact.type || 'client'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedContact.status || 'active'}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Contact>
        title="CRM"
        subtitle="Manage contacts, deals, and customer relationships"
        data={contactList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search contacts..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContact(r); setDrawerOpen(true); }}
        createLabel="Add Contact"
        onCreate={() => router.push('/contacts')}
        entityType="contacts"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'email', 'company', 'type', 'status']}
        onExport={createExportHandler({
          filename: "contacts",
          getData: () => (contacts || []).map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            company: c.company || '',
            status: c.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No contacts found"
        emptyAction={{ label: 'Add Contact', onClick: () => router.push('/contacts') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/contacts/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch?.();
          } else if (action === 'archive') {
            await fetch('/api/contacts/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch?.();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedContact} title={(c) => c.name} subtitle={(c) => c.company || c.email} sections={detailSections} onEdit={(c) => router.push(`/contacts/${c.id}/edit`)} actions={[{ id: 'email', label: 'Send Email', icon: <Mail className="size-4" /> }]} onAction={(id, c) => id === 'email' && (window.location.href = `mailto:${c.email}`)} />
    </AtlvsAppLayout>
  );
}
