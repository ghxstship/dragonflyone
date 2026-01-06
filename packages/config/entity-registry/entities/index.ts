/**
 * Entity Configurations Index
 * 
 * Exports all entity configurations and registers them with the registry.
 */

import { registerEntities } from '../registry';

// Import all entity configurations
import { credentialsEntity } from './credentials';
import { billsEntity } from './bills';
import { ordersEntity } from './orders';
import { ticketsEntity } from './tickets';
import { sopsEntity } from './sops';
import { crewEntity } from './crew';
import { equipmentEntity } from './equipment';
import { eventsEntity } from './events';
import { projectsEntity } from './projects';
import { invoicesEntity } from './invoices';
import { vendorsEntity } from './vendors';
import { contactsEntity } from './contacts';
import { assetsEntity } from './assets';
import { tasksEntity } from './tasks';
import { incidentsEntity } from './incidents';
import { budgetsEntity } from './budgets';
import { expensesEntity } from './expenses';
import { proposalsEntity } from './proposals';
import { purchaseOrdersEntity } from './purchase-orders';
import { peopleEntity } from './people';
import { placesEntity } from './places';
import { organizationsEntity } from './organizations';
import { productionsEntity } from './productions';
import { dealsEntity } from './deals';
import { quotesEntity } from './quotes';
import { advancingEntity } from './advancing';
import { beosEntity } from './beos';
import { availabilityEntity } from './availability';
import { venuesEntity } from './venues';
import { scheduleEntity } from './schedule';
import { issuesEntity } from './issues';
import { maintenanceEntity } from './maintenance';
import { permitsEntity } from './permits';
import { deliveriesEntity } from './deliveries';
import { certificationsEntity } from './certifications';
import { emergencyEntity } from './emergency';
import { drawingsEntity } from './drawings';
import { integrationsEntity } from './integrations';
import { backgroundChecksEntity } from './background-checks';
import { buildStrikeEntity } from './build-strike';
import { photoDocumentationEntity } from './photo-documentation';
import { punchListEntity } from './punch-list';
import { qaCheckpointsEntity } from './qa-checkpoints';
import { riskRegisterEntity } from './risk-register';
import { runOfShowEntity } from './run-of-show';
import { setTimesEntity } from './set-times';
import { settlementEntity } from './settlement';
import { showCallEntity } from './show-call';
import { siteAccessEntity } from './site-access';
import { siteSurveysEntity } from './site-surveys';
import { skillsEntity } from './skills';
import { soundcheckEntity } from './soundcheck';
import { specSheetsEntity } from './spec-sheets';
import { stageManagementEntity } from './stage-management';
import { subcontractorsEntity } from './subcontractors';
import { techRehearsalEntity } from './tech-rehearsal';
import { templatesEntity } from './templates';
import { timekeepingEntity } from './timekeeping';
import { travelEntity } from './travel';
import { troubleshootingEntity } from './troubleshooting';
import { vipManagementEntity } from './vip-management';
import { weatherContingencyEntity } from './weather-contingency';
import { searchEntity } from './search';
import { accountOrdersEntity } from './account-orders';
import { accountTicketsEntity } from './account-tickets';
import { rewardsTransactionsEntity } from './rewards-transactions';
import { rewardsCatalogEntity } from './rewards-catalog';

// Import new missing entities
import { savedFiltersEntity } from './saved-filters';
import { userPreferencesEntity } from './user-preferences';
import { userSettingsEntity } from './user-settings';
import { userNotificationPreferencesEntity } from './user-notification-preferences';
import { workspacesEntity } from './workspaces';
import { apiKeysEntity } from './api-keys';
import { webhooksEntity } from './webhooks';
import { featureFlagsEntity } from './feature-flags';
import { notificationsEntity } from './notifications';
import { automationRulesEntity } from './automation-rules';
import { integrationPosEntity } from './integration-pos';
import { integrationAtsEntity } from './integration-ats';
import { searchHistoryEntity } from './search-history';
import { importJobsEntity } from './import-jobs';
import { exportJobsEntity } from './export-jobs';
import { ssoProvidersEntity } from './sso-providers';
import { userSessionsEntity } from './user-sessions';

// Export individual entities
export { credentialsEntity } from './credentials';
export { billsEntity } from './bills';
export { ordersEntity } from './orders';
export { ticketsEntity } from './tickets';
export { sopsEntity } from './sops';
export { crewEntity } from './crew';
export { equipmentEntity } from './equipment';
export { eventsEntity } from './events';
export { projectsEntity } from './projects';
export { invoicesEntity } from './invoices';
export { vendorsEntity } from './vendors';
export { contactsEntity } from './contacts';
export { assetsEntity } from './assets';
export { tasksEntity } from './tasks';
export { incidentsEntity } from './incidents';
export { budgetsEntity, BUDGET_STATUS_COLORS } from './budgets';
export { expensesEntity, EXPENSE_STATUS_COLORS } from './expenses';
export { proposalsEntity, PROPOSAL_STATUS_COLORS } from './proposals';
export { purchaseOrdersEntity, PURCHASE_ORDER_STATUS_COLORS } from './purchase-orders';
export { peopleEntity, PEOPLE_STATUS_COLORS, PEOPLE_TYPE_COLORS } from './people';
export { placesEntity, PLACES_STATUS_COLORS, PLACES_TYPE_COLORS } from './places';
export { organizationsEntity, ORGANIZATION_STATUS_COLORS, ORGANIZATION_TYPE_COLORS } from './organizations';
export { productionsEntity, PRODUCTION_STATUS_COLORS } from './productions';
export { dealsEntity, DEAL_STATUS_COLORS, DEAL_STAGE_COLORS } from './deals';
export { quotesEntity, QUOTE_STATUS_COLORS } from './quotes';
export { advancingEntity, ADVANCING_STATUS_COLORS } from './advancing';
export { beosEntity } from './beos';
export { availabilityEntity } from './availability';
export { venuesEntity } from './venues';
export { scheduleEntity } from './schedule';
export { issuesEntity } from './issues';
export { maintenanceEntity } from './maintenance';
export { permitsEntity } from './permits';
export { deliveriesEntity } from './deliveries';
export { certificationsEntity } from './certifications';
export { emergencyEntity } from './emergency';
export { drawingsEntity } from './drawings';
export { integrationsEntity } from './integrations';
export { backgroundChecksEntity } from './background-checks';
export { buildStrikeEntity } from './build-strike';
export { photoDocumentationEntity } from './photo-documentation';
export { punchListEntity } from './punch-list';
export { qaCheckpointsEntity } from './qa-checkpoints';
export { riskRegisterEntity } from './risk-register';
export { runOfShowEntity } from './run-of-show';
export { setTimesEntity } from './set-times';
export { settlementEntity } from './settlement';
export { showCallEntity } from './show-call';
export { siteAccessEntity } from './site-access';
export { siteSurveysEntity } from './site-surveys';
export { skillsEntity } from './skills';
export { soundcheckEntity } from './soundcheck';
export { specSheetsEntity } from './spec-sheets';
export { stageManagementEntity } from './stage-management';
export { subcontractorsEntity } from './subcontractors';
export { techRehearsalEntity } from './tech-rehearsal';
export { templatesEntity } from './templates';
export { timekeepingEntity } from './timekeeping';
export { travelEntity } from './travel';
export { troubleshootingEntity } from './troubleshooting';
export { vipManagementEntity } from './vip-management';
export { weatherContingencyEntity } from './weather-contingency';
export { searchEntity } from './search';
export { accountOrdersEntity } from './account-orders';
export { accountTicketsEntity } from './account-tickets';
export { rewardsTransactionsEntity, REWARDS_TRANSACTION_TYPE_COLORS } from './rewards-transactions';
export { rewardsCatalogEntity, REWARDS_AVAILABILITY_COLORS, REWARDS_TYPE_COLORS } from './rewards-catalog';

// Export new missing entities
export { savedFiltersEntity } from './saved-filters';
export { userPreferencesEntity } from './user-preferences';
export { userSettingsEntity } from './user-settings';
export { userNotificationPreferencesEntity } from './user-notification-preferences';
export { workspacesEntity } from './workspaces';
export { apiKeysEntity } from './api-keys';
export { webhooksEntity } from './webhooks';
export { featureFlagsEntity } from './feature-flags';
export { notificationsEntity } from './notifications';
export { automationRulesEntity } from './automation-rules';
export { integrationPosEntity } from './integration-pos';
export { integrationAtsEntity } from './integration-ats';
export { searchHistoryEntity } from './search-history';
export { importJobsEntity } from './import-jobs';
export { exportJobsEntity } from './export-jobs';
export { ssoProvidersEntity } from './sso-providers';
export { userSessionsEntity } from './user-sessions';

// All entities array
export const allEntities = [
  credentialsEntity,
  billsEntity,
  ordersEntity,
  ticketsEntity,
  sopsEntity,
  crewEntity,
  equipmentEntity,
  budgetsEntity,
  expensesEntity,
  proposalsEntity,
  purchaseOrdersEntity,
  peopleEntity,
  placesEntity,
  organizationsEntity,
  productionsEntity,
  eventsEntity,
  projectsEntity,
  invoicesEntity,
  vendorsEntity,
  contactsEntity,
  assetsEntity,
  tasksEntity,
  incidentsEntity,
  dealsEntity,
  quotesEntity,
  advancingEntity,
  beosEntity,
  availabilityEntity,
  venuesEntity,
  scheduleEntity,
  issuesEntity,
  maintenanceEntity,
  permitsEntity,
  deliveriesEntity,
  certificationsEntity,
  emergencyEntity,
  drawingsEntity,
  integrationsEntity,
  backgroundChecksEntity,
  buildStrikeEntity,
  photoDocumentationEntity,
  punchListEntity,
  qaCheckpointsEntity,
  riskRegisterEntity,
  runOfShowEntity,
  setTimesEntity,
  settlementEntity,
  showCallEntity,
  siteAccessEntity,
  siteSurveysEntity,
  skillsEntity,
  soundcheckEntity,
  specSheetsEntity,
  stageManagementEntity,
  subcontractorsEntity,
  techRehearsalEntity,
  templatesEntity,
  timekeepingEntity,
  travelEntity,
  troubleshootingEntity,
  vipManagementEntity,
  weatherContingencyEntity,
  searchEntity,
  accountOrdersEntity,
  accountTicketsEntity,
  rewardsTransactionsEntity,
  rewardsCatalogEntity,
  
  // New missing entities
  savedFiltersEntity,
  userPreferencesEntity,
  userSettingsEntity,
  userNotificationPreferencesEntity,
  workspacesEntity,
  apiKeysEntity,
  webhooksEntity,
  featureFlagsEntity,
  notificationsEntity,
  automationRulesEntity,
  integrationPosEntity,
  integrationAtsEntity,
  searchHistoryEntity,
  importJobsEntity,
  exportJobsEntity,
  ssoProvidersEntity,
  userSessionsEntity,
];

// Register all entities on module load
registerEntities(allEntities);

// Entity name constants for type-safe lookups
export const ENTITY_NAMES = {
  CREDENTIALS: 'credentials',
  BILLS: 'bills',
  ORDERS: 'orders',
  TICKETS: 'tickets',
  SOPS: 'sops',
  CREW: 'crew',
  EQUIPMENT: 'equipment',
  BUDGETS: 'budgets',
  EXPENSES: 'expenses',
  PROPOSALS: 'proposals',
  PURCHASE_ORDERS: 'purchase-orders',
  PEOPLE: 'people',
  PLACES: 'places',
  ORGANIZATIONS: 'organizations',
  PRODUCTIONS: 'productions',
  EVENTS: 'events',
  PROJECTS: 'projects',
  INVOICES: 'invoices',
  VENDORS: 'vendors',
  CONTACTS: 'contacts',
  ASSETS: 'assets',
  TASKS: 'tasks',
  INCIDENTS: 'incidents',
  DEALS: 'deals',
  QUOTES: 'quotes',
  ADVANCING: 'advancing',
  SCHEDULE: 'schedule',
  
  // New missing entities
  SAVED_FILTERS: 'saved-filters',
  USER_PREFERENCES: 'user-preferences',
  USER_SETTINGS: 'user-settings',
  USER_NOTIFICATION_PREFERENCES: 'user-notification-preferences',
  WORKSPACES: 'workspaces',
  API_KEYS: 'api-keys',
  WEBHOOKS: 'webhooks',
  FEATURE_FLAGS: 'feature-flags',
  NOTIFICATIONS: 'notifications',
  AUTOMATION_RULES: 'automation-rules',
  INTEGRATION_POS: 'integration-pos',
  INTEGRATION_ATS: 'integration-ats',
  SEARCH_HISTORY: 'search-history',
  IMPORT_JOBS: 'import-jobs',
  EXPORT_JOBS: 'export-jobs',
  SSO_PROVIDERS: 'sso-providers',
  USER_SESSIONS: 'user-sessions',
} as const;

export type EntityNameType = typeof ENTITY_NAMES[keyof typeof ENTITY_NAMES];
