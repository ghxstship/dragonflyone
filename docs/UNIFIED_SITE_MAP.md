# GHXSTSHIP Platform - Unified Site Map
**Version:** 4.0 (Verified Audit)  
**Last Updated:** 2025-12-29  
**Architecture:** Single Source of Truth, 3NF Normalized Database  
**Audit Date:** 2025-12-29 (Full Filesystem Scan)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Database Entity Mapping](#database-entity-mapping)
4. [ATLVS Application](#atlvs-application)
5. [COMPVSS Application](#compvss-application)
6. [GVTEWAY Application](#gvteway-application)
7. [Cross-App Workflows](#cross-app-workflows)
8. [Navigation Patterns](#navigation-patterns)
9. [Authentication & Authorization](#authentication--authorization)
10. [API Infrastructure](#api-infrastructure)
11. [Implementation Status](#implementation-status)

---

## Executive Summary

### Platform Statistics (Verified 2025-12-29)
| Metric | Value |
|--------|-------|
| **Total Applications** | 3 (ATLVS, COMPVSS, GVTEWAY) |
| **Total Pages (Verified)** | 295 |
| **Database Tables** | 180+ |
| **Database Migrations** | 37 |
| **API Routes** | 116 |
| **React Query Hooks** | 57 |
| **Shared UI Components** | 38 |

### Page Count Summary (Filesystem Audit 2025-12-29)
| App | Actual Pages | Status |
|-----|--------------|--------|
| ATLVS | 149 | ✅ Verified |
| COMPVSS | 75 | ✅ Verified |
| GVTEWAY | 71 | ✅ Verified |
| **Total** | **295** | **100% Audited** |

---

## Architecture Overview

### Design Principles

1. **Entity-Centric Navigation**
   - Each database entity has ONE primary page
   - No duplicate views of the same data
   - All pages map directly to database entities

2. **Unified Data Views**
   - **List View**: `/[entity]` - Filterable, searchable table
   - **Detail View**: `/[entity]/[id]` - Full entity with tabs for related data
   - **Create View**: `/[entity]/new` - Form for new entity
   - **Edit View**: `/[entity]/[id]/edit` - Form for editing

3. **Tab-Based Detail Views**
   - Related data shown as tabs within detail views, not separate routes
   - Reduces navigation complexity
   - Maintains context while exploring related data

4. **Role-Based Visibility**
   - Navigation items shown/hidden based on user roles
   - Platform roles: `super_admin`, `org_admin`, `finance_director`, `operations_manager`, `team_lead`, `team_member`, `viewer`
   - Event roles: `executive_producer`, `production_manager`, `finance_manager`, `marketing_manager`, `operations_lead`, `team_member`, `vendor`, `contractor`

5. **Context-Aware Navigation**
   - Platform-level navigation for organization-wide views
   - Production/Event-level navigation when in specific context
   - Clear visual distinction between contexts

---

## Database Entity Mapping

### Foundation Layer (0002_core_foundation.sql)
| Table | Primary Route | App | Type |
|-------|---------------|-----|------|
| `organizations` | `/settings/organization` | ATLVS | Settings |
| `platform_users` | `/admin/users` | ATLVS | Admin |
| `user_organizations` | (Managed via users) | - | - |
| `role_definitions` | `/admin/roles` | ATLVS | Admin |
| `user_roles` | (Managed via users) | - | - |

### Legend Layer (0003_legend_schema.sql)
| Table | Primary Route | App | Related Views |
|-------|---------------|-----|---------------|
| `legend_events` | `/events` | ATLVS | Schedule, Team, Budget, Documents |
| `legend_places` | `/places` | ATLVS | Capacity, Zones, Floor Plans |
| `legend_people` | `/people` | ATLVS | Contacts, Crew, Artists |
| `legend_organizations` | `/organizations` | ATLVS | Vendors, Clients, Partners |
| `legend_products` | `/products` | ATLVS | Inventory, Pricing |
| `legend_departments` | `/settings/departments` | ATLVS | - |
| `legend_teams` | `/teams` | ATLVS | Members, Assignments |
| `legend_documents` | `/documents` | ATLVS | - |
| `legend_tags` | `/settings/tags` | ATLVS | - |
| `legend_categories` | `/settings/categories` | ATLVS | - |

### Profile Extensions (0004-0005_legend_profiles.sql)
| Profile Table | Extends | View Location |
|---------------|---------|---------------|
| `people_profile_employee` | `legend_people` | `/people/[id]` → Employee Tab |
| `people_profile_crew` | `legend_people` | `/people/[id]` → Crew Tab |
| `people_profile_artist` | `legend_people` | `/people/[id]` → Artist Tab |
| `people_profile_contact` | `legend_people` | `/people/[id]` → Contact Tab |
| `orgs_profile_vendor` | `legend_organizations` | `/organizations/[id]` → Vendor Tab |
| `orgs_profile_client` | `legend_organizations` | `/organizations/[id]` → Client Tab |
| `orgs_profile_sponsor` | `legend_organizations` | `/organizations/[id]` → Sponsor Tab |
| `places_profile_venue` | `legend_places` | `/places/[id]` → Venue Tab |
| `places_profile_warehouse` | `legend_places` | `/places/[id]` → Warehouse Tab |
| `products_profile_ticket` | `legend_products` | `/products/[id]` → Ticket Tab |
| `products_profile_service` | `legend_products` | `/products/[id]` → Service Tab |

### Saga Layer (0006_saga_schema.sql)
| Table | Primary Route | Related Views |
|-------|---------------|---------------|
| `saga_templates` | `/workflows/templates` | Steps, Transitions |
| `saga_instances` | `/workflows` | Progress, Participants |
| `saga_steps` | (Within workflow detail) | - |

### Chronicle Layer (0007_chronicle_schema.sql)
| Table | Primary Route | Related Views |
|-------|---------------|---------------|
| `chronicle_entries` | `/activity` | Timeline, Filters |
| `chronicle_daily_aggregates` | `/analytics/activity` | - |

### Finance Layer (0011_operational_finance.sql)
| Table | Primary Route | App | Related Views |
|-------|---------------|-----|---------------|
| `deals` | `/deals` | ATLVS | Pipeline, Stages |
| `proposals` | `/proposals` | ATLVS | Line Items, Versions |
| `quotes` | `/quotes` | ATLVS | - |
| `orders` | `/orders` | ATLVS/GVTEWAY | Items, Fulfillment |
| `bills` | `/bills` | ATLVS | Payments |
| `finance_expenses` | `/expenses` | ATLVS | Categories, Approvals |
| `finance_purchase_orders` | `/purchase-orders` | ATLVS | Items, Receiving |
| `budgets` | `/budgets` | ATLVS | Line Items, Actuals |
| `ledger_accounts` | `/finance/accounts` | ATLVS | - |
| `ledger_entries` | `/finance/ledger` | ATLVS | - |
| `assets` | `/assets` | ATLVS | Maintenance, Tracking |
| `projects` | `/projects` | ATLVS | Budget, Team, Timeline |

### Workforce Layer (0012_operational_workforce.sql)
| Table | Primary Route | App | Related Views |
|-------|---------------|-----|---------------|
| `workforce_employees` | `/workforce` | ATLVS | Roles, Shifts, Time |
| `workforce_shifts` | `/schedule/shifts` | ATLVS | Assignments |
| `workforce_time_entries` | `/timesheets` | ATLVS/COMPVSS | - |
| `workforce_certifications` | `/certifications` | COMPVSS | - |
| `training_courses` | `/training` | ATLVS/COMPVSS | Modules, Enrollments |
| `background_checks` | `/compliance/background-checks` | COMPVSS | - |

### Production Layer (0019, 0027-0028)
| Table | Primary Route | App | Related Views |
|-------|---------------|-----|---------------|
| `production_advances` | `/advancing` | ATLVS/COMPVSS | Items, History |
| `production_schedules` | `/schedule` | COMPVSS | Tasks, Dependencies |
| `run_of_show` | `/run-of-show` | COMPVSS | Cues |
| `show_calls` | `/show-calls` | COMPVSS | Responses |
| `incidents` | `/incidents` | COMPVSS | Updates |
| `settlements` | `/settlements` | COMPVSS | Line Items |

### Consumer Layer (0029, 0032)
| Table | Primary Route | App | Related Views |
|-------|---------------|-----|---------------|
| `access_passes` | `/tickets` | GVTEWAY | - |
| `orders` (consumer) | `/orders` | GVTEWAY | Items |
| `memberships` | `/memberships` | GVTEWAY | Benefits |
| `loyalty_accounts` | `/rewards` | GVTEWAY | Transactions |
| `reviews` | `/reviews` | GVTEWAY | - |
| `wishlists` | `/wishlist` | GVTEWAY | - |
| `collections` | `/collections` | GVTEWAY | Items |
| `social_groups` | `/groups` | GVTEWAY | Members |
| `watch_parties` | `/watch-parties` | GVTEWAY | Participants |

---

## ATLVS Application

**Purpose:** Business Management Platform (B2B)  
**Target Users:** Internal staff, finance team, procurement, HR, executives  
**Total Pages:** 149 (verified via filesystem audit 2025-12-28)

### Platform-Level Routes

#### Dashboard & Analytics
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/dashboard` | Platform overview with KPIs | Stats cards, charts, activity feed | `useAnalytics` | ✅ Complete |
| `/analytics` | Analytics hub | Dashboard builder, reports | `useAnalytics` | ✅ Complete |
| `/reports` | Report builder | Report templates, export | `useReports` | ✅ Complete |

#### People Module (Unified)
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/people` | All people (contacts, employees, crew, artists) | Filterable table, type filters | `usePeopleQuery` | ✅ Complete |
| `/people/[id]` | Person detail with profile tabs | Tabs: Overview, Contact, Employment, Crew, Artist, Documents, Timeline | `usePersonQuery` | ✅ Complete |
| `/people/new` | Create person | Form with type selection | `useCreatePerson` | ✅ Complete |
| `/people/[id]/edit` | Edit person | Pre-filled form | `useUpdatePerson` | ✅ Complete |

**Filters Available:**
- Type: Contact, Employee, Crew, Artist, Lead
- Status: Active, Inactive, Pending
- Department, Team, Skills

#### Organizations Module (Unified)
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/organizations` | All orgs (vendors, clients, partners, sponsors) | Filterable table, type filters | `useOrganizationsQuery` | ✅ Complete |
| `/organizations/[id]` | Org detail with type tabs | Tabs: Overview, Contacts, Contracts, Orders, Performance, Documents | `useOrganizationQuery` | ✅ Complete |
| `/organizations/new` | Create organization | Form with type selection | `useCreateOrganization` | ✅ Complete |
| `/organizations/[id]/edit` | Edit organization | Pre-filled form | `useUpdateOrganization` | ✅ Complete |

**Filters Available:**
- Type: Vendor, Client, Partner, Sponsor, Agency
- Status: Active, Inactive, Preferred
- Industry, Location

#### Events Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/events` | All events (bookings, productions, shows) | Calendar view, list view, filters | `useEventsQuery` | ✅ Complete |
| `/events/[id]` | Event detail with tabs | Tabs: Overview, Schedule, Team, Budget, Documents, Vendors, Advancing, Wrap | `useEventQuery` | ✅ Complete |
| `/events/new` | Create event | Multi-step wizard | `useCreateEvent` | ✅ Complete |
| `/events/[id]/edit` | Edit event | Pre-filled form | `useUpdateEvent` | ✅ Complete |
| `/calendar` | Calendar view | Month/week/day views, drag-drop | `useCalendar` | ✅ Complete |

#### Places Module (Unified)
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/places` | All places (venues, spaces, warehouses) | Map view, list view, filters | `usePlacesQuery` | ✅ Complete |
| `/places/[id]` | Place detail with tabs | Tabs: Overview, Capacity, Zones, Floor Plans, Availability | `usePlaceQuery` | ✅ Complete |
| `/places/new` | Create place | Form with type selection | `useCreatePlace` | ✅ Complete |
| `/places/[id]/edit` | Edit place | Pre-filled form | `useUpdatePlace` | ✅ Complete |

#### Finance Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/finance` | Finance dashboard | Revenue charts, AR/AP summary, cash flow | `useFinance` | ✅ Complete |
| `/deals` | Sales pipeline | Kanban board, pipeline stages | `useDeals` | ✅ Complete |
| `/deals/[id]` | Deal detail | Timeline, activities, proposals | `useDealQuery` | ✅ Complete |
| `/proposals` | Proposals list | Status filters, templates | `useProposals` | Pending |
| `/proposals/[id]` | Proposal detail | Line items, versions, send | `useProposalQuery` | Pending |
| `/invoices` | Invoices list | Status filters, aging | `useInvoices` | Pending |
| `/invoices/[id]` | Invoice detail | Line items, payments, send | `useInvoiceQuery` | Pending |
| `/expenses` | Expenses list | Categories, approvals | `useExpenses` | Pending |
| `/budgets` | Budgets list | Categories, actuals vs planned | `useBudgets` | Pending |
| `/budgets/[id]` | Budget detail | Line items, variance analysis | `useBudgetQuery` | Pending |
| `/purchase-orders` | PO list | Status, approvals | `usePurchaseOrders` | Pending |
| `/bills` | Bills (vendor invoices) | Status, payments | `useBills` | Pending |

#### Assets Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/assets` | All assets (inventory, equipment) | Categories, location tracking | `useAssets` | ✅ Complete |
| `/assets/[id]` | Asset detail with tabs | Tabs: Overview, Maintenance, History, Documents | `useAssetQuery` | ✅ Complete |
| `/assets/new` | Create asset | Form with category selection | `useCreateAsset` | ✅ Complete |
| `/assets/scan` | Barcode scanner | Camera, QR/barcode reader | `useAssetScan` | ✅ Complete |
| `/assets/maintenance` | Maintenance schedule | Calendar, alerts | `useMaintenance` | ✅ Complete |

#### Documents Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/documents` | All documents (contracts, templates, BEOs) | Type filters, search | `useDocuments` | Pending |
| `/documents/[id]` | Document detail | Preview, versions, signatures | `useDocumentQuery` | Pending |
| `/documents/new` | Create document | Template selection, editor | `useCreateDocument` | Pending |
| `/templates` | Template library | Categories, preview | `useTemplates` | Pending |

#### Projects Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/projects` | All projects | Status filters, timeline | `useProjects` | ✅ Complete |
| `/projects/[id]` | Project detail with tabs | Tabs: Overview, Budget, Team, Timeline, Documents, Expenses | `useProjectQuery` | ✅ Complete |
| `/projects/new` | Create project | Multi-step wizard | `useCreateProject` | ✅ Complete |
| `/projects/[id]/edit` | Edit project | Pre-filled form | `useUpdateProject` | ✅ Complete |

#### Workforce Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/workforce` | Employee management | Directory, org chart | `useWorkforce` | ✅ Complete |
| `/workforce/[id]` | Employee detail | Profile, assignments, time | `useEmployeeQuery` | ✅ Complete |
| `/timesheets` | Time tracking | Calendar, entries | `useTimesheets` | ✅ Complete |
| `/training` | Training management | Courses, enrollments | `useTraining` | ✅ Complete |
| `/compliance` | Compliance & certifications | Tracking, alerts | `useCompliance` | ✅ Complete |

#### Settings Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/settings` | Settings hub | Navigation to sub-settings | - | ✅ Complete |
| `/settings/organization` | Organization settings | Branding, info | `useOrganizationSettings` | ✅ Complete |
| `/settings/team` | Team management | Members, invites | `useTeamSettings` | ✅ Complete |
| `/settings/integrations` | Integrations | Connected apps, API | `useIntegrations` | ✅ Complete |
| `/settings/billing` | Billing | Plans, invoices | `useBilling` | ✅ Complete |
| `/settings/security` | Security | 2FA, sessions | `useSecurity` | ✅ Complete |
| `/settings/roles` | Role management | Permissions matrix | `useRoles` | ✅ Complete |
| `/settings/notifications` | Notification preferences | Channels, frequency | `useNotificationSettings` | ✅ Complete |

#### Admin Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/admin/users` | User management | Directory, roles | `useAdminUsers` | ✅ Complete |
| `/admin/roles` | Role management | Permissions | `useAdminRoles` | ✅ Complete |
| `/admin/audit` | Audit logs | Timeline, filters | `useAuditLogs` | ✅ Complete |
| `/admin/batch-operations` | Batch operations | Import, export, bulk actions | `useBatchOperations` | ✅ Complete |

### Production Context Routes (`/p/[productionId]/`)

When a production is selected, navigation switches to production context:

| Route | Description | UI Elements | Tabs |
|-------|-------------|-------------|------|
| `/p/[id]/overview` | Production dashboard | KPIs, timeline, alerts | - |
| `/p/[id]/schedule` | Schedule management | Timeline, tasks | Tasks, Contingencies, Templates |
| `/p/[id]/team` | Team management | Assignments, availability | Assignments, Training |
| `/p/[id]/advancing` | Advancing management | Requests, allocations | Allocations, Fulfillment, History |
| `/p/[id]/vendors` | Vendor management | Directory, contracts | - |
| `/p/[id]/documents` | Documents | Contracts, permits | Contracts, Permits, Insurance |
| `/p/[id]/shows` | Shows management | Run of show, cues | Run-of-Show, Cues, Set Times |
| `/p/[id]/wrap` | Wrap & settlement | Checklist, reconciliation | - |
| `/p/[id]/settings` | Production settings | Details, permissions | - |

### Portal Routes
| Route | Description | Target Users |
|-------|-------------|--------------|
| `/portal/artist` | Artist self-service | Artists |
| `/portal/crew` | Crew self-service | Crew members |
| `/portal/investor` | Investor dashboard | Investors |
| `/portal/sponsor` | Sponsor dashboard | Sponsors |
| `/portal/vendor` | Vendor self-service | Vendors |

### Public/Marketing Pages
| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page | ✅ Complete |
| `/about` | About us | ✅ Complete |
| `/pricing` | Pricing (7-tier BYO model) | ✅ Complete |
| `/products` | Products overview | ✅ Complete |
| `/products/atlvs` | ATLVS product page | ✅ Complete |
| `/products/compvss` | COMPVSS product page | ✅ Complete |
| `/products/gvteway` | GVTEWAY product page | ✅ Complete |
| `/products/compare` | Product comparison | ✅ Complete |
| `/solutions` | Solutions by role | ✅ Complete |
| `/solutions/[slug]` | Solution detail | ✅ Complete |
| `/features` | Features overview | ✅ Complete |
| `/demo` | Request demo | ✅ Complete |
| `/contact` | Contact us | ✅ Complete |
| `/blog` | Blog | ✅ Complete |
| `/careers` | Careers | ✅ Complete |
| `/case-studies` | Case studies | ✅ Complete |
| `/partners` | Partners | ✅ Complete |
| `/press` | Press | ✅ Complete |
| `/security` | Security | ✅ Complete |
| `/status` | Status page | ✅ Complete |
| `/changelog` | Changelog | ✅ Complete |
| `/help` | Help center | ✅ Complete |
| `/docs/api` | API documentation | ✅ Complete |
| `/legal/privacy` | Privacy policy | ✅ Complete |
| `/legal/terms` | Terms of service | ✅ Complete |
| `/legal/cookies` | Cookie policy | ✅ Complete |
| `/legal/accessibility` | Accessibility | ✅ Complete |

---

## COMPVSS Application

**Purpose:** Production Operations Platform (B2B)  
**Target Users:** Production crew, technical directors, project managers, stage managers  
**Total Pages:** 75 (verified via filesystem audit 2025-12-28)

### Platform-Level Routes

#### Dashboard & My Workspace
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/dashboard` | Production overview | Active productions, assignments | `useDashboard` | ✅ Complete |
| `/notifications` | Notifications | Alerts, messages | `useNotifications` | ✅ Complete |

#### Crew Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/crew` | Crew directory with filters | Searchable table, skills matrix | `useCrew` | ✅ Complete |
| `/crew/[id]` | Crew member detail | Profile, certifications, history | `useCrewMember` | ✅ Complete |
| `/availability` | Availability management | Calendar, conflicts | `useAvailability` | ✅ Complete |
| `/certifications` | Certifications & training | Tracking, expiry alerts | `useCertifications` | ✅ Complete |

#### Operations Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/schedule` | Master schedule | Calendar, timeline | `useSchedule` | ✅ Complete |
| `/run-of-show` | Run of show | Cue list, timeline | `useRunOfShow` | ✅ Complete |
| `/advancing` | Advancing management | Requests, catalog | `useAdvancing` | ✅ Complete |
| `/advancing/catalog` | Global catalog browser | Categories, search | `useAdvancingCatalog` | ✅ Complete |
| `/advancing/new` | Create advance request | Form, catalog selection | `useCreateAdvance` | ✅ Complete |

#### Logistics Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/equipment` | Equipment tracking | Inventory, location | `useEquipment` | ✅ Complete |
| `/deliveries` | Deliveries | Tracking, scheduling | `useDeliveries` | ✅ Complete |
| `/weather` | Weather monitoring | Forecasts, alerts | `useWeather` | ✅ Complete |

#### Documentation Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/beos` | BEOs (Banquet Event Orders) | List, templates | `useBEOs` | ✅ Complete |
| `/beos/[id]` | BEO detail | Sections, items | `useBEOQuery` | ✅ Complete |
| `/beos/new` | Create BEO | Template selection, form | `useCreateBEO` | ✅ Complete |

#### Safety Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/safety` | Safety dashboard | Metrics, alerts | `useSafety` | ✅ Complete |
| `/incidents` | Incident management | Reports, tracking | `useIncidents` | Pending |
| `/incidents/[id]` | Incident detail | Timeline, actions | `useIncidentQuery` | Pending |
| `/emergency` | Emergency procedures | Plans, contacts | `useEmergency` | ✅ Complete |

#### Settings Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/settings` | Settings hub | Navigation | - | ✅ Complete |
| `/profile` | Profile | Personal info, preferences | `useProfile` | ✅ Complete |
| `/integrations` | Integrations | Connected apps | `useIntegrations` | ✅ Complete |

### Production Context Routes (`/p/[productionId]/`)

| Route | Description | UI Elements | Tabs |
|-------|-------------|-------------|------|
| `/p/[id]/overview` | Production dashboard | KPIs, timeline | - |
| `/p/[id]/schedule` | Schedule | Timeline, tasks | Run-of-Show, Build-Strike, Set Times |
| `/p/[id]/crew` | Crew assignments | Directory, roles | Assignments, Timekeeping |
| `/p/[id]/advancing` | Advancing | Requests, status | - |
| `/p/[id]/vendors` | Vendors | Directory, orders | - |
| `/p/[id]/documents` | Documents | SOPs, specs | SOPs, Specs, Files |
| `/p/[id]/safety` | Safety | Incidents, plans | Incidents, Emergency |
| `/p/[id]/settlement` | Settlement & wrap | Reconciliation | - |
| `/p/[id]/wrap` | Wrap checklist | Tasks, sign-offs | - |
| `/p/[id]/settings` | Production settings | Details, team | - |

---

## GVTEWAY Application

**Purpose:** Fan Experience Platform (B2C)  
**Target Users:** Event attendees, customers, community members  
**Total Pages:** 71 (verified via filesystem audit 2025-12-28)

### Consumer Routes

#### Home & Discovery
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/` | Landing/discover | Featured events, search | `useDiscover` | ✅ Complete |
| `/dashboard` | User dashboard | Upcoming events, orders | `useDashboard` | ✅ Complete |
| `/browse` | Browse events | Filters, categories | `useBrowse` | ✅ Complete |
| `/search` | Search | Universal search | `useSearch` | ✅ Complete |
| `/calendar` | Event calendar | Month/week views | `useCalendar` | ✅ Complete |

#### Events Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/events` | Events list | Filters, map view | `useEvents` | ✅ Complete |
| `/events/[id]` | Event detail | Info, tickets, lineup | `useEventQuery` | ✅ Complete |

#### Tickets Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/tickets` | My tickets | List, QR codes | `useTickets` | ✅ Complete |

#### Account Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/account` | Account dashboard | Overview, quick actions | `useAccount` | ✅ Complete |
| `/account/tickets` | My tickets | List, transfers | `useAccountTickets` | ✅ Complete |
| `/orders` | My orders | History, details | `useOrders` | ✅ Complete |
| `/orders/[id]` | Order detail | Items, status | `useOrderQuery` | ✅ Complete |
| `/wallet` | Wallet & payments | Cards, balance | `useWallet` | Pending |
| `/rewards` | Rewards & loyalty | Points, tiers | `useRewards` | ✅ Complete |
| `/profile` | Profile settings | Personal info | `useProfile` | ✅ Complete |
| `/settings` | Settings | Preferences, privacy | `useSettings` | ✅ Complete |

#### Shop Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/cart` | Shopping cart | Items, totals | `useCart` | Pending |
| `/checkout` | Checkout flow | Payment, confirmation | `useCheckout` | Pending |
| `/merch` | Merchandise | Products, categories | `useMerch` | Pending |
| `/gift-cards` | Gift cards | Purchase, redeem | `useGiftCards` | Pending |

#### Community Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/community` | Community hub | Groups, forums, reviews | `useCommunity` | Pending |
| `/groups` | Groups | List, join | `useGroups` | Pending |
| `/groups/[id]` | Group detail | Members, posts | `useGroupQuery` | Pending |
| `/friends` | Friends | List, requests | `useFriends` | Pending |
| `/reviews` | Reviews | List, write | `useReviews` | Pending |
| `/watch-parties` | Watch parties | List, create | `useWatchParties` | Pending |
| `/messages` | Messages | Inbox, compose | `useMessages` | Pending |

#### Venues Module
| Route | Description | UI Elements | Hooks | Status |
|-------|-------------|-------------|-------|--------|
| `/venues` | Venues list | Map, filters | `useVenues` | ✅ Complete |
| `/venues/[id]` | Venue detail | Info, events | `useVenueQuery` | ✅ Complete |

### Event Experience Routes (`/e/[eventId]/`)

| Route | Description | UI Elements | Tabs |
|-------|-------------|-------------|------|
| `/e/[id]/tickets` | Ticketing | Purchase, seating | Seating, Waitlist |
| `/e/[id]/map` | Venue map | Floor plan, navigation | Navigate, Parking, Accessibility |
| `/e/[id]/engage` | Engagement | Social wall, activities | Chat, Polls, Q&A, Photos |
| `/e/[id]/services` | Services | Food, merch, VIP | Support, Lost-Found, Emergency |
| `/e/[id]/photos` | Photos | Photo booth, galleries | - |
| `/e/[id]/chat` | Chat | Event chat, groups | - |

### Admin Routes (`/admin/`)

| Route | Description | UI Elements | Status |
|-------|-------------|-------------|--------|
| `/admin` | Admin dashboard | Overview, metrics | Pending |
| `/admin/events` | Event management | CRUD, settings | Pending |
| `/admin/ticketing` | Ticketing admin | Pricing, inventory | Pending |
| `/admin/marketing` | Marketing | Promos, email, SMS | Pending |
| `/admin/analytics` | Analytics & reporting | Dashboards, exports | Pending |
| `/admin/moderation` | Content moderation | Reviews, reports | Pending |
| `/admin/pos` | Point of sale | Transactions | Pending |

---

## Cross-App Workflows

### Advancing System (COMPVSS ↔ ATLVS)

The Advancing module is a unified cross-app workflow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ADVANCING WORKFLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COMPVSS (Submit)              ATLVS (Process)           COMPVSS (Fulfill)  │
│  ─────────────────             ──────────────            ─────────────────  │
│                                                                             │
│  1. Create Advance Request     3. Review Request         6. Receive Items   │
│     - Select from Catalog      4. Approve/Deny/Modify    7. Confirm Receipt │
│     - Specify quantities       5. Allocate Resources     8. Deploy to Event │
│     - Set delivery details        - From inventory       9. Return/Reconcile│
│  2. Submit for Approval           - From rentals                            │
│                                   - From procurement                        │
│                                                                             │
│  CATALOG SOURCES:                                                           │
│  ├── Global Asset Inventory (owned equipment)                               │
│  ├── Rental Catalog (preferred vendors)                                     │
│  ├── Procurement Items (purchasable goods)                                  │
│  └── Service Catalog (labor, services)                                      │
│                                                                             │
│  ADVANCE TYPES:                                                             │
│  ├── Production Advances (staging, lighting, audio, video)                  │
│  ├── Artist Advances (hospitality, technical riders)                        │
│  ├── Crew Advances (equipment, supplies, per diems)                         │
│  └── Venue Advances (site-specific requirements)                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Deal-to-Project Handoff (ATLVS)

When a deal closes in ATLVS, it automatically creates a project:
1. Deal reaches "Closed Won" stage
2. Project is created with scope from proposal
3. Budget is initialized from deal value
4. Team assignments are suggested based on deal contacts

### Project-to-Event Flow (ATLVS → COMPVSS)

When a project becomes a production:
1. Production is created in COMPVSS
2. Schedule is initialized from project timeline
3. Crew assignments are suggested
4. Advancing requests can be submitted

### Ticket-Revenue Sync (GVTEWAY → ATLVS)

Ticket sales flow to financial reporting:
1. Tickets sold in GVTEWAY
2. Revenue recorded in ATLVS ledger
3. Reconciliation runs daily
4. Payouts tracked in ATLVS

---

## Navigation Patterns

### Smart Sidebar
- Collapsible sections
- Role-based visibility
- Recent items
- Favorites/pinned
- Context-aware (production mode)

### Entity Detail Tabs
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="schedule">Schedule</TabsTrigger>
    <TabsTrigger value="team">Team</TabsTrigger>
    <TabsTrigger value="budget">Budget</TabsTrigger>
    <TabsTrigger value="documents">Documents</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
</Tabs>
```

### Quick Actions
Floating action button with context-aware actions:
- Create new entity
- Quick search
- Recent items
- Notifications

### Breadcrumbs
Always show navigation path:
`Dashboard > Events > Summer Festival 2025 > Schedule`

### Command Palette (⌘K)
Global search and navigation:
- Search all entities
- Quick actions
- Recent pages
- Keyboard shortcuts

---

## Authentication & Authorization

### Authentication Routes (All Apps)
| Route | Description |
|-------|-------------|
| `/auth/signin` | Sign in |
| `/auth/signup` | Sign up |
| `/auth/forgot-password` | Password recovery |
| `/auth/reset-password` | Password reset |
| `/auth/magic-link` | Magic link auth |
| `/auth/verify-email` | Email verification |

### Platform Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| `super_admin` | Full platform access | All features |
| `org_admin` | Organization admin | Org settings, users |
| `finance_director` | Finance access | Finance, budgets, reports |
| `operations_manager` | Operations access | Projects, events, assets |
| `team_lead` | Team management | Team, assignments |
| `team_member` | Standard access | Assigned areas |
| `viewer` | Read-only access | View only |

### Event Roles
| Role | Description | Access Level |
|------|-------------|--------------|
| `executive_producer` | Full event access | All event features |
| `production_manager` | Production management | Schedule, team, budget |
| `finance_manager` | Event finance | Budget, expenses |
| `marketing_manager` | Marketing | Campaigns, promos |
| `operations_lead` | Operations | Logistics, vendors |
| `team_member` | Standard access | Assigned tasks |
| `vendor` | Vendor access | Vendor portal |
| `contractor` | Contractor access | Limited access |

---

## API Infrastructure

### API Route Structure
All API routes follow the pattern: `/api/[entity]/[action]`

| Endpoint Pattern | Methods | Description |
|------------------|---------|-------------|
| `/api/[entity]` | GET, POST | List/Create |
| `/api/[entity]/[id]` | GET, PUT, DELETE | Read/Update/Delete |
| `/api/[entity]/[id]/[relation]` | GET, POST | Related entities |
| `/api/[entity]/batch` | POST | Batch operations |
| `/api/[entity]/search` | POST | Advanced search |

### API Statistics
| App | API Routes | Hooks |
|-----|------------|-------|
| ATLVS | 44 | 22 |
| COMPVSS | 31 | 20 |
| GVTEWAY | 41 | 15 |
| **Total** | **116** | **57** |

### Supabase Edge Functions
1. `automation-actions` - Workflow automation
2. `automation-triggers` - Event-driven triggers
3. `broadcast-updates` - Real-time notifications
4. `cache-warmer` - Performance optimization
5. `cleanup-jobs` - Data maintenance
6. `deal-project-handoff` - Cross-app workflows
7. `email-notifications` - User communications
8. `file-upload` - Asset management
9. `health-check` - System monitoring
10. `webhook-gvteway` - Marketplace webhooks
11. `webhook-stripe` - Payment processing
12. `webhook-twilio` - SMS notifications
13. `advance-notifications` - Advancing alerts

---

## Implementation Status

### Overall Progress
| Category | Progress | Status |
|----------|----------|--------|
| **Phase 1: Foundation** | 100% | ✅ Complete |
| **Phase 2: Core Applications** | 95% | ✅ Near Complete |
| **Phase 3: Integration & Polish** | 90% | ✅ Advanced |
| **Phase 4: Deployment** | 40% | 🟡 In Progress |

### Backend Infrastructure: 99% Complete
- ✅ 92 pages structured across 3 apps
- ✅ 116 API routes implemented with full CRUD
- ✅ 57 custom hooks with complete operations
- ✅ 38 shared UI components
- ✅ 33 database migrations
- ✅ 13 Supabase Edge Functions
- ✅ Authentication & authorization system
- ✅ Row-level security policies
- ✅ Real-time subscriptions configured
- ✅ Stripe payment processing complete

### Page Consolidation: 100% Complete
- ✅ ATLVS: 438 → ~120 pages (72% reduction)
- ✅ COMPVSS: 177 → ~80 pages (55% reduction)
- ✅ GVTEWAY: 223 → ~90 pages (60% reduction)
- ✅ Navigation updated across all apps
- ✅ Stale routes removed

### Key Consolidations Applied
| Old Routes | New Route | Filter |
|------------|-----------|--------|
| `/contacts`, `/clients`, `/leads`, `/employees`, `/crew` | `/people` | `type` |
| `/vendors`, `/preferred-vendors`, `/partners`, `/sponsors` | `/organizations` | `type` |
| `/spaces`, `/venues`, `/locations`, `/warehouses` | `/places` | `type` |
| `/inventory`, `/assets`, `/equipment` | `/assets` | `category` |
| `/bookings`, `/holds`, `/reservations`, `/productions` | `/events` | `type`, `status` |

---

## Related Documents

| Document | Purpose | Location |
|----------|---------|----------|
| FULL_STACK_AUDIT_TRACKER.md | 6-layer validation tracking | `/docs/` |
| PAGE_CONSOLIDATION_PLAN.md | Detailed consolidation checklist | `/docs/` |
| NAVIGATION_ARCHITECTURE.md | Navigation design spec | `/docs/architecture/` |
| Database Migrations | Schema source of truth | `/supabase/migrations/` |

---

## Changelog

### v3.0 (2025-12-28)
- Consolidated all site map documents into unified reference
- Added full stack details (routes, hooks, UI elements, status)
- Updated navigation to reflect consolidation
- Removed stale routes from all apps
- Added cross-app workflow documentation

### v2.0 (2025-12-27)
- Implemented 3NF-aligned page consolidation
- Reduced total pages from 838 to ~290 (65% reduction)
- Added tab-based detail views
- Updated production/event context routes

### v1.0 (2024-11-24)
- Initial site map creation
- Basic route structure
