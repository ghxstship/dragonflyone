/**
 * Drawings Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { DRAWING_STATUS_COLORS } from '../status-mappings';

export const drawingsEntity: EntityConfig = {
  name: 'drawings',
  singular: 'Drawing',
  plural: 'Drawings',
  description: 'Manage technical drawings and plans',
  icon: 'Image',
  
  routes: {
    list: '/drawings',
    detail: '/drawings/[id]',
    create: '/drawings/new',
    edit: '/drawings/[id]/edit',
  },
  
  api: {
    endpoint: '/api/drawings',
    statsEndpoint: '/api/drawings/stats',
  },
  
  columns: [
    { key: 'name', label: 'Drawing Name', accessor: 'name', sortable: true },
    { key: 'drawing_number', label: 'Number', accessor: 'drawing_number', sortable: true },
    { key: 'revision', label: 'Revision', accessor: 'revision', sortable: true },
    { key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: DRAWING_STATUS_COLORS },
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
    editAction('/drawings/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Upload Drawing', icon: 'Plus', handler: 'route', route: '/drawings/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Drawing Name', type: 'text', required: true },
    { name: 'drawing_number', label: 'Drawing Number', type: 'text', required: true },
    { name: 'revision', label: 'Revision', type: 'text', defaultValue: 'A' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'review', label: 'Review' },
      { value: 'approved', label: 'Approved' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Drawing Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'drawing_number', label: 'Number', accessor: 'drawing_number' },
        { key: 'revision', label: 'Revision', accessor: 'revision' },
        { key: 'updated_at', label: 'Updated', accessor: 'updated_at', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: DRAWING_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
    { key: 'in_review', label: 'In Review', accessor: 'in_review', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search drawings...',
    fields: ['name', 'drawing_number'],
  },
  
  emptyState: {
    message: 'No drawings yet',
    actionLabel: 'Upload Drawing',
    actionRoute: '/drawings/new',
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
