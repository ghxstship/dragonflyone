/**
 * Venues Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { PLACES_STATUS_COLORS, PLACES_TYPE_COLORS } from '../status-mappings';

export const venuesEntity: EntityConfig = {
  name: 'venues',
  singular: 'Venue',
  plural: 'Venues',
  description: 'Manage venue locations',
  icon: 'MapPin',
  
  routes: {
    list: '/venues',
    detail: '/venues/[id]',
    create: '/venues/new',
    edit: '/venues/[id]/edit',
  },
  
  api: {
    endpoint: '/api/venues',
    statsEndpoint: '/api/venues/stats',
  },
  
  columns: [
    { key: 'name', label: 'Venue Name', accessor: 'name', sortable: true },
    { key: 'city', label: 'City', accessor: 'city', sortable: true },
    { key: 'state', label: 'State', accessor: 'state', sortable: true },
    { key: 'capacity', label: 'Capacity', accessor: 'capacity', sortable: true, dataType: 'number' },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true, dataType: 'status', statusColors: PLACES_TYPE_COLORS },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PLACES_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Available' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
    { 
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'arena', label: 'Arena' },
        { value: 'stadium', label: 'Stadium' },
        { value: 'theater', label: 'Theater' },
        { value: 'club', label: 'Club' },
        { value: 'outdoor', label: 'Outdoor' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/venues/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Venue', icon: 'Plus', handler: 'route', route: '/venues/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Venue Name', type: 'text', required: true },
    { name: 'city', label: 'City', type: 'text', required: true },
    { name: 'state', label: 'State', type: 'text', required: true },
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'type', label: 'Type', type: 'select', options: [
      { value: 'arena', label: 'Arena' },
      { value: 'stadium', label: 'Stadium' },
      { value: 'theater', label: 'Theater' },
      { value: 'club', label: 'Club' },
      { value: 'outdoor', label: 'Outdoor' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Available' },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Venue Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'city', label: 'City', accessor: 'city' },
        { key: 'state', label: 'State', accessor: 'state' },
        { key: 'capacity', label: 'Capacity', accessor: 'capacity', dataType: 'number' },
        { key: 'type', label: 'Type', accessor: 'type', dataType: 'status', statusColors: PLACES_TYPE_COLORS },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PLACES_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Venues', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search venues...',
    fields: ['name', 'city', 'state'],
  },
  
  emptyState: {
    message: 'No venues yet',
    actionLabel: 'Add Venue',
    actionRoute: '/venues/new',
  },
  
  defaultSort: {
    field: 'name',
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
