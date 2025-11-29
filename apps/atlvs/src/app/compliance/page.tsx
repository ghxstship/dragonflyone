"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface ComplianceItem {
  id: string;
  title: string;
  compliance_type: string;
  category?: string;
  provider_name?: string;
  status: string;
  effective_date: string;
  expiration_date?: string;
  coverage_amount?: number;
  annual_cost?: number;
}

interface ComplianceSummary {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
}

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
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ComplianceItem | null>(null);

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setItems(data.items || []);
      setSummary(data.summary || null);
    } catch { /* fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCompliance(); }, [fetchCompliance]);

  const complianceRate = summary ? Math.round((summary.active / Math.max(summary.total, 1)) * 100) : 0;

  const rowActions: ListPageAction<ComplianceItem>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedItem(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/compliance/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setItemToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create compliance item:', data);
    setCreateModalOpen(false);
    fetchCompliance();
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      console.log('Delete:', itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchCompliance();
    }
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('/api/compliance/report', { method: 'POST' });
      if (response.ok) {
        addNotification({ type: 'success', title: 'Success', message: 'Report generated' });
      }
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to generate report' });
    }
  };

  const stats = [
    { label: 'Total Items', value: summary?.total || items.length },
    { label: 'Active', value: summary?.active || 0 },
    { label: 'Expiring Soon', value: summary?.expiringSoon || 0 },
    { label: 'Compliance Rate', value: `${complianceRate}%` },
  ];

  const detailSections: DetailSection[] = selectedItem ? [
    { id: 'overview', title: 'Compliance Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedItem.title}</div>
        <div><strong>Type:</strong> {selectedItem.compliance_type}</div>
        <div><strong>Provider:</strong> {selectedItem.provider_name || '—'}</div>
        <div><strong>Status:</strong> {selectedItem.status}</div>
        <div><strong>Effective:</strong> {selectedItem.effective_date ? new Date(selectedItem.effective_date).toLocaleDateString() : '—'}</div>
        <div><strong>Expires:</strong> {selectedItem.expiration_date ? new Date(selectedItem.expiration_date).toLocaleDateString() : '—'}</div>
        {selectedItem.coverage_amount && <div><strong>Coverage:</strong> ${selectedItem.coverage_amount.toLocaleString()}</div>}
        {selectedItem.annual_cost && <div><strong>Annual Cost:</strong> ${selectedItem.annual_cost.toLocaleString()}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<ComplianceItem>
        title="Compliance Tracking"
        subtitle="Manage insurance, licenses, certifications, and permits"
        data={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={fetchCompliance}
        searchPlaceholder="Search compliance items..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedItem(r); setDrawerOpen(true); }}
        createLabel="Add Compliance Item"
        onCreate={() => setCreateModalOpen(true)}
        onExport={handleGenerateReport}
        stats={stats}
        emptyMessage="No compliance items found"
        emptyAction={{ label: 'Add Item', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Compliance' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Compliance Item" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedItem} title={(i) => i.title} subtitle={(i) => i.compliance_type} sections={detailSections} onEdit={(i) => router.push(`/compliance/${i.id}/edit`)} onDelete={(i) => { setItemToDelete(i); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Compliance Item" message={`Delete "${itemToDelete?.title}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setItemToDelete(null); }} />
    </>
  );
}
