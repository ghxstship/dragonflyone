/**
 * API Keys Entity Configuration
 * API key management and access control
 */

import type { EntityConfig } from '../types';

export const apiKeysEntity: EntityConfig = {
  name: 'api-keys',
  singular: 'API Key',
  plural: 'API Keys',
  description: 'API key management and access control',
  icon: 'Key',
  
  routes: {
    list: '/api-keys',
    detail: '/api-keys/[id]',
    create: '/api-keys/new',
    edit: '/api-keys/[id]/edit',
  },
  
  api: {
    endpoint: '/api/api-keys',
    statsEndpoint: '/api/api-keys/stats',
  },

  columns: [],

  filters: [],

  rowActions: [],

  bulkActions: [],

  quickActions: [],

  formFields: [],

  detailSections: [],

  stats: [],

  features: {
    search: true,
    export: true,
    import: false,
    bulkActions: false,
    selection: false,
  },

  permissions: {
    view: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    create: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    edit: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    delete: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    export: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
  },

  search: {
    placeholder: 'Search API keys...',
    fields: ['name', 'key_prefix', 'permissions'],
  },

  emptyState: {
    message: 'No API keys found',
    actionLabel: 'Create API Key',
    actionRoute: '/api-keys/new',
  },
};
