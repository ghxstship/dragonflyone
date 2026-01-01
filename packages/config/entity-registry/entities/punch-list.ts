/**
 * Punch List Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { PUNCH_LIST_STATUS_COLORS, PRIORITY_COLORS } from '../status-mappings';

export const punchListEntity: EntityConfig = {
  name: 'punch-list',
  singular: 'Punch List Item',
  plural: 'Punch List',
  description: 'Manage punch list items',
  icon: 'Check',
  
  routes: {
    list: '/punch-list',
    detail: '/punch-list/[id]',
    create: '/punch-list/new',
    edit: '/punch-list/[id]/edit',
  },
  
  api: {
    endpoint: '/api/punch-list',
    statsEndpoint: '/api/punch-list/stats',
  },
  
  columns: [
    { key: 'title', label: 'Item', accessor: 'title', sortable: true },
    { key: 'location', label: 'Location', accessor: 'location', sortable: true },
    { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, dataType: 'status', statusColors: PRIORITY_COLORS },
    { key: 'assignee', label: 'Assignee', accessor: 'assignee', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PUNCH_LIST_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'verified', label: 'Verified' },
      ],
    },
    { 
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/punch-list/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Item', icon: 'Plus', handler: 'route', route: '/punch-list/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'priority', label: 'Priority', type: 'select', required: true, options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ]},
    { name: 'assignee_id', label: 'Assignee', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'open', options: [
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Punch List Details',
      fields: [
        { key: 'title', label: 'Item', accessor: 'title' },
        { key: 'location', label: 'Location', accessor: 'location' },
        { key: 'priority', label: 'Priority', accessor: 'priority', dataType: 'status', statusColors: PRIORITY_COLORS },
        { key: 'assignee', label: 'Assignee', accessor: 'assignee' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PUNCH_LIST_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'open', label: 'Open', accessor: 'open', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search punch list...',
    fields: ['title', 'location'],
  },
  
  emptyState: {
    message: 'No punch list items',
    actionLabel: 'Add Item',
    actionRoute: '/punch-list/new',
  },
  
  defaultSort: {
    field: 'priority',
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
