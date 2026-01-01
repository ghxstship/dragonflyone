/**
 * Account Orders Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
} from '../common-actions';
import { ORDER_STATUS_COLORS } from '../status-mappings';

export const accountOrdersEntity: EntityConfig = {
  name: 'account-orders',
  singular: 'Order',
  plural: 'My Orders',
  description: 'View your orders',
  icon: 'Package',
  
  routes: {
    list: '/account/orders',
    detail: '/account/orders/[id]',
    create: '',
    edit: '',
  },
  
  api: {
    endpoint: '/api/account/orders',
    statsEndpoint: '/api/account/orders/stats',
  },
  
  columns: [
    { key: 'order_number', label: 'Order #', accessor: 'order_number', sortable: true },
    { key: 'date', label: 'Date', accessor: 'date', sortable: true, dataType: 'date' },
    { key: 'items_count', label: 'Items', accessor: 'items_count', sortable: true, dataType: 'number' },
    { key: 'total', label: 'Total', accessor: 'total', sortable: true, dataType: 'currency' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: ORDER_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
  ],
  
  bulkActions: [],
  quickActions: [],
  
  formFields: [],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Order Details',
      fields: [
        { key: 'order_number', label: 'Order #', accessor: 'order_number' },
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'total', label: 'Total', accessor: 'total', dataType: 'currency' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: ORDER_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Orders', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search orders...',
    fields: ['order_number'],
  },
  
  emptyState: {
    message: 'No orders yet',
    actionLabel: '',
    actionRoute: '',
  },
  
  defaultSort: {
    field: 'date',
    direction: 'desc',
  },
  
  features: {
    create: false,
    edit: false,
    delete: false,
    export: false,
    import: false,
    bulkActions: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: false,
  },
};
