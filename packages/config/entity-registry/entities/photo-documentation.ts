/**
 * Photo Documentation Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { PHOTO_STATUS_COLORS } from '../status-mappings';

export const photoDocumentationEntity: EntityConfig = {
  name: 'photo-documentation',
  singular: 'Photo',
  plural: 'Photo Documentation',
  description: 'Manage photo documentation',
  icon: 'Camera',
  
  routes: {
    list: '/photo-documentation',
    detail: '/photo-documentation/[id]',
    create: '/photo-documentation/new',
    edit: '/photo-documentation/[id]/edit',
  },
  
  api: {
    endpoint: '/api/photo-documentation',
    statsEndpoint: '/api/photo-documentation/stats',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category', sortable: true },
    { key: 'taken_at', label: 'Taken', accessor: 'taken_at', sortable: true, dataType: 'datetime' },
    { key: 'photographer', label: 'Photographer', accessor: 'photographer', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PHOTO_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/photo-documentation/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Upload Photo', icon: 'Plus', handler: 'route', route: '/photo-documentation/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'progress', label: 'Progress' },
      { value: 'issue', label: 'Issue' },
      { value: 'completion', label: 'Completion' },
      { value: 'safety', label: 'Safety' },
    ]},
    { name: 'photographer', label: 'Photographer', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Photo Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'category', label: 'Category', accessor: 'category' },
        { key: 'taken_at', label: 'Taken', accessor: 'taken_at', dataType: 'datetime' },
        { key: 'photographer', label: 'Photographer', accessor: 'photographer' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PHOTO_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search photos...',
    fields: ['title', 'photographer'],
  },
  
  emptyState: {
    message: 'No photos yet',
    actionLabel: 'Upload Photo',
    actionRoute: '/photo-documentation/new',
  },
  
  defaultSort: {
    field: 'taken_at',
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
