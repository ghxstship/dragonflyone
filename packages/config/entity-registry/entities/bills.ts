/**
 * Bills Entity Configuration
 * 
 * Configuration for the bills entity used in ATLVS.
 */

import type { EntityConfig } from '../types';
import { 
  referenceNumberColumn, 
  vendorColumn, 
  descriptionColumn,
  amountColumn,
  dateColumn,
  statusColumn,
} from '../common-columns';
import { financialStatusFilter, paymentStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  approveAction,
  recordPaymentAction,
  exportBulkAction,
  approveBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { FINANCIAL_STATUS_COLORS } from '../status-mappings';

export const billsEntity: EntityConfig = {
  name: 'bills',
  singular: 'Bill',
  plural: 'Bills',
  description: 'Track and manage vendor bills and payments',
  icon: 'Receipt',
  
  routes: {
    list: '/bills',
    detail: '/bills/[id]',
    create: '/bills/new',
    edit: '/bills/[id]/edit',
    custom: {
      payment: '/bills/[id]/payment',
    },
  },
  
  api: {
    endpoint: '/api/bills',
    statsEndpoint: '/api/bills/stats',
  },
  
  columns: [
    referenceNumberColumn('bill_number', 'Bill #'),
    vendorColumn,
    descriptionColumn,
    amountColumn('amount', 'Amount'),
    amountColumn('amount_paid', 'Paid'),
    dateColumn('due_date', 'Due Date'),
    statusColumn({ statusColors: FINANCIAL_STATUS_COLORS }),
  ],
  
  filters: [
    financialStatusFilter,
    paymentStatusFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/bills/[id]/edit'),
    recordPaymentAction('/bills/[id]/payment'),
    approveAction,
    deleteAction({ titleField: 'bill_number' }),
  ],
  
  bulkActions: [
    approveBulkAction,
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [],
  
  formFields: [
    { name: 'vendor_id', label: 'Vendor', type: 'select', required: true, options: [], colSpan: 2 },
    { name: 'description', label: 'Description', type: 'text', required: true, colSpan: 2 },
    { name: 'amount', label: 'Amount', type: 'currency', required: true },
    { name: 'currency', label: 'Currency', type: 'select', options: [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR' },
      { value: 'GBP', label: 'GBP' },
    ], defaultValue: 'USD' },
    { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
    { name: 'due_date', label: 'Due Date', type: 'date', required: true },
    { name: 'category', label: 'Category', type: 'select', options: [
      { value: 'equipment', label: 'Equipment' },
      { value: 'labor', label: 'Labor' },
      { value: 'materials', label: 'Materials' },
      { value: 'services', label: 'Services' },
      { value: 'venue', label: 'Venue' },
      { value: 'catering', label: 'Catering' },
      { value: 'transportation', label: 'Transportation' },
      { value: 'other', label: 'Other' },
    ]},
    { name: 'reference_number', label: 'Reference #', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Bill Details',
      fields: [
        { key: 'bill_number', label: 'Bill #', accessor: 'bill_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: FINANCIAL_STATUS_COLORS },
        { key: 'vendor', label: 'Vendor', accessor: (row) => (row.vendor as { name?: string })?.name || '—' },
        { key: 'project', label: 'Project', accessor: (row) => (row.project as { name?: string })?.name || '—' },
        { key: 'amount', label: 'Amount', accessor: 'amount', dataType: 'currency' },
        { key: 'amount_paid', label: 'Paid', accessor: 'amount_paid', dataType: 'currency' },
        { key: 'due', label: 'Due', accessor: (row) => (row.amount as number) - (row.amount_paid as number), dataType: 'currency' },
        { key: 'due_date', label: 'Due Date', accessor: 'due_date', dataType: 'date' },
        { key: 'description', label: 'Description', accessor: 'description', colSpan: 2, hideEmpty: true },
        { key: 'notes', label: 'Notes', accessor: 'notes', colSpan: 2, hideEmpty: true },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Bills', accessor: 'total', dataType: 'number' },
    { key: 'total_billed', label: 'Total Billed', accessor: 'total_billed', dataType: 'currency' },
    { key: 'total_outstanding', label: 'Outstanding', accessor: 'total_outstanding', dataType: 'currency' },
    { key: 'overdue_amount', label: 'Overdue', accessor: 'overdue_amount', dataType: 'currency' },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'invoice',
  },
  
  search: {
    placeholder: 'Search bills...',
    fields: ['bill_number', 'description', 'vendor.name'],
  },
  
  emptyState: {
    message: 'No bills found',
    actionLabel: 'Add First Bill',
    actionRoute: '/bills/new',
  },
  
  defaultSort: {
    field: 'due_date',
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
