/**
 * Templates Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TEMPLATE_STATUS_COLORS } from '../status-mappings';

export const templatesEntity: EntityConfig = {
  name: 'templates',
  singular: 'Template',
  plural: 'Templates',
  description: 'Manage document templates',
  icon: 'FileText',
  
  routes: {
    list: '/templates',
    detail: '/templates/[id]',
    create: '/templates/new',
    edit: '/templates/[id]/edit',
  },
  
  api: {
    endpoint: '/api/templates',
    statsEndpoint: '/api/templates/stats',
  },
  
  columns: [
    { key: 'name', label: 'Template Name', accessor: 'name', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category', sortable: true },
    { key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: TEMPLATE_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/templates/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Template', icon: 'Plus', handler: 'route', route: '/templates/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Template Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'document', label: 'Document' },
      { value: 'email', label: 'Email' },
      { value: 'contract', label: 'Contract' },
      { value: 'report', label: 'Report' },
    ]},
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'archived', label: 'Archived' },
    ]},
    { name: 'content', label: 'Content', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Template Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'category', label: 'Category', accessor: 'category' },
        { key: 'updated_at', label: 'Updated', accessor: 'updated_at', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TEMPLATE_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search templates...',
    fields: ['name', 'type', 'category'],
  },
  
  emptyState: {
    message: 'No templates',
    actionLabel: 'New Template',
    actionRoute: '/templates/new',
  },
  
  defaultSort: {
    field: 'name',
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
