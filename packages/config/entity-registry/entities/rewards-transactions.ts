/**
 * Rewards Transactions Entity Configuration
 * Points history for loyalty program
 */

import type { EntityConfig, StatusVariant } from '../types';
import { viewAction } from '../common-actions';

export const REWARDS_TRANSACTION_TYPE_COLORS: Record<string, StatusVariant> = {
  earned: 'success',
  redeemed: 'warning',
};

export const rewardsTransactionsEntity: EntityConfig = {
  name: 'rewards-transactions',
  singular: 'Transaction',
  plural: 'Points History',
  description: 'View your points earned and redeemed',
  icon: 'TrendingUp',
  
  routes: {
    list: '/rewards/history',
    detail: '/rewards/history/[id]',
    create: '',
    edit: '',
  },
  
  api: {
    endpoint: '/api/rewards/history',
    statsEndpoint: '/api/rewards/history/stats',
  },
  
  columns: [
    { key: 'date', label: 'Date', accessor: 'date', sortable: true, dataType: 'date' },
    { key: 'description', label: 'Description', accessor: 'description', sortable: true },
    { key: 'source', label: 'Source', accessor: 'source', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true, dataType: 'status', statusColors: REWARDS_TRANSACTION_TYPE_COLORS },
    { key: 'amount', label: 'Points', accessor: 'amount', sortable: true, dataType: 'number' },
  ],
  
  filters: [
    { 
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'earned', label: 'Earned' },
        { value: 'redeemed', label: 'Redeemed' },
      ],
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
    },
  ],
  
  rowActions: [
    viewAction,
  ],
  
  bulkActions: [],
  quickActions: [],
  
  formFields: [],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Transaction Details',
      fields: [
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'description', label: 'Description', accessor: 'description' },
        { key: 'source', label: 'Source', accessor: 'source' },
        { key: 'type', label: 'Type', accessor: 'type', dataType: 'status', statusColors: REWARDS_TRANSACTION_TYPE_COLORS },
        { key: 'amount', label: 'Points', accessor: 'amount', dataType: 'number' },
      ],
    },
  ],
  
  stats: [
    { key: 'current_balance', label: 'Current Balance', accessor: 'current_balance', dataType: 'number' },
    { key: 'total_earned', label: 'Total Earned', accessor: 'total_earned', dataType: 'number' },
    { key: 'total_redeemed', label: 'Total Redeemed', accessor: 'total_redeemed', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search transactions...',
    fields: ['description', 'source'],
  },
  
  emptyState: {
    message: 'No transactions yet',
    actionLabel: '',
    actionRoute: '',
  },
  
  defaultSort: {
    field: 'date',
    direction: 'desc',
  },
  
  features: {
    create: false,
    edit: false,
    delete: false,
    export: true,
    import: false,
    bulkActions: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: false,
  },
};
