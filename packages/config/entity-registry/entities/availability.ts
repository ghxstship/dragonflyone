/**
 * Availability Entity Configuration
 * 
 * Configuration for crew availability management in COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  statusColumn,
  dateColumn,
} from '../common-columns';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { AVAILABILITY_STATUS_COLORS } from '../status-mappings';

export const availabilityEntity: EntityConfig = {
  name: 'availability',
  singular: 'Availability',
  plural: 'Availability',
  description: 'Manage crew availability and calendar integration',
  icon: 'Calendar',
  
  routes: {
    list: '/availability',
    detail: '/availability/[id]',
    create: '/availability/new',
    edit: '/availability/[id]/edit',
  },
  
  api: {
    endpoint: '/api/availability',
    statsEndpoint: '/api/availability/stats',
  },
  
  columns: [
    {
      key: 'user_name',
      label: 'Crew Member',
      accessor: 'user_name',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'role',
      label: 'Role',
      accessor: 'role',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'department',
      label: 'Department',
      accessor: 'department',
      sortable: true,
      dataType: 'badge',
    },
    dateColumn('date', 'Date'),
    statusColumn({ statusColors: AVAILABILITY_STATUS_COLORS }),
    {
      key: 'start_time',
      label: 'Start',
      accessor: (row) => row.start_time || '-',
      sortable: false,
      dataType: 'string',
    },
    {
      key: 'end_time',
      label: 'End',
      accessor: (row) => row.end_time || '-',
      sortable: false,
      dataType: 'string',
    },
    {
      key: 'calendar_source',
      label: 'Source',
      accessor: (row) => row.calendar_source === 'google' ? 'Google' : 'Manual',
      sortable: false,
      dataType: 'string',
    },
  ],
  
  filters: [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'available', label: 'Available' },
        { value: 'unavailable', label: 'Unavailable' },
        { value: 'tentative', label: 'Tentative' },
        { value: 'booked', label: 'Booked' },
      ],
    },
    {
      key: 'department',
      label: 'Department',
      type: 'select',
      options: [
        { value: 'Audio', label: 'Audio' },
        { value: 'Lighting', label: 'Lighting' },
        { value: 'Stage', label: 'Stage' },
        { value: 'Video', label: 'Video' },
        { value: 'Rigging', label: 'Rigging' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/availability/[id]/edit'),
    deleteAction({ titleField: 'user_name' }),
  ],
  
  bulkActions: [
    { id: 'book', label: 'Book Selected', variant: 'default', icon: 'Calendar', handler: 'custom', customAction: 'book' },
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'available', label: 'Available' },
      { value: 'unavailable', label: 'Unavailable' },
      { value: 'tentative', label: 'Tentative' },
    ] },
    { name: 'start_time', label: 'Start Time', type: 'text', placeholder: '09:00' },
    { name: 'end_time', label: 'End Time', type: 'text', placeholder: '18:00' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'details',
      title: 'Availability Details',
      fields: [
        { key: 'user_name', label: 'Crew Member', accessor: 'user_name' },
        { key: 'role', label: 'Role', accessor: 'role' },
        { key: 'department', label: 'Department', accessor: 'department' },
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: AVAILABILITY_STATUS_COLORS },
        { key: 'start_time', label: 'Start Time', accessor: 'start_time' },
        { key: 'end_time', label: 'End Time', accessor: 'end_time' },
        { key: 'calendar_source', label: 'Source', accessor: 'calendar_source' },
        { key: 'notes', label: 'Notes', accessor: 'notes', hideEmpty: true },
      ],
    },
  ],
  
  stats: [
    { key: 'available', label: 'Available', accessor: 'available', dataType: 'number' },
    { key: 'unavailable', label: 'Unavailable', accessor: 'unavailable', dataType: 'number' },
    { key: 'tentative', label: 'Tentative', accessor: 'tentative', dataType: 'number' },
    { key: 'booked', label: 'Booked', accessor: 'booked', dataType: 'number' },
  ],
  
  capabilities: [],
  
  legendMapping: undefined,
  
  search: {
    placeholder: 'Search availability...',
    fields: ['user_name', 'role', 'department'],
  },
  
  emptyState: {
    message: 'No availability records',
    actionLabel: 'Set Availability',
    actionRoute: '/availability/new',
  },
  
  defaultSort: {
    field: 'date',
    direction: 'desc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: true,
    export: true,
    import: true,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
  },
};
