'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Package, Trash2, Download, Check, Pause } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedVendor(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/vendors/${row.id}/edit`) },
    { id: 'order', label: 'New Order', icon: <Package className="size-4" />, onClick: (row) => router.push(`/procurement/new?vendor=${row.id}`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setVendorToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'activate', label: 'Activate', icon: <Check className="size-4" /> },
    { id: 'deactivate', label: 'Deactivate', icon: <Pause className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
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
    if (actionId === 'export') {
      const selected = vendorList.filter(v => selectedIds.includes(v.id));
      const csv = [
        ['ID', 'Name', 'Category', 'Status', 'Rating', 'Total Spend', 'Email'].join(','),
        ...selected.map(v => [v.id, v.name, v.category, v.status, v.rating || '', v.total_spend || '', v.email].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vendors-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (actionId === 'deactivate') {
      await Promise.all(selectedIds.map(id =>
        fetch(`/api/vendors/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'inactive' }),
        })
      ));
      refetch();
    }
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
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Category:</strong> {selectedVendor.category}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedVendor.status}</Body>
          <Body size="sm"><strong>Rating:</strong> {selectedVendor.rating ? `${selectedVendor.rating}★` : '—'}</Body>
          <Body size="sm"><strong>Total Orders:</strong> {selectedVendor.total_orders || 0}</Body>
          <Body size="sm"><strong>Total Spend:</strong> ${((selectedVendor.total_spend || 0) / 1000).toFixed(1)}K</Body>
        </Grid>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: (
        <Stack gap={2}>
          <Body size="sm"><strong>Contact:</strong> {selectedVendor.contact_name || '—'}</Body>
          <Body size="sm"><strong>Email:</strong> {selectedVendor.email}</Body>
          <Body size="sm"><strong>Phone:</strong> {selectedVendor.phone || '—'}</Body>
        </Stack>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
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
        entityType="vendors"
        onExport={createExportHandler({
          filename: "vendors",
          getData: () => vendorList.map(v => ({
            id: v.id,
            name: v.name,
            category: v.category,
            status: v.status,
            rating: v.rating || '',
            total_spend: v.total_spend || '',
            email: v.email,
            phone: v.phone || '',
          })),
        })}
        stats={stats}
        emptyMessage="No vendors found"
        emptyAction={{ label: 'Add Vendor', onClick: () => setCreateModalOpen(true) }}
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
    </AtlvsAppLayout>
  );
}
