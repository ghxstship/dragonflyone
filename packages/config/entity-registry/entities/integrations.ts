/**
 * Integrations Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { INTEGRATION_STATUS_COLORS } from '../status-mappings';

export const integrationsEntity: EntityConfig = {
  name: 'integrations',
  singular: 'Integration',
  plural: 'Integrations',
  description: 'Manage third-party integrations',
  icon: 'Link',
  
  routes: {
    list: '/integrations',
    detail: '/integrations/[id]',
    create: '/integrations/new',
    edit: '/integrations/[id]/edit',
  },
  
  api: {
    endpoint: '/api/integrations',
    statsEndpoint: '/api/integrations/stats',
  },
  
  columns: [
    { key: 'name', label: 'Integration', accessor: 'name', sortable: true },
    { key: 'provider', label: 'Provider', accessor: 'provider', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'last_sync', label: 'Last Sync', accessor: 'last_sync', sortable: true, dataType: 'datetime' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: INTEGRATION_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'connected', label: 'Connected' },
        { value: 'disconnected', label: 'Disconnected' },
        { value: 'pending', label: 'Pending' },
        { value: 'error', label: 'Error' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/integrations/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Integration', icon: 'Plus', handler: 'route', route: '/integrations/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Integration Name', type: 'text', required: true },
    { name: 'provider', label: 'Provider', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'api', label: 'API' },
      { value: 'webhook', label: 'Webhook' },
      { value: 'oauth', label: 'OAuth' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'connected', label: 'Connected' },
      { value: 'disconnected', label: 'Disconnected' },
      { value: 'pending', label: 'Pending' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Integration Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'provider', label: 'Provider', accessor: 'provider' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'last_sync', label: 'Last Sync', accessor: 'last_sync', dataType: 'datetime' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: INTEGRATION_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'connected', label: 'Connected', accessor: 'connected', dataType: 'number' },
    { key: 'errors', label: 'Errors', accessor: 'errors', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search integrations...',
    fields: ['name', 'provider'],
  },
  
  emptyState: {
    message: 'No integrations yet',
    actionLabel: 'Add Integration',
    actionRoute: '/integrations/new',
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
