# GHXSTSHIP Platform - Master Workflow Inventory

> **Version:** 2.0  
> **Last Updated:** December 31, 2025  
> **Total Pages:** 591 (ATLVS: 236, COMPVSS: 166, GVTEWAY: 189)  
> **Total Workflows Documented:** 96 detailed workflows

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [USER_GUIDES.md](../guides/USER_GUIDES.md) | Comprehensive end-to-end user guides from signup to archiving |
| [ATLVS_WORKFLOWS.md](./ATLVS_WORKFLOWS.md) | Detailed ATLVS platform workflows (31 workflows) |
| [COMPVSS_WORKFLOWS.md](./COMPVSS_WORKFLOWS.md) | Detailed COMPVSS platform workflows (34 workflows) |
| [GVTEWAY_WORKFLOWS.md](./GVTEWAY_WORKFLOWS.md) | Detailed GVTEWAY platform workflows (31 workflows) |
| [PERMISSIONS.md](../PERMISSIONS.md) | Role-based access control documentation |

---

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [User Types & Roles](#user-types--roles)
3. [ATLVS Workflows](#atlvs-workflows) → [Detailed Workflows](./ATLVS_WORKFLOWS.md)
4. [COMPVSS Workflows](#compvss-workflows) → [Detailed Workflows](./COMPVSS_WORKFLOWS.md)
5. [GVTEWAY Workflows](#gvteway-workflows) → [Detailed Workflows](./GVTEWAY_WORKFLOWS.md)
6. [Access & Permissions Matrix](#access--permissions-matrix)
7. [Identified Gaps & Recommendations](#identified-gaps--recommendations)

---

## Platform Overview

| App | Purpose | Target Users | Pages |
|-----|---------|--------------|-------|
| **ATLVS** | Business operations, finance, project management | Internal teams, executives, investors, sponsors | 236 |
| **COMPVSS** | Production operations, crew management, event execution | Production crews, vendors, artists, staff | 166 |
| **GVTEWAY** | Consumer-facing ticketing, fan engagement, experiences | Fans, ticket buyers, artists, venue managers | 189 |

---

## User Types & Roles

### Platform Roles (RBAC)

#### Legend Roles (God Mode) - @ghxstship.pro email required
| Role | Description | Can Impersonate |
|------|-------------|-----------------|
| `LEGEND_SUPER_ADMIN` | Absolute platform control | Yes |
| `LEGEND_ADMIN` | Internal product management | Yes |
| `LEGEND_DEVELOPER` | Full repository access | Yes |
| `LEGEND_COLLABORATOR` | External scoped access | No |
| `LEGEND_SUPPORT` | Tech support | Yes (with permission) |
| `LEGEND_INCOGNITO` | Stealth mode | Yes |

#### ATLVS Roles
| Role | Level | Description |
|------|-------|-------------|
| `ATLVS_SUPER_ADMIN` | admin | Full system administration |
| `ATLVS_ADMIN` | admin | Administrative access |
| `ATLVS_TEAM_MEMBER` | member | Work on tasks/projects |
| `ATLVS_VIEWER` | viewer | Read-only access |

#### COMPVSS Roles
| Role | Level | Description |
|------|-------|-------------|
| `COMPVSS_ADMIN` | admin | Full production admin |
| `COMPVSS_TEAM_MEMBER` | member | Work on events |
| `COMPVSS_COLLABORATOR` | member | Limited event access |
| `COMPVSS_VIEWER` | viewer | Read-only access |

#### GVTEWAY Roles
| Role | Level | Description |
|------|-------|-------------|
| `GVTEWAY_ADMIN` | admin | Full platform admin |
| `GVTEWAY_EXPERIENCE_CREATOR` | manager | Create/manage events |
| `GVTEWAY_VENUE_MANAGER` | manager | Manage venues |
| `GVTEWAY_ARTIST_VERIFIED` | member | Verified artist |
| `GVTEWAY_ARTIST` | member | Artist profile |
| `GVTEWAY_MEMBER_EXTRA` | member | Premium membership |
| `GVTEWAY_MEMBER_PLUS` | member | Enhanced membership |
| `GVTEWAY_MEMBER` | member | Standard member |
| `GVTEWAY_MEMBER_GUEST` | member | Guest access |
| `GVTEWAY_AFFILIATE` | member | Affiliate marketing |
| `GVTEWAY_MODERATOR` | manager | Content moderation |

### Event-Level Roles

#### All Platform Access (ATLVS + COMPVSS + GVTEWAY)
- `EXECUTIVE` (1000) - Full control
- `CORE_AAA` (900) - Event creation/management
- `AA` (800) - Event editing, advancing
- `PRODUCTION` (700) - Production access
- `MANAGEMENT` (600) - Management access

#### COMPVSS-Only
- `CREW` (500), `STAFF` (450), `VENDOR` (400), `AGENT` (300), `INDUSTRY` (150), `INTERN` (100), `VOLUNTEER` (50)

#### COMPVSS + GVTEWAY
- `ENTERTAINER` (350), `ARTIST` (350), `MEDIA` (250), `SPONSOR` (200), `PARTNER` (200)

#### GVTEWAY-Only (Ticket Tiers)
- `BACKSTAGE_L2/L1`, `PLATINUM_VIP_L2/L1`, `VIP_L3/L2/L1`, `GA_L5/L4/L3/L2/L1`, `GUEST`, `INFLUENCER`, `BRAND_AMBASSADOR`, `AFFILIATE`

---

## ATLVS Workflows (236 pages)

> **📄 Full Details:** [ATLVS_WORKFLOWS.md](./ATLVS_WORKFLOWS.md) - 31 detailed workflows

### Workflow Summary by User Type

#### Admin Workflows (20 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-ATLVS-001 | Production Creation & Setup | Create and configure new productions | `/productions/new`, `/p/[id]/settings` |
| WF-ATLVS-002 | Budget Management & Approval | Create, modify, approve budgets | `/p/[id]/budgets` |
| WF-ATLVS-003 | Vendor Onboarding & Management | Add vendors, contracts, rate cards | `/vendors`, `/vendors/contracts` |
| WF-ATLVS-004 | Sponsor Acquisition & Management | Lead to sponsor conversion, fulfillment | `/sponsors`, `/sponsors/fulfillment` |
| WF-ATLVS-005 | Investor Relations Management | Investor comms, funding rounds | `/investors`, `/investors/rounds` |
| WF-ATLVS-006 | Venue Setup & Configuration | Add venues, maps, zones | `/venues`, `/venues/zones` |
| WF-ATLVS-007 | Asset Inventory Management | Track, maintain, allocate assets | `/assets`, `/assets/maintenance` |
| WF-ATLVS-008 | Contract Lifecycle Management | Create, review, execute contracts | `/contracts`, `/templates` |
| WF-ATLVS-009 | Compliance Management | Track requirements, audits | `/compliance`, `/audit` |
| WF-ATLVS-010 | Expense Submission & Approval | Submit, review, approve expenses | `/expenses`, `/expenses/reports` |
| WF-ATLVS-011 | Invoice Processing | Process vendor/client invoices | `/invoices`, `/finance/accounts-receivable` |
| WF-ATLVS-012 | Permit Management | Apply, track, link permits | `/permits`, `/p/[id]/permits` |
| WF-ATLVS-013 | Insurance Management | Manage policies, COIs | `/insurance`, `/p/[id]/insurance` |
| WF-ATLVS-014 | Procurement & Purchase Orders | Requisition to PO to receipt | `/procurement`, `/quotes` |
| WF-ATLVS-015 | RFP Management | Create, distribute, evaluate RFPs | `/rfp`, `/contracts` |
| WF-ATLVS-016 | Advancing Request Management | Coordinate production advancing | `/advancing`, `/p/[id]/advancing` |
| WF-ATLVS-017 | Workforce Management | HR, payroll, compliance | `/workforce`, `/payroll` |
| WF-ATLVS-018 | CRM & Lead Management | Contacts, leads, relationships | `/crm`, `/contacts` |
| WF-ATLVS-019 | Analytics & Reporting | Dashboards, KPIs, reports | `/analytics`, `/reports` |
| WF-ATLVS-020 | API & Integration Management | API keys, webhooks, integrations | `/api-management`, `/integrations` |

#### Team Member Workflows (4 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-ATLVS-021 | Daily Task Management | View tasks, update status, log time | `/dashboard`, `/schedule/tasks` |
| WF-ATLVS-022 | Production Work | Access production, complete tasks | `/p/[id]/overview`, `/p/[id]/schedule` |
| WF-ATLVS-023 | Expense Submission | Submit expenses for approval | `/expenses` |
| WF-ATLVS-024 | Advancing Submission | Submit advancing information | `/advancing/requests/[id]` |

#### Viewer Workflows (1 workflow)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-ATLVS-025 | Read-Only Access | View business data without editing | `/dashboard`, `/productions` |

#### Portal User Workflows (5 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-ATLVS-026 | Artist Portal | Artist event access, advancing | `/portal/artist` |
| WF-ATLVS-027 | Crew Portal | Crew assignments, schedule | `/portal/crew` |
| WF-ATLVS-028 | Investor Portal | Investment info, updates | `/portal/investor` |
| WF-ATLVS-029 | Sponsor Portal | Activations, deliverables | `/portal/sponsor` |
| WF-ATLVS-030 | Vendor Portal | POs, invoices, payments | `/portal/vendor` |

#### Authentication (1 workflow)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-ATLVS-031 | User Authentication | Sign in, magic link, password reset | `/auth/*` |

---

## COMPVSS Workflows (166 pages)

> **📄 Full Details:** [COMPVSS_WORKFLOWS.md](./COMPVSS_WORKFLOWS.md) - 34 detailed workflows

### Workflow Summary by User Type

#### Admin Workflows (18 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-001 | Production Setup & Configuration | Configure production, channels, credentials | `/projects/new`, `/p/[id]/settings` |
| WF-COMPVSS-002 | Crew Scheduling & Assignment | Schedule crew, issue credentials | `/crew`, `/crew/assign` |
| WF-COMPVSS-003 | Advancing Management | Coordinate advancing requirements | `/advancing`, `/advancing/new` |
| WF-COMPVSS-004 | Credential System Management | Define types, zones, issue credentials | `/credentials`, `/credentials/types` |
| WF-COMPVSS-005 | Schedule Management | Build/strike, tech, soundcheck, ROS | `/schedule`, `/p/[id]/schedule` |
| WF-COMPVSS-006 | Safety & Incident Management | Safety protocols, incident reporting | `/safety`, `/incidents` |
| WF-COMPVSS-007 | Quality Assurance Management | QA checkpoints, punch list, issues | `/p/[id]/quality` |
| WF-COMPVSS-008 | Vendor Coordination | Assign vendors, deliveries, logistics | `/p/[id]/vendors`, `/deliveries` |
| WF-COMPVSS-009 | Load-In Management | Coordinate load-in, equipment, QA | `/p/[id]/load-in` |
| WF-COMPVSS-010 | Show Day Operations | Run show, catering, weather, VIPs | `/p/[id]/operations` |
| WF-COMPVSS-011 | Load-Out & Strike | Execute strike, equipment return | `/p/[id]/load-out`, `/p/[id]/strike` |
| WF-COMPVSS-012 | Production Wrap & Settlement | Reports, settlement, close production | `/p/[id]/wrap`, `/settlement` |
| WF-COMPVSS-013 | SOP Management | Create, categorize, train on SOPs | `/sops`, `/sops/training` |
| WF-COMPVSS-014 | Opportunity & Bid Management | Track opportunities, submit bids | `/opportunities`, `/bid-portal` |
| WF-COMPVSS-015 | Communication Management | Channels, messages, stakeholder portal | `/communications` |
| WF-COMPVSS-016 | Risk Management | Risk register, weather contingency | `/risk-register`, `/weather-contingency` |
| WF-COMPVSS-017 | Training & Certification Management | Certifications, skills, mentorship | `/certifications`, `/skills` |
| WF-COMPVSS-018 | Reporting & Documentation | Daily reports, wrap reports, photos | `/reports/daily`, `/reports/wrap` |

#### Team Member Workflows (6 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-019 | Daily Work Management | Clock in, tasks, time logging | `/dashboard`, `/clock-in` |
| WF-COMPVSS-020 | Credential Management | View/scan credentials | `/my-credentials`, `/credentials/scan` |
| WF-COMPVSS-021 | Document Access | Access SOPs, specs, knowledge base | `/p/[id]/documents`, `/knowledge` |
| WF-COMPVSS-022 | Quality & Issue Reporting | Log issues, punch list, troubleshoot | `/p/[id]/quality/issues` |
| WF-COMPVSS-023 | Safety & Incident Reporting | Report incidents, access emergency info | `/safety`, `/p/[id]/incidents` |
| WF-COMPVSS-024 | Communication & Messaging | Messages, channels, notifications | `/messages`, `/channels` |

#### Crew Workflows (3 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-025 | Crew Check-In & Work | Clock in, assignments, timesheets | `/clock-in`, `/my-assignments` |
| WF-COMPVSS-026 | Crew Training & Certification | Complete training, acknowledge SOPs | `/my-training`, `/sops/training` |
| WF-COMPVSS-027 | Crew Social & Directory | Connect with crew, browse directory | `/crew-social`, `/directory` |

#### Artist Workflows (2 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-028 | Artist Portal Access | View rider, schedule, hospitality | `/artist-portal`, `/my-rider` |
| WF-COMPVSS-029 | Artist Advancing | Submit rider info, confirm schedule | `/advancing`, `/my-hospitality` |

#### Vendor Workflows (2 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-030 | Vendor Portal Access | View deliveries, contracts, invoices | `/vendor-portal`, `/my-deliveries` |
| WF-COMPVSS-031 | Vendor Delivery Coordination | Coordinate delivery, site access | `/my-deliveries`, `/site-access` |

#### Stakeholder Workflows (1 workflow)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-032 | Stakeholder Portal Access | View updates, documents, reports | `/stakeholder-portal` |

#### Offline & Authentication (2 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-COMPVSS-033 | Offline Work Mode | Work offline, sync when connected | `/offline`, `/knowledge/offline` |
| WF-COMPVSS-034 | User Authentication | Sign in, magic link, password reset | `/auth/*` |

---

## GVTEWAY Workflows (189 pages)

> **📄 Full Details:** [GVTEWAY_WORKFLOWS.md](./GVTEWAY_WORKFLOWS.md) - 31 detailed workflows

### Workflow Summary by User Type

#### Consumer/Public Workflows (7 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-GVTEWAY-001 | Event Discovery & Browse | Find events via browse, search, discover | `/browse`, `/discover`, `/search` |
| WF-GVTEWAY-002 | Event Details & Information | View event details, program, seating | `/events/[id]`, `/events/[id]/program` |
| WF-GVTEWAY-003 | Ticket Purchase Flow | Select tickets, checkout, payment | `/cart`, `/checkout`, `/confirmation` |
| WF-GVTEWAY-004 | Artist & Venue Discovery | Browse artists, venues, creators | `/artists`, `/venues`, `/creators` |
| WF-GVTEWAY-005 | Merchandise Shopping | Browse and purchase merch, bundles | `/merch`, `/deals`, `/gift-cards` |
| WF-GVTEWAY-006 | Help & Support Access | Access help, accessibility info | `/help`, `/accessibility` |
| WF-GVTEWAY-007 | User Registration | Create account, verify email, onboard | `/auth/signup`, `/onboarding` |

#### Member Workflows (11 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-GVTEWAY-008 | Account Management | Manage profile, orders, tickets | `/account`, `/profile` |
| WF-GVTEWAY-009 | Ticket Management | Track, transfer, gift, resell tickets | `/tickets`, `/wallet`, `/resale` |
| WF-GVTEWAY-010 | Order Management | View orders, history, request refunds | `/orders`, `/orders/history` |
| WF-GVTEWAY-011 | Live Event Experience | Access event hub, navigate, view tickets | `/e/[eventId]`, `/e/[eventId]/map` |
| WF-GVTEWAY-012 | Event Engagement | Challenges, polls, Q&A, UGC, chat | `/e/[eventId]/engage`, `/e/[eventId]/chat` |
| WF-GVTEWAY-013 | Event Services | Emergency, lost & found, support | `/e/[eventId]/services` |
| WF-GVTEWAY-014 | Community Participation | Forums, groups, friends, reviews | `/community`, `/forums`, `/reviews` |
| WF-GVTEWAY-015 | Fan Club & Membership | Join fan clubs, manage membership | `/fan-club`, `/membership` |
| WF-GVTEWAY-016 | Settings & Preferences | Language, notifications, privacy | `/settings`, `/notifications` |
| WF-GVTEWAY-017 | Support & Help | Chat support, surveys, lost items | `/support/chat`, `/lost-found` |
| WF-GVTEWAY-018 | Event Matching | Personalized event recommendations | `/match`, `/favorites` |

#### Artist Workflows (2 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-GVTEWAY-019 | Artist Profile Management | Manage profile, merch, events | `/profile`, `/merch/[artistId]` |
| WF-GVTEWAY-020 | Artist Application | Apply to become artist | `/apply`, `/apply/confirmation` |

#### Admin Workflows (8 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-GVTEWAY-021 | Event Creation & Management | Create, configure, manage events | `/events/create`, `/events/[id]` |
| WF-GVTEWAY-022 | Ticketing Administration | Anti-scalping, promos, will call | `/admin/anti-scalping`, `/admin/promo-codes` |
| WF-GVTEWAY-023 | Marketing Administration | A/B testing, influencers, pixels | `/marketing/analytics`, `/marketing/pixels` |
| WF-GVTEWAY-024 | Social Media Management | Inbox, sentiment, crisis, content | `/social`, `/social/inbox` |
| WF-GVTEWAY-025 | Moderation & Community | Moderate content, manage contests | `/moderate`, `/admin/moderation` |
| WF-GVTEWAY-026 | POS & Operations | Configure POS, cashless, integrations | `/admin/pos`, `/admin/integrations` |
| WF-GVTEWAY-027 | Box Office Operations | Will call, check-in, scan tickets | `/e/[eventId]/box-office`, `/e/[eventId]/scan` |
| WF-GVTEWAY-028 | Event Settlement | Process settlement, review sales | `/e/[eventId]/settlement` |

#### Venue Manager Workflows (1 workflow)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-GVTEWAY-029 | Venue Management | Manage venue profile, view events | `/venues/[id]`, `/dashboard` |

#### Offline & Authentication (2 workflows)
| ID | Workflow | Description | Key Pages |
|----|----------|-------------|-----------|
| WF-GVTEWAY-030 | User Authentication | Sign in, magic link, password reset | `/auth/*`, `/(auth)/login` |
| WF-GVTEWAY-031 | Offline Access | Access tickets offline | `/offline`, `/wallet/offline` |

---

## Access & Permissions Matrix

### ATLVS
| Feature | Legend | Super Admin | Admin | Team Member | Viewer | Portal |
|---------|--------|-------------|-------|-------------|--------|--------|
| Dashboard | Full | Full | Full | Full | Read | Limited |
| Analytics | Full | Full | Full | Read | Read | - |
| Finance | Full | Full | Full | Limited | - | - |
| Productions | Full | Full | Full | R/W | Read | Limited |
| Settings | Full | Full | Full | Own | Own | Own |

### COMPVSS
| Feature | Legend | Admin | Team Member | Collaborator | Viewer | Portal |
|---------|--------|-------|-------------|--------------|--------|--------|
| Dashboard | Full | Full | Full | Limited | Read | Limited |
| Productions | Full | Full | R/W | Limited | Read | Limited |
| Credentials | Full | Full | R/W | Read | - | Own |
| Safety | Full | Full | R/W | Read | Read | Read |

### GVTEWAY
| Feature | Legend | Admin | Exp. Creator | Venue Mgr | Artist | Member | Guest |
|---------|--------|-------|--------------|-----------|--------|--------|-------|
| Browse | Full | Full | Full | Full | Full | Full | Full |
| Events (Create) | Full | Full | Full | Limited | - | - | - |
| Ticketing | Full | Full | Full | Full | Full | Full | Limited |
| Admin | Full | Full | - | - | - | - | - |

---

## Identified Gaps & Recommendations

> **Status**: All 14 gaps have been remediated as of December 2025

### Critical (High Priority) - REMEDIATED

1. **Missing Role-Based Route Protection** ✅ REMEDIATED
   - **Solution**: Created `withRoleProtection` HOC in `packages/config/middleware/withRoleProtection.tsx`
   - Pre-configured protection configs for all platforms (ATLVS, COMPVSS, GVTEWAY)

2. **Portal User Data Isolation** ✅ REMEDIATED
   - **Solution**: Migration `0223_gap_remediation_rls_portal_isolation.sql`
   - Created `portal_user_entity_access` table with RLS policies
   - Functions: `grant_portal_access()`, `revoke_portal_access()`, `has_portal_entity_access()`

3. **Missing Two-Factor Authentication** ✅ REMEDIATED
   - **Solution**: Migration `0224_gap_remediation_2fa_totp.sql`
   - Created `user_2fa_config` and `user_2fa_verification_log` tables
   - Functions: `init_2fa_setup()`, `enable_2fa()`, `use_backup_code()`, `get_2fa_status()`

4. **No Audit Trail for Permission Changes** ✅ REMEDIATED
   - **Solution**: Migration `0225_gap_remediation_audit_trail.sql`
   - Created `permission_audit_log` table with automatic triggers
   - Functions: `log_permission_change()`, `query_permission_audit_logs()`

### Medium Priority - REMEDIATED

5. **Finance Permission Granularity** ✅ REMEDIATED
   - **Solution**: Migration `0226_gap_remediation_finance_permissions.sql`
   - Created `finance_permissions` table with granular controls
   - Functions: `has_finance_permission()`, `grant_finance_permissions()`

6. **Event Role Inheritance Incomplete** ✅ REMEDIATED
   - **Solution**: Updated `packages/config/roles.ts`
   - Added `PLATFORM_ROLE_PERMISSIONS` mapping
   - Implemented full `hasPermission()` with inheritance logic

7. **No Role Management UI** ✅ REMEDIATED
   - **Solution**: Created `apps/atlvs/src/app/(dashboard)/admin/users/page.tsx`
   - Full user management with role assignment and audit log viewing

8. **Incomplete Offline Support** ✅ REMEDIATED
   - **Solution**: Created `packages/config/offline/service-worker.ts` and `sync-manager.ts`
   - IndexedDB-based offline queue with automatic sync

### Low Priority - REMEDIATED

9. **Missing Bulk Operations UI** ✅ REMEDIATED
   - **Solution**: Created `apps/atlvs/src/app/(dashboard)/admin/batch-operations/page.tsx`
   - Real-time progress monitoring, cancel/retry functionality

10. **No Cross-App Navigation** ✅ REMEDIATED
    - **Solution**: Created `packages/ui/src/components/AppSwitcher.tsx`
    - Role-aware app switching with Legend access indicator

11. **No Permission Documentation** ✅ REMEDIATED
    - **Solution**: Created `docs/PERMISSIONS.md`
    - Comprehensive documentation of all roles, permissions, and access levels

12. **Single Onboarding Flow** ✅ REMEDIATED
    - **Solution**: Created `packages/config/onboarding/role-onboarding.ts`
    - 12 role-specific onboarding flows with customized steps

### Data Integrity - REMEDIATED

13. **No Soft Delete** ✅ REMEDIATED
    - **Solution**: Migration `0227_gap_remediation_soft_delete.sql`
    - Added `deleted_at` and `deleted_by` columns to key tables
    - Functions: `soft_delete()`, `restore_deleted()`, `purge_deleted_records()`

14. **Missing Export Controls** ✅ REMEDIATED
    - **Solution**: Migration `0228_gap_remediation_export_permissions.sql`
    - Created `export_permissions` and `export_audit_log` tables
    - Functions: `can_export()`, `log_export()`, `get_export_statistics()`

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Pages | 591 |
| **Total Detailed Workflows** | **96** |
| - ATLVS Workflows | 31 |
| - COMPVSS Workflows | 34 |
| - GVTEWAY Workflows | 31 |
| Platform Roles | 17 |
| Event Roles | 32 |
| Permissions Defined | 51 |
| Critical Gaps | 4 |
| Medium Gaps | 4 |
| Low Priority Gaps | 4 |
| Data Integrity Gaps | 2 |

---

## Detailed Workflow Documents

| App | Document | Workflows | Description |
|-----|----------|-----------|-------------|
| ATLVS | [ATLVS_WORKFLOWS.md](./ATLVS_WORKFLOWS.md) | 31 | Step-by-step workflows for admin, team member, viewer, and portal users |
| COMPVSS | [COMPVSS_WORKFLOWS.md](./COMPVSS_WORKFLOWS.md) | 34 | Step-by-step workflows for admin, team member, crew, artist, vendor, stakeholder |
| GVTEWAY | [GVTEWAY_WORKFLOWS.md](./GVTEWAY_WORKFLOWS.md) | 31 | Step-by-step workflows for consumers, members, artists, admins, venue managers |

Each detailed workflow document includes:
- **Actor**: Who performs the workflow
- **Trigger**: What initiates the workflow
- **Step-by-step actions**: Numbered steps with specific pages
- **Post-conditions**: Expected outcomes after workflow completion
- **Related workflows**: Cross-references to dependent workflows

---

*Document generated by GHXSTSHIP Platform Audit*
