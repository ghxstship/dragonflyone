/**
 * User Notification Preferences Entity Configuration
 * User notification and alert preferences
 */

import type { EntityConfig } from '../types';

export const userNotificationPreferencesEntity: EntityConfig = {
  name: 'user-notification-preferences',
  singular: 'Notification Preference',
  plural: 'Notification Preferences',
  description: 'User notification and alert preferences',
  icon: 'Bell',
  
  routes: {
    list: '/user-notification-preferences',
    detail: '/user-notification-preferences/[id]',
    create: '/user-notification-preferences/new',
    edit: '/user-notification-preferences/[id]/edit',
  },
  
  api: {
    endpoint: '/api/user-notification-preferences',
    statsEndpoint: '/api/user-notification-preferences/stats',
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
    placeholder: 'Search notification preferences...',
    fields: ['digest_frequency', 'channel_preferences'],
  },

  emptyState: {
    message: 'No notification preferences found',
    actionLabel: 'Create Preference',
    actionRoute: '/user-notification-preferences/new',
  },
};
