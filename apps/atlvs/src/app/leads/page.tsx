'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download, Mail } from 'lucide-react';
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
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useLeads, useCreateLead, useDeleteLead } from '@/hooks/useLeads';

interface Lead {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  source?: string;
  status: string;
  score: number;
  assigned_to?: string;
  notes?: string;
  created_at: string;
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'solid' | 'outline'> = {
  new: 'info',
  contacted: 'outline',
  qualified: 'warning',
  proposal: 'warning',
  negotiation: 'warning',
  won: 'success',
  lost: 'error',
};

const columns: ListPageColumn<Lead>[] = [
  { key: 'name', label: 'Name', accessor: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || '—', sortable: true },
  { key: 'email', label: 'Email', accessor: 'email', render: (v) => String(v) || '—' },
  { key: 'company', label: 'Company', accessor: 'company', render: (v) => String(v) || '—' },
  { key: 'source', label: 'Source', accessor: 'source', render: (v) => <Badge variant="outline">{String(v) || 'Unknown'}</Badge> },
  { key: 'score', label: 'Score', accessor: 'score', sortable: true, render: (v) => {
    const score = Number(v);
    const variant = score >= 70 ? 'success' : score >= 40 ? 'warning' : 'outline';
    return <Badge variant={variant}>{score}</Badge>;
  }},
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge> },
  { key: 'created_at', label: 'Created', accessor: 'created_at', render: (v) => new Date(String(v)).toLocaleDateString() },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
  ]},
  { key: 'source', label: 'Source', options: [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'event', label: 'Event' },
    { value: 'social', label: 'Social Media' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'company', label: 'Company', type: 'text' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'source', label: 'Source', type: 'select', options: [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'event', label: 'Event' },
    { value: 'social', label: 'Social Media' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
  ]},
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function LeadsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: leads, isLoading, error, refetch } = useLeads();
  const createMutation = useCreateLead();
  const deleteMutation = useDeleteLead();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const leadList = (leads || []) as Lead[];

  const stats = [
    { label: 'Total Leads', value: leadList.length },
    { label: 'New', value: leadList.filter(l => l.status === 'new').length },
    { label: 'Qualified', value: leadList.filter(l => l.status === 'qualified').length },
    { label: 'Won', value: leadList.filter(l => l.status === 'won').length },
  ];

  const rowActions: ListPageAction<Lead>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedLead(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/leads/${row.id}/edit`) },
    { id: 'email', label: 'Send Email', icon: <Mail className="size-4" />, onClick: (row) => window.open(`mailto:${row.email}`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setLeadToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync(data as Parameters<typeof createMutation.mutateAsync>[0]);
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Success', message: 'Lead created' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create lead' });
    }
  };

  const handleDelete = async () => {
    if (leadToDelete) {
      try {
        await deleteMutation.mutateAsync(leadToDelete.id);
        setDeleteConfirmOpen(false);
        setLeadToDelete(null);
      } catch {
        addNotification({ type: 'error', title: 'Error', message: 'Failed to delete lead' });
      }
    }
  };

  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'leads',
    requiredFields: ['first_name', 'email'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('leads').length > 0
    ? getImportTemplates('leads')
    : [{ id: 'default', name: 'Lead Import', mapping: { first_name: 'first_name', last_name: 'last_name', email: 'email', company: 'company', source: 'source' } }];

  const detailSections: DetailSection[] = selectedLead ? [
    {
      id: 'overview',
      title: 'Lead Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {`${selectedLead.first_name || ''} ${selectedLead.last_name || ''}`.trim()}</Body>
          <Body size="sm"><strong>Email:</strong> {selectedLead.email || '—'}</Body>
          <Body size="sm"><strong>Phone:</strong> {selectedLead.phone || '—'}</Body>
          <Body size="sm"><strong>Company:</strong> {selectedLead.company || '—'}</Body>
          <Body size="sm"><strong>Title:</strong> {selectedLead.title || '—'}</Body>
          <Body size="sm"><strong>Source:</strong> {selectedLead.source || '—'}</Body>
          <Body size="sm"><strong>Score:</strong> {selectedLead.score}</Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedLead.status] || 'outline'}>{selectedLead.status.toUpperCase()}</Badge></Body>
          {selectedLead.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedLead.notes}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Lead>
        title="Lead Management"
        subtitle="Track and manage sales leads"
        data={leadList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search leads..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedLead(row); setDrawerOpen(true); }}
        createLabel="Add Lead"
        onCreate={() => setCreateModalOpen(true)}
        entityType="leads"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['first_name', 'last_name', 'email', 'company', 'source']}
        onExport={createExportHandler({
          filename: 'leads',
          getData: () => leadList.map(l => ({
            id: l.id,
            name: `${l.first_name || ''} ${l.last_name || ''}`.trim(),
            email: l.email,
            company: l.company,
            status: l.status,
            score: l.score,
          })),
        })}
        stats={stats}
        emptyMessage="No leads yet"
        emptyAction={{ label: 'Add First Lead', onClick: () => setCreateModalOpen(true) }}
        bulkActions={bulkActions}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            for (const id of ids) {
              await deleteMutation.mutateAsync(id);
            }
            refetch();
          }
        }}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Lead"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedLead}
        title={(lead) => `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Lead'}
        subtitle={(lead) => lead.company || lead.email || ''}
        sections={detailSections}
        onEdit={(lead) => router.push(`/leads/${lead.id}/edit`)}
        onDelete={(lead) => { setLeadToDelete(lead); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Lead"
        message={`Delete lead "${leadToDelete?.first_name} ${leadToDelete?.last_name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setLeadToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
