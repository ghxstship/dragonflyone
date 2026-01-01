/**
 * QA Checkpoints Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { QA_STATUS_COLORS } from '../status-mappings';

export const qaCheckpointsEntity: EntityConfig = {
  name: 'qa-checkpoints',
  singular: 'QA Checkpoint',
  plural: 'QA Checkpoints',
  description: 'Manage quality assurance checkpoints',
  icon: 'ClipboardCheck',
  
  routes: {
    list: '/qa-checkpoints',
    detail: '/qa-checkpoints/[id]',
    create: '/qa-checkpoints/new',
    edit: '/qa-checkpoints/[id]/edit',
  },
  
  api: {
    endpoint: '/api/qa-checkpoints',
    statsEndpoint: '/api/qa-checkpoints/stats',
  },
  
  columns: [
    { key: 'name', label: 'Checkpoint', accessor: 'name', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category', sortable: true },
    { key: 'inspector', label: 'Inspector', accessor: 'inspector', sortable: true },
    { key: 'inspected_at', label: 'Inspected', accessor: 'inspected_at', sortable: true, dataType: 'datetime' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: QA_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'passed', label: 'Passed' },
        { value: 'failed', label: 'Failed' },
        { value: 'waived', label: 'Waived' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/qa-checkpoints/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Checkpoint', icon: 'Plus', handler: 'route', route: '/qa-checkpoints/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Checkpoint Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'safety', label: 'Safety' },
      { value: 'quality', label: 'Quality' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'performance', label: 'Performance' },
    ]},
    { name: 'inspector_id', label: 'Inspector', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'passed', label: 'Passed' },
      { value: 'failed', label: 'Failed' },
      { value: 'waived', label: 'Waived' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'QA Checkpoint Details',
      fields: [
        { key: 'name', label: 'Checkpoint', accessor: 'name' },
        { key: 'category', label: 'Category', accessor: 'category' },
        { key: 'inspector', label: 'Inspector', accessor: 'inspector' },
        { key: 'inspected_at', label: 'Inspected', accessor: 'inspected_at', dataType: 'datetime' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: QA_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'passed', label: 'Passed', accessor: 'passed', dataType: 'number' },
    { key: 'failed', label: 'Failed', accessor: 'failed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search checkpoints...',
    fields: ['name', 'category'],
  },
  
  emptyState: {
    message: 'No QA checkpoints',
    actionLabel: 'Add Checkpoint',
    actionRoute: '/qa-checkpoints/new',
  },
  
  defaultSort: {
    field: 'inspected_at',
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
