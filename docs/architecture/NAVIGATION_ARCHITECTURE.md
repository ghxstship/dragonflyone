# GHXSTSHIP Navigation Architecture
## Optimized UI/UX Navigation for Platform & Event-Level Roles

**Version:** 1.0  
**Date:** December 2024  
**Status:** Proposed

---

## Executive Summary

This document proposes a restructured navigation architecture across all three GHXSTSHIP applications (ATLVS, COMPVSS, GVTEWAY) that:

1. **Separates platform-level from event-level contexts** with clear visual distinction
2. **Organizes features by workflow** rather than arbitrary groupings
3. **Implements role-based visibility** for both platform and event roles
4. **Follows project management best practices** (PMBOK, Agile, RACI)
5. **Reduces cognitive load** through progressive disclosure and contextual navigation

---

## Current State Analysis

### Page Counts
| Application | Pages | Primary Purpose |
|-------------|-------|-----------------|
| ATLVS | 150 | Production Management (B2B) |
| COMPVSS | 107 | Crew & Operations (B2B) |
| GVTEWAY | 147 | Consumer Experience (B2C) |

### Current Issues
- **Flat navigation** with 60+ top-level routes in ATLVS
- **Duplicate functionality** across apps (venues, schedule, expenses)
- **No clear context switching** between platform and event levels
- **Inconsistent groupings** (e.g., analytics scattered, finance fragmented)
- **Missing role-based filtering** in navigation

---

## Cross-App Workflow: Advancing System

The Advancing module is a **unified cross-app workflow** that uses the Global Catalog:

### Workflow Flow
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

### Existing Pages (to be unified)
| App | Route | Purpose |
|-----|-------|---------|
| ATLVS | `/advances` | Advance requests queue (processing) |
| ATLVS | `/advances/[id]` | Advance detail (approve/deny) |
| ATLVS | `/advancing` | Advancing dashboard |
| ATLVS | `/advancing/requests/[id]` | Request detail |
| COMPVSS | `/advancing` | Advancing dashboard (submit) |
| COMPVSS | `/advancing/[id]` | Advance detail |
| COMPVSS | `/advancing/catalog` | Global catalog browser |
| COMPVSS | `/advancing/new` | Create new advance request |

---

## Gap Analysis: Missing from Navigation Architecture

### ATLVS Pages NOT in Proposed Navigation

| Category | Existing Route | Status | Recommendation |
|----------|---------------|--------|----------------|
| **Advancing** | `/advances`, `/advances/[id]` | MISSING | Add to Operations section |
| **Advancing** | `/advancing`, `/advancing/requests/[id]` | MISSING | Add to Operations section |
| **Assets** | `/assets/calibration` | MISSING | Add to Assets > Maintenance |
| **Assets** | `/assets/damage-reports` | MISSING | Add to Assets > Maintenance |
| **Assets** | `/assets/idle-analysis` | MISSING | Add to Assets > Analytics |
| **Assets** | `/assets/kits` | MISSING | Add to Assets > Inventory |
| **Assets** | `/assets/optimization` | MISSING | Add to Assets > Analytics |
| **Assets** | `/assets/performance` | MISSING | Add to Assets > Analytics |
| **Assets** | `/assets/scan` | MISSING | Add to Assets > Tracking |
| **Assets** | `/assets/serialized` | MISSING | Add to Assets > Inventory |
| **Assets** | `/assets/specifications` | MISSING | Add to Assets > Inventory |
| **Assets** | `/assets/storage` | MISSING | Add to Assets > Inventory |
| **Assets** | `/assets/utilization` | MISSING | Add to Assets > Analytics |
| **CRM** | `/crm`, `/crm/calendar`, `/crm/email-integration` | MISSING | Add to CRM section |
| **CRM** | `/crm/lead-scoring`, `/crm/relationships`, `/crm/tasks` | MISSING | Add to CRM section |
| **Finance** | `/finance`, `/finance/accounts-receivable` | MISSING | Add to Finance section |
| **Finance** | `/finance/bank-reconciliation`, `/finance/commissions` | MISSING | Add to Finance section |
| **Finance** | `/finance/credit-cards` | MISSING | Add to Finance section |
| **Generator** | `/generator`, `/generator/share/[id]` | MISSING | Add to Documents section |
| **Leads** | `/leads/scoring` | MISSING | Add to CRM > Leads |
| **Legal** | `/legal/privacy`, `/legal/terms` | MISSING | Add to Compliance > Legal |
| **Marketing** | `/marketing/attribution` | MISSING | Add to Marketing section |
| **Procurement** | `/procurement/categories`, `/procurement/emergency` | MISSING | Add to Finance > Procurement |
| **Procurement** | `/procurement/logistics`, `/procurement/vendor-audits` | MISSING | Add to Finance > Procurement |
| **Procurement** | `/procurement/vendor-selection` | MISSING | Add to Finance > Procurement |
| **Reports** | `/reports`, `/reports/scheduled` | MISSING | Add to Metrics > Reports |
| **Vendors** | `/vendors/contracts`, `/vendors/rate-cards` | MISSING | Add to People > Vendors |
| **Verticals** | `/verticals/activations`, `/verticals/destinations` | MISSING | Add to Productions |
| **Verticals** | `/verticals/installations`, `/verticals/productions` | MISSING | Add to Productions |
| **Workforce** | `/workforce`, `/workforce/background-checks` | MISSING | Add to Organization |
| **Workforce** | `/workforce/compensation`, `/workforce/handbook` | MISSING | Add to Organization |
| **Workforce** | `/workforce/labor-laws`, `/workforce/referrals` | MISSING | Add to Organization |
| **Workforce** | `/workforce/succession`, `/workforce/union-*` | MISSING | Add to Organization |

### COMPVSS Pages NOT in Proposed Navigation

| Category | Existing Route | Status | Recommendation |
|----------|---------------|--------|----------------|
| **Advancing** | `/advancing/*` | MISSING | Add to Operations section |
| **Artists** | `/artists` | MISSING | Add to Operations > Artists |
| **Availability** | `/availability` | MISSING | Add to Crew section |
| **Background Checks** | `/background-checks` | MISSING | Add to Crew section |
| **Backup Plans** | `/backup-plans` | MISSING | Add to Documents section |
| **Best Practices** | `/best-practices` | MISSING | Add to Resources section |
| **Bid Portal** | `/bid-portal` | MISSING | Add to Opportunities section |
| **Build/Strike** | `/build-strike` | MISSING | Add to Schedule section |
| **Case Studies** | `/case-studies` | MISSING | Add to Resources section |
| **Catering** | `/catering` | MISSING | Add to Operations section |
| **Certifications** | `/certifications` | MISSING | Add to Crew section |
| **Channels** | `/channels` | MISSING | Add to Communication section |
| **Communications** | `/communications/*` | MISSING | Add to Communication section |
| **Crew Social** | `/crew-social`, `/crew/social` | MISSING | Add to Community section |
| **Crew** | `/crew`, `/crew/assign`, `/crew/background-checks` | PARTIAL | Expand Crew section |
| **Deliveries** | `/deliveries` | MISSING | Add to Logistics section |
| **Directory** | `/directory`, `/directory/*` | MISSING | Add to Crew section |
| **Drawings** | `/drawings` | MISSING | Add to Logistics > Venues |
| **Emergency** | `/emergency` | MISSING | Add to Safety section |
| **Equipment** | `/equipment` | MISSING | Add to Logistics section |
| **Expenses** | `/expenses` | MISSING | Add to Reports section |
| **Files** | `/files` | MISSING | Add to Documents section |
| **Glossary** | `/glossary` | MISSING | Add to Resources section |
| **Incidents** | `/incidents` | MISSING | Add to Safety section |
| **Integrations** | `/integrations` | MISSING | Add to Settings section |
| **Issues** | `/issues` | MISSING | Add to Quality section |
| **Knowledge** | `/knowledge/*` | MISSING | Add to Resources section |
| **Logistics** | `/logistics` | MISSING | Add to Logistics section |
| **Maintenance** | `/maintenance` | MISSING | Add to Logistics section |
| **Mentorship** | `/mentorship` | MISSING | Add to Development section |
| **Messages** | `/messages` | MISSING | Add to Communication section |
| **Offline** | `/offline` | MISSING | Add to Settings section |
| **Onboarding** | `/onboarding` | MISSING | Add to Crew section |
| **Opportunities** | `/opportunities/*` | MISSING | Add to Opportunities section |
| **Permits** | `/permits` | MISSING | Add to Safety section |
| **Photo Documentation** | `/photo-documentation` | MISSING | Add to Reports section |
| **Projects** | `/projects`, `/projects/new` | MISSING | Add to main nav |
| **Punch List** | `/punch-list` | MISSING | Add to Quality section |
| **QA Checkpoints** | `/qa-checkpoints` | MISSING | Add to Quality section |
| **Risk Register** | `/risk-register` | MISSING | Add to Safety section |
| **Run of Show** | `/run-of-show` | MISSING | Add to Schedule section |
| **Safety** | `/safety` | MISSING | Add to Safety section |
| **Schedule** | `/schedule` | MISSING | Add to Schedule section |
| **Set Times** | `/set-times` | MISSING | Add to Schedule section |
| **Settlement** | `/settlement` | MISSING | Add to Reports section |
| **Show Call** | `/show-call` | MISSING | Add to Schedule section |
| **Site Access** | `/site-access` | MISSING | Add to Logistics > Venues |
| **Site Surveys** | `/site-surveys` | MISSING | Add to Logistics > Venues |
| **Skills** | `/skills` | MISSING | Add to Crew section |
| **Social Amplification** | `/social-amplification` | MISSING | Add to Communication section |
| **Soundcheck** | `/soundcheck` | MISSING | Add to Schedule section |
| **Spec Sheets** | `/spec-sheets` | MISSING | Add to Documents section |
| **Stage Management** | `/stage-management` | MISSING | Add to Operations section |
| **Stakeholder Portal** | `/stakeholder-portal` | MISSING | Add to Communication section |
| **Subcontractors** | `/subcontractors` | MISSING | Add to Logistics section |
| **Tech Rehearsal** | `/tech-rehearsal` | MISSING | Add to Schedule section |
| **Templates** | `/templates` | MISSING | Add to Documents section |
| **Timekeeping** | `/timekeeping` | MISSING | Add to Crew section |
| **Travel** | `/travel` | MISSING | Add to Operations section |
| **Troubleshooting** | `/troubleshooting` | MISSING | Add to Quality section |
| **Vendors** | `/vendors/compare` | MISSING | Add to Logistics section |
| **Venues** | `/venues` | MISSING | Add to Logistics section |
| **VIP Management** | `/vip-management` | MISSING | Add to Operations section |
| **Weather** | `/weather`, `/weather-contingency` | MISSING | Add to Safety section |

---

## Proposed Architecture

### Core Principles

1. **Context-First Navigation**: Primary nav shows current context (Platform vs Event)
2. **Workflow-Aligned Grouping**: Features grouped by business process, not entity type
3. **Progressive Disclosure**: Show complexity only when needed
4. **Role-Aware Visibility**: Navigation adapts to user permissions
5. **Cross-App Consistency**: Shared patterns across ATLVS/COMPVSS/GVTEWAY

---

## ATLVS Navigation Structure

### Platform-Level Navigation (Organization Context)
*Visible when no production is selected*

```
┌─────────────────────────────────────────────────────────────────┐
│  ATLVS                           [Org Switcher] [User Menu]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PLATFORM                                                       │
│  ├── Dashboard                    # Platform overview           │
│  ├── Productions                  # All productions list        │
│  │   ├── Active                                                 │
│  │   ├── Upcoming                                               │
│  │   ├── Archived                                               │
│  │   ├── Templates                                              │
│  │   └── Verticals                # Production types            │
│  │       ├── Productions                                        │
│  │       ├── Activations                                        │
│  │       ├── Installations                                      │
│  │       └── Destinations                                       │
│  │                                                              │
│  ├── Organization                                               │
│  │   ├── Settings                                               │
│  │   ├── Team Members                                           │
│  │   ├── Departments                                            │
│  │   ├── Roles & Permissions                                    │
│  │   └── Subsidiaries                                           │
│  │                                                              │
│  ├── Finance (Platform)                                         │
│  │   ├── Overview                                               │
│  │   ├── Billing & Subscription                                 │
│  │   ├── Revenue Recognition                                    │
│  │   ├── Taxes                                                  │
│  │   └── Payroll                                                │
│  │                                                              │
│  ├── Workforce                                                  │
│  │   ├── Employees                                              │
│  │   ├── Background Checks                                      │
│  │   ├── Compensation                                           │
│  │   ├── Handbook                                               │
│  │   ├── Labor Laws                                             │
│  │   ├── Union Compliance                                       │
│  │   ├── Referrals                                              │
│  │   └── Succession Planning                                    │
│  │                                                              │
│  ├── CRM                                                        │
│  │   ├── Dashboard                                              │
│  │   ├── Contacts                                               │
│  │   ├── Leads                                                  │
│  │   │   └── Scoring                                            │
│  │   ├── Deals                                                  │
│  │   ├── Pipeline                                               │
│  │   ├── Relationships                                          │
│  │   ├── Tasks                                                  │
│  │   ├── Calendar                                               │
│  │   └── Email Integration                                      │
│  │                                                              │
│  ├── Assets (Global)                                            │
│  │   ├── Inventory                                              │
│  │   │   ├── All Items                                          │
│  │   │   ├── Serialized                                         │
│  │   │   ├── Kits                                               │
│  │   │   ├── Specifications                                     │
│  │   │   └── Storage                                            │
│  │   ├── Maintenance                                            │
│  │   │   ├── Schedule                                           │
│  │   │   ├── Calibration                                        │
│  │   │   └── Damage Reports                                     │
│  │   ├── Rentals                                                │
│  │   ├── Tracking                                               │
│  │   │   ├── Location                                           │
│  │   │   └── Scan                                               │
│  │   └── Analytics                                              │
│  │       ├── Utilization                                        │
│  │       ├── Performance                                        │
│  │       ├── Idle Analysis                                      │
│  │       └── Optimization                                       │
│  │                                                              │
│  ├── Analytics (Platform)                                       │
│  │   ├── KPIs                                                   │
│  │   ├── Dashboard Builder                                      │
│  │   ├── Data Warehouse                                         │
│  │   └── Client Retention                                       │
│  │                                                              │
│  ├── Integrations                                               │
│  │   ├── Connected Apps                                         │
│  │   ├── API Management                                         │
│  │   │   ├── Keys                                               │
│  │   │   ├── Webhooks                                           │
│  │   │   └── Logs                                               │
│  │   └── Sync Status                                            │
│  │                                                              │
│  └── Settings                                                   │
│      ├── Preferences                                            │
│      ├── Notifications                                          │
│      ├── Security                                               │
│      └── Audit Log                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Event-Level Navigation (Production Context)
*Visible when a production is selected*

```
┌─────────────────────────────────────────────────────────────────┐
│  ATLVS  ◀ Back to Platform    [Production: Festival 2025]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRODUCTION                                                     │
│  ├── Overview                     # Production dashboard        │
│  │                                                              │
│  ├── PLANNING                                                   │
│  │   ├── Schedule                                               │
│  │   │   ├── Timeline                                           │
│  │   │   ├── Tasks                                              │
│  │   │   ├── Contingencies                                      │
│  │   │   └── Templates                                          │
│  │   ├── Shows                                                  │
│  │   │   ├── Run of Show                                        │
│  │   │   ├── Cues                                               │
│  │   │   └── Set Times                                          │
│  │   ├── Venues                                                 │
│  │   │   ├── Locations                                          │
│  │   │   ├── Zones                                              │
│  │   │   └── Maps                                               │
│  │   └── Alignment                 # Stakeholder alignment      │
│  │                                                              │
│  ├── ADVANCING                      # Process requests from COMPVSS │
│  │   ├── Dashboard                  # All advance requests      │
│  │   ├── Pending Review             # Awaiting approval         │
│  │   ├── Approved                   # Ready for allocation      │
│  │   ├── Allocations                # Resource assignment       │
│  │   │   ├── From Inventory         # Owned assets              │
│  │   │   ├── From Rentals           # Rental vendors            │
│  │   │   └── From Procurement       # Purchase orders           │
│  │   ├── Fulfillment                # Delivery tracking         │
│  │   └── History                    # Past requests             │
│  │                                                              │
│  ├── PEOPLE                                                     │
│  │   ├── Team                                                   │
│  │   │   ├── Assignments                                        │
│  │   │   ├── Availability                                       │
│  │   │   └── Training                                           │
│  │   ├── Stakeholders                                           │
│  │   ├── Vendors                                                │
│  │   │   ├── Directory                                          │
│  │   │   ├── Contracts                                          │
│  │   │   └── Rate Cards                                         │
│  │   └── Contacts                                               │
│  │                                                              │
│  ├── FINANCE                                                    │
│  │   ├── Budget                                                 │
│  │   │   ├── Overview                                           │
│  │   │   ├── Categories                                         │
│  │   │   └── Scenarios                                          │
│  │   ├── Expenses                                               │
│  │   │   ├── Submissions                                        │
│  │   │   ├── Approvals                                          │
│  │   │   ├── Categories                                         │
│  │   │   └── Reports                                            │
│  │   ├── Sponsors                                               │
│  │   │   ├── Prospects                                          │
│  │   │   ├── Active                                             │
│  │   │   ├── Tiers                                              │
│  │   │   └── Deliverables                                       │
│  │   ├── Investors                                              │
│  │   │   ├── Rounds                                             │
│  │   │   ├── Commitments                                        │
│  │   │   └── Updates                                            │
│  │   ├── Invoices                                               │
│  │   ├── Contracts                                              │
│  │   ├── Procurement                                            │
│  │   │   ├── Dashboard                                          │
│  │   │   ├── RFPs                                               │
│  │   │   ├── Quotes                                             │
│  │   │   ├── Purchase Orders                                    │
│  │   │   ├── Categories                                         │
│  │   │   ├── Vendor Selection                                   │
│  │   │   ├── Vendor Audits                                      │
│  │   │   ├── Logistics                                          │
│  │   │   └── Emergency                                          │
│  │   └── Accounts                                               │
│  │       ├── Receivable                                         │
│  │       ├── Bank Reconciliation                                │
│  │       ├── Commissions                                        │
│  │       └── Credit Cards                                       │
│  │                                                              │
│  ├── COMPLIANCE                                                 │
│  │   ├── Permits                                                │
│  │   ├── Insurance                                              │
│  │   ├── Legal                                                  │
│  │   │   ├── Privacy                                            │
│  │   │   └── Terms                                              │
│  │   ├── Governance                                             │
│  │   └── Risks                                                  │
│  │                                                              │
│  ├── MARKETING                                                  │
│  │   ├── Campaigns                                              │
│  │   ├── Content                                                │
│  │   ├── Partnerships                                           │
│  │   ├── IP Tracking                                            │
│  │   └── Attribution                                            │
│  │                                                              │
│  ├── METRICS                                                    │
│  │   ├── Dashboard                                              │
│  │   ├── KPIs                                                   │
│  │   ├── Reports                                                │
│  │   └── OKRs                                                   │
│  │                                                              │
│  ├── DOCUMENTS                                                  │
│  │   ├── Files                                                  │
│  │   ├── Templates                                              │
│  │   └── Generator                 # AI Experience Generator    │
│  │                                                              │
│  └── SETTINGS                                                   │
│      ├── Production Details                                     │
│      ├── Team Permissions                                       │
│      └── Integrations                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## COMPVSS Navigation Structure

### Platform-Level Navigation
*Crew management across all productions*

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPVSS                         [Org Switcher] [User Menu]     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PLATFORM                                                       │
│  ├── Dashboard                    # My assignments overview     │
│  ├── My Schedule                  # Personal calendar           │
│  ├── Productions                  # Productions I'm on          │
│  │                                                              │
│  ├── CREW MANAGEMENT                                            │
│  │   ├── Directory                                              │
│  │   ├── Skills Matrix                                          │
│  │   ├── Certifications                                         │
│  │   ├── Background Checks                                      │
│  │   └── Availability                                           │
│  │                                                              │
│  ├── RESOURCES                                                  │
│  │   ├── Knowledge Base                                         │
│  │   ├── SOPs Library                                           │
│  │   ├── Best Practices                                         │
│  │   ├── Glossary                                               │
│  │   └── Case Studies                                           │
│  │                                                              │
│  ├── DEVELOPMENT                                                │
│  │   ├── Training                                               │
│  │   ├── Mentorship                                             │
│  │   └── Opportunities                                          │
│  │                                                              │
│  ├── COMMUNITY                                                  │
│  │   ├── Crew Social                                            │
│  │   ├── Messages                                               │
│  │   └── Channels                                               │
│  │                                                              │
│  └── SETTINGS                                                   │
│      ├── Profile                                                │
│      ├── Preferences                                            │
│      └── Notifications                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Event-Level Navigation (Production Context)
*Operations for a specific production*

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPVSS  ◀ Back to Platform  [Production: Festival 2025]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRODUCTION                                                     │
│  ├── Overview                     # Production dashboard        │
│  │                                                              │
│  ├── SCHEDULE                                                   │
│  │   ├── Run of Show                                            │
│  │   ├── Show Call                                              │
│  │   ├── Set Times                                              │
│  │   ├── Soundcheck                                             │
│  │   ├── Tech Rehearsal                                         │
│  │   └── Build/Strike                                           │
│  │                                                              │
│  ├── CREW                                                       │
│  │   ├── Assignments                                            │
│  │   ├── Timekeeping                                            │
│  │   ├── Credentials                                            │
│  │   │   ├── Issue                                              │
│  │   │   ├── Zone Access                                        │
│  │   │   └── Templates                                          │
│  │   └── Onboarding                                             │
│  │                                                              │
│  ├── ADVANCING                   # Unified cross-app workflow   │
│  │   ├── Dashboard                # My advance requests          │
│  │   ├── New Request              # Create from catalog          │
│  │   ├── Catalog                  # Browse global catalog        │
│  │   ├── Pending                  # Awaiting approval            │
│  │   ├── Approved                 # Ready for fulfillment        │
│  │   └── History                  # Past requests                │
│  │                                                              │
│  ├── OPERATIONS                                                 │
│  │   ├── Stage Management                                       │
│  │   ├── Artists                                                │
│  │   │   ├── Roster                                             │
│  │   │   └── Hospitality                                        │
│  │   ├── VIP Management                                         │
│  │   ├── Catering                                               │
│  │   └── Travel                                                 │
│  │                                                              │
│  ├── LOGISTICS                                                  │
│  │   ├── Equipment                                              │
│  │   ├── Deliveries                                             │
│  │   ├── Vendors                                                │
│  │   ├── Subcontractors                                         │
│  │   └── Venues                                                 │
│  │       ├── Site Surveys                                       │
│  │       ├── Site Access                                        │
│  │       └── Drawings                                           │
│  │                                                              │
│  ├── SAFETY                                                     │
│  │   ├── Emergency Plans                                        │
│  │   ├── Incidents                                              │
│  │   ├── Weather                                                │
│  │   │   └── Contingency                                        │
│  │   ├── Permits                                                │
│  │   └── Risk Register                                          │
│  │                                                              │
│  ├── QUALITY                                                    │
│  │   ├── QA Checkpoints                                         │
│  │   ├── Punch List                                             │
│  │   ├── Issues                                                 │
│  │   └── Troubleshooting                                        │
│  │                                                              │
│  ├── REPORTS                                                    │
│  │   ├── Daily Reports                                          │
│  │   ├── Wrap Reports                                           │
│  │   ├── Expenses                                               │
│  │   ├── Photo Documentation                                    │
│  │   └── Settlement                                             │
│  │                                                              │
│  ├── DOCUMENTS                                                  │
│  │   ├── Files                                                  │
│  │   ├── SOPs                                                   │
│  │   ├── Spec Sheets                                            │
│  │   ├── Templates                                              │
│  │   └── Backup Plans                                           │
│  │                                                              │
│  ├── COMMUNICATION                                              │
│  │   ├── Messages                                               │
│  │   ├── Channels                                               │
│  │   ├── Stakeholder Portal                                     │
│  │   └── Social Amplification                                   │
│  │                                                              │
│  └── OFFLINE                      # Offline-capable features    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## GVTEWAY Navigation Structure

### Consumer Navigation (Attendee Context)

```
┌─────────────────────────────────────────────────────────────────┐
│  GVTEWAY                                    [Cart] [User Menu]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DISCOVER                                                       │
│  ├── Home                         # Personalized feed           │
│  ├── Browse                                                     │
│  │   ├── Events                                                 │
│  │   ├── Experiences                                            │
│  │   ├── Tours                                                  │
│  │   ├── Artists                                                │
│  │   └── Venues                                                 │
│  ├── Search                                                     │
│  ├── Nearby                                                     │
│  ├── Calendar                                                   │
│  └── Destinations                                               │
│                                                                 │
│  MY STUFF                                                       │
│  ├── My Events                    # Upcoming & past             │
│  ├── Tickets                                                    │
│  │   ├── Active                                                 │
│  │   ├── Transfer                                               │
│  │   └── Resale                                                 │
│  ├── Wallet                                                     │
│  ├── Orders                                                     │
│  ├── Favorites                                                  │
│  ├── Wishlist                                                   │
│  └── Saved Searches                                             │
│                                                                 │
│  COMMUNITY                                                      │
│  ├── Friends                                                    │
│  ├── Groups                                                     │
│  ├── Forums                                                     │
│  ├── Fan Clubs                                                  │
│  ├── Reviews                                                    │
│  └── Photos                                                     │
│                                                                 │
│  REWARDS                                                        │
│  ├── Points                                                     │
│  ├── Membership                                                 │
│  ├── Referrals                                                  │
│  └── Deals                                                      │
│                                                                 │
│  SHOP                                                           │
│  ├── Merch                                                      │
│  ├── Gift Cards                                                 │
│  └── Packages                                                   │
│                                                                 │
│  SUPPORT                                                        │
│  ├── Help                                                       │
│  ├── Messages                                                   │
│  └── Accessibility                                              │
│                                                                 │
│  SETTINGS                                                       │
│  ├── Profile                                                    │
│  ├── Notifications                                              │
│  ├── Privacy                                                    │
│  └── Language                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Event Context Navigation (During Event)
*Contextual nav when attending an event*

```
┌─────────────────────────────────────────────────────────────────┐
│  GVTEWAY  ◀ Exit Event Mode   [Event: Festival 2025]           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EVENT                                                          │
│  ├── Home                         # Event landing               │
│  ├── Program                      # Schedule/lineup             │
│  ├── Map                          # Interactive venue map       │
│  ├── My Ticket                    # QR code, entry info         │
│  │                                                              │
│  ├── NAVIGATE                                                   │
│  │   ├── Directions                                             │
│  │   ├── Parking                                                │
│  │   ├── Seating                                                │
│  │   └── Accessibility                                          │
│  │                                                              │
│  ├── CONNECT                                                    │
│  │   ├── Friends at Event                                       │
│  │   ├── Chat                                                   │
│  │   ├── Social Wall                                            │
│  │   └── Photo Booth                                            │
│  │                                                              │
│  ├── ENGAGE                                                     │
│  │   ├── Q&A Sessions                                           │
│  │   ├── Polls                                                  │
│  │   ├── Challenges                                             │
│  │   └── UGC                                                    │
│  │                                                              │
│  ├── SERVICES                                                   │
│  │   ├── Lost & Found                                           │
│  │   ├── Support Chat                                           │
│  │   └── Emergency Info                                         │
│  │                                                              │
│  └── SHOP                                                       │
│      ├── Merch                                                  │
│      └── F&B                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Role-Based Navigation Visibility

### Platform-Level Roles (ATLVS)

| Role | Dashboard | Productions | Finance | CRM | Assets | Analytics | Integrations | Settings |
|------|-----------|-------------|---------|-----|--------|-----------|--------------|----------|
| **Super Admin** | Full | Full | Full | Full | Full | Full | Full | Full |
| **Org Admin** | Full | Full | Full | Full | Full | Full | Full | Full |
| **Finance Director** | Summary | Read | Full | Read | Read | Full | Read | Limited |
| **Production Manager** | Summary | Full | Read | Read | Read | Read | Read | Limited |
| **Sales Director** | Summary | Read | Read | Full | - | Read | Read | Limited |
| **Operations Director** | Summary | Read | Read | Read | Full | Read | Read | Limited |

### Event-Level Roles (ATLVS/COMPVSS)

| Role | Planning | People | Finance | Compliance | Marketing | Metrics | Documents |
|------|----------|--------|---------|------------|-----------|---------|-----------|
| **Executive Producer** | Full | Full | Full | Full | Full | Full | Full |
| **Production Manager** | Full | Full | Read | Full | Read | Full | Full |
| **Finance Manager** | Read | Read | Full | Read | - | Read | Read |
| **Operations Manager** | Full | Full | Read | Read | - | Read | Full |
| **Marketing Manager** | Read | Read | Read | - | Full | Read | Read |
| **Department Head** | Own Dept | Own Dept | Own Dept | Read | - | Own Dept | Own Dept |
| **Crew Member** | Read | Read | - | - | - | - | Read |

---

## Implementation Approach

### Phase 1: Navigation Infrastructure (Week 1-2)
1. Create shared navigation config types
2. Implement context switcher component (Platform ↔ Event)
3. Build role-based visibility hooks
4. Create navigation state management

### Phase 2: ATLVS Restructure (Week 3-4)
1. Reorganize routes to match new structure
2. Implement platform-level navigation
3. Implement event-level navigation
4. Add breadcrumb system

### Phase 3: COMPVSS Restructure (Week 5-6)
1. Reorganize routes to match new structure
2. Implement platform-level navigation
3. Implement event-level navigation
4. Sync with ATLVS patterns

### Phase 4: GVTEWAY Restructure (Week 7-8)
1. Reorganize routes to match new structure
2. Implement consumer navigation
3. Implement event context navigation
4. Add mobile-first optimizations

### Phase 5: Cross-App Integration (Week 9-10)
1. Implement deep linking between apps
2. Add unified search across contexts
3. Create shared notification system
4. Build command palette (Cmd+K)

---

## Navigation Components

### Required Components

```typescript
// Navigation config type
interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavItem[];
  badge?: string | number;
  roles?: string[];           // Required roles to see
  permissions?: string[];     // Required permissions
  contextLevel: 'platform' | 'event' | 'both';
  apps?: ('atlvs' | 'compvss' | 'gvteway')[];
}

// Context switcher
interface NavigationContext {
  level: 'platform' | 'event';
  organizationId?: string;
  productionId?: string;
  eventId?: string;
}

// Sidebar component props
interface SidebarProps {
  context: NavigationContext;
  userRoles: string[];
  userPermissions: string[];
  collapsed?: boolean;
}
```

### Key Components to Build
1. **ContextSwitcher** - Toggle between platform and event views
2. **ProductionSelector** - Dropdown to select active production
3. **RoleAwareNav** - Navigation that filters by role
4. **BreadcrumbTrail** - Context-aware breadcrumbs
5. **CommandPalette** - Quick navigation (Cmd+K)
6. **MobileNav** - Responsive bottom navigation

---

## URL Structure

### ATLVS Routes
```
Platform Level:
/dashboard                      # Platform dashboard
/productions                    # All productions
/organization/*                 # Org settings
/finance/*                      # Platform finance
/crm/*                          # CRM features
/assets/*                       # Global assets
/analytics/*                    # Platform analytics
/integrations/*                 # API & integrations
/settings/*                     # User settings

Event Level:
/p/[productionId]               # Production dashboard
/p/[productionId]/schedule/*    # Schedule features
/p/[productionId]/shows/*       # Shows & cues
/p/[productionId]/venues/*      # Venues & zones
/p/[productionId]/team/*        # Team management
/p/[productionId]/finance/*     # Production finance
/p/[productionId]/compliance/*  # Permits, insurance
/p/[productionId]/marketing/*   # Marketing features
/p/[productionId]/metrics/*     # Production metrics
/p/[productionId]/documents/*   # Files & templates
/p/[productionId]/settings/*    # Production settings
```

### COMPVSS Routes
```
Platform Level:
/dashboard                      # My dashboard
/schedule                       # My schedule
/productions                    # My productions
/crew/*                         # Crew management
/resources/*                    # Knowledge base
/development/*                  # Training
/community/*                    # Social features
/settings/*                     # User settings

Event Level:
/p/[productionId]               # Production dashboard
/p/[productionId]/schedule/*    # Run of show, etc.
/p/[productionId]/crew/*        # Crew assignments
/p/[productionId]/operations/*  # Stage mgmt, artists
/p/[productionId]/logistics/*   # Equipment, vendors
/p/[productionId]/safety/*      # Emergency, incidents
/p/[productionId]/quality/*     # QA, punch list
/p/[productionId]/reports/*     # Daily, wrap reports
/p/[productionId]/documents/*   # SOPs, files
/p/[productionId]/comms/*       # Messages, channels
```

### GVTEWAY Routes
```
Consumer Level:
/                               # Home
/browse/*                       # Discovery
/search                         # Search
/my-events                      # My events
/tickets/*                      # Ticket management
/wallet                         # Digital wallet
/community/*                    # Social features
/rewards/*                      # Loyalty program
/shop/*                         # Merch, gifts
/settings/*                     # User settings

Event Context:
/e/[eventId]                    # Event landing
/e/[eventId]/program            # Schedule
/e/[eventId]/map                # Venue map
/e/[eventId]/ticket             # My ticket
/e/[eventId]/connect/*          # Social features
/e/[eventId]/engage/*           # Interactive features
/e/[eventId]/services/*         # Support
/e/[eventId]/shop/*             # Event merch
```

---

## Migration Strategy

### Route Redirects
All existing routes should redirect to new structure:
```typescript
// Example redirects for ATLVS
const redirects = [
  { from: '/sponsors', to: '/p/:productionId/finance/sponsors' },
  { from: '/investors', to: '/p/:productionId/finance/investors' },
  { from: '/expenses', to: '/p/:productionId/finance/expenses' },
  { from: '/permits', to: '/p/:productionId/compliance/permits' },
  { from: '/insurance', to: '/p/:productionId/compliance/insurance' },
  { from: '/schedule/*', to: '/p/:productionId/schedule/*' },
  { from: '/venues/*', to: '/p/:productionId/venues/*' },
  // ... etc
];
```

### Backward Compatibility
- Maintain old routes with redirects for 6 months
- Add deprecation warnings in console
- Update all internal links progressively
- Provide migration guide for API consumers

---

## Success Metrics

1. **Navigation Efficiency**: Reduce average clicks to reach any feature by 40%
2. **Context Clarity**: 95% of users correctly identify current context
3. **Role Adoption**: 100% of features respect role-based visibility
4. **Mobile Usability**: Navigation works on all screen sizes
5. **Performance**: Navigation renders in < 100ms

---

## Next Steps

1. [ ] Review and approve this architecture
2. [ ] Create navigation config files
3. [ ] Build shared navigation components
4. [ ] Implement context switching
5. [ ] Migrate ATLVS routes
6. [ ] Migrate COMPVSS routes
7. [ ] Migrate GVTEWAY routes
8. [ ] Add redirects for backward compatibility
9. [ ] Update documentation
10. [ ] User testing and iteration
