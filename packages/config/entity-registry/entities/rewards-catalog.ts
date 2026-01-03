/**
 * Rewards Catalog Entity Configuration
 * Redeemable rewards for loyalty program
 */

import type { EntityConfig, StatusVariant } from '../types';
import { viewAction } from '../common-actions';

export const REWARDS_AVAILABILITY_COLORS: Record<string, StatusVariant> = {
  available: 'success',
  locked: 'ghost',
  redeemed: 'info',
  expired: 'error',
};

export const REWARDS_TYPE_COLORS: Record<string, StatusVariant> = {
  discount: 'info',
  experience: 'success',
  merchandise: 'warning',
  upgrade: 'info',
  exclusive: 'ghost',
};

export const rewardsCatalogEntity: EntityConfig = {
  name: 'rewards-catalog',
  singular: 'Reward',
  plural: 'Rewards Catalog',
  description: 'Redeem your points for exclusive rewards',
  icon: 'Gift',
  
  routes: {
    list: '/rewards/redeem',
    detail: '/rewards/redeem/[id]',
    create: '',
    edit: '',
  },
  
  api: {
    endpoint: '/api/rewards/catalog',
    statsEndpoint: '/api/rewards/catalog/stats',
  },
  
  columns: [
    { key: 'name', label: 'Reward', accessor: 'name', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true, dataType: 'status', statusColors: REWARDS_TYPE_COLORS },
    { key: 'points_required', label: 'Points Required', accessor: 'points_required', sortable: true, dataType: 'number' },
    { key: 'availability', label: 'Availability', accessor: 'availability', sortable: true, dataType: 'status', statusColors: REWARDS_AVAILABILITY_COLORS },
    { key: 'expires_at', label: 'Expires', accessor: 'expires_at', sortable: true, dataType: 'date' },
  ],
  
  filters: [
    { 
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'discount', label: 'Discount' },
        { value: 'experience', label: 'Experience' },
        { value: 'merchandise', label: 'Merchandise' },
        { value: 'upgrade', label: 'Upgrade' },
        { value: 'exclusive', label: 'Exclusive' },
      ],
    },
    { 
      key: 'availability',
      label: 'Availability',
      type: 'select',
      options: [
        { value: 'available', label: 'Available' },
        { value: 'locked', label: 'Locked' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    {
      id: 'redeem',
      label: 'Redeem',
      icon: 'Gift',
      variant: 'primary',
      handler: 'confirm',
      confirm: {
        title: 'Redeem Reward',
        message: 'Are you sure you want to redeem this reward?',
        confirmLabel: 'Redeem',
        variant: 'info',
      },
    },
  ],
  
  bulkActions: [],
  quickActions: [],
  
  formFields: [],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Reward Details',
      fields: [
        { key: 'name', label: 'Reward', accessor: 'name' },
        { key: 'description', label: 'Description', accessor: 'description' },
        { key: 'type', label: 'Type', accessor: 'type', dataType: 'status', statusColors: REWARDS_TYPE_COLORS },
        { key: 'points_required', label: 'Points Required', accessor: 'points_required', dataType: 'number' },
        { key: 'availability', label: 'Availability', accessor: 'availability', dataType: 'status', statusColors: REWARDS_AVAILABILITY_COLORS },
        { key: 'expires_at', label: 'Expires', accessor: 'expires_at', dataType: 'date' },
      ],
    },
  ],
  
  stats: [
    { key: 'available_count', label: 'Available Rewards', accessor: 'available_count', dataType: 'number' },
    { key: 'user_points', label: 'Your Points', accessor: 'user_points', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search rewards...',
    fields: ['name', 'description', 'type'],
  },
  
  emptyState: {
    message: 'No rewards available',
    actionLabel: '',
    actionRoute: '',
  },
  
  defaultSort: {
    field: 'points_required',
    direction: 'asc',
  },
  
  features: {
    create: false,
    edit: false,
    delete: false,
    export: false,
    import: false,
    bulkActions: false,
    search: true,
    filters: true,
    sort: true,
    pagination: true,
    selection: false,
  },
};
