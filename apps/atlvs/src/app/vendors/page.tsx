'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useVendors, type Vendor } from '../../hooks/useVendors';

const columns: ListPageColumn<Vendor>[] = [
  { key: 'name', label: 'Vendor Name', accessor: 'name', sortable: true },
  { 
    key: 'category', 
    label: 'Category', 
    accessor: 'category', 
    sortable: true,
    render: (value) => <Badge>{String(value).toUpperCase()}</Badge>
  },
  { key: 'contact_name', label: 'Contact', accessor: 'contact_name' },
  { key: 'email', label: 'Email', accessor: 'email', sortable: true },
  { 
    key: 'rating', 
    label: 'Rating', 
    accessor: 'rating', 
    sortable: true,
    render: (value) => value ? `${value}★` : '—'
  },
  { 
    key: 'total_orders', 
    label: 'Orders', 
    accessor: 'total_orders',
    render: (value) => String(value || 0)
  },
  { 
    key: 'total_spend', 
    label: 'Total Spend', 
    accessor: 'total_spend', 
    sortable: true,
    render: (value) => `$${((Number(value) || 0) / 1000).toFixed(1)}K`
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'active' ? 'solid' : 'outline'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'category', 
    label: 'Category', 
    options: [
      { value: 'equipment', label: 'Equipment' },
      { value: 'av', label: 'AV/Technology' },
      { value: 'staging', label: 'Staging' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'catering', label: 'Catering' },
      { value: 'transportation', label: 'Transportation' },
      { value: 'other', label: 'Other' },
    ]
  },
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'inactive', label: 'Inactive' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Vendor Name', type: 'text', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'equipment', label: 'Equipment' },
    { value: 'av', label: 'AV/Technology' },
    { value: 'staging', label: 'Staging' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'catering', label: 'Catering' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
  ]},
  { name: 'contact_name', label: 'Contact Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'address', label: 'Address', type: 'textarea', colSpan: 2 },
];

export default function VendorsPage() {
  const router = useRouter();
  const { data: vendors, isLoading, refetch } = useVendors({});
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const rowActions: ListPageAction<Vendor>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedVendor(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/vendors/${row.id}/edit`) },
    { id: 'order', label: 'New Order', icon: '📦', onClick: (row) => router.push(`/procurement/new?vendor=${row.id}`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setVendorToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'activate', label: 'Activate', icon: '✅' },
    { id: 'deactivate', label: 'Deactivate', icon: '⏸️' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setCreateModalOpen(false);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (vendorToDelete) {
      await fetch(`/api/vendors/${vendorToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setVendorToDelete(null);
      refetch();
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
  };

  const vendorList = vendors || [];
  const stats = [
    { label: 'Total Vendors', value: vendorList.length },
    { label: 'Active', value: vendorList.filter(v => v.status === 'active').length },
    { label: 'Total Spend', value: `$${(vendorList.reduce((sum, v) => sum + (v.total_spend || 0), 0) / 1000).toFixed(0)}K` },
    { label: 'Avg Rating', value: vendorList.length > 0 ? (vendorList.reduce((sum, v) => sum + (v.rating || 0), 0) / vendorList.length).toFixed(1) : '0' },
  ];

  const detailSections: DetailSection[] = selectedVendor ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Category:</strong> {selectedVendor.category}</div>
          <div><strong>Status:</strong> {selectedVendor.status}</div>
          <div><strong>Rating:</strong> {selectedVendor.rating ? `${selectedVendor.rating}★` : '—'}</div>
          <div><strong>Total Orders:</strong> {selectedVendor.total_orders || 0}</div>
          <div><strong>Total Spend:</strong> ${((selectedVendor.total_spend || 0) / 1000).toFixed(1)}K</div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: (
        <div className="grid gap-2">
          <div><strong>Contact:</strong> {selectedVendor.contact_name || '—'}</div>
          <div><strong>Email:</strong> {selectedVendor.email}</div>
          <div><strong>Phone:</strong> {selectedVendor.phone || '—'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Vendor>
        title="Vendor Management"
        subtitle="Track and manage vendor relationships and procurement"
        data={vendorList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Search vendors..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedVendor(row); setDrawerOpen(true); }}
        createLabel="Add Vendor"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export vendors')}
        stats={stats}
        emptyMessage="No vendors found"
        emptyAction={{ label: 'Add Vendor', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Vendors' }]}
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
        title="Add Vendor"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedVendor}
        title={(v) => v.name}
        subtitle={(v) => v.category}
        sections={detailSections}
        onEdit={(v) => router.push(`/vendors/${v.id}/edit`)}
        onDelete={(v) => { setVendorToDelete(v); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[{ id: 'order', label: 'New Order', icon: '📦' }]}
        onAction={(actionId, vendor) => {
          if (actionId === 'order') router.push(`/procurement/new?vendor=${vendor.id}`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${vendorToDelete?.name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setVendorToDelete(null); }}
      />
    </>
  );
}
