/**
 * Emergency Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { INCIDENT_STATUS_COLORS, SEVERITY_COLORS } from '../status-mappings';

export const emergencyEntity: EntityConfig = {
  name: 'emergency',
  singular: 'Emergency',
  plural: 'Emergencies',
  description: 'Manage emergency incidents',
  icon: 'AlertTriangle',
  
  routes: {
    list: '/emergency',
    detail: '/emergency/[id]',
    create: '/emergency/new',
    edit: '/emergency/[id]/edit',
  },
  
  api: {
    endpoint: '/api/emergency',
    statsEndpoint: '/api/emergency/stats',
  },
  
  columns: [
    { key: 'title', label: 'Incident', accessor: 'title', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'severity', label: 'Severity', accessor: 'severity', sortable: true, dataType: 'status', statusColors: SEVERITY_COLORS },
    { key: 'reported_at', label: 'Reported', accessor: 'reported_at', sortable: true, dataType: 'datetime' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: INCIDENT_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'reported', label: 'Reported' },
        { value: 'investigating', label: 'Investigating' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    { 
      key: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'major', label: 'Major' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'minor', label: 'Minor' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/emergency/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Report Emergency', icon: 'Plus', handler: 'route', route: '/emergency/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Incident Title', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'medical', label: 'Medical' },
      { value: 'fire', label: 'Fire' },
      { value: 'security', label: 'Security' },
      { value: 'weather', label: 'Weather' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'severity', label: 'Severity', type: 'select', required: true, options: [
      { value: 'critical', label: 'Critical' },
      { value: 'major', label: 'Major' },
      { value: 'moderate', label: 'Moderate' },
      { value: 'minor', label: 'Minor' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'reported', options: [
      { value: 'reported', label: 'Reported' },
      { value: 'investigating', label: 'Investigating' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Emergency Details',
      fields: [
        { key: 'title', label: 'Incident', accessor: 'title' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'severity', label: 'Severity', accessor: 'severity', dataType: 'status', statusColors: SEVERITY_COLORS },
        { key: 'reported_at', label: 'Reported', accessor: 'reported_at', dataType: 'datetime' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: INCIDENT_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'critical', label: 'Critical', accessor: 'critical', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search emergencies...',
    fields: ['title', 'type'],
  },
  
  emptyState: {
    message: 'No emergencies reported',
    actionLabel: 'Report Emergency',
    actionRoute: '/emergency/new',
  },
  
  defaultSort: {
    field: 'reported_at',
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
