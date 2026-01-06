/**
 * Integration ATS Entity Configuration
 * Applicant Tracking System integration management
 */

import type { EntityConfig } from '../types';

export const integrationAtsEntity: EntityConfig = {
  name: 'integration-ats',
  singular: 'ATS Integration',
  plural: 'ATS Integrations',
  description: 'Applicant Tracking System integration management',
  icon: 'Users',
  
  routes: {
    list: '/integration-ats',
    detail: '/integration-ats/[id]',
    create: '/integration-ats/new',
    edit: '/integration-ats/[id]/edit',
  },
  
  api: {
    endpoint: '/api/integration-ats',
    statsEndpoint: '/api/integration-ats/stats',
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
    view: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    create: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    edit: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    delete: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
    export: ['ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN'],
  },

  search: {
    placeholder: 'Search ATS integrations...',
    fields: ['candidate_name', 'job_title', 'status'],
  },

  emptyState: {
    message: 'No ATS integrations found',
    actionLabel: 'Create ATS Integration',
    actionRoute: '/integration-ats/new',
  },
};
