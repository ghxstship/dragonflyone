/**
 * Expenses Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const EXPENSE_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  draft: 'outline',
  submitted: 'info',
  approved: 'success',
  rejected: 'error',
  paid: 'success',
  reimbursed: 'success',
};

export const expensesEntity: EntityConfig = {
  name: 'expenses',
  singular: 'Expense',
  plural: 'Expenses',
  description: 'Manage expenses and reimbursements',
  icon: 'Receipt',
  
  routes: {
    list: '/finance/expenses',
    detail: '/finance/expenses/[id]',
    create: '/finance/expenses/new',
    edit: '/finance/expenses/[id]/edit',
  },
  
  api: {
    endpoint: '/api/finance/expenses',
    statsEndpoint: '/api/finance/expenses/stats',
  },
  
  columns: [
    { key: 'description', label: 'Description', accessor: 'description', sortable: true },
    { key: 'submitter', label: 'Submitted By', accessor: (row) => {
      const r = row as { submitter?: { first_name?: string; last_name?: string } };
      return `${r.submitter?.first_name || ''} ${r.submitter?.last_name || ''}`.trim() || 'Unknown';
    }},
    { key: 'category', label: 'Category', accessor: (row) => (row as { category?: { name?: string } }).category?.name || 'Uncategorized' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: EXPENSE_STATUS_COLORS },
    { key: 'amount', label: 'Amount', accessor: 'amount', sortable: true, dataType: 'currency' },
    { key: 'expense_date', label: 'Date', accessor: 'expense_date', sortable: true, dataType: 'date' },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'paid', label: 'Paid' },
        { value: 'reimbursed', label: 'Reimbursed' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: [],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/finance/expenses/[id]/edit'),
    deleteAction({ titleField: 'description' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Expense', icon: 'Plus', handler: 'route', route: '/finance/expenses/new', primary: true },
  ],
  
  formFields: [
    { name: 'description', label: 'Description', type: 'text', required: true, placeholder: 'Enter expense description' },
    { name: 'amount', label: 'Amount', type: 'currency', required: true },
    { name: 'category_id', label: 'Category', type: 'select', required: true, options: [] },
    { name: 'expense_date', label: 'Expense Date', type: 'date', required: true },
    { name: 'vendor_name', label: 'Vendor', type: 'text' },
    { name: 'receipt_url', label: 'Receipt', type: 'file' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Expense Details',
      fields: [
        { key: 'description', label: 'Description', accessor: 'description' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: EXPENSE_STATUS_COLORS },
        { key: 'amount', label: 'Amount', accessor: 'amount', dataType: 'currency' },
        { key: 'category', label: 'Category', accessor: (row) => (row as { category?: { name?: string } }).category?.name || 'Uncategorized' },
        { key: 'expense_date', label: 'Date', accessor: 'expense_date', dataType: 'date' },
        { key: 'vendor_name', label: 'Vendor', accessor: 'vendor_name' },
      ],
    },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'expense',
  },
  
  stats: [
    { key: 'total', label: 'Total Expenses', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'total_amount', label: 'Total Amount', accessor: 'total_amount', dataType: 'currency' },
    { key: 'approved_amount', label: 'Approved', accessor: 'approved_amount', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search expenses...',
    fields: ['description', 'vendor_name'],
  },
  
  emptyState: {
    message: 'No expenses yet',
    actionLabel: 'Add Expense',
    actionRoute: '/finance/expenses/new',
  },
  
  defaultSort: {
    field: 'expense_date',
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
    pagination: true,
    selection: true,
  },
};
