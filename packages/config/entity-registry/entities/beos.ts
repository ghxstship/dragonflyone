/**
 * BEOs (Banquet Event Orders) Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { BEO_STATUS_COLORS } from '../status-mappings';

export const beosEntity: EntityConfig = {
  name: 'beos',
  singular: 'BEO',
  plural: 'BEOs',
  description: 'Manage Banquet Event Orders',
  icon: 'FileText',
  
  routes: {
    list: '/beos',
    detail: '/beos/[id]',
    create: '/beos/new',
    edit: '/beos/[id]/edit',
  },
  
  api: {
    endpoint: '/api/beos',
    statsEndpoint: '/api/beos/stats',
  },
  
  columns: [
    { key: 'event_name', label: 'Event Name', accessor: 'event_name', sortable: true },
    { key: 'client', label: 'Client', accessor: 'client', sortable: true },
    { key: 'event_date', label: 'Event Date', accessor: 'event_date', sortable: true, dataType: 'date' },
    { key: 'guest_count', label: 'Guests', accessor: 'guest_count', sortable: true, dataType: 'number' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: BEO_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'distributed', label: 'Distributed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/beos/[id]/edit'),
    deleteAction({ titleField: 'event_name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New BEO', icon: 'Plus', handler: 'route', route: '/beos/new', primary: true },
  ],
  
  formFields: [
    { name: 'event_name', label: 'Event Name', type: 'text', required: true },
    { name: 'client', label: 'Client', type: 'text', required: true },
    { name: 'event_date', label: 'Event Date', type: 'date', required: true },
    { name: 'guest_count', label: 'Guest Count', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Event Details',
      fields: [
        { key: 'event_name', label: 'Event Name', accessor: 'event_name' },
        { key: 'client', label: 'Client', accessor: 'client' },
        { key: 'event_date', label: 'Event Date', accessor: 'event_date', dataType: 'date' },
        { key: 'guest_count', label: 'Guest Count', accessor: 'guest_count', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: BEO_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total BEOs', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search BEOs...',
    fields: ['event_name', 'client'],
  },
  
  emptyState: {
    message: 'No BEOs yet',
    actionLabel: 'Create BEO',
    actionRoute: '/beos/new',
  },
  
  defaultSort: {
    field: 'event_date',
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
