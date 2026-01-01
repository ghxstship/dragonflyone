/**
 * Show Call Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SHOW_CALL_STATUS_COLORS } from '../status-mappings';

export const showCallEntity: EntityConfig = {
  name: 'show-call',
  singular: 'Show Call',
  plural: 'Show Calls',
  description: 'Manage show call sheets',
  icon: 'FileText',
  
  routes: {
    list: '/show-call',
    detail: '/show-call/[id]',
    create: '/show-call/new',
    edit: '/show-call/[id]/edit',
  },
  
  api: {
    endpoint: '/api/show-call',
    statsEndpoint: '/api/show-call/stats',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'date', label: 'Date', accessor: 'date', sortable: true, dataType: 'date' },
    { key: 'call_time', label: 'Call Time', accessor: 'call_time', sortable: true },
    { key: 'version', label: 'Version', accessor: 'version', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SHOW_CALL_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Published' },
        { value: 'updated', label: 'Updated' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/show-call/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Show Call', icon: 'Plus', handler: 'route', route: '/show-call/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'call_time', label: 'Call Time', type: 'time', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Show Call Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'call_time', label: 'Call Time', accessor: 'call_time' },
        { key: 'version', label: 'Version', accessor: 'version' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SHOW_CALL_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'published', label: 'Published', accessor: 'published', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search show calls...',
    fields: ['title'],
  },
  
  emptyState: {
    message: 'No show calls',
    actionLabel: 'New Show Call',
    actionRoute: '/show-call/new',
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
