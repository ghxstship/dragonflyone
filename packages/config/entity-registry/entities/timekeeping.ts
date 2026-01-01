/**
 * Timekeeping Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TIMEKEEPING_STATUS_COLORS } from '../status-mappings';

export const timekeepingEntity: EntityConfig = {
  name: 'timekeeping',
  singular: 'Time Entry',
  plural: 'Timekeeping',
  description: 'Manage time entries',
  icon: 'Clock',
  
  routes: {
    list: '/timekeeping',
    detail: '/timekeeping/[id]',
    create: '/timekeeping/new',
    edit: '/timekeeping/[id]/edit',
  },
  
  api: {
    endpoint: '/api/timekeeping',
    statsEndpoint: '/api/timekeeping/stats',
  },
  
  columns: [
    { key: 'person', label: 'Person', accessor: 'person', sortable: true },
    { key: 'date', label: 'Date', accessor: 'date', sortable: true, dataType: 'date' },
    { key: 'hours', label: 'Hours', accessor: 'hours', sortable: true, dataType: 'number' },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: TIMEKEEPING_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'paid', label: 'Paid' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/timekeeping/[id]/edit'),
    deleteAction({ titleField: 'person' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Entry', icon: 'Plus', handler: 'route', route: '/timekeeping/new', primary: true },
  ],
  
  formFields: [
    { name: 'person_id', label: 'Person', type: 'select', required: true, options: [] },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'hours', label: 'Hours', type: 'number', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'regular', label: 'Regular' },
      { value: 'overtime', label: 'Overtime' },
      { value: 'holiday', label: 'Holiday' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Time Entry Details',
      fields: [
        { key: 'person', label: 'Person', accessor: 'person' },
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'hours', label: 'Hours', accessor: 'hours', dataType: 'number' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TIMEKEEPING_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total_hours', label: 'Total Hours', accessor: 'total_hours', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search timekeeping...',
    fields: ['person'],
  },
  
  emptyState: {
    message: 'No time entries',
    actionLabel: 'Add Entry',
    actionRoute: '/timekeeping/new',
  },
  
  defaultSort: {
    field: 'date',
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
