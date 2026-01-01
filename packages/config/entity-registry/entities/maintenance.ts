/**
 * Maintenance Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { MAINTENANCE_STATUS_COLORS, PRIORITY_COLORS } from '../status-mappings';

export const maintenanceEntity: EntityConfig = {
  name: 'maintenance',
  singular: 'Maintenance Request',
  plural: 'Maintenance',
  description: 'Manage maintenance requests',
  icon: 'Wrench',
  
  routes: {
    list: '/maintenance',
    detail: '/maintenance/[id]',
    create: '/maintenance/new',
    edit: '/maintenance/[id]/edit',
  },
  
  api: {
    endpoint: '/api/maintenance',
    statsEndpoint: '/api/maintenance/stats',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'equipment', label: 'Equipment', accessor: 'equipment', sortable: true },
    { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, dataType: 'status', statusColors: PRIORITY_COLORS },
    { key: 'scheduled_date', label: 'Scheduled', accessor: 'scheduled_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: MAINTENANCE_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'overdue', label: 'Overdue' },
      ],
    },
    { 
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/maintenance/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Request', icon: 'Plus', handler: 'route', route: '/maintenance/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'equipment_id', label: 'Equipment', type: 'select', required: true, options: [] },
    { name: 'priority', label: 'Priority', type: 'select', required: true, options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ]},
    { name: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'scheduled', options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Maintenance Details',
      fields: [
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'equipment', label: 'Equipment', accessor: 'equipment' },
        { key: 'priority', label: 'Priority', accessor: 'priority', dataType: 'status', statusColors: PRIORITY_COLORS },
        { key: 'scheduled_date', label: 'Scheduled', accessor: 'scheduled_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: MAINTENANCE_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'scheduled', label: 'Scheduled', accessor: 'scheduled', dataType: 'number' },
    { key: 'overdue', label: 'Overdue', accessor: 'overdue', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search maintenance...',
    fields: ['title', 'equipment'],
  },
  
  emptyState: {
    message: 'No maintenance requests',
    actionLabel: 'New Request',
    actionRoute: '/maintenance/new',
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
