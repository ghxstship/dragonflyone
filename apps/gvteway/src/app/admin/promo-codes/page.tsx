'use client';

import { useState } from 'react';
import { RefreshCw, Trash2, Pause, Play } from 'lucide-react';
import { GvtewayAppLayout } from '@/components/app-layout';
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
import { createExportHandler, createImportHandler, getImportTemplates, log } from '@ghxstship/config';
import { usePromoCodesData, type PromoCode } from '@/hooks/usePromoCodes';

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
  const {
    promoCodes,
    isLoading: loading,
    error,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    refetch,
  } = usePromoCodesData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState<PromoCode | null>(null);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createPromoCode({
        code: String(data.code),
        discount_type: data.discount_type as 'percentage' | 'fixed',
        discount_value: parseFloat(String(data.discount_value)),
        valid_from: String(data.valid_from),
        valid_until: String(data.valid_until),
        max_uses: data.max_uses ? parseInt(String(data.max_uses)) : null,
        min_purchase: data.min_purchase ? parseFloat(String(data.min_purchase)) : null,
      });
      setCreateModalOpen(false);
    } catch (err) {
      log.error('Create error', err instanceof Error ? err : undefined);
      throw err;
    }
  };

  const handleToggleStatus = async (promo: PromoCode) => {
    const newStatus = promo.status === 'active' ? 'disabled' : 'active';
    try {
      await updatePromoCode({ id: promo.id, status: newStatus });
    } catch (err) {
      log.error('Toggle error', err instanceof Error ? err : undefined);
    }
  };

  const handleDelete = async () => {
    if (!promoToDelete) return;
    try {
      await deletePromoCode(promoToDelete.id);
      setDeleteConfirmOpen(false);
      setPromoToDelete(null);
    } catch (err) {
      log.error('Delete error', err instanceof Error ? err : undefined);
    }
  };

  const rowActions: ListPageAction<PromoCode>[] = [
    { 
      id: 'toggle', 
      label: 'Toggle Status', 
      icon: <RefreshCw className="size-4" />, 
      onClick: handleToggleStatus 
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger', 
      onClick: (row) => { setPromoToDelete(row); setDeleteConfirmOpen(true); } 
    },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'disable', label: 'Disable', icon: <Pause className="size-4" /> },
    { id: 'enable', label: 'Enable', icon: <Play className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'disable') {
      await Promise.all(selectedIds.map(id => updatePromoCode({ id, status: 'disabled' })));
    } else if (actionId === 'enable') {
      await Promise.all(selectedIds.map(id => updatePromoCode({ id, status: 'active' })));
    } else if (actionId === 'delete') {
      await Promise.all(selectedIds.map(id => deletePromoCode(id)));
    }
  };

  const stats = [
    { label: 'Total Codes', value: promoCodes.length },
    { label: 'Active', value: promoCodes.filter(p => p.status === 'active').length },
    { label: 'Total Uses', value: promoCodes.reduce((sum, p) => sum + p.current_uses, 0) },
    { label: 'Expired', value: promoCodes.filter(p => p.status === 'expired').length },
  ];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<PromoCode, 'id'>>({

    entityType: 'promo-codes',

    requiredFields: ['code', 'discount_type', 'discount_value'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/promo-codes', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      await refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('promo-codes');


  return (
    <GvtewayAppLayout>
      <ListPage<PromoCode>
        title="Promo Codes"
        subtitle="Manage discount codes and promotional offers"
        data={promoCodes}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        searchPlaceholder="Search promo codes..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        createLabel="Create Code"
        onCreate={() => setCreateModalOpen(true)}
        entityType="promo-codes"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['code', 'discount_type', 'discount_value', 'valid_from', 'valid_until', 'max_uses', 'min_purchase']}
        onExport={createExportHandler({
          filename: 'promo-codes',
          getData: () => promoCodes.map(p => ({
            id: p.id,
            code: p.code,
            discount_type: p.discount_type,
            discount_value: p.discount_value,
            max_uses: p.max_uses || 'unlimited',
            current_uses: p.current_uses,
            valid_from: p.valid_from,
            valid_until: p.valid_until,
            status: p.status,
          })),
        })}
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
    </GvtewayAppLayout>
  );
}
