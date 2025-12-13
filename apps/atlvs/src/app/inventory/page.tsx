'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useInventory, useCreateInventoryItem, useDeleteInventoryItem } from '../../hooks/useInventory';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  Card,
  Stack,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface InventoryItem {
  id: string;
  product_id: string;
  min_quantity: number;
  max_quantity?: number;
  reorder_point?: number;
  reorder_quantity?: number;
  created_at: string;
  location?: {
    id: string;
    name: string;
    type: string;
  };
}

const columns: ListPageColumn<InventoryItem>[] = [
  {
    key: 'product_id',
    label: 'Product ID',
    accessor: 'product_id',
    sortable: true,
    render: (value) => String(value).slice(0, 8) + '...',
  },
  {
    key: 'location',
    label: 'Location',
    accessor: (row) => row.location?.name || 'Unassigned',
  },
  {
    key: 'location_type',
    label: 'Type',
    accessor: (row) => row.location?.type || '—',
    render: (value) => value !== '—' ? (
      <Badge variant="outline">{String(value).toUpperCase()}</Badge>
    ) : '—',
  },
  {
    key: 'min_quantity',
    label: 'Min Qty',
    accessor: 'min_quantity',
    sortable: true,
  },
  {
    key: 'reorder_point',
    label: 'Reorder Point',
    accessor: 'reorder_point',
    render: (value) => value ?? '—',
  },
  {
    key: 'reorder_quantity',
    label: 'Reorder Qty',
    accessor: 'reorder_quantity',
    render: (value) => value ?? '—',
  },
  {
    key: 'created_at',
    label: 'Created',
    accessor: 'created_at',
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'location_type',
    label: 'Location Type',
    options: [
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'venue', label: 'Venue' },
      { value: 'popup', label: 'Pop-up' },
      { value: 'virtual', label: 'Virtual' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'product_id', label: 'Product ID', type: 'text', required: true },
  { name: 'location_id', label: 'Location', type: 'select', options: [] },
  { name: 'min_quantity', label: 'Minimum Quantity', type: 'number', required: true },
  { name: 'max_quantity', label: 'Maximum Quantity', type: 'number' },
  { name: 'reorder_point', label: 'Reorder Point', type: 'number' },
  { name: 'reorder_quantity', label: 'Reorder Quantity', type: 'number' },
];

export default function InventoryPage() {
  const router = useRouter();
  const { data: response, isLoading, error, refetch } = useInventory();
  const createMutation = useCreateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();

  const inventory = response?.inventory || [];
  const alerts = response?.alerts || [];
  const summary = response?.summary;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const rowActions: ListPageAction<InventoryItem>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedItem(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => router.push(`/inventory/${row.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setItemToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      product_id: String(data.product_id),
      location_id: data.location_id ? String(data.location_id) : undefined,
      min_quantity: Number(data.min_quantity) || 0,
      max_quantity: data.max_quantity ? Number(data.max_quantity) : undefined,
      reorder_point: data.reorder_point ? Number(data.reorder_point) : undefined,
      reorder_quantity: data.reorder_quantity ? Number(data.reorder_quantity) : undefined,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Items', value: summary?.total_items || 0 },
    { label: 'Low Stock Alerts', value: summary?.low_stock_alerts || 0 },
    { label: 'Out of Stock', value: summary?.out_of_stock_alerts || 0 },
    { label: 'Total Alerts', value: summary?.total_alerts || 0 },
  ];

  const detailSections: DetailSection[] = selectedItem
    ? [
        {
          id: 'overview',
          title: 'Inventory Details',
          content: (
            <Grid cols={2} gap={4}>
              <Body size="sm"><strong>Product ID:</strong> {selectedItem.product_id}</Body>
              <Body size="sm"><strong>Location:</strong> {selectedItem.location?.name || 'Unassigned'}</Body>
              <Body size="sm"><strong>Location Type:</strong> {selectedItem.location?.type || '—'}</Body>
              <Body size="sm"><strong>Min Quantity:</strong> {selectedItem.min_quantity}</Body>
              <Body size="sm"><strong>Max Quantity:</strong> {selectedItem.max_quantity ?? '—'}</Body>
              <Body size="sm"><strong>Reorder Point:</strong> {selectedItem.reorder_point ?? '—'}</Body>
              <Body size="sm"><strong>Reorder Quantity:</strong> {selectedItem.reorder_quantity ?? '—'}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <AtlvsAppLayout>
      {alerts.length > 0 && (
        <Card inverted className="mb-6 p-4 border-warning">
          <Stack direction="horizontal" gap={2} className="items-center">
            <AlertTriangle className="size-5 text-warning" />
            <Body className="text-warning">
              {alerts.length} active inventory alert{alerts.length !== 1 ? 's' : ''} require attention
            </Body>
          </Stack>
        </Card>
      )}

      <ListPage
        title="Inventory"
        description="Manage inventory levels, thresholds, and alerts"
        icon={<Package className="size-6" />}
        data={inventory}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        stats={stats}
        loading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Add Item"
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Inventory Item"
        fields={formFields}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Inventory Details"
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
