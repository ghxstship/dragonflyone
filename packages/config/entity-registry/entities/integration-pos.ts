/**
 * Integration POS Entity Configuration
 * Point of Sale integration management
 */

import type { EntityConfig } from '../types';

export const integrationPosEntity: EntityConfig = {
  name: 'integration-pos',
  singular: 'POS Integration',
  plural: 'POS Integrations',
  description: 'Point of Sale integration management',
  icon: 'CreditCard',
  
  routes: {
    list: '/integration-pos',
    detail: '/integration-pos/[id]',
    create: '/integration-pos/new',
    edit: '/integration-pos/[id]/edit',
  },
  
  api: {
    endpoint: '/api/integration-pos',
    statsEndpoint: '/api/integration-pos/stats',
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
    placeholder: 'Search POS integrations...',
    fields: ['location_name', 'terminal_id', 'integration_type'],
  },

  emptyState: {
    message: 'No POS integrations found',
    actionLabel: 'Create POS Integration',
    actionRoute: '/integration-pos/new',
  },
};
