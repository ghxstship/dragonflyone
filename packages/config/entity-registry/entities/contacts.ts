/**
 * Contacts Entity Configuration
 * 
 * Configuration for the contacts entity used across apps.
 */

import type { EntityConfig } from '../types';
import { 
  fullNameColumn, 
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { statusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { UNIVERSAL_STATUS_COLORS } from '../status-mappings';

export const contactsEntity: EntityConfig = {
  name: 'contacts',
  singular: 'Contact',
  plural: 'Contacts',
  description: 'Manage contacts and stakeholders',
  icon: 'Users',
  
  routes: {
    list: '/contacts',
    detail: '/contacts/[id]',
    create: '/contacts/new',
    edit: '/contacts/[id]/edit',
  },
  
  api: {
    endpoint: '/api/contacts',
    statsEndpoint: '/api/contacts/stats',
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
      key: 'company',
      label: 'Company',
      accessor: (row) => (row.company as { name?: string })?.name || (row.company_name as string) || '—',
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
    statusColumn({ statusColors: UNIVERSAL_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    statusFilter(),
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'client', label: 'Client' },
        { value: 'vendor', label: 'Vendor' },
        { value: 'partner', label: 'Partner' },
        { value: 'employee', label: 'Employee' },
        { value: 'other', label: 'Other' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/contacts/[id]/edit'),
    deleteAction({ titleField: 'first_name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'company_name', label: 'Company', type: 'text' },
    { name: 'role', label: 'Role/Title', type: 'text' },
    { name: 'type', label: 'Contact Type', type: 'select', options: [
      { value: 'client', label: 'Client' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'partner', label: 'Partner' },
      { value: 'employee', label: 'Employee' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ], defaultValue: 'active' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'personal',
      title: 'Contact Information',
      fields: [
        { key: 'name', label: 'Name', accessor: (row) => `${row.first_name} ${row.last_name}` },
        { key: 'email', label: 'Email', accessor: 'email', dataType: 'email' },
        { key: 'phone', label: 'Phone', accessor: 'phone', dataType: 'phone' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: UNIVERSAL_STATUS_COLORS },
      ],
    },
    {
      id: 'work',
      title: 'Work Information',
      fields: [
        { key: 'company', label: 'Company', accessor: (row) => (row.company as { name?: string })?.name || row.company_name || '—' },
        { key: 'role', label: 'Role', accessor: 'role', hideEmpty: true },
        { key: 'type', label: 'Type', accessor: 'type' },
      ],
    },
  ],
  
  capabilities: ['view:map'],
  
  legendMapping: {
    table: 'legend_people',
    profileTable: 'people_profile_contact',
    profileForeignKey: 'person_id',
    selectQuery: '*, people_profile_contact!person_id(*)',
    relationships: [
      { entity: 'vendors', type: 'many-to-one', foreignKey: 'organization_id', eager: false },
    ],
  },
  
  stats: [
    { key: 'total', label: 'Total Contacts', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'clients', label: 'Clients', accessor: 'clients', dataType: 'number' },
    { key: 'vendors', label: 'Vendors', accessor: 'vendors', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search contacts...',
    fields: ['first_name', 'last_name', 'email', 'company_name'],
  },
  
  emptyState: {
    message: 'No contacts added yet',
    actionLabel: 'Add First Contact',
    actionRoute: '/contacts/new',
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
