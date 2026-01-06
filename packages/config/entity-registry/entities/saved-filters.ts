/**
 * Saved Filters Entity Configuration
 * User-specific filter configurations
 */

import type { EntityConfig } from '../types';

export const savedFiltersEntity: EntityConfig = {
  name: 'saved-filters',
  singular: 'Saved Filter',
  plural: 'Saved Filters',
  description: 'User-specific filter configurations for list views',
  icon: 'Filter',
  
  routes: {
    list: '/saved-filters',
    detail: '/saved-filters/[id]',
    create: '/saved-filters/new',
    edit: '/saved-filters/[id]/edit',
  },
  
  api: {
    endpoint: '/api/saved-filters',
    statsEndpoint: '/api/saved-filters/stats',
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
    view: ['ATLVS_VIEWER', 'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    create: ['ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    edit: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    delete: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    export: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
  },

  search: {
    placeholder: 'Search saved filters...',
    fields: ['name', 'description'],
  },

  emptyState: {
    message: 'No saved filters found',
    actionLabel: 'Create Filter',
    actionRoute: '/saved-filters/new',
  },
};
