/**
 * Soundcheck Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SOUNDCHECK_STATUS_COLORS } from '../status-mappings';

export const soundcheckEntity: EntityConfig = {
  name: 'soundcheck',
  singular: 'Soundcheck',
  plural: 'Soundchecks',
  description: 'Manage soundcheck schedules',
  icon: 'Volume2',
  
  routes: {
    list: '/soundcheck',
    detail: '/soundcheck/[id]',
    create: '/soundcheck/new',
    edit: '/soundcheck/[id]/edit',
  },
  
  api: {
    endpoint: '/api/soundcheck',
    statsEndpoint: '/api/soundcheck/stats',
  },
  
  columns: [
    { key: 'artist', label: 'Artist', accessor: 'artist', sortable: true },
    { key: 'stage', label: 'Stage', accessor: 'stage', sortable: true },
    { key: 'scheduled_time', label: 'Scheduled', accessor: 'scheduled_time', sortable: true },
    { key: 'duration', label: 'Duration', accessor: 'duration', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SOUNDCHECK_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/soundcheck/[id]/edit'),
    deleteAction({ titleField: 'artist' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Schedule Soundcheck', icon: 'Plus', handler: 'route', route: '/soundcheck/new', primary: true },
  ],
  
  formFields: [
    { name: 'artist_id', label: 'Artist', type: 'select', required: true, options: [] },
    { name: 'stage_id', label: 'Stage', type: 'select', required: true, options: [] },
    { name: 'scheduled_time', label: 'Scheduled Time', type: 'time', required: true },
    { name: 'duration', label: 'Duration (min)', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'scheduled', options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Soundcheck Details',
      fields: [
        { key: 'artist', label: 'Artist', accessor: 'artist' },
        { key: 'stage', label: 'Stage', accessor: 'stage' },
        { key: 'scheduled_time', label: 'Scheduled', accessor: 'scheduled_time' },
        { key: 'duration', label: 'Duration', accessor: 'duration' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SOUNDCHECK_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'scheduled', label: 'Scheduled', accessor: 'scheduled', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search soundchecks...',
    fields: ['artist', 'stage'],
  },
  
  emptyState: {
    message: 'No soundchecks scheduled',
    actionLabel: 'Schedule Soundcheck',
    actionRoute: '/soundcheck/new',
  },
  
  defaultSort: {
    field: 'scheduled_time',
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
