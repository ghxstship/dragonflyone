/**
 * User Preferences Entity Configuration
 * General user preferences and settings
 */

import type { EntityConfig } from '../types';

export const userPreferencesEntity: EntityConfig = {
  name: 'user-preferences',
  singular: 'User Preference',
  plural: 'User Preferences',
  description: 'General user preferences and application settings',
  icon: 'Settings',
  
  routes: {
    list: '/user-preferences',
    detail: '/user-preferences/[id]',
    create: '/user-preferences/new',
    edit: '/user-preferences/[id]/edit',
  },
  
  api: {
    endpoint: '/api/user-preferences',
    statsEndpoint: '/api/user-preferences/stats',
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
    placeholder: 'Search user preferences...',
    fields: ['theme', 'language', 'timezone'],
  },

  emptyState: {
    message: 'No user preferences found',
    actionLabel: 'Create Preference',
    actionRoute: '/user-preferences/new',
  },
};
