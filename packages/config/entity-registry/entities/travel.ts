/**
 * Travel Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TRAVEL_STATUS_COLORS } from '../status-mappings';

export const travelEntity: EntityConfig = {
  name: 'travel',
  singular: 'Travel',
  plural: 'Travel',
  description: 'Manage travel arrangements',
  icon: 'MapPin',
  
  routes: {
    list: '/travel',
    detail: '/travel/[id]',
    create: '/travel/new',
    edit: '/travel/[id]/edit',
  },
  
  api: {
    endpoint: '/api/travel',
    statsEndpoint: '/api/travel/stats',
  },
  
  columns: [
    { key: 'traveler', label: 'Traveler', accessor: 'traveler', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'departure_date', label: 'Departure', accessor: 'departure_date', sortable: true, dataType: 'date' },
    { key: 'destination', label: 'Destination', accessor: 'destination', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: TRAVEL_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'requested', label: 'Requested' },
        { value: 'booked', label: 'Booked' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/travel/[id]/edit'),
    deleteAction({ titleField: 'traveler' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Book Travel', icon: 'Plus', handler: 'route', route: '/travel/new', primary: true },
  ],
  
  formFields: [
    { name: 'traveler_id', label: 'Traveler', type: 'select', required: true, options: [] },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'flight', label: 'Flight' },
      { value: 'hotel', label: 'Hotel' },
      { value: 'car', label: 'Car Rental' },
      { value: 'train', label: 'Train' },
    ]},
    { name: 'departure_date', label: 'Departure Date', type: 'date', required: true },
    { name: 'return_date', label: 'Return Date', type: 'date' },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'requested', options: [
      { value: 'requested', label: 'Requested' },
      { value: 'booked', label: 'Booked' },
      { value: 'confirmed', label: 'Confirmed' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Travel Details',
      fields: [
        { key: 'traveler', label: 'Traveler', accessor: 'traveler' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'departure_date', label: 'Departure', accessor: 'departure_date', dataType: 'date' },
        { key: 'destination', label: 'Destination', accessor: 'destination' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TRAVEL_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'upcoming', label: 'Upcoming', accessor: 'upcoming', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search travel...',
    fields: ['traveler', 'destination'],
  },
  
  emptyState: {
    message: 'No travel arrangements',
    actionLabel: 'Book Travel',
    actionRoute: '/travel/new',
  },
  
  defaultSort: {
    field: 'departure_date',
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
