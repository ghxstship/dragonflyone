/**
 * Permits Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { PERMIT_STATUS_COLORS } from '../status-mappings';

export const permitsEntity: EntityConfig = {
  name: 'permits',
  singular: 'Permit',
  plural: 'Permits',
  description: 'Manage permits and licenses',
  icon: 'FileCheck',
  
  routes: {
    list: '/permits',
    detail: '/permits/[id]',
    create: '/permits/new',
    edit: '/permits/[id]/edit',
  },
  
  api: {
    endpoint: '/api/permits',
    statsEndpoint: '/api/permits/stats',
  },
  
  columns: [
    { key: 'name', label: 'Permit Name', accessor: 'name', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'issuing_authority', label: 'Authority', accessor: 'issuing_authority', sortable: true },
    { key: 'expiry_date', label: 'Expires', accessor: 'expiry_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PERMIT_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'denied', label: 'Denied' },
        { value: 'expired', label: 'Expired' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/permits/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Permit', icon: 'Plus', handler: 'route', route: '/permits/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Permit Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'text', required: true },
    { name: 'issuing_authority', label: 'Issuing Authority', type: 'text', required: true },
    { name: 'issue_date', label: 'Issue Date', type: 'date' },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Permit Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'issuing_authority', label: 'Authority', accessor: 'issuing_authority' },
        { key: 'expiry_date', label: 'Expires', accessor: 'expiry_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PERMIT_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
    { key: 'expiring', label: 'Expiring Soon', accessor: 'expiring', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search permits...',
    fields: ['name', 'type', 'issuing_authority'],
  },
  
  emptyState: {
    message: 'No permits yet',
    actionLabel: 'Add Permit',
    actionRoute: '/permits/new',
  },
  
  defaultSort: {
    field: 'expiry_date',
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
