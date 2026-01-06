/**
 * Automation Rules Entity Configuration
 * User-defined automation rules and workflows
 */

import type { EntityConfig } from '../types';

export const automationRulesEntity: EntityConfig = {
  name: 'automation-rules',
  singular: 'Automation Rule',
  plural: 'Automation Rules',
  description: 'User-defined automation rules and workflows',
  icon: 'Zap',
  
  routes: {
    list: '/automation-rules',
    detail: '/automation-rules/[id]',
    create: '/automation-rules/new',
    edit: '/automation-rules/[id]/edit',
  },
  
  api: {
    endpoint: '/api/automation-rules',
    statsEndpoint: '/api/automation-rules/stats',
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
    placeholder: 'Search automation rules...',
    fields: ['name', 'description', 'trigger_type'],
  },

  emptyState: {
    message: 'No automation rules found',
    actionLabel: 'Create Automation Rule',
    actionRoute: '/automation-rules/new',
  },
};
