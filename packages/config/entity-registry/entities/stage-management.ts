/**
 * Stage Management Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { TASK_STATUS_COLORS } from '../status-mappings';

const STAGE_STATUS_COLORS = TASK_STATUS_COLORS;

export const stageManagementEntity: EntityConfig = {
  name: 'stage-management',
  singular: 'Stage',
  plural: 'Stage Management',
  description: 'Manage stages and areas',
  icon: 'Layout',
  
  routes: {
    list: '/stage-management',
    detail: '/stage-management/[id]',
    create: '/stage-management/new',
    edit: '/stage-management/[id]/edit',
  },
  
  api: {
    endpoint: '/api/stage-management',
    statsEndpoint: '/api/stage-management/stats',
  },
  
  columns: [
    { key: 'name', label: 'Stage Name', accessor: 'name', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'capacity', label: 'Capacity', accessor: 'capacity', sortable: true, dataType: 'number' },
    { key: 'manager', label: 'Manager', accessor: 'manager', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: STAGE_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'setup', label: 'Setup' },
        { value: 'strike', label: 'Strike' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/stage-management/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Stage', icon: 'Plus', handler: 'route', route: '/stage-management/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Stage Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'main', label: 'Main Stage' },
      { value: 'secondary', label: 'Secondary Stage' },
      { value: 'tent', label: 'Tent' },
      { value: 'outdoor', label: 'Outdoor' },
    ]},
    { name: 'capacity', label: 'Capacity', type: 'number' },
    { name: 'manager_id', label: 'Manager', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Active' },
      { value: 'setup', label: 'Setup' },
      { value: 'strike', label: 'Strike' },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Stage Details',
      fields: [
        { key: 'name', label: 'Stage Name', accessor: 'name' },
        { key: 'type', label: 'Type', accessor: 'type' },
        { key: 'capacity', label: 'Capacity', accessor: 'capacity', dataType: 'number' },
        { key: 'manager', label: 'Manager', accessor: 'manager' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: STAGE_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Stages', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search stages...',
    fields: ['name', 'manager'],
  },
  
  emptyState: {
    message: 'No stages defined',
    actionLabel: 'Add Stage',
    actionRoute: '/stage-management/new',
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
