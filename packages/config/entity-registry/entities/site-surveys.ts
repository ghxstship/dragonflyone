/**
 * Site Surveys Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SURVEY_STATUS_COLORS } from '../status-mappings';

export const siteSurveysEntity: EntityConfig = {
  name: 'site-surveys',
  singular: 'Site Survey',
  plural: 'Site Surveys',
  description: 'Manage site surveys',
  icon: 'MapPin',
  
  routes: {
    list: '/site-surveys',
    detail: '/site-surveys/[id]',
    create: '/site-surveys/new',
    edit: '/site-surveys/[id]/edit',
  },
  
  api: {
    endpoint: '/api/site-surveys',
    statsEndpoint: '/api/site-surveys/stats',
  },
  
  columns: [
    { key: 'name', label: 'Survey Name', accessor: 'name', sortable: true },
    { key: 'location', label: 'Location', accessor: 'location', sortable: true },
    { key: 'surveyor', label: 'Surveyor', accessor: 'surveyor', sortable: true },
    { key: 'scheduled_date', label: 'Scheduled', accessor: 'scheduled_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SURVEY_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/site-surveys/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Survey', icon: 'Plus', handler: 'route', route: '/site-surveys/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Survey Name', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'surveyor_id', label: 'Surveyor', type: 'select', options: [] },
    { name: 'scheduled_date', label: 'Scheduled Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'scheduled', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Site Survey Details',
      fields: [
        { key: 'name', label: 'Survey Name', accessor: 'name' },
        { key: 'location', label: 'Location', accessor: 'location' },
        { key: 'surveyor', label: 'Surveyor', accessor: 'surveyor' },
        { key: 'scheduled_date', label: 'Scheduled', accessor: 'scheduled_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SURVEY_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'scheduled', label: 'Scheduled', accessor: 'scheduled', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search site surveys...',
    fields: ['name', 'location'],
  },
  
  emptyState: {
    message: 'No site surveys',
    actionLabel: 'New Survey',
    actionRoute: '/site-surveys/new',
  },
  
  defaultSort: {
    field: 'scheduled_date',
    direction: 'asc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: true,
    export: true,
    import: false,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
  },
};
