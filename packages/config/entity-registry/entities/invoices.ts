/**
 * Invoices Entity Configuration
 * 
 * Configuration for the invoices entity used in ATLVS.
 */

import type { EntityConfig } from '../types';
import { 
  referenceNumberColumn, 
  statusColumn,
  dateColumn,
  amountColumn,
} from '../common-columns';
import { financialStatusFilter, paymentStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  sendInvoiceAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { FINANCIAL_STATUS_COLORS } from '../status-mappings';

export const invoicesEntity: EntityConfig = {
  name: 'invoices',
  singular: 'Invoice',
  plural: 'Invoices',
  description: 'Create and manage client invoices',
  icon: 'FileText',
  
  routes: {
    list: '/invoices',
    detail: '/invoices/[id]',
    create: '/invoices/new',
    edit: '/invoices/[id]/edit',
  },
  
  api: {
    endpoint: '/api/invoices',
    statsEndpoint: '/api/invoices/stats',
  },
  
  columns: [
    referenceNumberColumn('invoice_number', 'Invoice #'),
    {
      key: 'client',
      label: 'Client',
      accessor: (row) => (row.client as { name?: string })?.name || (row.client_name as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    amountColumn('amount', 'Amount'),
    dateColumn('issue_date', 'Issued'),
    dateColumn('due_date', 'Due'),
    statusColumn({ statusColors: FINANCIAL_STATUS_COLORS }),
  ],
  
  filters: [
    financialStatusFilter,
    paymentStatusFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/invoices/[id]/edit'),
    sendInvoiceAction,
    deleteAction({ titleField: 'invoice_number' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
    { name: 'client_id', label: 'Client', type: 'select', required: true, options: [] },
    { name: 'project_id', label: 'Project', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'sent', label: 'Sent' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ], defaultValue: 'draft' },
    { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
    { name: 'due_date', label: 'Due Date', type: 'date', required: true },
    { name: 'subtotal', label: 'Subtotal', type: 'currency', required: true },
    { name: 'tax', label: 'Tax', type: 'currency' },
    { name: 'amount', label: 'Total Amount', type: 'currency', required: true },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Invoice Details',
      fields: [
        { key: 'invoice_number', label: 'Invoice #', accessor: 'invoice_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: FINANCIAL_STATUS_COLORS },
        { key: 'client', label: 'Client', accessor: (row) => (row.client as { name?: string })?.name || '—' },
        { key: 'project', label: 'Project', accessor: (row) => (row.project as { name?: string })?.name || '—' },
        { key: 'issue_date', label: 'Issued', accessor: 'issue_date', dataType: 'date' },
        { key: 'due_date', label: 'Due', accessor: 'due_date', dataType: 'date' },
        { key: 'subtotal', label: 'Subtotal', accessor: 'subtotal', dataType: 'currency' },
        { key: 'tax', label: 'Tax', accessor: 'tax', dataType: 'currency' },
        { key: 'amount', label: 'Total', accessor: 'amount', dataType: 'currency' },
        { key: 'notes', label: 'Notes', accessor: 'notes', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'invoice',
    profileTable: 'docs_profile_invoice',
    profileForeignKey: 'document_id',
    selectQuery: '*, docs_profile_invoice!document_id(*), client:legend_organizations(*)',
    relationships: [
      { entity: 'vendors', type: 'many-to-one', foreignKey: 'related_org_id', eager: true },
      { entity: 'projects', type: 'many-to-one', foreignKey: 'related_event_id', eager: false },
    ],
  },
  
  stats: [
    { key: 'total', label: 'Total Invoices', accessor: 'total', dataType: 'number' },
    { key: 'total_amount', label: 'Total Billed', accessor: 'total_amount', dataType: 'currency' },
    { key: 'paid_amount', label: 'Paid', accessor: 'paid_amount', dataType: 'currency' },
    { key: 'outstanding', label: 'Outstanding', accessor: 'outstanding', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search invoices...',
    fields: ['invoice_number', 'client.name'],
  },
  
  emptyState: {
    message: 'No invoices created yet',
    actionLabel: 'Create First Invoice',
    actionRoute: '/invoices/new',
  },
  
  defaultSort: {
    field: 'issue_date',
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
