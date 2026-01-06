/**
 * Export Jobs Entity Configuration
 * Data export job tracking and management
 */

import type { EntityConfig } from '../types';

export const exportJobsEntity: EntityConfig = {
  name: 'export-jobs',
  singular: 'Export Job',
  plural: 'Export Jobs',
  description: 'Data export job tracking and management',
  icon: 'Download',
  
  routes: {
    list: '/export-jobs',
    detail: '/export-jobs/[id]',
    create: '/export-jobs/new',
    edit: '/export-jobs/[id]/edit',
  },
  
  api: {
    endpoint: '/api/export-jobs',
    statsEndpoint: '/api/export-jobs/stats',
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
    placeholder: 'Search export jobs...',
    fields: ['file_name', 'entity_type', 'status'],
  },

  emptyState: {
    message: 'No export jobs found',
    actionLabel: 'Create Export Job',
    actionRoute: '/export-jobs/new',
  },
};
