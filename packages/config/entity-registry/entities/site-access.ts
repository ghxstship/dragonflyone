/**
 * Site Access Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SITE_ACCESS_STATUS_COLORS } from '../status-mappings';

export const siteAccessEntity: EntityConfig = {
  name: 'site-access',
  singular: 'Site Access',
  plural: 'Site Access',
  description: 'Manage site access permissions',
  icon: 'Key',
  
  routes: {
    list: '/site-access',
    detail: '/site-access/[id]',
    create: '/site-access/new',
    edit: '/site-access/[id]/edit',
  },
  
  api: {
    endpoint: '/api/site-access',
    statsEndpoint: '/api/site-access/stats',
  },
  
  columns: [
    { key: 'person', label: 'Person', accessor: 'person', sortable: true },
    { key: 'area', label: 'Area', accessor: 'area', sortable: true },
    { key: 'valid_from', label: 'Valid From', accessor: 'valid_from', sortable: true, dataType: 'date' },
    { key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SITE_ACCESS_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'granted', label: 'Granted' },
        { value: 'pending', label: 'Pending' },
        { value: 'denied', label: 'Denied' },
        { value: 'expired', label: 'Expired' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/site-access/[id]/edit'),
    deleteAction({ titleField: 'person' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Grant Access', icon: 'Plus', handler: 'route', route: '/site-access/new', primary: true },
  ],
  
  formFields: [
    { name: 'person_id', label: 'Person', type: 'select', required: true, options: [] },
    { name: 'area', label: 'Area', type: 'select', required: true, options: [
      { value: 'all', label: 'All Areas' },
      { value: 'backstage', label: 'Backstage' },
      { value: 'production', label: 'Production' },
      { value: 'vip', label: 'VIP' },
    ]},
    { name: 'valid_from', label: 'Valid From', type: 'date', required: true },
    { name: 'valid_until', label: 'Valid Until', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'granted', label: 'Granted' },
      { value: 'pending', label: 'Pending' },
      { value: 'denied', label: 'Denied' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Site Access Details',
      fields: [
        { key: 'person', label: 'Person', accessor: 'person' },
        { key: 'area', label: 'Area', accessor: 'area' },
        { key: 'valid_from', label: 'Valid From', accessor: 'valid_from', dataType: 'date' },
        { key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SITE_ACCESS_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'granted', label: 'Granted', accessor: 'granted', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search site access...',
    fields: ['person', 'area'],
  },
  
  emptyState: {
    message: 'No site access records',
    actionLabel: 'Grant Access',
    actionRoute: '/site-access/new',
  },
  
  defaultSort: {
    field: 'valid_from',
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
