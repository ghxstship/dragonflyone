/**
 * Skills Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { SKILL_STATUS_COLORS } from '../status-mappings';

export const skillsEntity: EntityConfig = {
  name: 'skills',
  singular: 'Skill',
  plural: 'Skills',
  description: 'Manage crew skills',
  icon: 'Star',
  
  routes: {
    list: '/skills',
    detail: '/skills/[id]',
    create: '/skills/new',
    edit: '/skills/[id]/edit',
  },
  
  api: {
    endpoint: '/api/skills',
    statsEndpoint: '/api/skills/stats',
  },
  
  columns: [
    { key: 'name', label: 'Skill', accessor: 'name', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category', sortable: true },
    { key: 'level', label: 'Level', accessor: 'level', sortable: true },
    { key: 'crew_count', label: 'Crew', accessor: 'crew_count', sortable: true, dataType: 'number' },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: SKILL_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/skills/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Skill', icon: 'Plus', handler: 'route', route: '/skills/new', primary: true },
  ],
  
  formFields: [
    { name: 'name', label: 'Skill Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'technical', label: 'Technical' },
      { value: 'creative', label: 'Creative' },
      { value: 'management', label: 'Management' },
      { value: 'safety', label: 'Safety' },
    ]},
    { name: 'level', label: 'Level', type: 'select', options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'expert', label: 'Expert' },
    ]},
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'active', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Skill Details',
      fields: [
        { key: 'name', label: 'Skill', accessor: 'name' },
        { key: 'category', label: 'Category', accessor: 'category' },
        { key: 'level', label: 'Level', accessor: 'level' },
        { key: 'crew_count', label: 'Crew', accessor: 'crew_count', dataType: 'number' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: SKILL_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total', accessor: 'total', dataType: 'number' },
    { key: 'active', label: 'Active', accessor: 'active', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search skills...',
    fields: ['name', 'category'],
  },
  
  emptyState: {
    message: 'No skills defined',
    actionLabel: 'Add Skill',
    actionRoute: '/skills/new',
  },
  
  defaultSort: {
    field: 'name',
    direction: 'asc',
  },
  
  features: {
    create: true,
    edit: true,
    delete: true,
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
