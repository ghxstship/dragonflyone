/**
 * Organizations Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const ORGANIZATION_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  pending: 'warning',
  suspended: 'error',
  draft: 'ghost',
};

export const ORGANIZATION_TYPE_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  vendor: 'warning',
  client: 'success',
  sponsor: 'info',
  partner: 'info',
  agency: 'warning',
  other: 'outline',
};

export const organizationsEntity: EntityConfig = {
  name: 'organizations',
  singular: 'Organization',
  plural: 'Organizations',
  description: 'Manage vendors, clients, sponsors, and partners',
  icon: 'Building2',
  
  routes: {
    list: '/organizations',
    detail: '/organizations/[id]',
    create: '/organizations/new',
    edit: '/organizations/[id]/edit',
  },
  
  api: {
    endpoint: '/api/organizations',
    statsEndpoint: '/api/organizations/stats',
  },
  
  columns: [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { key: 'legal_name', label: 'Legal Name', accessor: 'legal_name' },
    { key: 'org_type', label: 'Type', accessor: 'org_type', sortable: true, dataType: 'status', statusColors: ORGANIZATION_TYPE_COLORS },
    { key: 'email', label: 'Email', accessor: 'email' },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
    { key: 'industry', label: 'Industry', accessor: 'industry' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: ORGANIZATION_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'org_type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'vendor', label: 'Vendor' },
        { value: 'client', label: 'Client' },
        { value: 'sponsor', label: 'Sponsor' },
        { value: 'partner', label: 'Partner' },
        { value: 'agency', label: 'Agency' },
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
        { value: 'pending', label: 'Pending' },
        { value: 'suspended', label: 'Suspended' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/organizations/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Organization', icon: 'Plus', handler: 'route', route: '/organizations/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'legal_name', label: 'Legal Name', type: 'text' },
    { name: 'org_type', label: 'Type', type: 'select', required: true, options: [
      { value: 'vendor', label: 'Vendor' },
      { value: 'client', label: 'Client' },
      { value: 'sponsor', label: 'Sponsor' },
      { value: 'partner', label: 'Partner' },
      { value: 'agency', label: 'Agency' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'website', label: 'Website', type: 'url' },
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Organization Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'legal_name', label: 'Legal Name', accessor: 'legal_name' },
        { key: 'org_type', label: 'Type', accessor: 'org_type', dataType: 'status', statusColors: ORGANIZATION_TYPE_COLORS },
        { key: 'email', label: 'Email', accessor: 'email' },
        { key: 'phone', label: 'Phone', accessor: 'phone' },
        { key: 'website', label: 'Website', accessor: 'website' },
        { key: 'industry', label: 'Industry', accessor: 'industry' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: ORGANIZATION_STATUS_COLORS },
      ],
    },
  ],
  
  capabilities: ['view:map'],
  
  legendMapping: {
    table: 'legend_organizations',
    selectQuery: '*, orgs_profile_vendor(*), orgs_profile_sponsor(*), orgs_profile_client(*), primary_contact:legend_people(*)',
  },
  
  stats: [
    { key: 'total', label: 'Total Organizations', accessor: 'total', dataType: 'number' },
    { key: 'vendors', label: 'Vendors', accessor: 'vendors', dataType: 'number' },
    { key: 'clients', label: 'Clients', accessor: 'clients', dataType: 'number' },
    { key: 'sponsors', label: 'Sponsors', accessor: 'sponsors', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search organizations...',
    fields: ['name', 'legal_name', 'email'],
  },
  
  emptyState: {
    message: 'No organizations yet',
    actionLabel: 'Add Organization',
    actionRoute: '/organizations/new',
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
