/**
 * Productions Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const PRODUCTION_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  active: 'success',
  planning: 'warning',
  upcoming: 'info',
  completed: 'info',
  past: 'outline',
  draft: 'ghost',
  cancelled: 'error',
};

export const productionsEntity: EntityConfig = {
  name: 'productions',
  singular: 'Production',
  plural: 'Productions',
  description: 'Manage all your productions across the platform',
  icon: 'Video',
  
  routes: {
    list: '/productions',
    detail: '/p/[id]/overview',
    create: '/productions/new',
    edit: '/productions/[id]/edit',
  },
  
  api: {
    endpoint: '/api/productions',
    statsEndpoint: '/api/productions/stats',
  },
  
  columns: [
    { key: 'name', label: 'Production', accessor: 'name', sortable: true },
    { key: 'venue', label: 'Venue', accessor: (row) => (row as { venue_name?: string }).venue_name || 'No venue' },
    { key: 'dates', label: 'Dates', accessor: (row) => {
      const r = row as { startDate?: string; endDate?: string };
      return `${r.startDate || 'TBD'} - ${r.endDate || 'TBD'}`;
    }},
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PRODUCTION_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'planning', label: 'Planning' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'completed', label: 'Completed' },
        { value: 'draft', label: 'Draft' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/productions/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Production', icon: 'Plus', handler: 'route', route: '/productions/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'venue_id', label: 'Venue', type: 'select', options: [] },
    { name: 'opening_date', label: 'Opening Date', type: 'date' },
    { name: 'closing_date', label: 'Closing Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'planning', options: [
      { value: 'planning', label: 'Planning' },
      { value: 'active', label: 'Active' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'completed', label: 'Completed' },
      { value: 'draft', label: 'Draft' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Production Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'venue', label: 'Venue', accessor: (row) => (row as { venue_name?: string }).venue_name || 'No venue' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PRODUCTION_STATUS_COLORS },
        { key: 'opening_date', label: 'Opening', accessor: 'opening_date', dataType: 'date' },
        { key: 'closing_date', label: 'Closing', accessor: 'closing_date', dataType: 'date' },
      ],
    },
  ],
  
  capabilities: ['view:timeline', 'view:gantt', 'view:calendar'],
  
  legendMapping: {
    table: 'legend_events',
    typeColumn: 'event_type',
    typeValue: 'production',
    profileTable: 'events_profile_production',
    profileForeignKey: 'event_id',
    selectQuery: '*, events_profile_production!event_id(*), venue:legend_places(*)',
  },
  
  stats: [
    { key: 'total', label: 'Total Productions', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'upcoming', label: 'Upcoming', accessor: 'upcoming', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search productions...',
    fields: ['name', 'title', 'venue_name'],
  },
  
  emptyState: {
    message: 'No productions yet',
    actionLabel: 'New Production',
    actionRoute: '/productions/new',
  },
  
  defaultSort: {
    field: 'opening_date',
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
