/**
 * Search History Entity Configuration
 * Search history and analytics
 */

import type { EntityConfig } from '../types';

export const searchHistoryEntity: EntityConfig = {
  name: 'search-history',
  singular: 'Search History',
  plural: 'Search History',
  description: 'Search history and analytics',
  icon: 'Search',
  
  routes: {
    list: '/search-history',
    detail: '/search-history/[id]',
    create: '/search-history/new',
    edit: '/search-history/[id]/edit',
  },
  
  api: {
    endpoint: '/api/search-history',
    statsEndpoint: '/api/search-history/stats',
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
    create: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    edit: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    delete: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    export: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
  },

  search: {
    placeholder: 'Search search history...',
    fields: ['query', 'entity_type', 'results_count'],
  },

  emptyState: {
    message: 'No search history found',
    actionLabel: 'View Search Analytics',
    actionRoute: '/search-history/analytics',
  },
};
