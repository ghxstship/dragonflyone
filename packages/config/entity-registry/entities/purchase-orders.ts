/**
 * Purchase Orders Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const PURCHASE_ORDER_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  draft: 'outline',
  pending: 'warning',
  approved: 'info',
  ordered: 'info',
  received: 'success',
  cancelled: 'error',
};

export const purchaseOrdersEntity: EntityConfig = {
  name: 'purchase-orders',
  singular: 'Purchase Order',
  plural: 'Purchase Orders',
  description: 'Manage purchase orders and procurement',
  icon: 'ShoppingCart',
  
  routes: {
    list: '/finance/purchase-orders',
    detail: '/finance/purchase-orders/[id]',
    create: '/finance/purchase-orders/new',
    edit: '/finance/purchase-orders/[id]/edit',
  },
  
  api: {
    endpoint: '/api/finance/purchase-orders',
    statsEndpoint: '/api/finance/purchase-orders/stats',
  },
  
  columns: [
    { key: 'po_number', label: 'PO Number', accessor: 'po_number', sortable: true },
    { key: 'vendor', label: 'Vendor', accessor: (row) => (row as { vendor?: { name?: string } }).vendor?.name || 'Unknown', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PURCHASE_ORDER_STATUS_COLORS },
    { key: 'total_amount', label: 'Amount', accessor: 'total_amount', sortable: true, dataType: 'currency' },
    { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true },
    { key: 'created_at', label: 'Created', accessor: 'created_at', sortable: true, dataType: 'date' },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'ordered', label: 'Ordered' },
        { value: 'received', label: 'Received' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/finance/purchase-orders/[id]/edit'),
    deleteAction({ titleField: 'po_number' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Purchase Order', icon: 'Plus', handler: 'route', route: '/finance/purchase-orders/new', primary: true },
  ],
  
  formFields: [
    { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [] },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'priority', label: 'Priority', type: 'select', defaultValue: 'medium', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ]},
    { name: 'total_amount', label: 'Total Amount', type: 'currency', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Purchase Order Details',
      fields: [
        { key: 'po_number', label: 'PO Number', accessor: 'po_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PURCHASE_ORDER_STATUS_COLORS },
        { key: 'vendor', label: 'Vendor', accessor: (row) => (row as { vendor?: { name?: string } }).vendor?.name || 'Unknown' },
        { key: 'total_amount', label: 'Amount', accessor: 'total_amount', dataType: 'currency' },
        { key: 'priority', label: 'Priority', accessor: 'priority' },
        { key: 'created_at', label: 'Created', accessor: 'created_at', dataType: 'date' },
      ],
    },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'purchase_order',
  },
  
  stats: [
    { key: 'total', label: 'Total POs', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'total_value', label: 'Total Value', accessor: 'total_value', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search purchase orders...',
    fields: ['po_number', 'category'],
  },
  
  emptyState: {
    message: 'No purchase orders yet',
    actionLabel: 'Create PO',
    actionRoute: '/finance/purchase-orders/new',
  },
  
  defaultSort: {
    field: 'created_at',
    direction: 'desc',
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
