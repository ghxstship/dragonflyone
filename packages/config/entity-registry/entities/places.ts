/**
 * Places Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const PLACES_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  maintenance: 'warning',
  closed: 'error',
  draft: 'ghost',
};

export const PLACES_TYPE_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  venue: 'info',
  warehouse: 'warning',
  office: 'success',
  studio: 'error',
  outdoor: 'info',
  other: 'outline',
};

export const placesEntity: EntityConfig = {
  name: 'places',
  singular: 'Place',
  plural: 'Places',
  description: 'Manage venues, warehouses, and locations',
  icon: 'MapPin',
  
  routes: {
    list: '/places',
    detail: '/places/[id]',
    create: '/places/new',
    edit: '/places/[id]/edit',
  },
  
  api: {
    endpoint: '/api/places',
    statsEndpoint: '/api/places/stats',
  },
  
  columns: [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { key: 'code', label: 'Code', accessor: 'code' },
    { key: 'place_type', label: 'Type', accessor: 'place_type', sortable: true, dataType: 'status', statusColors: PLACES_TYPE_COLORS },
    { key: 'capacity', label: 'Capacity', accessor: 'capacity', sortable: true, dataType: 'number' },
    { key: 'city', label: 'City', accessor: (row) => (row as { address?: { city?: string } }).address?.city || '' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PLACES_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'place_type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'venue', label: 'Venue' },
        { value: 'warehouse', label: 'Warehouse' },
        { value: 'office', label: 'Office' },
        { value: 'studio', label: 'Studio' },
        { value: 'outdoor', label: 'Outdoor' },
        { value: 'other', label: 'Other' },
      ],
    },
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'closed', label: 'Closed' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/places/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Place', icon: 'Plus', handler: 'route', route: '/places/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text' },
    { name: 'place_type', label: 'Type', type: 'select', required: true, options: [
      { value: 'venue', label: 'Venue' },
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'office', label: 'Office' },
      { value: 'studio', label: 'Studio' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'maintenance', label: 'Maintenance' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Place Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'code', label: 'Code', accessor: 'code' },
        { key: 'place_type', label: 'Type', accessor: 'place_type', dataType: 'status', statusColors: PLACES_TYPE_COLORS },
        { key: 'capacity', label: 'Capacity', accessor: 'capacity', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PLACES_STATUS_COLORS },
      ],
    },
  ],
  
  capabilities: ['view:map'],
  
  legendMapping: {
    table: 'legend_places',
    selectQuery: '*, places_profile_venue(*), places_profile_warehouse(*)',
  },
  
  stats: [
    { key: 'total', label: 'Total Places', accessor: 'total', dataType: 'number' },
    { key: 'venues', label: 'Venues', accessor: 'venues', dataType: 'number' },
    { key: 'warehouses', label: 'Warehouses', accessor: 'warehouses', dataType: 'number' },
    { key: 'total_capacity', label: 'Total Capacity', accessor: 'total_capacity', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search places...',
    fields: ['name', 'code', 'description'],
  },
  
  emptyState: {
    message: 'No places yet',
    actionLabel: 'Add Place',
    actionRoute: '/places/new',
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
    import: true,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: true,
  },
};
