/**
 * Equipment Entity Configuration
 * 
 * Configuration for the equipment/assets entity used in COMPVSS.
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

export const equipmentEntity: EntityConfig = {
  name: 'equipment',
  singular: 'Equipment',
  plural: 'Equipment',
  description: 'Track and manage production equipment and assets',
  icon: 'Package',
  
  routes: {
    list: '/equipment',
    detail: '/equipment/[id]',
    create: '/equipment/new',
    edit: '/equipment/[id]/edit',
    custom: {
      scan: '/equipment/scan',
      maintenance: '/equipment/maintenance',
    },
  },
  
  api: {
    endpoint: '/api/equipment',
    statsEndpoint: '/api/equipment/stats',
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
      key: 'serial_number',
      label: 'Serial #',
      accessor: 'serial_number',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'location',
      label: 'Location',
      accessor: (row) => (row.location as { name?: string })?.name || (row.location as string) || '—',
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
    editAction('/equipment/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    scanQuickAction('/equipment/scan'),
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
      { value: 'repair', label: 'Repair' },
      { value: 'retired', label: 'Retired' },
    ], defaultValue: 'available' },
    { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
    { name: 'purchase_price', label: 'Purchase Price', type: 'currency' },
    { name: 'warranty_expires', label: 'Warranty Expires', type: 'date' },
    { name: 'manufacturer', label: 'Manufacturer', type: 'text' },
    { name: 'model', label: 'Model', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Equipment Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'asset_tag', label: 'Asset Tag', accessor: 'asset_tag' },
        { key: 'serial_number', label: 'Serial #', accessor: 'serial_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: EQUIPMENT_STATUS_COLORS },
        { key: 'category', label: 'Category', accessor: (row) => (row.category as { name?: string })?.name || '—' },
        { key: 'location', label: 'Location', accessor: (row) => (row.location as { name?: string })?.name || '—' },
        { key: 'manufacturer', label: 'Manufacturer', accessor: 'manufacturer', hideEmpty: true },
        { key: 'model', label: 'Model', accessor: 'model', hideEmpty: true },
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2, hideEmpty: true },
      ],
    },
    {
      id: 'purchase',
      title: 'Purchase Information',
      fields: [
        { key: 'purchase_date', label: 'Purchase Date', accessor: 'purchase_date', dataType: 'date', hideEmpty: true },
        { key: 'purchase_price', label: 'Purchase Price', accessor: 'purchase_price', dataType: 'currency', hideEmpty: true },
        { key: 'warranty_expires', label: 'Warranty Expires', accessor: 'warranty_expires', dataType: 'date', hideEmpty: true },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Equipment', accessor: 'total', dataType: 'number' },
    { key: 'available', label: 'Available', accessor: 'available', dataType: 'number' },
    { key: 'in_use', label: 'In Use', accessor: 'in_use', dataType: 'number' },
    { key: 'maintenance', label: 'Maintenance', accessor: 'maintenance', dataType: 'number' },
  ],
  
  capabilities: ['scannable:qr', 'scannable:barcode', 'scannable:rfid', 'view:map'],
  
  capabilityRoutes: {
    'scannable:qr': '/equipment/scan',
    'scannable:barcode': '/equipment/scan',
    'scannable:rfid': '/equipment/scan',
  },
  
  legendMapping: {
    table: 'legend_products',
    typeColumn: 'product_type',
    typeValue: 'equipment',
    profileTable: 'products_profile_equipment',
    profileForeignKey: 'product_id',
    selectQuery: '*, products_profile_equipment!product_id(*), vendor:legend_organizations(*)',
    relationships: [
      { entity: 'vendors', type: 'many-to-one', foreignKey: 'vendor_id', eager: true },
      { entity: 'projects', type: 'many-to-many', foreignKey: 'equipment_id', joinTable: 'project_equipment_assignments' },
    ],
  },
  
  search: {
    placeholder: 'Search equipment...',
    fields: ['name', 'asset_tag', 'serial_number'],
  },
  
  emptyState: {
    message: 'No equipment added yet',
    actionLabel: 'Add First Equipment',
    actionRoute: '/equipment/new',
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
