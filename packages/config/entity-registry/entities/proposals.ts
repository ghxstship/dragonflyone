/**
 * Proposals Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const PROPOSAL_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  draft: 'outline',
  sent: 'info',
  viewed: 'warning',
  accepted: 'success',
  declined: 'error',
  expired: 'ghost',
};

export const proposalsEntity: EntityConfig = {
  name: 'proposals',
  singular: 'Proposal',
  plural: 'Proposals',
  description: 'Create and manage client proposals',
  icon: 'FileText',
  
  routes: {
    list: '/finance/proposals',
    detail: '/finance/proposals/[id]',
    create: '/finance/proposals/new',
    edit: '/finance/proposals/[id]/edit',
  },
  
  api: {
    endpoint: '/api/finance/proposals',
    statsEndpoint: '/api/finance/proposals/stats',
  },
  
  columns: [
    { key: 'name', label: 'Proposal', accessor: 'name', sortable: true },
    { key: 'proposal_number', label: 'Number', accessor: 'proposal_number' },
    { key: 'client', label: 'Client', accessor: (row) => {
      const r = row as { contact?: { first_name?: string; last_name?: string } };
      return `${r.contact?.first_name || ''} ${r.contact?.last_name || ''}`.trim() || 'Unknown';
    }},
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PROPOSAL_STATUS_COLORS },
    { key: 'total', label: 'Amount', accessor: 'total', sortable: true, dataType: 'currency' },
    { key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', sortable: true, dataType: 'date' },
    { key: 'created_at', label: 'Created', accessor: 'created_at', sortable: true, dataType: 'date' },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'viewed', label: 'Viewed' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'declined', label: 'Declined' },
        { value: 'expired', label: 'Expired' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/finance/proposals/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Proposal', icon: 'Plus', handler: 'route', route: '/finance/proposals/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Proposal Name', type: 'text', required: true, placeholder: 'Enter proposal name' },
    { name: 'contact_id', label: 'Client', type: 'select', required: true, options: [] },
    { name: 'valid_until', label: 'Valid Until', type: 'date', required: true },
    { name: 'total', label: 'Total Amount', type: 'currency', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Proposal Details',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'proposal_number', label: 'Number', accessor: 'proposal_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PROPOSAL_STATUS_COLORS },
        { key: 'total', label: 'Amount', accessor: 'total', dataType: 'currency' },
        { key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', dataType: 'date' },
        { key: 'created_at', label: 'Created', accessor: 'created_at', dataType: 'date' },
      ],
    },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'proposal',
  },
  
  stats: [
    { key: 'total', label: 'Total Proposals', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'accepted', label: 'Accepted', accessor: 'accepted', dataType: 'number' },
    { key: 'total_value', label: 'Total Value', accessor: 'total_value', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search proposals...',
    fields: ['name', 'proposal_number'],
  },
  
  emptyState: {
    message: 'No proposals yet',
    actionLabel: 'Create Proposal',
    actionRoute: '/finance/proposals/new',
  },
  
  defaultSort: {
    field: 'created_at',
    direction: 'desc',
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
