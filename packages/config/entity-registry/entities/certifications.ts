/**
 * Certifications Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { CERTIFICATION_STATUS_COLORS } from '../status-mappings';

export const certificationsEntity: EntityConfig = {
  name: 'certifications',
  singular: 'Certification',
  plural: 'Certifications',
  description: 'Manage certifications and training',
  icon: 'Award',
  
  routes: {
    list: '/certifications',
    detail: '/certifications/[id]',
    create: '/certifications/new',
    edit: '/certifications/[id]/edit',
  },
  
  api: {
    endpoint: '/api/certifications',
    statsEndpoint: '/api/certifications/stats',
  },
  
  columns: [
    { key: 'name', label: 'Certification', accessor: 'name', sortable: true },
    { key: 'holder', label: 'Holder', accessor: 'holder', sortable: true },
    { key: 'issuing_body', label: 'Issuing Body', accessor: 'issuing_body', sortable: true },
    { key: 'expiry_date', label: 'Expires', accessor: 'expiry_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: CERTIFICATION_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'valid', label: 'Valid' },
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'expiring', label: 'Expiring' },
        { value: 'expired', label: 'Expired' },
        { value: 'revoked', label: 'Revoked' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/certifications/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Certification', icon: 'Plus', handler: 'route', route: '/certifications/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Certification Name', type: 'text', required: true },
    { name: 'holder_id', label: 'Holder', type: 'select', required: true, options: [] },
    { name: 'issuing_body', label: 'Issuing Body', type: 'text', required: true },
    { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
    { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'valid', options: [
      { value: 'valid', label: 'Valid' },
      { value: 'pending', label: 'Pending' },
      { value: 'expired', label: 'Expired' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Certification Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'holder', label: 'Holder', accessor: 'holder' },
        { key: 'issuing_body', label: 'Issuing Body', accessor: 'issuing_body' },
        { key: 'expiry_date', label: 'Expires', accessor: 'expiry_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: CERTIFICATION_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'valid', label: 'Valid', accessor: 'valid', dataType: 'number' },
    { key: 'expiring', label: 'Expiring', accessor: 'expiring', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search certifications...',
    fields: ['name', 'holder', 'issuing_body'],
  },
  
  emptyState: {
    message: 'No certifications yet',
    actionLabel: 'Add Certification',
    actionRoute: '/certifications/new',
  },
  
  defaultSort: {
    field: 'expiry_date',
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
