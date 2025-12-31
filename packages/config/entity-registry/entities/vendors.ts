/**
 * Vendors Entity Configuration
 * 
 * Configuration for the vendors entity used in ATLVS and COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  nameColumn, 
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { statusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  archiveAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { UNIVERSAL_STATUS_COLORS } from '../status-mappings';

export const vendorsEntity: EntityConfig = {
  name: 'vendors',
  singular: 'Vendor',
  plural: 'Vendors',
  description: 'Manage vendor relationships and contracts',
  icon: 'Building2',
  
  routes: {
    list: '/vendors',
    detail: '/vendors/[id]',
    create: '/vendors/new',
    edit: '/vendors/[id]/edit',
  },
  
  api: {
    endpoint: '/api/vendors',
    statsEndpoint: '/api/vendors/stats',
  },
  
  columns: [
    nameColumn,
    {
      key: 'category',
      label: 'Category',
      accessor: (row) => (row.category as { name?: string })?.name || (row.category as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'contact_name',
      label: 'Contact',
      accessor: 'contact_name',
      sortable: true,
      dataType: 'string',
    },
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
    statusColumn({ statusColors: UNIVERSAL_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    statusFilter(),
    {
      key: 'category_id',
      label: 'Category',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/vendors/[id]/edit'),
    archiveAction({ titleField: 'name' }),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'name', label: 'Vendor Name', type: 'text', required: true, colSpan: 2 },
    { name: 'category_id', label: 'Category', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ], defaultValue: 'active' },
    { name: 'contact_name', label: 'Contact Name', type: 'text' },
    { name: 'contact_title', label: 'Contact Title', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'website', label: 'Website', type: 'url' },
    { name: 'address', label: 'Address', type: 'textarea', colSpan: 2 },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Vendor Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: UNIVERSAL_STATUS_COLORS },
        { key: 'category', label: 'Category', accessor: (row) => (row.category as { name?: string })?.name || '—' },
        { key: 'contact_name', label: 'Contact', accessor: 'contact_name' },
        { key: 'email', label: 'Email', accessor: 'email', dataType: 'email' },
        { key: 'phone', label: 'Phone', accessor: 'phone', dataType: 'phone' },
        { key: 'website', label: 'Website', accessor: 'website', hideEmpty: true },
        { key: 'address', label: 'Address', accessor: 'address', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  capabilities: ['view:map'],
  
  legendMapping: {
    table: 'legend_organizations',
    typeColumn: 'org_type',
    typeValue: 'vendor',
    profileTable: 'orgs_profile_vendor',
    profileForeignKey: 'organization_id',
    selectQuery: '*, orgs_profile_vendor!organization_id(*), primary_contact:legend_people(*)',
    relationships: [
      { entity: 'contacts', type: 'one-to-one', foreignKey: 'primary_contact_id', eager: true },
      { entity: 'bills', type: 'one-to-many', foreignKey: 'vendor_id', eager: false },
      { entity: 'equipment', type: 'one-to-many', foreignKey: 'vendor_id', eager: false },
    ],
  },
  
  stats: [
    { key: 'total', label: 'Total Vendors', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search vendors...',
    fields: ['name', 'contact_name', 'email'],
  },
  
  emptyState: {
    message: 'No vendors added yet',
    actionLabel: 'Add First Vendor',
    actionRoute: '/vendors/new',
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
