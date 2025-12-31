/**
 * Crew Entity Configuration
 * 
 * Configuration for the crew/personnel entity used in COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  fullNameColumn, 
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { crewStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  assignAction,
  scanQuickAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { CREW_STATUS_COLORS } from '../status-mappings';

export const crewEntity: EntityConfig = {
  name: 'crew',
  singular: 'Crew Member',
  plural: 'Crew',
  description: 'Manage production crew and staff',
  icon: 'Users',
  
  routes: {
    list: '/crew',
    detail: '/crew/[id]',
    create: '/crew/new',
    edit: '/crew/[id]/edit',
    custom: {
      scan: '/crew/scan',
      schedule: '/crew/schedule',
    },
  },
  
  api: {
    endpoint: '/api/crew',
    statsEndpoint: '/api/crew/stats',
  },
  
  columns: [
    fullNameColumn(),
    {
      key: 'email',
      label: 'Email',
      accessor: 'email',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'phone',
      label: 'Phone',
      accessor: 'phone',
      sortable: false,
      dataType: 'string',
    },
    {
      key: 'role',
      label: 'Role',
      accessor: (row) => (row.role as { name?: string })?.name || (row.role as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'department',
      label: 'Department',
      accessor: (row) => (row.department as { name?: string })?.name || (row.department as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    statusColumn({ statusColors: CREW_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    crewStatusFilter,
    {
      key: 'department_id',
      label: 'Department',
      type: 'select',
      options: [],
    },
    {
      key: 'role_id',
      label: 'Role',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/crew/[id]/edit'),
    assignAction,
    deleteAction({ titleField: 'first_name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    scanQuickAction('/crew/scan'),
  ],
  
  formFields: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'role_id', label: 'Role', type: 'select', options: [] },
    { name: 'department_id', label: 'Department', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'available', label: 'Available' },
      { value: 'assigned', label: 'Assigned' },
      { value: 'on_break', label: 'On Break' },
      { value: 'off_duty', label: 'Off Duty' },
    ], defaultValue: 'active' },
    { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
    { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'tel' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: [
        { key: 'name', label: 'Name', accessor: (row) => `${row.first_name} ${row.last_name}` },
        { key: 'email', label: 'Email', accessor: 'email', dataType: 'email' },
        { key: 'phone', label: 'Phone', accessor: 'phone', dataType: 'phone' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: CREW_STATUS_COLORS },
      ],
    },
    {
      id: 'work',
      title: 'Work Information',
      fields: [
        { key: 'role', label: 'Role', accessor: (row) => (row.role as { name?: string })?.name || '—' },
        { key: 'department', label: 'Department', accessor: (row) => (row.department as { name?: string })?.name || '—' },
      ],
    },
    {
      id: 'emergency',
      title: 'Emergency Contact',
      fields: [
        { key: 'emergency_contact_name', label: 'Name', accessor: 'emergency_contact_name', hideEmpty: true },
        { key: 'emergency_contact_phone', label: 'Phone', accessor: 'emergency_contact_phone', dataType: 'phone', hideEmpty: true },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Crew', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'available', label: 'Available', accessor: 'available', dataType: 'number' },
    { key: 'assigned', label: 'Assigned', accessor: 'assigned', dataType: 'number' },
  ],
  
  capabilities: ['scannable:qr', 'scannable:barcode', 'scannable:nfc'],
  
  capabilityRoutes: {
    'scannable:qr': '/credentials/scan',
    'scannable:barcode': '/credentials/scan',
    'scannable:nfc': '/credentials/scan',
  },
  
  legendMapping: {
    table: 'legend_people',
    profileTable: 'people_profile_crew',
    profileForeignKey: 'person_id',
    selectQuery: '*, people_profile_crew!person_id(*)',
    relationships: [
      { entity: 'credentials', type: 'one-to-many', foreignKey: 'contact_id', eager: false },
      { entity: 'projects', type: 'many-to-many', foreignKey: 'crew_id', joinTable: 'project_crew_assignments' },
    ],
  },
  
  search: {
    placeholder: 'Search crew...',
    fields: ['first_name', 'last_name', 'email'],
  },
  
  emptyState: {
    message: 'No crew members added yet',
    actionLabel: 'Add First Crew Member',
    actionRoute: '/crew/new',
  },
  
  defaultSort: {
    field: 'last_name',
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
