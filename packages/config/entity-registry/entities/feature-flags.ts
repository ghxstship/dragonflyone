/**
 * Feature Flags Entity Configuration
 * Feature flag management and overrides
 */

import type { EntityConfig } from '../types';

export const featureFlagsEntity: EntityConfig = {
  name: 'feature-flags',
  singular: 'Feature Flag',
  plural: 'Feature Flags',
  description: 'Feature flag management and overrides',
  icon: 'Flag',
  
  routes: {
    list: '/feature-flags',
    detail: '/feature-flags/[id]',
    create: '/feature-flags/new',
    edit: '/feature-flags/[id]/edit',
  },
  
  api: {
    endpoint: '/api/feature-flags',
    statsEndpoint: '/api/feature-flags/stats',
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
    placeholder: 'Search feature flags...',
    fields: ['key', 'description', 'environment'],
  },

  emptyState: {
    message: 'No feature flags found',
    actionLabel: 'Create Feature Flag',
    actionRoute: '/feature-flags/new',
  },
};
