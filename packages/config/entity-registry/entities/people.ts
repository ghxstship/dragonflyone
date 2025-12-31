/**
 * People Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';

export const PEOPLE_STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  pending: 'warning',
  archived: 'error',
  draft: 'ghost',
};

export const PEOPLE_TYPE_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline'> = {
  contact: 'info',
  employee: 'success',
  crew: 'warning',
  artist: 'error',
  volunteer: 'info',
  candidate: 'outline',
};

export const peopleEntity: EntityConfig = {
  name: 'people',
  singular: 'Person',
  plural: 'People',
  description: 'Unified directory of contacts, employees, crew, artists, and more',
  icon: 'Users',
  
  routes: {
    list: '/people',
    detail: '/people/[id]',
    create: '/people/new',
    edit: '/people/[id]/edit',
  },
  
  api: {
    endpoint: '/api/people',
    statsEndpoint: '/api/people/stats',
  },
  
  columns: [
    { key: 'display_name', label: 'Name', accessor: 'display_name', sortable: true },
    { key: 'email', label: 'Email', accessor: 'email' },
    { key: 'phone', label: 'Phone', accessor: 'phone' },
    { key: 'title', label: 'Title', accessor: 'title', sortable: true },
    { key: 'primary_type', label: 'Type', accessor: 'primary_type', sortable: true, dataType: 'status', statusColors: PEOPLE_TYPE_COLORS },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: PEOPLE_STATUS_COLORS },
    { key: 'updated_at', label: 'Updated', accessor: 'updated_at', sortable: true, dataType: 'date' },
  ],
  
  filters: [
    { 
      key: 'primary_type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All People' },
        { value: 'contact', label: 'Contacts' },
        { value: 'employee', label: 'Employees' },
        { value: 'crew', label: 'Crew' },
        { value: 'artist', label: 'Artists' },
        { value: 'volunteer', label: 'Volunteers' },
        { value: 'candidate', label: 'Candidates' },
      ],
    },
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'archived', label: 'Archived' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/people/[id]/edit'),
    deleteAction({ titleField: 'display_name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Person', icon: 'Plus', handler: 'route', route: '/people/new', primary: true },
  ],
  
  formFields: [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'tel' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'primary_type', label: 'Type', type: 'select', required: true, options: [
      { value: 'contact', label: 'Contact' },
      { value: 'employee', label: 'Employee' },
      { value: 'crew', label: 'Crew' },
      { value: 'artist', label: 'Artist' },
      { value: 'volunteer', label: 'Volunteer' },
      { value: 'candidate', label: 'Candidate' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ]},
    { name: 'bio', label: 'Bio', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Person Details',
      fields: [
        { key: 'display_name', label: 'Name', accessor: 'display_name' },
        { key: 'email', label: 'Email', accessor: 'email' },
        { key: 'phone', label: 'Phone', accessor: 'phone' },
        { key: 'title', label: 'Title', accessor: 'title' },
        { key: 'primary_type', label: 'Type', accessor: 'primary_type', dataType: 'status', statusColors: PEOPLE_TYPE_COLORS },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: PEOPLE_STATUS_COLORS },
      ],
    },
  ],
  
  legendMapping: {
    table: 'legend_people',
    selectQuery: '*, people_profile_employee(*), people_profile_crew(*), people_profile_contact(*)',
  },
  
  stats: [
    { key: 'total', label: 'Total People', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
    { key: 'employees', label: 'Employees', accessor: 'employees', dataType: 'number' },
    { key: 'crew', label: 'Crew', accessor: 'crew', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search by name, email, or title...',
    fields: ['display_name', 'email', 'title', 'first_name', 'last_name'],
  },
  
  emptyState: {
    message: 'No people yet',
    actionLabel: 'Add Person',
    actionRoute: '/people/new',
  },
  
  defaultSort: {
    field: 'display_name',
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
