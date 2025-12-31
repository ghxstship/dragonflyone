/**
 * Quotes Entity Configuration
 */
import type { EntityConfig } from '../types';
import { 
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import {
  viewAction,
  editAction,
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const QUOTE_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  draft: 'ghost',
  sent: 'info',
  viewed: 'info',
  negotiating: 'warning',
  accepted: 'success',
  declined: 'error',
  converted: 'success',
  expired: 'ghost',
};

export const quotesEntity: EntityConfig = {
  name: 'quotes',
  singular: 'Quote',
  plural: 'Quotes',
  icon: 'FileText',
  description: 'Sales quotes and proposals',
  
  routes: {
    list: '/quotes',
    detail: '/quotes/[id]',
    create: '/quotes/new',
    edit: '/quotes/[id]/edit',
  },
  
  api: {
    endpoint: '/api/quotes',
  },
  
  columns: [
    { key: 'quote_number', label: 'Quote ID', accessor: 'quote_number', sortable: true },
    { key: 'client', label: 'Client', accessor: (row) => (row as { client?: { name?: string }; client_name?: string }).client?.name || (row as { client_name?: string }).client_name || '—', sortable: true },
    { key: 'project', label: 'Project', accessor: (row) => (row as { opportunity_name?: string; title?: string }).opportunity_name || (row as { title?: string }).title || '—' },
    { key: 'total_amount', label: 'Amount', accessor: 'total_amount', sortable: true, dataType: 'currency' },
    { key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', sortable: true, dataType: 'date' },
    statusColumn({ statusColors: QUOTE_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'viewed', label: 'Viewed' },
        { value: 'negotiating', label: 'Negotiating' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'declined', label: 'Declined' },
        { value: 'converted', label: 'Converted' },
      ]
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/quotes/[id]/edit'),
    deleteAction({ titleField: 'quote_number' }),
  ],
  
  bulkActions: [exportBulkAction, deleteBulkAction],
  
  quickActions: [],
  
  formFields: [
    { name: 'quote_number', label: 'Quote Number', type: 'text', required: true },
    { name: 'client_name', label: 'Client', type: 'text', required: true },
    { name: 'opportunity_name', label: 'Project/Opportunity', type: 'text' },
    { name: 'total_amount', label: 'Amount', type: 'currency', required: true },
    { name: 'valid_until', label: 'Valid Until', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'declined', label: 'Declined' },
    ], defaultValue: 'draft' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Quote Details',
      fields: [
        { key: 'quote_number', label: 'Quote ID', accessor: 'quote_number' },
        { key: 'client', label: 'Client', accessor: (row) => (row as { client?: { name?: string }; client_name?: string }).client?.name || (row as { client_name?: string }).client_name || '—' },
        { key: 'total_amount', label: 'Amount', accessor: 'total_amount', dataType: 'currency' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: QUOTE_STATUS_COLORS },
        { key: 'valid_until', label: 'Valid Until', accessor: 'valid_until', dataType: 'date' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Quotes', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'pipeline_value', label: 'Pipeline Value', accessor: 'pipeline_value', dataType: 'currency' },
    { key: 'win_rate', label: 'Win Rate', accessor: 'win_rate', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search quotes...',
    fields: ['quote_number', 'client_name', 'opportunity_name'],
  },
  
  emptyState: {
    message: 'No quotes yet',
    actionLabel: 'Create First Quote',
    actionRoute: '/quotes/new',
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
    import: true,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
  },
};
