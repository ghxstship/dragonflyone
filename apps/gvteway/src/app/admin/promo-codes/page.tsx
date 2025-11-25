'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ListPage,
  Badge,
  RecordFormModal,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
} from '@ghxstship/ui';

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string;
  event_id: string | null;
  event_title?: string;
  status: 'active' | 'expired' | 'disabled';
  min_purchase?: number;
  created_at: string;
}

const columns: ListPageColumn<PromoCode>[] = [
  { key: 'code', label: 'Code', accessor: 'code', sortable: true },
  { 
    key: 'discount', 
    label: 'Discount', 
    accessor: (row) => row.discount_type === 'percentage' ? `${row.discount_value}%` : `$${row.discount_value}`,
    sortable: true 
  },
  { 
    key: 'usage', 
    label: 'Usage', 
    accessor: (row) => `${row.current_uses} / ${row.max_uses || '∞'}` 
  },
  { 
    key: 'valid_from', 
    label: 'Valid From', 
    accessor: 'valid_from', 
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleDateString()
  },
  { 
    key: 'valid_until', 
    label: 'Valid Until', 
    accessor: 'valid_until', 
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleDateString()
  },
  { 
    key: 'event', 
    label: 'Event', 
    accessor: (row) => row.event_title || 'All Events' 
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
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'expired', label: 'Expired' },
      { value: 'disabled', label: 'Disabled' },
    ]
  },
  {
    key: 'discount_type',
    label: 'Type',
    options: [
      { value: 'percentage', label: 'Percentage' },
      { value: 'fixed', label: 'Fixed Amount' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'code', label: 'Promo Code', type: 'text', required: true, placeholder: 'SUMMER2024', colSpan: 2 },
  { name: 'discount_type', label: 'Discount Type', type: 'select', required: true, options: [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount ($)' },
  ]},
  { name: 'discount_value', label: 'Discount Value', type: 'number', required: true, placeholder: '20' },
  { name: 'valid_from', label: 'Valid From', type: 'date', required: true },
  { name: 'valid_until', label: 'Valid Until', type: 'date', required: true },
  { name: 'max_uses', label: 'Max Uses (empty = unlimited)', type: 'number', placeholder: '100' },
  { name: 'min_purchase', label: 'Min Purchase ($)', type: 'number', placeholder: '50.00' },
];

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);

  const fetchPromoCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/promo-codes');
      if (response.ok) {
        const data = await response.json();
        setPromoCodes(data.promo_codes || []);
      } else {
        setError(new Error('Failed to load promo codes'));
      }
    } catch (err) {
      setError(new Error('Network error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromoCodes();
  }, [fetchPromoCodes]);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/admin/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          discount_value: parseFloat(String(data.discount_value)),
          max_uses: data.max_uses ? parseInt(String(data.max_uses)) : null,
          min_purchase: data.min_purchase ? parseFloat(String(data.min_purchase)) : null,
        }),
      });

      if (response.ok) {
        setCreateModalOpen(false);
        fetchPromoCodes();
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create promo code');
      }
    } catch (err) {
      console.error('Create error:', err);
      throw err;
    }
  };

  const handleToggleStatus = async (promo: PromoCode) => {
    const newStatus = promo.status === 'active' ? 'disabled' : 'active';
    try {
      const response = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchPromoCodes();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDelete = async () => {
    if (!promoToDelete) return;
    try {
      const response = await fetch(`/api/admin/promo-codes/${promoToDelete.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPromoCodes();
        setDeleteConfirmOpen(false);
        setPromoToDelete(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const rowActions: ListPageAction<PromoCode>[] = [
    { 
      id: 'toggle', 
      label: 'Toggle Status', 
      icon: '🔄', 
      onClick: handleToggleStatus 
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: '🗑️', 
      variant: 'danger', 
      onClick: (row) => { setPromoToDelete(row); setDeleteConfirmOpen(true); } 
    },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'disable', label: 'Disable', icon: '⏸️' },
    { id: 'enable', label: 'Enable', icon: '▶️' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
    // Implement bulk actions
  };

  const stats = [
    { label: 'Total Codes', value: promoCodes.length },
    { label: 'Active', value: promoCodes.filter(p => p.status === 'active').length },
    { label: 'Total Uses', value: promoCodes.reduce((sum, p) => sum + p.current_uses, 0) },
    { label: 'Expired', value: promoCodes.filter(p => p.status === 'expired').length },
  ];

  return (
    <>
      <ListPage<PromoCode>
        title="Promo Codes"
        subtitle="Manage discount codes and promotional offers"
        data={promoCodes}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error}
        onRetry={fetchPromoCodes}
        searchPlaceholder="Search promo codes..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        createLabel="Create Code"
        onCreate={() => setCreateModalOpen(true)}
        stats={stats}
        emptyMessage="No promo codes yet"
        emptyAction={{ label: 'Create Promo Code', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Promo Code"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Promo Code"
        message={`Are you sure you want to delete "${promoToDelete?.code}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setPromoToDelete(null); }}
      />
    </>
  );
}
