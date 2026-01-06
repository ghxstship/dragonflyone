/**
 * SSO Providers Entity Configuration
 * Single Sign-On provider configuration
 */

import type { EntityConfig } from '../types';

export const ssoProvidersEntity: EntityConfig = {
  name: 'sso-providers',
  singular: 'SSO Provider',
  plural: 'SSO Providers',
  description: 'Single Sign-On provider configuration',
  icon: 'Shield',
  
  routes: {
    list: '/sso-providers',
    detail: '/sso-providers/[id]',
    create: '/sso-providers/new',
    edit: '/sso-providers/[id]/edit',
  },
  
  api: {
    endpoint: '/api/sso-providers',
    statsEndpoint: '/api/sso-providers/stats',
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
    placeholder: 'Search SSO providers...',
    fields: ['provider_name', 'provider_type', 'status'],
  },

  emptyState: {
    message: 'No SSO providers found',
    actionLabel: 'Create SSO Provider',
    actionRoute: '/sso-providers/new',
  },
};
