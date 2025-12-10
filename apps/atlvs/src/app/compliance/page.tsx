"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useComplianceData, type ComplianceItem } from "@/hooks/useCompliance";

const columns: ListPageColumn<ComplianceItem>[] = [
  { key: 'title', label: 'Title', accessor: 'title', sortable: true },
  { key: 'compliance_type', label: 'Type', accessor: 'compliance_type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'provider_name', label: 'Provider', accessor: (r) => r.provider_name || '—' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'active' ? 'solid' : v === 'expired' ? 'ghost' : 'outline'}>{String(v)}</Badge> },
  { key: 'effective_date', label: 'Effective', accessor: (r) => r.effective_date ? new Date(r.effective_date).toLocaleDateString() : '—', sortable: true },
  { key: 'expiration_date', label: 'Expires', accessor: (r) => r.expiration_date ? new Date(r.expiration_date).toLocaleDateString() : '—', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'compliance_type', label: 'Type', options: [{ value: 'insurance', label: 'Insurance' }, { value: 'license', label: 'License' }, { value: 'certification', label: 'Certification' }, { value: 'permit', label: 'Permit' }] },
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'expired', label: 'Expired' }, { value: 'pending', label: 'Pending' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'compliance_type', label: 'Type', type: 'select', required: true, options: [{ value: 'insurance', label: 'Insurance' }, { value: 'license', label: 'License' }, { value: 'certification', label: 'Certification' }, { value: 'permit', label: 'Permit' }] },
  { name: 'provider_name', label: 'Provider', type: 'text' },
  { name: 'effective_date', label: 'Effective Date', type: 'date', required: true },
  { name: 'expiration_date', label: 'Expiration Date', type: 'date' },
  { name: 'coverage_amount', label: 'Coverage Amount', type: 'number' },
];

export default function CompliancePage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const {
    items,
    summary,
    complianceRate,
    isLoading: loading,
    createItem,
    deleteItem,
    generateReport,
    refetch,
  } = useComplianceData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ComplianceItem | null>(null);

  const rowActions: ListPageAction<ComplianceItem>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedItem(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/compliance/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setItemToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createItem(data);
      setCreateModalOpen(false);
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create item' });
    }
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteItem(itemToDelete.id);
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
      } catch {
        addNotification({ type: 'error', title: 'Error', message: 'Failed to delete item' });
      }
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateReport();
      addNotification({ type: 'success', title: 'Success', message: 'Report generated' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to generate report' });
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'compliance',
    requiredFields: ['title', 'compliance_type'],
    onImport: async (records) => {
      for (const record of records) {
        await createItem(record);
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('compliance').length > 0 
    ? getImportTemplates('compliance') 
    : [{ id: 'default', name: 'Compliance Import', mapping: { title: 'title', compliance_type: 'compliance_type', status: 'status', effective_date: 'effective_date' } }];

  const stats = [
    { label: 'Total Items', value: summary?.total || items.length },
    { label: 'Active', value: summary?.active || 0 },
    { label: 'Expiring Soon', value: summary?.expiringSoon || 0 },
    { label: 'Compliance Rate', value: `${complianceRate}%` },
  ];

  const detailSections: DetailSection[] = selectedItem ? [
    { id: 'overview', title: 'Compliance Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Title:</strong> {selectedItem.title}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedItem.compliance_type}</Body>
        <Body size="sm"><strong>Provider:</strong> {selectedItem.provider_name || '—'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedItem.status}</Body>
        <Body size="sm"><strong>Effective:</strong> {selectedItem.effective_date ? new Date(selectedItem.effective_date).toLocaleDateString() : '—'}</Body>
        <Body size="sm"><strong>Expires:</strong> {selectedItem.expiration_date ? new Date(selectedItem.expiration_date).toLocaleDateString() : '—'}</Body>
        {selectedItem.coverage_amount && <Body size="sm"><strong>Coverage:</strong> ${selectedItem.coverage_amount.toLocaleString()}</Body>}
        {selectedItem.annual_cost && <Body size="sm"><strong>Annual Cost:</strong> ${selectedItem.annual_cost.toLocaleString()}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<ComplianceItem>
        title="Compliance Tracking"
        subtitle="Manage insurance, licenses, certifications, and permits"
        data={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={refetch}
        searchPlaceholder="Search compliance items..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedItem(r); setDrawerOpen(true); }}
        createLabel="Add Compliance Item"
        onCreate={() => setCreateModalOpen(true)}
        onExport={handleGenerateReport}
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'compliance_type', 'status', 'effective_date']}
        stats={stats}
        emptyMessage="No compliance items found"
        emptyAction={{ label: 'Add Item', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/compliance/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'renew') {
            await fetch('/api/compliance/bulk-renew', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'renew', label: 'Renew Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Compliance Item" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedItem} title={(i) => i.title} subtitle={(i) => i.compliance_type} sections={detailSections} onEdit={(i) => router.push(`/compliance/${i.id}/edit`)} onDelete={(i) => { setItemToDelete(i); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Compliance Item" message={`Delete "${itemToDelete?.title}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setItemToDelete(null); }} />
    </AtlvsAppLayout>
  );
}
