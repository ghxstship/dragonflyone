/**
 * Budgets Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const BUDGET_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  draft: 'outline',
  active: 'success',
  closed: 'info',
  over_budget: 'error',
};

export const budgetsEntity: EntityConfig = {
  name: 'budgets',
  singular: 'Budget',
  plural: 'Budgets',
  description: 'Manage budgets and track spending',
  icon: 'Wallet',
  
  routes: {
    list: '/finance/budgets',
    detail: '/finance/budgets/[id]',
    create: '/finance/budgets/new',
    edit: '/finance/budgets/[id]/edit',
  },
  
  api: {
    endpoint: '/api/finance/budgets',
    statsEndpoint: '/api/finance/budgets/stats',
  },
  
  columns: [
    { key: 'name', label: 'Budget', accessor: 'name', sortable: true },
    { key: 'fiscal_year', label: 'Fiscal Year', accessor: (row) => (row as { fiscal_year?: number }).fiscal_year?.toString() || 'N/A', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: BUDGET_STATUS_COLORS },
    { key: 'total_amount', label: 'Total Amount', accessor: 'total_amount', sortable: true, dataType: 'currency' },
    { key: 'spent_amount', label: 'Spent', accessor: 'spent_amount', dataType: 'currency' },
    { key: 'remaining', label: 'Remaining', accessor: (row) => {
      const r = row as { total_amount?: number; spent_amount?: number };
      return (r.total_amount || 0) - (r.spent_amount || 0);
    }, dataType: 'currency' },
    { key: 'start_date', label: 'Start', accessor: 'start_date', dataType: 'date' },
    { key: 'end_date', label: 'End', accessor: 'end_date', dataType: 'date' },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'closed', label: 'Closed' },
        { value: 'over_budget', label: 'Over Budget' },
      ],
    },
    {
      key: 'fiscal_year',
      label: 'Fiscal Year',
      type: 'select',
      options: [
        { value: '2024', label: '2024' },
        { value: '2025', label: '2025' },
        { value: '2026', label: '2026' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/finance/budgets/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'New Budget', icon: 'Plus', handler: 'route', route: '/finance/budgets/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Budget Name', type: 'text', required: true, placeholder: 'Enter budget name' },
    { name: 'fiscal_year', label: 'Fiscal Year', type: 'number', required: true },
    { name: 'total_amount', label: 'Total Amount', type: 'currency', required: true },
    { name: 'currency', label: 'Currency', type: 'select', defaultValue: 'USD', options: [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR' },
      { value: 'GBP', label: 'GBP' },
    ]},
    { name: 'start_date', label: 'Start Date', type: 'date', required: true },
    { name: 'end_date', label: 'End Date', type: 'date', required: true },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'draft', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
    ]},
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Budget Overview',
      fields: [
        { key: 'name', label: 'Name', accessor: 'name' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: BUDGET_STATUS_COLORS },
        { key: 'fiscal_year', label: 'Fiscal Year', accessor: 'fiscal_year' },
        { key: 'total_amount', label: 'Total Amount', accessor: 'total_amount', dataType: 'currency' },
        { key: 'spent_amount', label: 'Spent', accessor: 'spent_amount', dataType: 'currency' },
        { key: 'start_date', label: 'Start', accessor: 'start_date', dataType: 'date' },
        { key: 'end_date', label: 'End', accessor: 'end_date', dataType: 'date' },
      ],
    },
  ],
  
  legendMapping: {
    table: 'legend_documents',
    typeColumn: 'document_type',
    typeValue: 'budget',
  },
  
  stats: [
    { key: 'total', label: 'Total Budgets', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'total_allocated', label: 'Total Allocated', accessor: 'total_allocated', dataType: 'currency' },
    { key: 'total_spent', label: 'Total Spent', accessor: 'total_spent', dataType: 'currency' },
  ],
  
  search: {
    placeholder: 'Search budgets...',
    fields: ['name'],
  },
  
  emptyState: {
    message: 'No budgets yet',
    actionLabel: 'Create Budget',
    actionRoute: '/finance/budgets/new',
  },
  
  defaultSort: {
    field: 'fiscal_year',
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
