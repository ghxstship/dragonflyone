/**
 * Schedule Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SCHEDULE_STATUS_COLORS } from '../status-mappings';

export const scheduleEntity: EntityConfig = {
  name: 'schedule',
  singular: 'Schedule',
  plural: 'Schedules',
  description: 'Manage production schedules',
  icon: 'Calendar',
  
  routes: {
    list: '/schedule',
    detail: '/schedule/[id]',
    create: '/schedule/new',
    edit: '/schedule/[id]/edit',
  },
  
  api: {
    endpoint: '/api/schedule',
    statsEndpoint: '/api/schedule/stats',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'date', label: 'Date', accessor: 'date', sortable: true, dataType: 'date' },
    { key: 'start_time', label: 'Start', accessor: 'start_time', sortable: true },
    { key: 'end_time', label: 'End', accessor: 'end_time', sortable: true },
    { key: 'location', label: 'Location', accessor: 'location', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SCHEDULE_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'tentative', label: 'Tentative' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/schedule/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Schedule', icon: 'Plus', handler: 'route', route: '/schedule/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'end_time', label: 'End Time', type: 'time', required: true },
    { name: 'location', label: 'Location', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'scheduled', options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'tentative', label: 'Tentative' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Schedule Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'start_time', label: 'Start Time', accessor: 'start_time' },
        { key: 'end_time', label: 'End Time', accessor: 'end_time' },
        { key: 'location', label: 'Location', accessor: 'location' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SCHEDULE_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'upcoming', label: 'Upcoming', accessor: 'upcoming', dataType: 'number' },
    { key: 'today', label: 'Today', accessor: 'today', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search schedules...',
    fields: ['title', 'location'],
  },
  
  emptyState: {
    message: 'No schedules yet',
    actionLabel: 'Add Schedule',
    actionRoute: '/schedule/new',
  },
  
  defaultSort: {
    field: 'date',
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
