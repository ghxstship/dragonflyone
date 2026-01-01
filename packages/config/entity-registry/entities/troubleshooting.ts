/**
 * Troubleshooting Entity Configuration
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

export const troubleshootingEntity: EntityConfig = {
  name: 'troubleshooting',
  singular: 'Issue',
  plural: 'Troubleshooting',
  description: 'Manage troubleshooting issues',
  icon: 'AlertCircle',
  
  routes: {
    list: '/troubleshooting',
    detail: '/troubleshooting/[id]',
    create: '/troubleshooting/new',
    edit: '/troubleshooting/[id]/edit',
  },
  
  api: {
    endpoint: '/api/troubleshooting',
    statsEndpoint: '/api/troubleshooting/stats',
  },
  
  columns: [
    { key: 'title', label: 'Issue', accessor: 'title', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category', sortable: true },
    { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, dataType: 'status', statusColors: PRIORITY_COLORS },
    { key: 'assignee', label: 'Assignee', accessor: 'assignee', sortable: true },
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
        { value: 'resolved', label: 'Resolved' },
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
    editAction('/troubleshooting/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Report Issue', icon: 'Plus', handler: 'route', route: '/troubleshooting/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Issue Title', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'audio', label: 'Audio' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'video', label: 'Video' },
      { value: 'power', label: 'Power' },
      { value: 'network', label: 'Network' },
      { value: 'other', label: 'Other' },
    ]},
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
      { value: 'resolved', label: 'Resolved' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Issue Details',
      fields: [
        { key: 'title', label: 'Issue', accessor: 'title' },
        { key: 'category', label: 'Category', accessor: 'category' },
        { key: 'priority', label: 'Priority', accessor: 'priority', dataType: 'status', statusColors: PRIORITY_COLORS },
        { key: 'assignee', label: 'Assignee', accessor: 'assignee' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TASK_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'open', label: 'Open', accessor: 'open', dataType: 'number' },
    { key: 'critical', label: 'Critical', accessor: 'critical', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search issues...',
    fields: ['title', 'category'],
  },
  
  emptyState: {
    message: 'No issues reported',
    actionLabel: 'Report Issue',
    actionRoute: '/troubleshooting/new',
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
