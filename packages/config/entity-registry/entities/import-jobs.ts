/**
 * Import Jobs Entity Configuration
 * Data import job tracking and management
 */

import type { EntityConfig } from '../types';

export const importJobsEntity: EntityConfig = {
  name: 'import-jobs',
  singular: 'Import Job',
  plural: 'Import Jobs',
  description: 'Data import job tracking and management',
  icon: 'Upload',
  
  routes: {
    list: '/import-jobs',
    detail: '/import-jobs/[id]',
    create: '/import-jobs/new',
    edit: '/import-jobs/[id]/edit',
  },
  
  api: {
    endpoint: '/api/import-jobs',
    statsEndpoint: '/api/import-jobs/stats',
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
    placeholder: 'Search import jobs...',
    fields: ['file_name', 'entity_type', 'status'],
  },

  emptyState: {
    message: 'No import jobs found',
    actionLabel: 'Create Import Job',
    actionRoute: '/import-jobs/new',
  },
};
