/**
 * Spec Sheets Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SPEC_SHEET_STATUS_COLORS } from '../status-mappings';

export const specSheetsEntity: EntityConfig = {
  name: 'spec-sheets',
  singular: 'Spec Sheet',
  plural: 'Spec Sheets',
  description: 'Manage technical spec sheets',
  icon: 'FileText',
  
  routes: {
    list: '/spec-sheets',
    detail: '/spec-sheets/[id]',
    create: '/spec-sheets/new',
    edit: '/spec-sheets/[id]/edit',
  },
  
  api: {
    endpoint: '/api/spec-sheets',
    statsEndpoint: '/api/spec-sheets/stats',
  },
  
  columns: [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'version', label: 'Version', accessor: 'version', sortable: true },
    { key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SPEC_SHEET_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'review', label: 'Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'superseded', label: 'Superseded' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/spec-sheets/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Spec Sheet', icon: 'Plus', handler: 'route', route: '/spec-sheets/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'audio', label: 'Audio' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'video', label: 'Video' },
      { value: 'staging', label: 'Staging' },
    ]},
    { name: 'version', label: 'Version', type: 'text', defaultValue: '1.0' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'Review' },
      { value: 'approved', label: 'Approved' },
    ]},
    { name: 'content', label: 'Content', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Spec Sheet Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'version', label: 'Version', accessor: 'version' },
        { key: 'updated_at', label: 'Updated', accessor: 'updated_at', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SPEC_SHEET_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search spec sheets...',
    fields: ['name', 'type'],
  },
  
  emptyState: {
    message: 'No spec sheets',
    actionLabel: 'New Spec Sheet',
    actionRoute: '/spec-sheets/new',
  },
  
  defaultSort: {
    field: 'updated_at',
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
