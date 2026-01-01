/**
 * Account Tickets Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
} from '../common-actions';
import { TICKET_STATUS_COLORS } from '../status-mappings';

export const accountTicketsEntity: EntityConfig = {
  name: 'account-tickets',
  singular: 'Ticket',
  plural: 'My Tickets',
  description: 'View your tickets',
  icon: 'Ticket',
  
  routes: {
    list: '/account/tickets',
    detail: '/account/tickets/[id]',
    create: '',
    edit: '',
  },
  
  api: {
    endpoint: '/api/account/tickets',
    statsEndpoint: '/api/account/tickets/stats',
  },
  
  columns: [
    { key: 'event', label: 'Event', accessor: 'event', sortable: true },
    { key: 'date', label: 'Date', accessor: 'date', sortable: true, dataType: 'date' },
    { key: 'venue', label: 'Venue', accessor: 'venue', sortable: true },
    { key: 'quantity', label: 'Qty', accessor: 'quantity', sortable: true, dataType: 'number' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: TICKET_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'valid', label: 'Valid' },
        { value: 'used', label: 'Used' },
        { value: 'expired', label: 'Expired' },
        { value: 'refunded', label: 'Refunded' },
      ],
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
      title: 'Ticket Details',
      fields: [
        { key: 'event', label: 'Event', accessor: 'event' },
        { key: 'date', label: 'Date', accessor: 'date', dataType: 'date' },
        { key: 'venue', label: 'Venue', accessor: 'venue' },
        { key: 'quantity', label: 'Quantity', accessor: 'quantity', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: TICKET_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Tickets', accessor: 'total', dataType: 'number' },
    { key: 'upcoming', label: 'Upcoming', accessor: 'upcoming', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search tickets...',
    fields: ['event', 'venue'],
  },
  
  emptyState: {
    message: 'No tickets yet',
    actionLabel: 'Browse Events',
    actionRoute: '/events',
  },
  
  defaultSort: {
    field: 'date',
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
