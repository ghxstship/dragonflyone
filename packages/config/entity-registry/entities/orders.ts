/**
 * Orders Entity Configuration
 * 
 * Configuration for the orders entity used in ATLVS and GVTEWAY.
 */

import type { EntityConfig } from '../types';
import { 
  referenceNumberColumn, 
  eventColumn,
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { orderStatusFilter, paymentStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
} from '../common-actions';
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../status-mappings';
import { formatCurrency } from '../formatters';

export const ordersEntity: EntityConfig = {
  name: 'orders',
  singular: 'Order',
  plural: 'Orders',
  description: 'Manage ticket orders and transactions',
  icon: 'ShoppingCart',
  
  routes: {
    list: '/orders',
    detail: '/orders/[id]',
    create: '/orders/new',
    edit: '/orders/[id]/edit',
  },
  
  api: {
    endpoint: '/api/orders',
    statsEndpoint: '/api/orders/stats',
  },
  
  columns: [
    referenceNumberColumn('order_number', 'Order #'),
    {
      key: 'customer',
      label: 'Customer',
      accessor: (row) => (row.billing_name as string) || (row.platform_users as { full_name?: string })?.full_name || (row.billing_email as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    eventColumn,
    {
      key: 'total',
      label: 'Total',
      accessor: (row) => formatCurrency(row.total_amount as number, { currency: (row.currency as string) || 'USD' }),
      sortable: true,
      dataType: 'currency',
    },
    {
      key: 'payment_status',
      label: 'Payment',
      accessor: 'payment_status',
      sortable: true,
      dataType: 'status',
      statusColors: PAYMENT_STATUS_COLORS,
    },
    statusColumn({ statusColors: ORDER_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    orderStatusFilter,
    paymentStatusFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/orders/[id]/edit'),
    deleteAction({ titleField: 'order_number' }),
  ],
  
  bulkActions: [
    exportBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'order_number', label: 'Order Number', type: 'text', required: true },
    { name: 'event_id', label: 'Event ID', type: 'text' },
    { name: 'billing_name', label: 'Customer Name', type: 'text', required: true },
    { name: 'billing_email', label: 'Email', type: 'email', required: true },
    { name: 'billing_phone', label: 'Phone', type: 'tel' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
    ]},
    { name: 'subtotal', label: 'Subtotal', type: 'currency', required: true },
    { name: 'tax', label: 'Tax', type: 'currency' },
    { name: 'fees', label: 'Fees', type: 'currency' },
    { name: 'total_amount', label: 'Total', type: 'currency', required: true },
    { name: 'payment_method', label: 'Payment Method', type: 'select', options: [
      { value: 'credit_card', label: 'Credit Card' },
      { value: 'debit_card', label: 'Debit Card' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'bank_transfer', label: 'Bank Transfer' },
      { value: 'cash', label: 'Cash' },
    ]},
    { name: 'payment_status', label: 'Payment Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'failed', label: 'Failed' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Order Details',
      fields: [
        { key: 'order_number', label: 'Order #', accessor: 'order_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: ORDER_STATUS_COLORS },
        { key: 'customer', label: 'Customer', accessor: 'billing_name' },
        { key: 'email', label: 'Email', accessor: 'billing_email', dataType: 'email' },
        { key: 'phone', label: 'Phone', accessor: 'billing_phone', dataType: 'phone' },
        { key: 'event', label: 'Event', accessor: (row) => (row.events as { name?: string })?.name || '—' },
        { key: 'subtotal', label: 'Subtotal', accessor: 'subtotal', dataType: 'currency' },
        { key: 'tax', label: 'Tax', accessor: 'tax', dataType: 'currency' },
        { key: 'fees', label: 'Fees', accessor: 'fees', dataType: 'currency' },
        { key: 'total', label: 'Total', accessor: 'total_amount', dataType: 'currency' },
        { key: 'payment_status', label: 'Payment', accessor: 'payment_status', dataType: 'status', statusColors: PAYMENT_STATUS_COLORS },
        { key: 'payment_method', label: 'Method', accessor: 'payment_method' },
        { key: 'notes', label: 'Notes', accessor: 'notes', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Orders', accessor: 'total', dataType: 'number' },
    { key: 'paid', label: 'Paid', accessor: 'paid', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'revenue', label: 'Revenue', accessor: 'revenue', dataType: 'currency' },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'invoice',
  },
  
  search: {
    placeholder: 'Search orders...',
    fields: ['order_number', 'billing_name', 'billing_email'],
  },
  
  emptyState: {
    message: 'No orders yet',
    actionLabel: 'Create First Order',
    actionRoute: '/orders/new',
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
