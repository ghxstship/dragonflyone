/**
 * SOPs Entity Configuration
 * 
 * Configuration for the Standard Operating Procedures entity used in COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  titleColumn, 
  categoryColumn,
  statusColumn,
  versionColumn,
  updatedAtColumn,
} from '../common-columns';
import { documentStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  approveAction,
  archiveAction,
  duplicateAction,
  exportBulkAction,
  approveBulkAction,
  archiveBulkAction,
  manageQuickAction,
} from '../common-actions';
import { DOCUMENT_STATUS_COLORS } from '../status-mappings';

export const sopsEntity: EntityConfig = {
  name: 'sops',
  singular: 'SOP',
  plural: 'SOPs',
  description: 'Standard Operating Procedures for production workflows',
  icon: 'FileText',
  
  routes: {
    list: '/sops',
    detail: '/sops/[id]',
    create: '/sops/new',
    edit: '/sops/[id]/edit',
    custom: {
      categories: '/sops/categories',
      acknowledgments: '/sops/acknowledgments',
      training: '/sops/training',
    },
  },
  
  api: {
    endpoint: '/api/sops',
    statsEndpoint: '/api/sops/stats',
  },
  
  columns: [
    titleColumn,
    categoryColumn,
    versionColumn,
    statusColumn({ statusColors: DOCUMENT_STATUS_COLORS }),
    {
      key: 'effective_date',
      label: 'Effective',
      accessor: 'effective_date',
      sortable: true,
      dataType: 'date',
    },
    updatedAtColumn,
  ],
  
  filters: [
    documentStatusFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/sops/[id]/edit'),
    approveAction,
    duplicateAction('/sops/new?duplicate=[id]'),
    archiveAction({ titleField: 'title' }),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    approveBulkAction,
    archiveBulkAction,
    exportBulkAction,
  ],
  
  quickActions: [
    manageQuickAction('Categories', '/sops/categories', 'Folder'),
    manageQuickAction('Acknowledgments', '/sops/acknowledgments', 'ClipboardCheck'),
    manageQuickAction('Training', '/sops/training', 'GraduationCap'),
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
    { name: 'category_id', label: 'Category', type: 'select', required: true, options: [] },
    { name: 'version', label: 'Version', type: 'text', required: true, defaultValue: '1.0' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'Under Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'archived', label: 'Archived' },
    ], defaultValue: 'draft' },
    { name: 'effective_date', label: 'Effective Date', type: 'date' },
    { name: 'review_date', label: 'Review Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'content', label: 'Content', type: 'rich-text', colSpan: 2 },
    { name: 'requires_acknowledgment', label: 'Requires Acknowledgment', type: 'checkbox' },
    { name: 'requires_training', label: 'Requires Training', type: 'checkbox' },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'SOP Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title', colSpan: 2 },
        { key: 'category', label: 'Category', accessor: (row) => (row.category as { name?: string })?.name || '—' },
        { key: 'version', label: 'Version', accessor: 'version' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: DOCUMENT_STATUS_COLORS },
        { key: 'effective_date', label: 'Effective', accessor: 'effective_date', dataType: 'date' },
        { key: 'review_date', label: 'Review Date', accessor: 'review_date', dataType: 'date' },
        { key: 'updated_at', label: 'Last Updated', accessor: 'updated_at', dataType: 'datetime' },
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2, hideEmpty: true },
      ],
    },
    {
      id: 'requirements',
      title: 'Requirements',
      fields: [
        { key: 'requires_acknowledgment', label: 'Acknowledgment Required', accessor: 'requires_acknowledgment', dataType: 'boolean' },
        { key: 'requires_training', label: 'Training Required', accessor: 'requires_training', dataType: 'boolean' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total SOPs', accessor: 'total', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
    { key: 'review', label: 'Under Review', accessor: 'review', dataType: 'number' },
    { key: 'draft', label: 'Draft', accessor: 'draft', dataType: 'number' },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'policy',
  },
  
  search: {
    placeholder: 'Search SOPs...',
    fields: ['title', 'description', 'category.name'],
  },
  
  emptyState: {
    message: 'No SOPs created yet',
    actionLabel: 'Create First SOP',
    actionRoute: '/sops/new',
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
    import: true,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
  },
};
