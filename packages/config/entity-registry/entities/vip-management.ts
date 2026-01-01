/**
 * VIP Management Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { VIP_STATUS_COLORS } from '../status-mappings';

export const vipManagementEntity: EntityConfig = {
  name: 'vip-management',
  singular: 'VIP',
  plural: 'VIP Management',
  description: 'Manage VIP guests',
  icon: 'Star',
  
  routes: {
    list: '/vip-management',
    detail: '/vip-management/[id]',
    create: '/vip-management/new',
    edit: '/vip-management/[id]/edit',
  },
  
  api: {
    endpoint: '/api/vip-management',
    statsEndpoint: '/api/vip-management/stats',
  },
  
  columns: [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { key: 'tier', label: 'Tier', accessor: 'tier', sortable: true },
    { key: 'contact', label: 'Contact', accessor: 'contact', sortable: true },
    { key: 'arrival_date', label: 'Arrival', accessor: 'arrival_date', sortable: true, dataType: 'date' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: VIP_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'pending', label: 'Pending' },
        { value: 'arrived', label: 'Arrived' },
        { value: 'departed', label: 'Departed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    { 
      key: 'tier',
      label: 'Tier',
      type: 'select',
      options: [
        { value: 'platinum', label: 'Platinum' },
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/vip-management/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add VIP', icon: 'Plus', handler: 'route', route: '/vip-management/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'tier', label: 'Tier', type: 'select', required: true, options: [
      { value: 'platinum', label: 'Platinum' },
      { value: 'gold', label: 'Gold' },
      { value: 'silver', label: 'Silver' },
    ]},
    { name: 'contact', label: 'Contact', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'arrival_date', label: 'Arrival Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'pending', options: [
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'pending', label: 'Pending' },
      { value: 'arrived', label: 'Arrived' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'VIP Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'tier', label: 'Tier', accessor: 'tier' },
        { key: 'contact', label: 'Contact', accessor: 'contact' },
        { key: 'arrival_date', label: 'Arrival', accessor: 'arrival_date', dataType: 'date' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: VIP_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total VIPs', accessor: 'total', dataType: 'number' },
    { key: 'confirmed', label: 'Confirmed', accessor: 'confirmed', dataType: 'number' },
    { key: 'arrived', label: 'Arrived', accessor: 'arrived', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search VIPs...',
    fields: ['name', 'contact'],
  },
  
  emptyState: {
    message: 'No VIPs',
    actionLabel: 'Add VIP',
    actionRoute: '/vip-management/new',
  },
  
  defaultSort: {
    field: 'arrival_date',
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
