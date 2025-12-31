/**
 * Advancing Entity Configuration
 */
import type { EntityConfig } from '../types';
import { 
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import {
  viewAction,
  editAction,
  exportBulkAction,
} from '../common-actions';

export const ADVANCING_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  pending: 'warning',
  submitted: 'info',
  approved: 'success',
  rejected: 'error',
  review: 'warning',
  complete: 'success',
  draft: 'ghost',
};

export const advancingEntity: EntityConfig = {
  name: 'advancing',
  singular: 'Advance',
  plural: 'Advances',
  icon: 'FileCheck',
  description: 'Artist and vendor advancing requests',
  
  routes: {
    list: '/advancing',
    detail: '/advancing/[id]',
    create: '/advancing/new',
    edit: '/advancing/[id]/edit',
  },
  
  api: {
    endpoint: '/api/advancing',
  },
  
  columns: [
    { key: 'reference', label: 'Reference', accessor: 'reference', sortable: true },
    { key: 'artist', label: 'Artist/Vendor', accessor: (row) => (row as { artist_name?: string; vendor_name?: string }).artist_name || (row as { vendor_name?: string }).vendor_name || '—', sortable: true },
    { key: 'event', label: 'Event', accessor: (row) => (row as { event?: { name?: string }; event_name?: string }).event?.name || (row as { event_name?: string }).event_name || '—' },
    { key: 'amount', label: 'Amount', accessor: 'amount', sortable: true, dataType: 'currency' },
    { key: 'due_date', label: 'Due Date', accessor: 'due_date', sortable: true, dataType: 'date' },
    statusColumn({ statusColors: ADVANCING_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'review', label: 'In Review' },
        { value: 'complete', label: 'Complete' },
      ]
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/advancing/[id]/edit'),
  ],
  
  bulkActions: [exportBulkAction],
  
  quickActions: [],
  
  formFields: [
    { name: 'reference', label: 'Reference', type: 'text', required: true },
    { name: 'artist_name', label: 'Artist/Vendor', type: 'text', required: true },
    { name: 'event_name', label: 'Event', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'currency' },
    { name: 'due_date', label: 'Due Date', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ], defaultValue: 'pending' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Advance Details',
      fields: [
        { key: 'reference', label: 'Reference', accessor: 'reference' },
        { key: 'artist', label: 'Artist/Vendor', accessor: (row) => (row as { artist_name?: string }).artist_name || '—' },
        { key: 'amount', label: 'Amount', accessor: 'amount', dataType: 'currency' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: ADVANCING_STATUS_COLORS },
        { key: 'due_date', label: 'Due Date', accessor: 'due_date', dataType: 'date' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Advances', accessor: 'total', dataType: 'number' },
    { key: 'pending', label: 'Pending', accessor: 'pending', dataType: 'number' },
    { key: 'approved', label: 'Approved', accessor: 'approved', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search advances...',
    fields: ['reference', 'artist_name', 'event_name'],
  },
  
  emptyState: {
    message: 'No advances yet',
    actionLabel: 'Create Advance',
    actionRoute: '/advancing/new',
  },
  
  defaultSort: {
    field: 'created_at',
    direction: 'desc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: false,
    export: true,
    import: false,
    bulkActions: true,
    search: true,
    filters: true,
    sort: true,
  },
};
