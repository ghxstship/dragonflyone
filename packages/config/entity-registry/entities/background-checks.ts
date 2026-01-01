/**
 * Background Checks Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { BACKGROUND_CHECK_STATUS_COLORS } from '../status-mappings';

export const backgroundChecksEntity: EntityConfig = {
  name: 'background-checks',
  singular: 'Background Check',
  plural: 'Background Checks',
  description: 'Manage background checks',
  icon: 'Shield',
  
  routes: {
    list: '/background-checks',
    detail: '/background-checks/[id]',
    create: '/background-checks/new',
    edit: '/background-checks/[id]/edit',
  },
  
  api: {
    endpoint: '/api/background-checks',
    statsEndpoint: '/api/background-checks/stats',
  },
  
  columns: [
    { key: 'person', label: 'Person', accessor: 'person', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'submitted_date', label: 'Submitted', accessor: 'submitted_date', sortable: true, dataType: 'date' },
    { key: 'expiry_date', label: 'Expires', accessor: 'expiry_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: BACKGROUND_CHECK_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'passed', label: 'Passed' },
        { value: 'failed', label: 'Failed' },
        { value: 'expired', label: 'Expired' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/background-checks/[id]/edit'),
    deleteAction({ titleField: 'person' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Check', icon: 'Plus', handler: 'route', route: '/background-checks/new', primary: true },
  ],
  
  formFields: [
    { name: 'person_id', label: 'Person', type: 'select', required: true, options: [] },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'criminal', label: 'Criminal' },
      { value: 'employment', label: 'Employment' },
      { value: 'education', label: 'Education' },
      { value: 'credit', label: 'Credit' },
    ]},
    { name: 'submitted_date', label: 'Submitted Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'passed', label: 'Passed' },
      { value: 'failed', label: 'Failed' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Background Check Details',
      fields: [
        { key: 'person', label: 'Person', accessor: 'person' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'submitted_date', label: 'Submitted', accessor: 'submitted_date', dataType: 'date' },
        { key: 'expiry_date', label: 'Expires', accessor: 'expiry_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: BACKGROUND_CHECK_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'expiring', label: 'Expiring', accessor: 'expiring', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search background checks...',
    fields: ['person', 'type'],
  },
  
  emptyState: {
    message: 'No background checks',
    actionLabel: 'New Check',
    actionRoute: '/background-checks/new',
  },
  
  defaultSort: {
    field: 'submitted_date',
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
