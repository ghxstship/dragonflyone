/**
 * Incidents Entity Configuration
 * 
 * Configuration for the incidents entity used in COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  titleColumn, 
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { incidentStatusFilter, severityFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
} from '../common-actions';
import { INCIDENT_STATUS_COLORS, SEVERITY_COLORS } from '../status-mappings';

export const incidentsEntity: EntityConfig = {
  name: 'incidents',
  singular: 'Incident',
  plural: 'Incidents',
  description: 'Track and manage safety incidents and reports',
  icon: 'AlertTriangle',
  
  routes: {
    list: '/incidents',
    detail: '/incidents/[id]',
    create: '/incidents/new',
    edit: '/incidents/[id]/edit',
  },
  
  api: {
    endpoint: '/api/incidents',
    statsEndpoint: '/api/incidents/stats',
  },
  
  columns: [
    {
      key: 'incident_number',
      label: 'Incident #',
      accessor: 'incident_number',
      sortable: true,
      width: '120px',
      dataType: 'string',
    },
    titleColumn,
    {
      key: 'severity',
      label: 'Severity',
      accessor: 'severity',
      sortable: true,
      dataType: 'status',
      statusColors: SEVERITY_COLORS,
    },
    {
      key: 'location',
      label: 'Location',
      accessor: (row) => (row.location as { name?: string })?.name || (row.location_name as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'reported_by',
      label: 'Reported By',
      accessor: (row) => {
        const user = row.reported_by as { first_name?: string; last_name?: string } | undefined;
        return user ? `${user.first_name} ${user.last_name}` : '—';
      },
      sortable: true,
      dataType: 'string',
    },
    statusColumn({ statusColors: INCIDENT_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    incidentStatusFilter,
    severityFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/incidents/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true, colSpan: 2 },
    { name: 'incident_number', label: 'Incident Number', type: 'text' },
    { name: 'severity', label: 'Severity', type: 'select', required: true, options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'reported', label: 'Reported' },
      { value: 'investigating', label: 'Investigating' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'closed', label: 'Closed' },
    ], defaultValue: 'reported' },
    { name: 'occurred_at', label: 'Occurred At', type: 'datetime', required: true },
    { name: 'location_name', label: 'Location', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
    { name: 'injuries', label: 'Injuries', type: 'textarea', colSpan: 2 },
    { name: 'corrective_actions', label: 'Corrective Actions', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Incident Details',
      fields: [
        { key: 'incident_number', label: 'Incident #', accessor: 'incident_number' },
        { key: 'title', label: 'Title', accessor: 'title', colSpan: 2 },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: INCIDENT_STATUS_COLORS },
        { key: 'severity', label: 'Severity', accessor: 'severity', dataType: 'status', statusColors: SEVERITY_COLORS },
        { key: 'occurred_at', label: 'Occurred', accessor: 'occurred_at', dataType: 'datetime' },
        { key: 'location', label: 'Location', accessor: (row) => (row.location as { name?: string })?.name || row.location_name || '—' },
        { key: 'reported_by', label: 'Reported By', accessor: (row) => {
          const user = row.reported_by as { first_name?: string; last_name?: string } | undefined;
          return user ? `${user.first_name} ${user.last_name}` : '—';
        }},
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2 },
      ],
    },
  ],
  
  capabilities: ['view:timeline', 'view:map'],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'report',
  },
  
  stats: [
    { key: 'total', label: 'Total Incidents', accessor: 'total', dataType: 'number' },
    { key: 'open', label: 'Open', accessor: 'open', dataType: 'number' },
    { key: 'investigating', label: 'Investigating', accessor: 'investigating', dataType: 'number' },
    { key: 'resolved', label: 'Resolved', accessor: 'resolved', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search incidents...',
    fields: ['title', 'incident_number', 'description'],
  },
  
  emptyState: {
    message: 'No incidents reported',
    actionLabel: 'Report Incident',
    actionRoute: '/incidents/new',
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
