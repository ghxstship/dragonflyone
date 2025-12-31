/**
 * Events Entity Configuration
 * 
 * Configuration for the events entity used in ATLVS and GVTEWAY.
 */

import type { EntityConfig } from '../types';
import { 
  nameColumn, 
  statusColumn,
  dateColumn,
} from '../common-columns';
import { eventStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  duplicateAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { EVENT_STATUS_COLORS } from '../status-mappings';

export const eventsEntity: EntityConfig = {
  name: 'events',
  singular: 'Event',
  plural: 'Events',
  description: 'Manage productions, shows, and events',
  icon: 'Calendar',
  
  routes: {
    list: '/events',
    detail: '/events/[id]',
    create: '/events/new',
    edit: '/events/[id]/edit',
  },
  
  api: {
    endpoint: '/api/events',
    statsEndpoint: '/api/events/stats',
  },
  
  columns: [
    nameColumn,
    {
      key: 'venue',
      label: 'Venue',
      accessor: (row) => (row.venue as { name?: string })?.name || (row.venue_name as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    dateColumn('start_date', 'Start Date'),
    dateColumn('end_date', 'End Date'),
    statusColumn({ statusColors: EVENT_STATUS_COLORS }),
    {
      key: 'capacity',
      label: 'Capacity',
      accessor: 'capacity',
      sortable: true,
      dataType: 'number',
    },
  ],
  
  filters: [
    eventStatusFilter,
    {
      key: 'venue_id',
      label: 'Venue',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/events/[id]/edit'),
    duplicateAction('/events/new?duplicate=[id]'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'name', label: 'Event Name', type: 'text', required: true, colSpan: 2 },
    { name: 'venue_id', label: 'Venue', type: 'select', options: [] },
    { name: 'venue_name', label: 'Venue Name', type: 'text' },
    { name: 'start_date', label: 'Start Date', type: 'datetime', required: true },
    { name: 'end_date', label: 'End Date', type: 'datetime' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ], defaultValue: 'draft' },
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Event Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name', colSpan: 2 },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: EVENT_STATUS_COLORS },
        { key: 'venue', label: 'Venue', accessor: (row) => (row.venue as { name?: string })?.name || row.venue_name || '—' },
        { key: 'start_date', label: 'Start', accessor: 'start_date', dataType: 'datetime' },
        { key: 'end_date', label: 'End', accessor: 'end_date', dataType: 'datetime' },
        { key: 'capacity', label: 'Capacity', accessor: 'capacity', dataType: 'number' },
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  capabilities: ['view:calendar', 'view:timeline', 'view:map', 'view:gantt'],
  
  legendMapping: {
    table: 'legend_events',
    typeColumn: 'event_type',
    typeValue: 'event',
    selectQuery: '*, place:legend_places(*), parent_event:legend_events(*)',
    relationships: [
      { entity: 'venues', type: 'many-to-one', foreignKey: 'place_id', eager: true },
      { entity: 'crew', type: 'many-to-many', foreignKey: 'event_id', joinTable: 'event_crew_assignments' },
      { entity: 'equipment', type: 'many-to-many', foreignKey: 'event_id', joinTable: 'event_equipment_assignments' },
    ],
  },
  
  stats: [
    { key: 'total', label: 'Total Events', accessor: 'total', dataType: 'number' },
    { key: 'scheduled', label: 'Scheduled', accessor: 'scheduled', dataType: 'number' },
    { key: 'in_progress', label: 'In Progress', accessor: 'in_progress', dataType: 'number' },
    { key: 'completed', label: 'Completed', accessor: 'completed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search events...',
    fields: ['name', 'venue.name', 'venue_name'],
  },
  
  emptyState: {
    message: 'No events created yet',
    actionLabel: 'Create First Event',
    actionRoute: '/events/new',
  },
  
  defaultSort: {
    field: 'start_date',
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
