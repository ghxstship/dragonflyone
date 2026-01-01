/**
 * Search Entity Configuration
 */

import type { EntityConfig } from '../types';

export const searchEntity: EntityConfig = {
  name: 'search',
  singular: 'Search Result',
  plural: 'Search',
  description: 'Global search functionality',
  icon: 'Search',
  
  routes: {
    list: '/search',
    detail: '/search/[id]',
    create: '',
    edit: '',
  },
  
  api: {
    endpoint: '/api/search',
    statsEndpoint: '',
  },
  
  columns: [
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'type', label: 'Type', accessor: 'type', sortable: true },
    { key: 'description', label: 'Description', accessor: 'description', sortable: false },
  ],
  
  filters: [
    { 
      key: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'people', label: 'People' },
        { value: 'places', label: 'Places' },
        { value: 'events', label: 'Events' },
        { value: 'documents', label: 'Documents' },
      ],
    },
  ],
  
  rowActions: [],
  bulkActions: [],
  quickActions: [],
  formFields: [],
  
  detailSections: [],
  
  stats: [],
  
  search: {
    placeholder: 'Search everything...',
    fields: ['title', 'description'],
  },
  
  emptyState: {
    message: 'No results found',
    actionLabel: '',
    actionRoute: '',
  },
  
  defaultSort: {
    field: 'title',
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
