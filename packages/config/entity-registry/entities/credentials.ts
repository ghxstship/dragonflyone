/**
 * Credentials Entity Configuration
 * 
 * Configuration for the credentials/badges entity used in COMPVSS.
 */

import type { EntityConfig } from '../types';
import { 
  referenceNumberColumn, 
  contactNameColumn, 
  statusColumn, 
  dateColumn, 
  accessLevelColumn,
  typeColumn,
} from '../common-columns';
import { credentialStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  suspendAction, 
  reactivateAction, 
  revokeAction,
  exportBulkAction,
  suspendBulkAction,
  revokeBulkAction,
  scanQuickAction,
  manageQuickAction,
} from '../common-actions';
import { CREDENTIAL_STATUS_COLORS } from '../status-mappings';

export interface Credential {
  id: string;
  badge_number: string;
  status: string;
  issued_at?: string;
  expires_at?: string;
  credential_type?: { 
    id: string; 
    name: string; 
    code: string; 
    color: string; 
    access_level: number;
  };
  contact?: { 
    id: string; 
    first_name: string; 
    last_name: string; 
    email: string; 
    phone?: string;
  };
}

export const credentialsEntity: EntityConfig = {
  name: 'credentials',
  singular: 'Credential',
  plural: 'Credentials',
  description: 'Manage access credentials and badges for production staff and guests',
  icon: 'BadgeCheck',
  
  routes: {
    list: '/credentials',
    detail: '/credentials/[id]',
    create: '/credentials/issue',
    edit: '/credentials/[id]/edit',
    custom: {
      types: '/credentials/types',
      zones: '/credentials/zones',
      scan: '/credentials/scan',
    },
  },
  
  api: {
    endpoint: '/api/credentials',
    statsEndpoint: '/api/credentials/stats',
  },
  
  columns: [
    referenceNumberColumn('badge_number', 'Badge #', { width: '120px' }),
    contactNameColumn,
    typeColumn('credential_type', 'Type', { codeKey: 'code', colorKey: 'color' }),
    accessLevelColumn('credential_type.access_level', 'Level'),
    statusColumn({ statusColors: CREDENTIAL_STATUS_COLORS }),
    dateColumn('issued_at', 'Issued'),
    {
      key: 'expires_at',
      label: 'Expires',
      accessor: 'expires_at',
      sortable: true,
      dataType: 'date',
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'Never',
    },
  ],
  
  filters: [
    credentialStatusFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/credentials/[id]'),
    suspendAction,
    reactivateAction,
    revokeAction({ titleField: 'badge_number' }),
  ],
  
  bulkActions: [
    suspendBulkAction,
    exportBulkAction,
    revokeBulkAction,
  ],
  
  quickActions: [
    scanQuickAction('/credentials/scan'),
    manageQuickAction('Manage Types', '/credentials/types', 'Pencil'),
    manageQuickAction('Zone Access', '/credentials/zones', 'UserPlus'),
  ],
  
  formFields: [
    { name: 'badge_number', label: 'Badge Number', type: 'text', required: true },
    { name: 'contact_id', label: 'Contact', type: 'select', required: true, options: [] },
    { name: 'credential_type_id', label: 'Credential Type', type: 'select', required: true, options: [] },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' },
    ], defaultValue: 'pending' },
    { name: 'issued_at', label: 'Issue Date', type: 'date' },
    { name: 'expires_at', label: 'Expiration Date', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'holder',
      title: 'Credential Holder',
      fields: [
        { key: 'contact_name', label: 'Name', accessor: (row) => {
          const contact = row.contact as { first_name?: string; last_name?: string } | undefined;
          return contact ? `${contact.first_name} ${contact.last_name}` : '—';
        }},
        { key: 'contact_email', label: 'Email', accessor: (row) => (row.contact as { email?: string })?.email || '—', dataType: 'email' },
        { key: 'contact_phone', label: 'Phone', accessor: (row) => (row.contact as { phone?: string })?.phone || '—', dataType: 'phone' },
        { key: 'badge_number', label: 'Badge Number', accessor: 'badge_number' },
      ],
    },
    {
      id: 'access',
      title: 'Access Information',
      fields: [
        { key: 'credential_type', label: 'Credential Type', accessor: (row) => (row.credential_type as { name?: string })?.name || '—' },
        { key: 'access_level', label: 'Access Level', accessor: (row) => `Level ${(row.credential_type as { access_level?: number })?.access_level || 0}` },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: CREDENTIAL_STATUS_COLORS },
        { key: 'expires_at', label: 'Expires', accessor: 'expires_at', dataType: 'date' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Credentials', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'suspended', label: 'Suspended', accessor: 'suspended', dataType: 'number' },
  ],
  
  capabilities: ['scannable:qr', 'scannable:barcode', 'scannable:nfc'],
  
  capabilityRoutes: {
    'scannable:qr': '/credentials/scan',
    'scannable:barcode': '/credentials/scan',
    'scannable:nfc': '/credentials/scan',
  },
  
  legendMapping: {
    table: 'legend_people',
    filters: { has_credential: true },
  },
  
  search: {
    placeholder: 'Search by badge number or name...',
    fields: ['badge_number', 'contact.first_name', 'contact.last_name'],
  },
  
  emptyState: {
    message: 'No credentials issued yet',
    actionLabel: 'Issue First Credential',
    actionRoute: '/credentials/issue',
  },
  
  defaultSort: {
    field: 'issued_at',
    direction: 'desc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: false,
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
