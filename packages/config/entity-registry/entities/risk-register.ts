/**
 * Risk Register Entity Configuration
 */

import type { EntityConfig } from '../types';
import { 
  viewAction, 
  editAction, 
  deleteAction,
  exportBulkAction,
  deleteBulkAction,
} from '../common-actions';
import { RISK_STATUS_COLORS, RISK_COLORS } from '../status-mappings';

export const riskRegisterEntity: EntityConfig = {
  name: 'risk-register',
  singular: 'Risk',
  plural: 'Risk Register',
  description: 'Manage project risks',
  icon: 'AlertTriangle',
  
  routes: {
    list: '/risk-register',
    detail: '/risk-register/[id]',
    create: '/risk-register/new',
    edit: '/risk-register/[id]/edit',
  },
  
  api: {
    endpoint: '/api/risk-register',
    statsEndpoint: '/api/risk-register/stats',
  },
  
  columns: [
    { key: 'title', label: 'Risk', accessor: 'title', sortable: true },
    { key: 'category', label: 'Category', accessor: 'category', sortable: true },
    { key: 'level', label: 'Level', accessor: 'level', sortable: true, dataType: 'status', statusColors: RISK_COLORS },
    { key: 'owner', label: 'Owner', accessor: 'owner', sortable: true },
    { key: 'status', label: 'Status', accessor: 'status', sortable: true, dataType: 'status', statusColors: RISK_STATUS_COLORS },
  ],
  
  filters: [
    { 
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'identified', label: 'Identified' },
        { value: 'assessed', label: 'Assessed' },
        { value: 'mitigated', label: 'Mitigated' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    { 
      key: 'level',
      label: 'Risk Level',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
  ],
  
  rowActions: [
    viewAction,
    editAction('/risk-register/[id]/edit'),
    deleteAction({ titleField: 'title' }),
  ],
  
  bulkActions: [
    exportBulkAction,
    deleteBulkAction,
  ],
  
  quickActions: [
    { id: 'create', label: 'Add Risk', icon: 'Plus', handler: 'route', route: '/risk-register/new', primary: true },
  ],
  
  formFields: [
    { name: 'title', label: 'Risk Title', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', required: true, options: [
      { value: 'technical', label: 'Technical' },
      { value: 'operational', label: 'Operational' },
      { value: 'financial', label: 'Financial' },
      { value: 'safety', label: 'Safety' },
      { value: 'legal', label: 'Legal' },
    ]},
    { name: 'level', label: 'Risk Level', type: 'select', required: true, options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ]},
    { name: 'owner_id', label: 'Owner', type: 'select', options: [] },
    { name: 'status', label: 'Status', type: 'select', defaultValue: 'identified', options: [
      { value: 'identified', label: 'Identified' },
      { value: 'assessed', label: 'Assessed' },
      { value: 'mitigated', label: 'Mitigated' },
      { value: 'accepted', label: 'Accepted' },
    ]},
    { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
    { name: 'mitigation', label: 'Mitigation Plan', type: 'textarea', colSpan: 2 },
  ],
  
  detailSections: [
    {
      id: 'overview',
      title: 'Risk Details',
      fields: [
        { key: 'title', label: 'Risk', accessor: 'title' },
        { key: 'category', label: 'Category', accessor: 'category' },
        { key: 'level', label: 'Level', accessor: 'level', dataType: 'status', statusColors: RISK_COLORS },
        { key: 'owner', label: 'Owner', accessor: 'owner' },
        { key: 'status', label: 'Status', accessor: 'status', dataType: 'status', statusColors: RISK_STATUS_COLORS },
      ],
    },
  ],
  
  stats: [
    { key: 'total', label: 'Total Risks', accessor: 'total', dataType: 'number' },
    { key: 'critical', label: 'Critical', accessor: 'critical', dataType: 'number' },
    { key: 'open', label: 'Open', accessor: 'open', dataType: 'number' },
  ],
  
  search: {
    placeholder: 'Search risks...',
    fields: ['title', 'category'],
  },
  
  emptyState: {
    message: 'No risks identified',
    actionLabel: 'Add Risk',
    actionRoute: '/risk-register/new',
  },
  
  defaultSort: {
    field: 'level',
    direction: 'desc',
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
