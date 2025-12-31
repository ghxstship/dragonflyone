/**
 * Tickets Entity Configuration
 * 
 * Configuration for the tickets entity used in GVTEWAY.
 */

import type { EntityConfig } from '../types';
import { 
  referenceNumberColumn, 
  eventColumn,
  statusColumn,
  createdAtColumn,
} from '../common-columns';
import { ticketStatusFilter } from '../common-filters';
import { 
  viewAction, 
  editAction, 
  cancelAction,
  transferAction,
  scanQuickAction,
  exportBulkAction,
} from '../common-actions';
import { TICKET_STATUS_COLORS } from '../status-mappings';

export const ticketsEntity: EntityConfig = {
  name: 'tickets',
  singular: 'Ticket',
  plural: 'Tickets',
  description: 'Manage event tickets and access passes',
  icon: 'Ticket',
  
  routes: {
    list: '/tickets',
    detail: '/tickets/[id]',
    create: '/tickets/new',
    edit: '/tickets/[id]/edit',
    custom: {
      scan: '/tickets/scan',
      transfer: '/tickets/[id]/transfer',
    },
  },
  
  api: {
    endpoint: '/api/tickets',
    statsEndpoint: '/api/tickets/stats',
  },
  
  columns: [
    referenceNumberColumn('ticket_number', 'Ticket #'),
    eventColumn,
    {
      key: 'ticket_type',
      label: 'Type',
      accessor: (row) => (row.ticket_types as { name?: string })?.name || '—',
      sortable: true,
      dataType: 'string',
    },
    {
      key: 'holder',
      label: 'Holder',
      accessor: (row) => (row.holder_name as string) || (row.holder_email as string) || '—',
      sortable: true,
      dataType: 'string',
    },
    statusColumn({ statusColors: TICKET_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    ticketStatusFilter,
  ],
  
  rowActions: [
    viewAction,
    editAction('/tickets/[id]/edit'),
    transferAction('/tickets/[id]/transfer'),
    cancelAction({ titleField: 'ticket_number' }),
  ],
  
  bulkActions: [
    exportBulkAction,
  ],
  
  quickActions: [
    scanQuickAction('/tickets/scan'),
  ],
  
  formFields: [
    { name: 'ticket_number', label: 'Ticket Number', type: 'text', required: true },
    { name: 'event_id', label: 'Event', type: 'select', required: true, options: [] },
    { name: 'ticket_type_id', label: 'Ticket Type', type: 'select', required: true, options: [] },
    { name: 'holder_name', label: 'Holder Name', type: 'text' },
    { name: 'holder_email', label: 'Holder Email', type: 'email' },
    { name: 'holder_phone', label: 'Holder Phone', type: 'tel' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'valid', label: 'Valid' },
      { value: 'used', label: 'Used' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'refunded', label: 'Refunded' },
    ], defaultValue: 'valid' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Ticket Details',
      fields: [
        { key: 'ticket_number', label: 'Ticket #', accessor: 'ticket_number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TICKET_STATUS_COLORS },
        { key: 'event', label: 'Event', accessor: (row) => (row.events as { name?: string })?.name || '—' },
        { key: 'type', label: 'Type', accessor: (row) => (row.ticket_types as { name?: string })?.name || '—' },
        { key: 'holder_name', label: 'Holder', accessor: 'holder_name' },
        { key: 'holder_email', label: 'Email', accessor: 'holder_email', dataType: 'email' },
        { key: 'holder_phone', label: 'Phone', accessor: 'holder_phone', dataType: 'phone' },
        { key: 'created_at', label: 'Created', accessor: 'created_at', dataType: 'datetime' },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Tickets', accessor: 'total', dataType: 'number' },
    { key: 'valid', label: 'Valid', accessor: 'valid', dataType: 'number' },
    { key: 'used', label: 'Used', accessor: 'used', dataType: 'number' },
    { key: 'cancelled', label: 'Cancelled', accessor: 'cancelled', dataType: 'number' },
  ],
  
  capabilities: ['scannable:qr', 'scannable:barcode'],
  
  capabilityRoutes: {
    'scannable:qr': '/tickets/scan',
    'scannable:barcode': '/tickets/scan',
  },
  
  legendMapping: {
    table: 'legend_products',
    typeColumn: 'product_type',
    typeValue: 'ticket',
  },
  
  search: {
    placeholder: 'Search tickets...',
    fields: ['ticket_number', 'holder_name', 'holder_email'],
  },
  
  emptyState: {
    message: 'No tickets found',
    actionLabel: 'Create Ticket',
    actionRoute: '/tickets/new',
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
    pagination: true,
    selection: true,
  },
};
