/**
 * User Sessions Entity Configuration
 * User session tracking and management
 */

import type { EntityConfig } from '../types';

export const userSessionsEntity: EntityConfig = {
  name: 'user-sessions',
  singular: 'User Session',
  plural: 'User Sessions',
  description: 'User session tracking and management',
  icon: 'Monitor',
  
  routes: {
    list: '/user-sessions',
    detail: '/user-sessions/[id]',
    create: '/user-sessions/new',
    edit: '/user-sessions/[id]/edit',
  },
  
  api: {
    endpoint: '/api/user-sessions',
    statsEndpoint: '/api/user-sessions/stats',
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
    placeholder: 'Search user sessions...',
    fields: ['user_email', 'ip_address', 'user_agent'],
  },

  emptyState: {
    message: 'No user sessions found',
    actionLabel: 'View Active Sessions',
    actionRoute: '/user-sessions/active',
  },
};
