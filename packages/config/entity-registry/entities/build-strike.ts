/**
 * Build/Strike Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { BUILD_STRIKE_STATUS_COLORS } from '../status-mappings';

export const buildStrikeEntity: EntityConfig = {
  name: 'build-strike',
  singular: 'Build/Strike',
  plural: 'Build/Strike',
  description: 'Manage build and strike schedules',
  icon: 'Hammer',
  
  routes: {
    list: '/build-strike',
    detail: '/build-strike/[id]',
    create: '/build-strike/new',
    edit: '/build-strike/[id]/edit',
  },
  
  api: {
    endpoint: '/api/build-strike',
    statsEndpoint: '/api/build-strike/stats',
  },
  
  columns: [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'scheduled_date', label: 'Scheduled', accessor: 'scheduled_date', sortable: true, dataType: 'date' },
    { key: 'crew_count', label: 'Crew', accessor: 'crew_count', sortable: true, dataType: 'number' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: BUILD_STRIKE_STATUS_COLORS },
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
        { value: 'delayed', label: 'Delayed' },
      ],
    },
    { 
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'build', label: 'Build' },
        { value: 'strike', label: 'Strike' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/build-strike/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Schedule', icon: 'Plus', handler: 'route', route: '/build-strike/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'build', label: 'Build' },
      { value: 'strike', label: 'Strike' },
    ]},
    { name: 'scheduled_date', label: 'Scheduled Date', type: 'date', required: true },
    { name: 'crew_count', label: 'Crew Count', type: 'number' },
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
      title: 'Build/Strike Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'scheduled_date', label: 'Scheduled', accessor: 'scheduled_date', dataType: 'date' },
        { key: 'crew_count', label: 'Crew', accessor: 'crew_count', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: BUILD_STRIKE_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'builds', label: 'Builds', accessor: 'builds', dataType: 'number' },
    { key: 'strikes', label: 'Strikes', accessor: 'strikes', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search build/strike...',
    fields: ['name'],
  },
  
  emptyState: {
    message: 'No build/strike scheduled',
    actionLabel: 'Schedule',
    actionRoute: '/build-strike/new',
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
