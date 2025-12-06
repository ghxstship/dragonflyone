'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Mail } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
  } from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
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
    try {
      await fetch('/api/partnerships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch { /* handled by refetch */ }
    setCreateModalOpen(false);
    refetch?.();
  };

  const detailSections: DetailSection[] = selectedPartnership ? [
    { id: 'overview', title: 'Partnership Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selectedPartnership.name}</Body>
        <Body size="sm"><strong>Company:</strong> {selectedPartnership.company || '—'}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedPartnership.type || 'Partner'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedPartnership.status || 'Active'}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedPartnership.email || '—'}</Body>
        <Body size="sm"><strong>Phone:</strong> {selectedPartnership.phone || '—'}</Body>
      </Grid>
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
        entityType="partnerships"
        onExport={createExportHandler({
          filename: "partnerships",
          getData: () => partnerships.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            status: p.status,
            startDate: p.startDate || '',
            endDate: p.endDate || '',
            value: p.value || 0,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No partnerships found"
        emptyAction={{ label: 'Add Partnership', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/partnerships/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'archive') {
            await fetch('/api/partnerships/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
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
          actions={[{ id: 'contact', label: 'Contact', icon: <Mail className="size-4" /> }]}
          onAction={(id, p) => {
            if (id === 'contact' && p.email) window.location.href = `mailto:${p.email}`;
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
