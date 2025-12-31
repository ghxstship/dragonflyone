/**
 * Projects Entity Configuration
 * 
 * Configuration for the projects entity used in ATLVS and COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  nameColumn, 
  statusColumn,
  dateColumn,
  createdAtColumn,
} from '../common-columns';
import { projectStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  archiveAction,
  exportBulkAction,
  archiveBulkAction,
} from '../common-actions';
import { PROJECT_STATUS_COLORS } from '../status-mappings';

export const projectsEntity: EntityConfig = {
  name: 'projects',
  singular: 'Project',
  plural: 'Projects',
  description: 'Manage production projects and campaigns',
  icon: 'Briefcase',
  
  routes: {
    list: '/projects',
    detail: '/projects/[id]',
    create: '/projects/new',
    edit: '/projects/[id]/edit',
  },
  
  api: {
    endpoint: '/api/projects',
    statsEndpoint: '/api/projects/stats',
  },
  
  columns: [
    nameColumn,
    {
      key: 'client',
      label: 'Client',
      accessor: (row) => (row.client as { name?: string })?.name || (row.client_name as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    dateColumn('start_date', 'Start'),
    dateColumn('end_date', 'End'),
    statusColumn({ statusColors: PROJECT_STATUS_COLORS }),
    {
      key: 'budget',
      label: 'Budget',
      accessor: 'budget',
      sortable: true,
      dataType: 'currency',
    },
    createdAtColumn,
  ],
  
  filters: [
    projectStatusFilter,
    {
      key: 'client_id',
      label: 'Client',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/projects/[id]/edit'),
    archiveAction({ titleField: 'name' }),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    archiveBulkAction,
    exportBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'name', label: 'Project Name', type: 'text', required: true, colSpan: 2 },
    { name: 'client_id', label: 'Client', type: 'select', options: [] },
    { name: 'client_name', label: 'Client Name', type: 'text' },
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'planning', label: 'Planning' },
      { value: 'active', label: 'Active' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
      { value: 'archived', label: 'Archived' },
    ], defaultValue: 'planning' },
    { name: 'budget', label: 'Budget', type: 'currency' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Project Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name', colSpan: 2 },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PROJECT_STATUS_COLORS },
        { key: 'client', label: 'Client', accessor: (row) => (row.client as { name?: string })?.name || row.client_name || '—' },
        { key: 'start_date', label: 'Start', accessor: 'start_date', dataType: 'date' },
        { key: 'end_date', label: 'End', accessor: 'end_date', dataType: 'date' },
        { key: 'budget', label: 'Budget', accessor: 'budget', dataType: 'currency' },
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  capabilities: ['view:timeline', 'view:gantt', 'view:kanban'],
  
  legendMapping: {
    table: 'legend_events',
    typeColumn: 'event_type',
    typeValue: 'production',
    profileTable: 'events_profile_production',
    profileForeignKey: 'event_id',
    selectQuery: '*, events_profile_production!event_id(*), client:legend_organizations(*)',
    relationships: [
      { entity: 'vendors', type: 'many-to-one', foreignKey: 'client_id', eager: true },
      { entity: 'crew', type: 'many-to-many', foreignKey: 'project_id', joinTable: 'project_crew_assignments' },
      { entity: 'equipment', type: 'many-to-many', foreignKey: 'project_id', joinTable: 'project_equipment_assignments' },
      { entity: 'tasks', type: 'one-to-many', foreignKey: 'project_id', eager: false },
    ],
  },
  
  stats: [
    { key: 'total', label: 'Total Projects', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
    { key: 'total_budget', label: 'Total Budget', accessor: 'total_budget', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search projects...',
    fields: ['name', 'client.name', 'client_name'],
  },
  
  emptyState: {
    message: 'No projects created yet',
    actionLabel: 'Create First Project',
    actionRoute: '/projects/new',
  },
  
  defaultSort: {
    field: 'created_at',
    direction: 'desc',
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
