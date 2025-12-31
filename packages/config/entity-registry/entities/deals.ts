/**
 * Deals Entity Configuration
 */
import type { EntityConfig } from '../types';
import { 
  nameColumn, 
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

export const DEAL_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  lead: 'info',
  qualified: 'info',
  proposal: 'warning',
  negotiation: 'warning',
  won: 'success',
  lost: 'ghost',
  closed: 'outline',
};

export const DEAL_STAGE_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  prospecting: 'ghost',
  qualification: 'info',
  proposal: 'warning',
  negotiation: 'warning',
  closing: 'success',
};

export const dealsEntity: EntityConfig = {
  name: 'deals',
  singular: 'Deal',
  plural: 'Deals',
  icon: 'Briefcase',
  description: 'Sales opportunities and pipeline management',
  
  routes: {
    list: '/deals',
    detail: '/deals/[id]',
    create: '/deals/new',
    edit: '/deals/[id]/edit',
  },
  
  api: {
    endpoint: '/api/deals',
  },
  
  columns: [
    { ...nameColumn, key: 'title', label: 'Deal', accessor: 'title' },
    { key: 'client', label: 'Client', accessor: 'client', sortable: true },
    { key: 'value', label: 'Value', accessor: 'value', sortable: true, dataType: 'currency' },
    { key: 'stage', label: 'Stage', accessor: 'stage', sortable: true, dataType: 'status', statusColors: DEAL_STAGE_COLORS },
    { key: 'probability', label: 'Probability', accessor: 'probability', dataType: 'number' },
    statusColumn({ statusColors: DEAL_STATUS_COLORS }),
    { key: 'close_date', label: 'Close Date', accessor: 'close_date', sortable: true, dataType: 'date' },
    createdAtColumn,
  ],
  
  filters: [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'lead', label: 'Lead' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'won', label: 'Won' },
        { value: 'lost', label: 'Lost' },
      ]
    },
    { 
      key: 'stage', 
      label: 'Stage', 
      options: [
        { value: 'prospecting', label: 'Prospecting' },
        { value: 'qualification', label: 'Qualification' },
        { value: 'proposal', label: 'Proposal' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'closing', label: 'Closing' },
      ]
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/deals/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [exportBulkAction, deleteBulkAction],
  
  quickActions: [],
  
  formFields: [
    { name: 'title', label: 'Deal Title', type: 'text', required: true, colSpan: 2 },
    { name: 'client', label: 'Client', type: 'text', required: true },
    { name: 'value', label: 'Value', type: 'currency', required: true },
    { name: 'stage', label: 'Stage', type: 'select', required: true, options: [
      { value: 'prospecting', label: 'Prospecting' },
      { value: 'qualification', label: 'Qualification' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'negotiation', label: 'Negotiation' },
      { value: 'closing', label: 'Closing' },
    ]},
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'lead', label: 'Lead' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'won', label: 'Won' },
      { value: 'lost', label: 'Lost' },
    ], defaultValue: 'lead' },
    { name: 'probability', label: 'Probability (%)', type: 'number' },
    { name: 'close_date', label: 'Expected Close', type: 'date' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Deal Details',
      fields: [
        { key: 'title', label: 'Deal', accessor: 'title', colSpan: 2 },
        { key: 'client', label: 'Client', accessor: 'client' },
        { key: 'value', label: 'Value', accessor: 'value', dataType: 'currency' },
        { key: 'stage', label: 'Stage', accessor: 'stage', dataType: 'status', statusColors: DEAL_STAGE_COLORS },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: DEAL_STATUS_COLORS },
        { key: 'probability', label: 'Probability', accessor: 'probability' },
        { key: 'close_date', label: 'Close Date', accessor: 'close_date', dataType: 'date' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Deals', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'won', label: 'Won', accessor: 'won', dataType: 'number' },
    { key: 'total_value', label: 'Pipeline Value', accessor: 'total_value', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search deals...',
    fields: ['title', 'client'],
  },
  
  emptyState: {
    message: 'No deals yet',
    actionLabel: 'Create First Deal',
    actionRoute: '/deals/new',
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
  },
};
