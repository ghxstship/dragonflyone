/**
 * User Settings Entity Configuration
 * Application-specific user settings
 */

import type { EntityConfig } from '../types';

export const userSettingsEntity: EntityConfig = {
  name: 'user-settings',
  singular: 'User Setting',
  plural: 'User Settings',
  description: 'Application-specific user settings and configurations',
  icon: 'Settings',
  
  routes: {
    list: '/user-settings',
    detail: '/user-settings/[id]',
    create: '/user-settings/new',
    edit: '/user-settings/[id]/edit',
  },
  
  api: {
    endpoint: '/api/user-settings',
    statsEndpoint: '/api/user-settings/stats',
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
    placeholder: 'Search user settings...',
    fields: ['setting_key', 'setting_value'],
  },

  emptyState: {
    message: 'No user settings found',
    actionLabel: 'Create Setting',
    actionRoute: '/user-settings/new',
  },
};
