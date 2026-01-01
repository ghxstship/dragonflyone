/**
 * Settlement Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SETTLEMENT_STATUS_COLORS } from '../status-mappings';

export const settlementEntity: EntityConfig = {
  name: 'settlement',
  singular: 'Settlement',
  plural: 'Settlements',
  description: 'Manage financial settlements',
  icon: 'DollarSign',
  
  routes: {
    list: '/settlement',
    detail: '/settlement/[id]',
    create: '/settlement/new',
    edit: '/settlement/[id]/edit',
  },
  
  api: {
    endpoint: '/api/settlement',
    statsEndpoint: '/api/settlement/stats',
  },
  
  columns: [
    { key: 'name', label: 'Settlement', accessor: 'name', sortable: true },
    { key: 'vendor', label: 'Vendor', accessor: 'vendor', sortable: true },
    { key: 'amount', label: 'Amount', accessor: 'amount', sortable: true, dataType: 'currency' },
    { key: 'due_date', label: 'Due Date', accessor: 'due_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SETTLEMENT_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'paid', label: 'Paid' },
        { value: 'disputed', label: 'Disputed' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/settlement/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Settlement', icon: 'Plus', handler: 'route', route: '/settlement/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Settlement Name', type: 'text', required: true },
    { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [] },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'due_date', label: 'Due Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'paid', label: 'Paid' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Settlement Details',
      fields: [
        { key: 'name', label: 'Settlement', accessor: 'name' },
        { key: 'vendor', label: 'Vendor', accessor: 'vendor' },
        { key: 'amount', label: 'Amount', accessor: 'amount', dataType: 'currency' },
        { key: 'due_date', label: 'Due Date', accessor: 'due_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SETTLEMENT_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'pending_amount', label: 'Pending', accessor: 'pending_amount', dataType: 'currency' },
    { key: 'paid_amount', label: 'Paid', accessor: 'paid_amount', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search settlements...',
    fields: ['name', 'vendor'],
  },
  
  emptyState: {
    message: 'No settlements',
    actionLabel: 'New Settlement',
    actionRoute: '/settlement/new',
  },
  
  defaultSort: {
    field: 'due_date',
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
