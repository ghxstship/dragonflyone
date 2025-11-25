'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from '@ghxstship/ui';
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
  const { data: contacts, isLoading: contactsLoading, refetch } = useContacts();
  const { data: deals, isLoading: dealsLoading } = useDeals();
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoading = contactsLoading || dealsLoading;
  const contactList = (contacts || []) as Contact[];
  const dealList = deals || [];

  const activeContacts = contactList.filter(c => c.status === 'active').length;
  const totalValue = dealList.reduce((sum: number, d: { value?: number }) => sum + (d.value || 0), 0);

  const rowActions: ListPageAction<Contact>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedContact(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/contacts/${r.id}/edit`) },
    { id: 'email', label: 'Send Email', icon: '✉️', onClick: (r) => window.location.href = `mailto:${r.email}` },
  ];

  const stats = [
    { label: 'Total Contacts', value: contactList.length },
    { label: 'Active Clients', value: activeContacts },
    { label: 'Total Deals', value: dealList.length },
    { label: 'Pipeline Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedContact ? [
    { id: 'overview', title: 'Contact Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selectedContact.name}</div>
        <div><strong>Email:</strong> {selectedContact.email}</div>
        <div><strong>Company:</strong> {selectedContact.company || '—'}</div>
        <div><strong>Type:</strong> {selectedContact.type || 'client'}</div>
        <div><strong>Status:</strong> {selectedContact.status || 'active'}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Contact>
        title="CRM"
        subtitle="Manage contacts, deals, and customer relationships"
        data={contactList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search contacts..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContact(r); setDrawerOpen(true); }}
        createLabel="Add Contact"
        onCreate={() => router.push('/contacts')}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No contacts found"
        emptyAction={{ label: 'Add Contact', onClick: () => router.push('/contacts') }}
        header={<Navigation />}
      />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedContact} title={(c) => c.name} subtitle={(c) => c.company || c.email} sections={detailSections} onEdit={(c) => router.push(`/contacts/${c.id}/edit`)} actions={[{ id: 'email', label: 'Send Email', icon: '✉️' }]} onAction={(id, c) => id === 'email' && (window.location.href = `mailto:${c.email}`)} />
    </>
  );
}
