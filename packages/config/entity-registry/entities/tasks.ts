/**
 * Tasks Entity Configuration
 * 
 * Configuration for the tasks entity used across apps.
 */

import type { EntityConfig } from '../types';
import { 
  titleColumn, 
  statusColumn,
  priorityColumn,
  dueDateColumn,
  createdAtColumn,
} from '../common-columns';
import { taskStatusFilter, priorityFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  completeAction,
  assignAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TASK_STATUS_COLORS, PRIORITY_COLORS } from '../status-mappings';

export const tasksEntity: EntityConfig = {
  name: 'tasks',
  singular: 'Task',
  plural: 'Tasks',
  description: 'Manage tasks and to-do items',
  icon: 'ClipboardCheck',
  
  routes: {
    list: '/tasks',
    detail: '/tasks/[id]',
    create: '/tasks/new',
    edit: '/tasks/[id]/edit',
  },
  
  api: {
    endpoint: '/api/tasks',
    statsEndpoint: '/api/tasks/stats',
  },
  
  columns: [
    titleColumn,
    {
      key: 'assignee',
      label: 'Assignee',
      accessor: (row) => {
        const user = row.assignee as { first_name?: string; last_name?: string } | undefined;
        return user ? `${user.first_name} ${user.last_name}` : '—';
      },
      sortable: true,
      dataType: 'string',
    },
    priorityColumn,
    dueDateColumn,
    statusColumn({ statusColors: TASK_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    taskStatusFilter,
    priorityFilter,
    {
      key: 'assignee_id',
      label: 'Assignee',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/tasks/[id]/edit'),
    completeAction,
    assignAction,
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'assignee_id', label: 'Assignee', type: 'select', options: [] },
    { name: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ], defaultValue: 'medium' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'blocked', label: 'Blocked' },
      { value: 'completed', label: 'Completed' },
    ], defaultValue: 'open' },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'project_id', label: 'Project', type: 'select', options: [] },
    { name: 'tags', label: 'Tags', type: 'text' },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Task Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title', colSpan: 2 },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TASK_STATUS_COLORS },
        { key: 'priority', label: 'Priority', accessor: 'priority', dataType: 'status', statusColors: PRIORITY_COLORS },
        { key: 'assignee', label: 'Assignee', accessor: (row) => {
          const user = row.assignee as { first_name?: string; last_name?: string } | undefined;
          return user ? `${user.first_name} ${user.last_name}` : '—';
        }},
        { key: 'due_date', label: 'Due Date', accessor: 'due_date', dataType: 'date' },
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  capabilities: ['view:kanban', 'view:calendar', 'view:timeline'],
  
  stats: [
    { key: 'total', label: 'Total Tasks', accessor: 'total', dataType: 'number' },
    { key: 'open', label: 'Open', accessor: 'open', dataType: 'number' },
    { key: 'in_progress', label: 'In Progress', accessor: 'in_progress', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search tasks...',
    fields: ['title', 'description'],
  },
  
  emptyState: {
    message: 'No tasks created yet',
    actionLabel: 'Create First Task',
    actionRoute: '/tasks/new',
  },
  
  defaultSort: {
    field: 'due_date',
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
