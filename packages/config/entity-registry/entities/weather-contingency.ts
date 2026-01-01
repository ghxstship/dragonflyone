/**
 * Weather Contingency Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { WEATHER_STATUS_COLORS } from '../status-mappings';

export const weatherContingencyEntity: EntityConfig = {
  name: 'weather-contingency',
  singular: 'Weather Plan',
  plural: 'Weather Contingency',
  description: 'Manage weather contingency plans',
  icon: 'Cloud',
  
  routes: {
    list: '/weather-contingency',
    detail: '/weather-contingency/[id]',
    create: '/weather-contingency/new',
    edit: '/weather-contingency/[id]/edit',
  },
  
  api: {
    endpoint: '/api/weather-contingency',
    statsEndpoint: '/api/weather-contingency/stats',
  },
  
  columns: [
    { key: 'name', label: 'Plan Name', accessor: 'name', sortable: true },
    { key: 'trigger', label: 'Trigger', accessor: 'trigger', sortable: true },
    { key: 'severity', label: 'Severity', accessor: 'severity', sortable: true },
    { key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: WEATHER_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'standby', label: 'Standby' },
        { value: 'triggered', label: 'Triggered' },
        { value: 'resolved', label: 'Resolved' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/weather-contingency/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Plan', icon: 'Plus', handler: 'route', route: '/weather-contingency/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Plan Name', type: 'text', required: true },
    { name: 'trigger', label: 'Trigger Condition', type: 'select', required: true, options: [
      { value: 'rain', label: 'Rain' },
      { value: 'wind', label: 'High Wind' },
      { value: 'lightning', label: 'Lightning' },
      { value: 'heat', label: 'Extreme Heat' },
      { value: 'cold', label: 'Extreme Cold' },
    ]},
    { name: 'severity', label: 'Severity', type: 'select', required: true, options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'standby', options: [
      { value: 'active', label: 'Active' },
      { value: 'standby', label: 'Standby' },
      { value: 'triggered', label: 'Triggered' },
    ]},
    { name: 'actions', label: 'Actions', type: 'textarea', required: true, colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Weather Plan Details',
      fields: [
        { key: 'name', label: 'Plan Name', accessor: 'name' },
        { key: 'trigger', label: 'Trigger', accessor: 'trigger' },
        { key: 'severity', label: 'Severity', accessor: 'severity' },
        { key: 'updated_at', label: 'Updated', accessor: 'updated_at', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: WEATHER_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Plans', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search plans...',
    fields: ['name', 'trigger'],
  },
  
  emptyState: {
    message: 'No weather plans',
    actionLabel: 'New Plan',
    actionRoute: '/weather-contingency/new',
  },
  
  defaultSort: {
    field: 'severity',
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
