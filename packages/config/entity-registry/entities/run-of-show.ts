/**
 * Run of Show Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { RUN_OF_SHOW_STATUS_COLORS } from '../status-mappings';

export const runOfShowEntity: EntityConfig = {
  name: 'run-of-show',
  singular: 'Run of Show',
  plural: 'Run of Show',
  description: 'Manage run of show schedules',
  icon: 'Clock',
  
  routes: {
    list: '/run-of-show',
    detail: '/run-of-show/[id]',
    create: '/run-of-show/new',
    edit: '/run-of-show/[id]/edit',
  },
  
  api: {
    endpoint: '/api/run-of-show',
    statsEndpoint: '/api/run-of-show/stats',
  },
  
  columns: [
    { key: 'time', label: 'Time', accessor: 'time', sortable: true },
    { key: 'activity', label: 'Activity', accessor: 'activity', sortable: true },
    { key: 'duration', label: 'Duration', accessor: 'duration', sortable: true },
    { key: 'responsible', label: 'Responsible', accessor: 'responsible', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: RUN_OF_SHOW_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/run-of-show/[id]/edit'),
    deleteAction({ titleField: 'activity' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Item', icon: 'Plus', handler: 'route', route: '/run-of-show/new', primary: true },
  ],
  
  formFields: [
    { name: 'time', label: 'Time', type: 'time', required: true },
    { name: 'activity', label: 'Activity', type: 'text', required: true },
    { name: 'duration', label: 'Duration (min)', type: 'number', required: true },
    { name: 'responsible_id', label: 'Responsible', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'confirmed', label: 'Confirmed' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Run of Show Details',
      fields: [
        { key: 'time', label: 'Time', accessor: 'time' },
        { key: 'activity', label: 'Activity', accessor: 'activity' },
        { key: 'duration', label: 'Duration', accessor: 'duration' },
        { key: 'responsible', label: 'Responsible', accessor: 'responsible' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: RUN_OF_SHOW_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Items', accessor: 'total', dataType: 'number' },
    { key: 'confirmed', label: 'Confirmed', accessor: 'confirmed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search run of show...',
    fields: ['activity', 'responsible'],
  },
  
  emptyState: {
    message: 'No run of show items',
    actionLabel: 'Add Item',
    actionRoute: '/run-of-show/new',
  },
  
  defaultSort: {
    field: 'time',
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
