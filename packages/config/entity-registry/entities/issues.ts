/**
 * Issues Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TASK_STATUS_COLORS, PRIORITY_COLORS } from '../status-mappings';

export const issuesEntity: EntityConfig = {
  name: 'issues',
  singular: 'Issue',
  plural: 'Issues',
  description: 'Track and manage issues',
  icon: 'AlertCircle',
  
  routes: {
    list: '/issues',
    detail: '/issues/[id]',
    create: '/issues/new',
    edit: '/issues/[id]/edit',
  },
  
  api: {
    endpoint: '/api/issues',
    statsEndpoint: '/api/issues/stats',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, dataType: 'status', statusColors: PRIORITY_COLORS },
    { key: 'assignee', label: 'Assignee', accessor: 'assignee', sortable: true },
    { key: 'created_at', label: 'Created', accessor: 'created_at', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: TASK_STATUS_COLORS },
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
        { value: 'closed', label: 'Closed' },
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
    editAction('/issues/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Report Issue', icon: 'Plus', handler: 'route', route: '/issues/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
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
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Issue Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'description', label: 'Description', accessor: 'description' },
        { key: 'priority', label: 'Priority', accessor: 'priority', dataType: 'status', statusColors: PRIORITY_COLORS },
        { key: 'assignee', label: 'Assignee', accessor: 'assignee' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TASK_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Issues', accessor: 'total', dataType: 'number' },
    { key: 'open', label: 'Open', accessor: 'open', dataType: 'number' },
    { key: 'critical', label: 'Critical', accessor: 'critical', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search issues...',
    fields: ['title', 'description'],
  },
  
  emptyState: {
    message: 'No issues reported',
    actionLabel: 'Report Issue',
    actionRoute: '/issues/new',
  },
  
  defaultSort: {
    field: 'created_at',
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
