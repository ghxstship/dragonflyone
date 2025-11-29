'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from '@ghxstship/ui';
import { useContacts } from '@/hooks/useContacts';

interface Partnership {
  id: string;
  name: string;
  company?: string;
  type?: string;
  email?: string;
  phone?: string;
  status?: string;
  [key: string]: unknown;
}

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status?.toLowerCase()) {
    case 'active': return 'solid';
    case 'pending': return 'outline';
    case 'inactive': return 'ghost';
    default: return 'outline';
  }
};

const columns: ListPageColumn<Partnership>[] = [
  { key: 'name', label: 'Partner', accessor: 'name', sortable: true },
  { key: 'company', label: 'Company', accessor: (r) => r.company || '—' },
  { key: 'type', label: 'Type', accessor: (r) => r.type || 'Partner', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'email', label: 'Email', accessor: (r) => r.email || '—' },
  { key: 'phone', label: 'Phone', accessor: (r) => r.phone || '—' },
  { key: 'status', label: 'Status', accessor: (r) => r.status || 'active', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v).toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [
    { value: 'strategic', label: 'Strategic Partner' },
    { value: 'joint', label: 'Joint Venture' },
    { value: 'vendor', label: 'Preferred Vendor' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Partner Name', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text' },
  { name: 'type', label: 'Partnership Type', type: 'select', options: [
    { value: 'strategic', label: 'Strategic Partner' },
    { value: 'joint', label: 'Joint Venture' },
    { value: 'vendor', label: 'Preferred Vendor' },
  ]},
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
];

export default function PartnershipsPage() {
  const router = useRouter();
  const { data: contacts, isLoading, refetch } = useContacts();
  const partnerships = (contacts || []) as Partnership[];
  
  const [selectedPartnership, setSelectedPartnership] = useState<Partnership | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const activeCount = partnerships.filter(p => p.status === 'active' || !p.status).length;
  const pendingCount = partnerships.filter(p => p.status === 'pending').length;
  const companiesCount = partnerships.filter(p => p.company).length;

  const rowActions: ListPageAction<Partnership>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedPartnership(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/partnerships/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Partners', value: partnerships.length },
    { label: 'Active', value: activeCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Companies', value: companiesCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create partnership:', data);
    setCreateModalOpen(false);
    refetch?.();
  };

  const detailSections: DetailSection[] = selectedPartnership ? [
    { id: 'overview', title: 'Partnership Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selectedPartnership.name}</div>
        <div><strong>Company:</strong> {selectedPartnership.company || '—'}</div>
        <div><strong>Type:</strong> {selectedPartnership.type || 'Partner'}</div>
        <div><strong>Status:</strong> {selectedPartnership.status || 'Active'}</div>
        <div><strong>Email:</strong> {selectedPartnership.email || '—'}</div>
        <div><strong>Phone:</strong> {selectedPartnership.phone || '—'}</div>
      </div>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Partnership>
        title="Partnerships"
        subtitle="Strategic alliances and joint ventures"
        data={partnerships}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search partnerships..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedPartnership(r); setDrawerOpen(true); }}
        createLabel="New Partnership"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push('/partnerships/export')}
        stats={stats}
        emptyMessage="No partnerships found"
        emptyAction={{ label: 'Add Partnership', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Partnerships' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="New Partnership"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedPartnership && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedPartnership}
          title={(p) => p.name}
          subtitle={(p) => p.company || p.type || 'Partner'}
          sections={detailSections}
          onEdit={(p) => router.push(`/partnerships/${p.id}/edit`)}
          actions={[{ id: 'contact', label: 'Contact', icon: '✉️' }]}
          onAction={(id, p) => { console.log(id, p.id); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
