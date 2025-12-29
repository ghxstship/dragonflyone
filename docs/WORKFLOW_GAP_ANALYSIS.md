# Workflow Gap Analysis & Implementation Plan
**Version:** 1.0  
**Date:** 2025-12-28  
**Architecture:** 3NF Normalized Single Source of Truth

---

## Executive Summary

This document identifies workflow gaps across all user roles (platform, organization, and event levels) and proposes a prioritized implementation plan while maintaining the 3NF normalized database architecture.

### Gap Summary by Priority

| Priority | Category | Gaps | Effort |
|----------|----------|------|--------|
| **P0 - Critical** | Core Business Workflows | 8 | High |
| **P1 - High** | User Role Completeness | 12 | Medium |
| **P2 - Medium** | Enhanced Features | 15 | Medium |
| **P3 - Low** | Nice-to-Have | 10 | Low |

---

## Gap Analysis by User Role

### Platform-Level Roles (ATLVS)

#### Super Admin
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| User Management | ✅ Complete | - | - |
| Role Management | ✅ Complete | - | - |
| Audit Logs | ✅ Complete | - | - |
| Batch Operations | ✅ Complete | - | - |
| System Settings | ✅ Complete | - | - |

#### Org Admin
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Organization Settings | ✅ Complete | - | - |
| Team Management | ✅ Complete | - | - |
| Billing Management | ✅ Complete | - | - |
| Integration Setup | ✅ Complete | - | - |

#### Finance Director
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Finance Dashboard | ✅ Complete | - | - |
| Deals Pipeline | ✅ Complete | - | - |
| **Proposals** | Page exists, needs full CRUD | Full workflow with templates, versioning, e-signature | **P0** |
| **Invoices** | Page exists, needs full CRUD | AR aging, payment tracking, reminders | **P0** |
| **Expenses** | Missing | Expense submission, approval workflow, categories | **P0** |
| **Budgets** | Page exists, needs full CRUD | Budget vs actuals, variance analysis, forecasting | **P1** |
| **Purchase Orders** | Missing | PO creation, approval workflow, receiving | **P1** |
| **Bills (AP)** | Page exists, needs full CRUD | Vendor invoice tracking, payment scheduling | **P1** |

#### Operations Manager
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Events Management | ✅ Complete | - | - |
| Projects Management | ✅ Complete | - | - |
| Assets Management | ✅ Complete | - | - |
| **Documents** | Missing | Document library, templates, version control | **P1** |
| **Workflows/Sagas** | Page exists, needs implementation | Workflow builder, automation rules | **P2** |

#### Team Lead
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Team View | ✅ Complete | - | - |
| Assignments | ✅ Complete | - | - |
| **Timesheets Approval** | Missing | Approve team timesheets, overtime tracking | **P1** |

---

### Organization-Level Roles (ATLVS)

#### People Module
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| People List | ✅ Complete | - | - |
| Person Detail | ✅ Complete | - | - |
| Create Person | ✅ Complete | - | - |
| **Person Edit** | Missing page | `/people/[id]/edit` route needed | **P0** |

#### Organizations Module
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Organizations List | ✅ Complete | - | - |
| Organization Detail | ✅ Complete | - | - |
| **Organization Create** | Missing page | `/organizations/new` route needed | **P0** |
| **Organization Edit** | Missing page | `/organizations/[id]/edit` route needed | **P0** |

#### Places Module
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Places List | ✅ Complete | - | - |
| Place Detail | ✅ Complete | - | - |
| **Place Create** | Missing page | `/places/new` route needed | **P0** |
| **Place Edit** | Missing page | `/places/[id]/edit` route needed | **P0** |

#### Events Module
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Events List | ✅ Complete | - | - |
| **Event Detail** | Missing page | `/events/[id]` with tabs needed | **P0** |
| **Event Create** | Missing page | `/events/new` route needed | **P0** |
| **Event Edit** | Missing page | `/events/[id]/edit` route needed | **P0** |
| Calendar View | Missing | `/calendar` route needed | **P1** |

---

### Event-Level Roles (Production Context)

#### Executive Producer (ATLVS `/p/[id]/`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Production Overview | ✅ Complete | - | - |
| Schedule Management | ✅ Complete | - | - |
| Team Management | ✅ Complete | - | - |
| Advancing | ✅ Complete | - | - |
| Vendors | ✅ Complete | - | - |
| Documents | ✅ Complete | - | - |
| Shows | ✅ Complete | - | - |
| Wrap | ✅ Complete | - | - |
| **Budget Tab** | Missing in production context | Production-specific budget view | **P1** |

#### Production Manager (COMPVSS `/p/[id]/`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Production Overview | ✅ Complete | - | - |
| Schedule | ✅ Complete | - | - |
| Crew Assignments | ✅ Complete | - | - |
| Advancing | ✅ Complete | - | - |
| Vendors | ✅ Complete | - | - |
| Documents | ✅ Complete | - | - |
| Safety | ✅ Complete | - | - |
| Settlement | ✅ Complete | - | - |
| Wrap | ✅ Complete | - | - |

#### Crew Member (COMPVSS)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Dashboard | ✅ Complete | - | - |
| Crew Directory | ✅ Complete | - | - |
| Availability | ✅ Complete | - | - |
| Certifications | ✅ Complete | - | - |
| Schedule | ✅ Complete | - | - |
| **Crew Detail** | Missing page | `/crew/[id]` route needed | **P1** |
| **My Profile** | ✅ Complete | - | - |

---

### Consumer Roles (GVTEWAY)

#### Event Attendee
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Browse Events | ✅ Complete | - | - |
| Event Detail | ✅ Complete | - | - |
| Tickets | ✅ Complete | - | - |
| Account | ✅ Complete | - | - |
| Orders | ✅ Complete | - | - |
| **Wallet** | Missing | Payment methods, balance management | **P2** |
| **Cart** | Page exists, needs full implementation | Shopping cart with persistence | **P1** |
| **Checkout** | Page exists, needs full implementation | Payment flow, confirmation | **P1** |

#### Community Member
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| **Community Hub** | Page exists, needs implementation | Groups, forums, activity feed | **P2** |
| **Groups** | Page exists, needs implementation | Create, join, manage groups | **P2** |
| **Friends** | Page exists, needs implementation | Friend requests, connections | **P2** |
| **Reviews** | Page exists, needs implementation | Write, read, moderate reviews | **P2** |
| **Watch Parties** | Page exists, needs implementation | Create, join virtual events | **P3** |
| **Messages** | Page exists, needs implementation | Direct messaging, inbox | **P2** |

#### Event Admin (GVTEWAY `/admin/`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| **Admin Dashboard** | Missing | Overview, metrics, quick actions | **P1** |
| **Event Management** | Missing | CRUD for events | **P1** |
| **Ticketing Admin** | Missing | Pricing, inventory, sales | **P1** |
| **Marketing** | Missing | Promos, email, SMS campaigns | **P2** |
| **Analytics** | Missing | Sales reports, attendance | **P2** |
| Moderation | ✅ Complete | - | - |
| POS | ✅ Complete | - | - |

---

### Portal Roles (Self-Service)

#### Artist Portal (ATLVS `/portal/artist`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Portal Landing | ✅ Complete | - | - |
| **My Bookings** | Missing | View upcoming performances | **P2** |
| **Rider Management** | Missing | Submit/update technical rider | **P2** |
| **Availability** | Missing | Set availability calendar | **P2** |
| **Documents** | Missing | Contracts, W9, etc. | **P2** |

#### Vendor Portal (ATLVS `/portal/vendor`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Portal Landing | ✅ Complete | - | - |
| **My Orders** | Missing | View POs, invoices | **P2** |
| **Submit Invoice** | Missing | Upload invoices for payment | **P2** |
| **Catalog Management** | Missing | Update product/service catalog | **P2** |

#### Investor Portal (ATLVS `/portal/investor`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Portal Landing | ✅ Complete | - | - |
| **Investment Summary** | Missing | Portfolio overview | **P3** |
| **Reports** | Missing | Financial reports, updates | **P3** |

#### Sponsor Portal (ATLVS `/portal/sponsor`)
| Workflow | Current State | Gap | Priority |
|----------|---------------|-----|----------|
| Portal Landing | ✅ Complete | - | - |
| **Activation Tracking** | Missing | View sponsorship deliverables | **P3** |
| **Reports** | Missing | Impressions, engagement | **P3** |

---

## Cross-App Workflow Gaps

### Advancing System (COMPVSS ↔ ATLVS)
| Workflow Step | Current State | Gap | Priority |
|---------------|---------------|-----|----------|
| Create Request (COMPVSS) | ✅ Complete | - | - |
| Catalog Browser (COMPVSS) | ✅ Complete | - | - |
| **Review Queue (ATLVS)** | Missing | Pending requests dashboard | **P0** |
| **Approval Workflow (ATLVS)** | Missing | Approve/deny/modify with comments | **P0** |
| **Allocation (ATLVS)** | Missing | Assign from inventory/rental/procurement | **P1** |
| **Fulfillment Tracking** | Missing | Track delivery, receipt confirmation | **P1** |

### Deal-to-Project Handoff
| Workflow Step | Current State | Gap | Priority |
|---------------|---------------|-----|----------|
| Deal Pipeline | ✅ Complete | - | - |
| **Proposal Generation** | Missing | Create proposal from deal | **P0** |
| **Auto-Project Creation** | Missing | Create project on deal close | **P1** |
| **Budget Initialization** | Missing | Copy deal value to project budget | **P1** |

### Ticket-Revenue Sync (GVTEWAY → ATLVS)
| Workflow Step | Current State | Gap | Priority |
|---------------|---------------|-----|----------|
| Ticket Sales | ✅ Complete | - | - |
| **Revenue Recording** | Missing | Sync to ATLVS ledger | **P1** |
| **Reconciliation** | Missing | Daily reconciliation job | **P2** |
| **Payout Tracking** | Missing | Track payouts to organizers | **P2** |

---

## Implementation Plan

### Phase 1: Critical CRUD Gaps (P0) - Week 1-2

**Goal:** Complete all missing CRUD operations for core entities

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 1.1 Create `/people/[id]/edit` | ATLVS | Edit person form | 4h |
| 1.2 Create `/organizations/new` | ATLVS | Create org form | 4h |
| 1.3 Create `/organizations/[id]/edit` | ATLVS | Edit org form | 4h |
| 1.4 Create `/places/new` | ATLVS | Create place form | 4h |
| 1.5 Create `/places/[id]/edit` | ATLVS | Edit place form | 4h |
| 1.6 Create `/events/[id]` | ATLVS | Event detail with tabs | 8h |
| 1.7 Create `/events/new` | ATLVS | Create event wizard | 8h |
| 1.8 Create `/events/[id]/edit` | ATLVS | Edit event form | 4h |

**Total Phase 1:** 40 hours

### Phase 2: Finance Workflows (P0-P1) - Week 3-4

**Goal:** Complete finance director workflows

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 2.1 Implement `/proposals` full CRUD | ATLVS | Proposals list + detail | 12h |
| 2.2 Implement `/invoices` full CRUD | ATLVS | Invoices with AR aging | 12h |
| 2.3 Create `/expenses` | ATLVS | Expense management | 8h |
| 2.4 Implement `/budgets` full CRUD | ATLVS | Budget vs actuals | 8h |
| 2.5 Create `/purchase-orders` | ATLVS | PO workflow | 8h |
| 2.6 Implement `/bills` full CRUD | ATLVS | AP management | 8h |

**Total Phase 2:** 56 hours

### Phase 3: Advancing Workflow (P0-P1) - Week 5

**Goal:** Complete cross-app advancing workflow

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 3.1 Create advancing review queue | ATLVS | `/advancing/review` | 8h |
| 3.2 Implement approval workflow | ATLVS | Approve/deny/modify | 8h |
| 3.3 Create allocation interface | ATLVS | Assign resources | 8h |
| 3.4 Implement fulfillment tracking | BOTH | Track delivery | 8h |

**Total Phase 3:** 32 hours

### Phase 4: Consumer Checkout (P1) - Week 6

**Goal:** Complete GVTEWAY purchase flow

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 4.1 Implement `/cart` full functionality | GVTEWAY | Cart with persistence | 8h |
| 4.2 Implement `/checkout` flow | GVTEWAY | Payment integration | 12h |
| 4.3 Create `/wallet` | GVTEWAY | Payment methods | 8h |

**Total Phase 4:** 28 hours

### Phase 5: Admin & Portal Enhancements (P1-P2) - Week 7-8

**Goal:** Complete admin dashboards and portal features

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 5.1 Create GVTEWAY admin dashboard | GVTEWAY | `/admin` | 8h |
| 5.2 Create event management admin | GVTEWAY | `/admin/events` | 8h |
| 5.3 Create ticketing admin | GVTEWAY | `/admin/ticketing` | 8h |
| 5.4 Implement `/documents` module | ATLVS | Document library | 12h |
| 5.5 Create `/crew/[id]` detail | COMPVSS | Crew member detail | 4h |
| 5.6 Create `/calendar` view | ATLVS | Calendar component | 8h |

**Total Phase 5:** 48 hours

### Phase 6: Community Features (P2) - Week 9-10

**Goal:** Implement GVTEWAY community features

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 6.1 Implement `/community` hub | GVTEWAY | Community landing | 8h |
| 6.2 Implement `/groups` CRUD | GVTEWAY | Group management | 8h |
| 6.3 Implement `/friends` | GVTEWAY | Friend connections | 6h |
| 6.4 Implement `/reviews` | GVTEWAY | Review system | 6h |
| 6.5 Implement `/messages` | GVTEWAY | Direct messaging | 8h |

**Total Phase 6:** 36 hours

### Phase 7: Portal Features (P2-P3) - Week 11-12

**Goal:** Enhance self-service portals

| Task | App | Route | Effort |
|------|-----|-------|--------|
| 7.1 Artist portal enhancements | ATLVS | Bookings, rider, availability | 12h |
| 7.2 Vendor portal enhancements | ATLVS | Orders, invoices, catalog | 12h |
| 7.3 Investor portal enhancements | ATLVS | Summary, reports | 8h |
| 7.4 Sponsor portal enhancements | ATLVS | Activations, reports | 8h |

**Total Phase 7:** 40 hours

---

## Database Alignment

All implementations must maintain 3NF normalized architecture:

### Entity-to-Table Mapping
| Entity | Primary Table | Profile Tables |
|--------|---------------|----------------|
| People | `legend_people` | `people_profile_*` |
| Organizations | `legend_organizations` | `orgs_profile_*` |
| Places | `legend_places` | `places_profile_*` |
| Events | `legend_events` | - |
| Products | `legend_products` | `products_profile_*` |
| Documents | `legend_documents` | - |
| Proposals | `proposals` | `proposal_line_items` |
| Invoices | `invoices` | `invoice_line_items` |
| Expenses | `finance_expenses` | - |
| Budgets | `budgets` | `budget_line_items` |
| Purchase Orders | `finance_purchase_orders` | `po_line_items` |
| Bills | `bills` | `bill_line_items` |

### API Pattern
All new routes follow the standard pattern:
```
/api/[entity]         - GET (list), POST (create)
/api/[entity]/[id]    - GET (read), PUT (update), DELETE (delete)
/api/[entity]/search  - POST (advanced search)
/api/[entity]/batch   - POST (batch operations)
```

### Hook Pattern
All new hooks follow the standard pattern:
```typescript
use[Entity]Query()        - List with filters
use[Entity]ByIdQuery(id)  - Single entity
useCreate[Entity]()       - Create mutation
useUpdate[Entity]()       - Update mutation
useDelete[Entity]()       - Delete mutation
```

---

## Summary

| Phase | Focus | Effort | Timeline |
|-------|-------|--------|----------|
| Phase 1 | Critical CRUD Gaps | 40h | Week 1-2 |
| Phase 2 | Finance Workflows | 56h | Week 3-4 |
| Phase 3 | Advancing Workflow | 32h | Week 5 |
| Phase 4 | Consumer Checkout | 28h | Week 6 |
| Phase 5 | Admin & Portal | 48h | Week 7-8 |
| Phase 6 | Community Features | 36h | Week 9-10 |
| Phase 7 | Portal Features | 40h | Week 11-12 |
| **Total** | | **280h** | **12 weeks** |

---

## Next Steps

1. Review and approve this gap analysis
2. Begin Phase 1 implementation
3. Update FULL_STACK_AUDIT_TRACKER.md as pages are completed
4. Run 6-layer validation on each completed workflow
