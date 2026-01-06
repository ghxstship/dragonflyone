/**
 * Workspaces Entity Configuration
 * Project groupings and workspace management
 */

import type { EntityConfig } from '../types';

export const workspacesEntity: EntityConfig = {
  name: 'workspaces',
  singular: 'Workspace',
  plural: 'Workspaces',
  description: 'Project groupings and workspace management',
  icon: 'LayoutGrid',
  
  routes: {
    list: '/workspaces',
    detail: '/workspaces/[id]',
    create: '/workspaces/new',
    edit: '/workspaces/[id]/edit',
  },
  
  api: {
    endpoint: '/api/workspaces',
    statsEndpoint: '/api/workspaces/stats',
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
    placeholder: 'Search workspaces...',
    fields: ['name', 'description'],
  },

  emptyState: {
    message: 'No workspaces found',
    actionLabel: 'Create Workspace',
    actionRoute: '/workspaces/new',
  },
};
