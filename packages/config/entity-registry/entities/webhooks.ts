/**
 * Webhooks Entity Configuration
 * Webhook management and delivery tracking
 */

import type { EntityConfig } from '../types';

export const webhooksEntity: EntityConfig = {
  name: 'webhooks',
  singular: 'Webhook',
  plural: 'Webhooks',
  description: 'Webhook management and delivery tracking',
  icon: 'Link',
  
  routes: {
    list: '/webhooks',
    detail: '/webhooks/[id]',
    create: '/webhooks/new',
    edit: '/webhooks/[id]/edit',
  },
  
  api: {
    endpoint: '/api/webhooks',
    statsEndpoint: '/api/webhooks/stats',
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
    placeholder: 'Search webhooks...',
    fields: ['name', 'url', 'event_types'],
  },

  emptyState: {
    message: 'No webhooks found',
    actionLabel: 'Create Webhook',
    actionRoute: '/webhooks/new',
  },
};
