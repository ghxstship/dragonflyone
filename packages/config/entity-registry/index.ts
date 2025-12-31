/**
 * Entity Registry
 * 
 * Centralized configuration system for all entities across the monorepo.
 * Eliminates hardcoded UI/workflow elements by providing a single source
 * of truth for columns, filters, actions, form fields, and more.
 * 
 * @example
 * ```tsx
 * import { getEntity, getEntityColumns, getEntityFilters } from '@ghxstship/config';
 * 
 * function MyListPage() {
 *   const entity = getEntity('credentials');
 *   const columns = getEntityColumns('credentials');
 *   const filters = getEntityFilters('credentials');
 *   
 *   return (
 *     <ListPage
 *       title={entity.plural}
 *       columns={columns}
 *       filters={filters}
 *       // ...
 *     />
 *   );
 * }
 * ```
 */

// Types
export type {
  IconName,
  StatusVariant,
  ActionVariant,
  FieldType,
  ColumnDefinition,
  FilterOption,
  FilterDefinition,
  RowActionDefinition,
  BulkActionDefinition,
  QuickActionDefinition,
  FormFieldDefinition,
  DetailFieldDefinition,
  DetailSectionDefinition,
  StatDefinition,
  EntityRoutes,
  EntityApi,
  EntityConfig,
  EntityRegistry,
  EntityName,
  ColumnGeneratorOptions,
  FilterGeneratorOptions,
  ActionGeneratorOptions,
  FormFieldGeneratorOptions,
  DetailSectionGeneratorOptions,
  StatsGeneratorOptions,
} from './types';

// Status Mappings
export {
  UNIVERSAL_STATUS_COLORS,
  CREDENTIAL_STATUS_COLORS,
  FINANCIAL_STATUS_COLORS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  TICKET_STATUS_COLORS,
  DOCUMENT_STATUS_COLORS,
  TASK_STATUS_COLORS,
  EQUIPMENT_STATUS_COLORS,
  CREW_STATUS_COLORS,
  EVENT_STATUS_COLORS,
  PROJECT_STATUS_COLORS,
  CERTIFICATION_STATUS_COLORS,
  INCIDENT_STATUS_COLORS,
  DELIVERY_STATUS_COLORS,
  MAINTENANCE_STATUS_COLORS,
  PRIORITY_COLORS,
  SEVERITY_COLORS,
  RISK_COLORS,
  ENTITY_STATUS_MAPPINGS,
  getStatusColor,
  getPriorityColor,
  getSeverityColor,
  getRiskColor,
  getEntityStatusColor,
  // New entity-specific status colors
  PEOPLE_STATUS_COLORS,
  PEOPLE_TYPE_COLORS,
  PLACES_STATUS_COLORS,
  PLACES_TYPE_COLORS,
  ORGANIZATION_STATUS_COLORS,
  ORGANIZATION_TYPE_COLORS,
  PRODUCTION_STATUS_COLORS,
  PROPOSAL_STATUS_COLORS,
  PURCHASE_ORDER_STATUS_COLORS,
  BUDGET_STATUS_COLORS,
  EXPENSE_STATUS_COLORS,
} from './status-mappings';

// Entity-specific status colors from entity files
export { DEAL_STATUS_COLORS, DEAL_STAGE_COLORS } from './entities/deals';
export { QUOTE_STATUS_COLORS } from './entities/quotes';
export { ADVANCING_STATUS_COLORS } from './entities/advancing';

// Formatters
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatDateRange,
  formatRelativeDate,
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatNumberCompact,
  formatPercentage,
  truncateText,
  formatName,
  formatPhone,
  formatEmail,
  formatStatus,
  formatSlug,
  formatId,
  formatOrderNumber,
  formatBoolean,
  formatFileSize,
  formatDuration,
  formatAddress,
  formatters,
} from './formatters';

// Common Columns
export {
  idColumn,
  referenceNumberColumn,
  nameColumn,
  titleColumn,
  fullNameColumn,
  contactNameColumn,
  statusColumn,
  paymentStatusColumn,
  createdAtColumn,
  updatedAtColumn,
  dateColumn,
  dateTimeColumn,
  dueDateColumn,
  expiresAtColumn,
  amountColumn,
  totalAmountColumn,
  priceColumn,
  vendorColumn,
  projectColumn,
  eventColumn,
  organizationColumn,
  ownerColumn,
  typeColumn,
  categoryColumn,
  descriptionColumn,
  notesColumn,
  booleanColumn,
  requiredColumn,
  priorityColumn,
  accessLevelColumn,
  versionColumn,
  commonColumns,
} from './common-columns';

// Common Filters
export {
  universalStatusOptions,
  credentialStatusOptions,
  financialStatusOptions,
  orderStatusOptions,
  paymentStatusOptions,
  ticketStatusOptions,
  documentStatusOptions,
  taskStatusOptions,
  equipmentStatusOptions,
  crewStatusOptions,
  eventStatusOptions,
  projectStatusOptions,
  certificationStatusOptions,
  incidentStatusOptions,
  deliveryStatusOptions,
  maintenanceStatusOptions,
  priorityOptions,
  severityOptions,
  riskLevelOptions,
  yesNoOptions,
  activeInactiveOptions,
  statusFilter,
  paymentStatusFilter,
  priorityFilter,
  severityFilter,
  dateRangeFilter,
  createdAtFilter,
  dueDateFilter,
  categoryFilter,
  typeFilter,
  booleanFilter,
  textFilter,
  numberFilter,
  credentialStatusFilter,
  financialStatusFilter,
  orderStatusFilter,
  ticketStatusFilter,
  documentStatusFilter,
  taskStatusFilter,
  equipmentStatusFilter,
  crewStatusFilter,
  eventStatusFilter,
  projectStatusFilter,
  certificationStatusFilter,
  incidentStatusFilter,
  deliveryStatusFilter,
  maintenanceStatusFilter,
  ENTITY_STATUS_OPTIONS,
  getEntityStatusOptions,
  getEntityStatusFilter,
  commonFilters,
} from './common-filters';

// Common Actions
export {
  viewAction,
  viewPageAction,
  editAction,
  deleteAction,
  archiveAction,
  duplicateAction,
  approveAction,
  rejectAction,
  suspendAction,
  reactivateAction,
  revokeAction,
  cancelAction,
  completeAction,
  recordPaymentAction,
  sendInvoiceAction,
  refundAction,
  downloadAction,
  printAction,
  shareAction,
  viewQRAction,
  scanAction,
  transferAction,
  assignAction,
  unassignAction,
  exportBulkAction,
  deleteBulkAction,
  archiveBulkAction,
  approveBulkAction,
  suspendBulkAction,
  revokeBulkAction,
  createQuickAction,
  importQuickAction,
  scanQuickAction,
  manageQuickAction,
  standardRowActions,
  standardBulkActions,
  commonActions,
} from './common-actions';

// Common Form Fields
export {
  nameField,
  titleField,
  firstNameField,
  lastNameField,
  referenceNumberField,
  emailField,
  phoneField,
  websiteField,
  streetField,
  street2Field,
  cityField,
  stateField,
  zipField,
  countryField,
  addressFields,
  statusField,
  priorityField,
  dateField,
  dateTimeField,
  startDateField,
  endDateField,
  dueDateField,
  issueDateField,
  effectiveDateField,
  expirationDateField,
  amountField,
  totalAmountField,
  subtotalField,
  taxField,
  feesField,
  currencyField,
  priceField,
  vendorField,
  projectField,
  eventField,
  organizationField,
  assigneeField,
  ownerField,
  categoryField as categoryFormField,
  typeField as typeFormField,
  descriptionField,
  notesField,
  commentsField,
  checkboxField,
  toggleField,
  activeField,
  requiredField,
  versionField,
  fileField,
  imageField,
  avatarField,
  paymentMethodField,
  paymentStatusField,
  commonFormFields,
} from './common-form-fields';

// Hooks
export { useEntityConfig, type UseEntityConfigOptions, type UseEntityConfigResult } from './hooks';

// Capability Bridge (integration with dataset-capabilities system)
export {
  mapToDatasetCapability,
  mapFromDatasetCapability,
  entityToCapabilityOverride,
  generateAllCapabilityOverrides,
  getEntityCapabilities,
  getEntityCapabilityRoute,
  entityHasCapability,
  getEntityScanCapabilities,
  getEntityViewCapabilities,
  getEntityLegendTable,
  getEntityLegendType,
  buildLegendQueryFilter,
  getEntitiesByLegendTable,
} from './capability-bridge';

// Registry
export {
  registerEntity,
  registerEntities,
  unregisterEntity,
  getEntity,
  getEntityOrThrow,
  hasEntity,
  getEntityNames,
  getAllEntities,
  getEntityColumns,
  getEntityFilters,
  getEntityRowActions,
  getEntityBulkActions,
  getEntityQuickActions,
  getEntityFormFields,
  getEntityDetailSections,
  getEntityStats,
  getEntityRoutes,
  buildEntityRoute,
  getEntityApi,
  getEntityEndpoint,
  entityHasFeature,
  hasEntityPermission,
  getEntitySearchConfig,
  getEntityEmptyState,
  entityRegistry,
} from './registry';

// Generators
export {
  formatColumnValue,
  getColumnStatusColor,
  getDetailFieldValue,
  formatDetailFieldValue,
  getDetailFieldStatusColor,
  getStatValue,
  formatStatValue,
  buildActionRoute,
  isActionHidden,
  isActionDisabled,
  getActionConfirmMessage,
  getVisibleColumns,
  getVisibleFilters,
  getAvailableRowActions,
  getAvailableBulkActions,
  getAvailableQuickActions,
  generateStats,
  generateDetailSections,
  generators,
} from './generators';

// Entity Configurations
export {
  credentialsEntity,
  billsEntity,
  ordersEntity,
  ticketsEntity,
  sopsEntity,
  crewEntity,
  equipmentEntity,
  eventsEntity,
  projectsEntity,
  invoicesEntity,
  vendorsEntity,
  contactsEntity,
  assetsEntity,
  tasksEntity,
  incidentsEntity,
  allEntities,
  ENTITY_NAMES,
  type EntityNameType,
} from './entities';

// Re-export types for integration
export type {
  LegendEntityType,
  LegendSchemaMapping,
  DatasetCapabilityType,
  ProfileTableType,
  RelationshipType,
  EntityRelationship,
  DbFieldMapping,
} from './types';

// Query Builder (3NF composite queries)
export {
  buildEntitySelectQuery,
  buildSupabaseQueryConfig,
  splitEntityData,
  getEntityRelationships,
  getRelatedEntities,
  areEntitiesRelated,
  getEntitiesForTable,
  getEntitiesForProfileTable,
  generateSchemaMap,
  type SupabaseQueryConfig,
  type CompositeQueryResult,
} from './query-builder';
