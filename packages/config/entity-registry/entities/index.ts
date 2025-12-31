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
} as const;

export type EntityNameType = typeof ENTITY_NAMES[keyof typeof ENTITY_NAMES];
