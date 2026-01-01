/**
 * Deliveries Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { DELIVERY_STATUS_COLORS } from '../status-mappings';

export const deliveriesEntity: EntityConfig = {
  name: 'deliveries',
  singular: 'Delivery',
  plural: 'Deliveries',
  description: 'Track deliveries and shipments',
  icon: 'Truck',
  
  routes: {
    list: '/deliveries',
    detail: '/deliveries/[id]',
    create: '/deliveries/new',
    edit: '/deliveries/[id]/edit',
  },
  
  api: {
    endpoint: '/api/deliveries',
    statsEndpoint: '/api/deliveries/stats',
  },
  
  columns: [
    { key: 'tracking_number', label: 'Tracking #', accessor: 'tracking_number', sortable: true },
    { key: 'vendor', label: 'Vendor', accessor: 'vendor', sortable: true },
    { key: 'expected_date', label: 'Expected', accessor: 'expected_date', sortable: true, dataType: 'date' },
    { key: 'items_count', label: 'Items', accessor: 'items_count', sortable: true, dataType: 'number' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: DELIVERY_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'failed', label: 'Failed' },
        { value: 'returned', label: 'Returned' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/deliveries/[id]/edit'),
    deleteAction({ titleField: 'tracking_number' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Delivery', icon: 'Plus', handler: 'route', route: '/deliveries/new', primary: true },
  ],
  
  formFields: [
    { name: 'tracking_number', label: 'Tracking Number', type: 'text', required: true },
    { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [] },
    { name: 'expected_date', label: 'Expected Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_transit', label: 'In Transit' },
      { value: 'delivered', label: 'Delivered' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Delivery Details',
      fields: [
        { key: 'tracking_number', label: 'Tracking #', accessor: 'tracking_number' },
        { key: 'vendor', label: 'Vendor', accessor: 'vendor' },
        { key: 'expected_date', label: 'Expected', accessor: 'expected_date', dataType: 'date' },
        { key: 'items_count', label: 'Items', accessor: 'items_count', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: DELIVERY_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'in_transit', label: 'In Transit', accessor: 'in_transit', dataType: 'number' },
    { key: 'delivered', label: 'Delivered', accessor: 'delivered', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search deliveries...',
    fields: ['tracking_number', 'vendor'],
  },
  
  emptyState: {
    message: 'No deliveries yet',
    actionLabel: 'Add Delivery',
    actionRoute: '/deliveries/new',
  },
  
  defaultSort: {
    field: 'expected_date',
    direction: 'asc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: true,
    export: true,
    import: false,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
  },
};
