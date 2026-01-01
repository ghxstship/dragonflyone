/**
 * Subcontractors Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SUBCONTRACTOR_STATUS_COLORS } from '../status-mappings';

export const subcontractorsEntity: EntityConfig = {
  name: 'subcontractors',
  singular: 'Subcontractor',
  plural: 'Subcontractors',
  description: 'Manage subcontractors',
  icon: 'Users',
  
  routes: {
    list: '/subcontractors',
    detail: '/subcontractors/[id]',
    create: '/subcontractors/new',
    edit: '/subcontractors/[id]/edit',
  },
  
  api: {
    endpoint: '/api/subcontractors',
    statsEndpoint: '/api/subcontractors/stats',
  },
  
  columns: [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { key: 'specialty', label: 'Specialty', accessor: 'specialty', sortable: true },
    { key: 'contact', label: 'Contact', accessor: 'contact', sortable: true },
    { key: 'rating', label: 'Rating', accessor: 'rating', sortable: true, dataType: 'number' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SUBCONTRACTOR_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'blacklisted', label: 'Blacklisted' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/subcontractors/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Subcontractor', icon: 'Plus', handler: 'route', route: '/subcontractors/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Company Name', type: 'text', required: true },
    { name: 'specialty', label: 'Specialty', type: 'select', required: true, options: [
      { value: 'audio', label: 'Audio' },
      { value: 'lighting', label: 'Lighting' },
      { value: 'video', label: 'Video' },
      { value: 'staging', label: 'Staging' },
      { value: 'rigging', label: 'Rigging' },
      { value: 'power', label: 'Power' },
    ]},
    { name: 'contact', label: 'Contact Person', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Subcontractor Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'specialty', label: 'Specialty', accessor: 'specialty' },
        { key: 'contact', label: 'Contact', accessor: 'contact' },
        { key: 'rating', label: 'Rating', accessor: 'rating', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SUBCONTRACTOR_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search subcontractors...',
    fields: ['name', 'specialty', 'contact'],
  },
  
  emptyState: {
    message: 'No subcontractors',
    actionLabel: 'Add Subcontractor',
    actionRoute: '/subcontractors/new',
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
