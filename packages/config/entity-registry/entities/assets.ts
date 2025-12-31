/**
 * Assets Entity Configuration
 * 
 * Configuration for the assets entity used in ATLVS.
 */

import type { EntityConfig } from '../types';
import { 
  nameColumn, 
  categoryColumn,
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { equipmentStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  scanQuickAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { EQUIPMENT_STATUS_COLORS } from '../status-mappings';

export const assetsEntity: EntityConfig = {
  name: 'assets',
  singular: 'Asset',
  plural: 'Assets',
  description: 'Track and manage organizational assets',
  icon: 'Package',
  
  routes: {
    list: '/assets',
    detail: '/assets/[id]',
    create: '/assets/new',
    edit: '/assets/[id]/edit',
    custom: {
      scan: '/assets/scan',
    },
  },
  
  api: {
    endpoint: '/api/assets',
    statsEndpoint: '/api/assets/stats',
  },
  
  columns: [
    {
      key: 'asset_tag',
      label: 'Asset Tag',
      accessor: 'asset_tag',
      sortable: true,
      width: '120px',
      dataType: 'string',
    },
    nameColumn,
    categoryColumn,
    {
      key: 'location',
      label: 'Location',
      accessor: (row) => (row.location as { name?: string })?.name || (row.location_name as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'assigned_to',
      label: 'Assigned To',
      accessor: (row) => {
        const user = row.assigned_to as { first_name?: string; last_name?: string } | undefined;
        return user ? `${user.first_name} ${user.last_name}` : '—';
      },
      sortable: true,
      dataType: 'string',
    },
    statusColumn({ statusColors: EQUIPMENT_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    equipmentStatusFilter,
    {
      key: 'category_id',
      label: 'Category',
      type: 'select',
      options: [],
    },
    {
      key: 'location_id',
      label: 'Location',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/assets/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    scanQuickAction('/assets/scan'),
  ],
  
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true, colSpan: 2 },
    { name: 'asset_tag', label: 'Asset Tag', type: 'text', required: true },
    { name: 'serial_number', label: 'Serial Number', type: 'text' },
    { name: 'category_id', label: 'Category', type: 'select', required: true, options: [] },
    { name: 'location_id', label: 'Location', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'available', label: 'Available' },
      { value: 'in_use', label: 'In Use' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'retired', label: 'Retired' },
    ], defaultValue: 'available' },
    { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
    { name: 'purchase_price', label: 'Purchase Price', type: 'currency' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Asset Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'asset_tag', label: 'Asset Tag', accessor: 'asset_tag' },
        { key: 'serial_number', label: 'Serial #', accessor: 'serial_number', hideEmpty: true },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: EQUIPMENT_STATUS_COLORS },
        { key: 'category', label: 'Category', accessor: (row) => (row.category as { name?: string })?.name || '—' },
        { key: 'location', label: 'Location', accessor: (row) => (row.location as { name?: string })?.name || '—' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Assets', accessor: 'total', dataType: 'number' },
    { key: 'available', label: 'Available', accessor: 'available', dataType: 'number' },
    { key: 'in_use', label: 'In Use', accessor: 'in_use', dataType: 'number' },
    { key: 'total_value', label: 'Total Value', accessor: 'total_value', dataType: 'currency' },
  ],
  
  capabilities: ['scannable:qr', 'scannable:barcode', 'view:map'],
  
  capabilityRoutes: {
    'scannable:qr': '/assets/scan',
    'scannable:barcode': '/assets/scan',
  },
  
  legendMapping: {
    table: 'legend_products',
    typeColumn: 'product_type',
    typeValue: 'asset',
  },
  
  search: {
    placeholder: 'Search assets...',
    fields: ['name', 'asset_tag', 'serial_number'],
  },
  
  emptyState: {
    message: 'No assets added yet',
    actionLabel: 'Add First Asset',
    actionRoute: '/assets/new',
  },
  
  defaultSort: {
    field: 'name',
    direction: 'asc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: true,
    export: true,
    import: true,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
  },
};
