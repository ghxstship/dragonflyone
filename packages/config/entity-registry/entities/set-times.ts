/**
 * Set Times Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SET_TIMES_STATUS_COLORS } from '../status-mappings';

export const setTimesEntity: EntityConfig = {
  name: 'set-times',
  singular: 'Set Time',
  plural: 'Set Times',
  description: 'Manage artist set times',
  icon: 'Music',
  
  routes: {
    list: '/set-times',
    detail: '/set-times/[id]',
    create: '/set-times/new',
    edit: '/set-times/[id]/edit',
  },
  
  api: {
    endpoint: '/api/set-times',
    statsEndpoint: '/api/set-times/stats',
  },
  
  columns: [
    { key: 'artist', label: 'Artist', accessor: 'artist', sortable: true },
    { key: 'stage', label: 'Stage', accessor: 'stage', sortable: true },
    { key: 'start_time', label: 'Start', accessor: 'start_time', sortable: true },
    { key: 'end_time', label: 'End', accessor: 'end_time', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SET_TIMES_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'updated', label: 'Updated' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/set-times/[id]/edit'),
    deleteAction({ titleField: 'artist' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Set Time', icon: 'Plus', handler: 'route', route: '/set-times/new', primary: true },
  ],
  
  formFields: [
    { name: 'artist_id', label: 'Artist', type: 'select', required: true, options: [] },
    { name: 'stage_id', label: 'Stage', type: 'select', required: true, options: [] },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'end_time', label: 'End Time', type: 'time', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'confirmed', label: 'Confirmed' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Set Time Details',
      fields: [
        { key: 'artist', label: 'Artist', accessor: 'artist' },
        { key: 'stage', label: 'Stage', accessor: 'stage' },
        { key: 'start_time', label: 'Start', accessor: 'start_time' },
        { key: 'end_time', label: 'End', accessor: 'end_time' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SET_TIMES_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'confirmed', label: 'Confirmed', accessor: 'confirmed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search set times...',
    fields: ['artist', 'stage'],
  },
  
  emptyState: {
    message: 'No set times',
    actionLabel: 'Add Set Time',
    actionRoute: '/set-times/new',
  },
  
  defaultSort: {
    field: 'start_time',
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
