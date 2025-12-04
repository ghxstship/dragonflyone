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
│  │   └── Templates                                              │
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
│  ├── CRM                                                        │
│  │   ├── Contacts                                               │
│  │   ├── Leads                                                  │
│  │   ├── Deals                                                  │
│  │   ├── Pipeline                                               │
│  │   └── Relationships                                          │
│  │                                                              │
│  ├── Assets (Global)                                            │
│  │   ├── Inventory                                              │
│  │   ├── Maintenance                                            │
│  │   ├── Rentals                                                │
│  │   └── Tracking                                               │
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
│  ├── PEOPLE                                                     │
│  │   ├── Team                                                   │
│  │   │   ├── Assignments                                        │
│  │   │   ├── Availability                                       │
│  │   │   └── Training                                           │
│  │   ├── Stakeholders                                           │
│  │   ├── Vendors                                                │
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
│  │   └── Procurement                                            │
│  │       ├── RFPs                                               │
│  │       ├── Quotes                                             │
│  │       └── Purchase Orders                                    │
│  │                                                              │
│  ├── COMPLIANCE                                                 │
│  │   ├── Permits                                                │
│  │   ├── Insurance                                              │
│  │   ├── Legal                                                  │
│  │   ├── Governance                                             │
│  │   └── Risks                                                  │
│  │                                                              │
│  ├── MARKETING                                                  │
│  │   ├── Campaigns                                              │
│  │   ├── Content                                                │
│  │   ├── Partnerships                                           │
│  │   └── IP Tracking                                            │
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
│  ├── OPERATIONS                                                 │
│  │   ├── Stage Management                                       │
│  │   ├── Artists                                                │
│  │   │   ├── Advancing                                          │
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
