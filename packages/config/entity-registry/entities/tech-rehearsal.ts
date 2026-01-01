/**
 * Tech Rehearsal Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TECH_REHEARSAL_STATUS_COLORS } from '../status-mappings';

const REHEARSAL_STATUS_COLORS = TECH_REHEARSAL_STATUS_COLORS;

export const techRehearsalEntity: EntityConfig = {
  name: 'tech-rehearsal',
  singular: 'Tech Rehearsal',
  plural: 'Tech Rehearsals',
  description: 'Manage technical rehearsals',
  icon: 'Settings',
  
  routes: {
    list: '/tech-rehearsal',
    detail: '/tech-rehearsal/[id]',
    create: '/tech-rehearsal/new',
    edit: '/tech-rehearsal/[id]/edit',
  },
  
  api: {
    endpoint: '/api/tech-rehearsal',
    statsEndpoint: '/api/tech-rehearsal/stats',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'scheduled_date', label: 'Date', accessor: 'scheduled_date', sortable: true, dataType: 'date' },
    { key: 'start_time', label: 'Start', accessor: 'start_time', sortable: true },
    { key: 'duration', label: 'Duration', accessor: 'duration', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: REHEARSAL_STATUS_COLORS },
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
    editAction('/tech-rehearsal/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Schedule Rehearsal', icon: 'Plus', handler: 'route', route: '/tech-rehearsal/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'scheduled_date', label: 'Date', type: 'date', required: true },
    { name: 'start_time', label: 'Start Time', type: 'time', required: true },
    { name: 'duration', label: 'Duration (hours)', type: 'number', required: true },
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
      title: 'Tech Rehearsal Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'scheduled_date', label: 'Date', accessor: 'scheduled_date', dataType: 'date' },
        { key: 'start_time', label: 'Start', accessor: 'start_time' },
        { key: 'duration', label: 'Duration', accessor: 'duration' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: REHEARSAL_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'scheduled', label: 'Scheduled', accessor: 'scheduled', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search rehearsals...',
    fields: ['title'],
  },
  
  emptyState: {
    message: 'No tech rehearsals',
    actionLabel: 'Schedule Rehearsal',
    actionRoute: '/tech-rehearsal/new',
  },
  
  defaultSort: {
    field: 'scheduled_date',
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
