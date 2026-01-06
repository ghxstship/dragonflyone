/**
 * Notifications Entity Configuration
 * Notification management and delivery
 */

import type { EntityConfig } from '../types';

export const notificationsEntity: EntityConfig = {
  name: 'notifications',
  singular: 'Notification',
  plural: 'Notifications',
  description: 'Notification management and delivery',
  icon: 'Bell',
  
  routes: {
    list: '/notifications',
    detail: '/notifications/[id]',
    create: '/notifications/new',
    edit: '/notifications/[id]/edit',
  },
  
  api: {
    endpoint: '/api/notifications',
    statsEndpoint: '/api/notifications/stats',
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
    placeholder: 'Search notifications...',
    fields: ['title', 'message', 'type'],
  },

  emptyState: {
    message: 'No notifications found',
    actionLabel: 'Create Notification',
    actionRoute: '/notifications/new',
  },
};
