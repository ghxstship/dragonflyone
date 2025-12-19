# GHXSTSHIP Platform Pricing Structure Optimization Plan

**Created:** December 19, 2024  
**Status:** Strategic Planning Document  
**Version:** 1.0

---

## Executive Summary

This document outlines a tiered pricing structure for the GHXSTSHIP platform ecosystem, designed to maximize market penetration across different customer segments while enabling clear upgrade paths and bundle economics.

---

## Tier Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GHXSTSHIP PRICING TIERS                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LEVEL 4 ─────────── ATLVS + COMPVSS + GVTEWAY (Full Suite)                │
│      ▲                                                                      │
│      │                                                                      │
│  LEVEL 3b ────────── ATLVS + GVTEWAY (Project Management + Ticketing)      │
│      │                                                                      │
│  LEVEL 3a ────────── ATLVS + COMPVSS (Project Management + Ops)            │
│      ▲                                                                      │
│      │                                                                      │
│  LEVEL 2 ─────────── ATLVS Only (Business Operations Standalone)            │
│                      └── Optional: 3rd Party Integrations (ConnectTeam)     │
│                                                                             │
│  LEVEL 1 ─────────── COMPVSS Only (Site Operations Standalone)              │
│                      └── Can JOIN ATLVS projects (cross-org capable)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Level 1: COMPVSS Standalone

### Target Customer Profile
- **Primary:** Teams, Vendors, Contractors, Subcontractors
- **Use Case:** On-site project/punch list management, crew management
- **Organization Type:** Service providers, labor companies, technical vendors

### Core Value Proposition
*"Professional-grade site operations for crews who work the ground"*

### Feature Set (172 Pages of Functionality)

#### Crew Management
- `/crew` - Crew directory with skills matrix
- `/crew/assign` - Crew assignments and scheduling
- `/crew/background-checks` - Background verification
- `/directory` - Full directory with availability tracking
- `/directory/availability` - Real-time availability management

#### Self-Service Portal (My Portal)
- `/my-assignments` - View assigned work
- `/my-contracts` - Contract access
- `/my-credentials` - Credential management
- `/my-schedule` - Personal schedule view
- `/my-timesheets` - Time entry and tracking
- `/my-training` - Training modules access

#### Operations
- `/punch-list` - Task and issue tracking
- `/schedule` - Production scheduling
- `/timekeeping` - Labor hours tracking
- `/equipment` - Equipment checkout/management
- `/logistics` - Transportation and logistics
- `/catering` - Hospitality coordination

#### Safety & Compliance
- `/safety` - Safety protocols
- `/incidents` - Incident reporting
- `/credentials` - Credentialing system
- `/certifications` - Certification tracking
- `/background-checks` - Verification status

#### Communications
- `/communications` - Team messaging
- `/channels` - Channel-based communication
- `/messages` - Direct messaging

#### Documentation
- `/knowledge` - Knowledge base access
- `/sops` - Standard operating procedures
- `/templates` - Document templates

### Cross-Organization Capability
- **JOIN Mode:** Can be invited to ATLVS projects owned by same or different organizations
- **Data Isolation:** Vendor/contractor data remains isolated per project engagement
- **Permission Inheritance:** Role-based access controlled by project owner

### Pricing Considerations
- Per-seat pricing for crew members
- Tiered by active crew count (10, 25, 50, 100, 250+)
- Project-based pricing option for short-term engagements

---

## Level 2: ATLVS Standalone

### Target Customer Profile
- **Primary:** Producers, Promoters, Executives
- **Use Case:** Business operations, finance, project management at organization level
- **Organization Type:** Production companies, promoters, venue operators

### Core Value Proposition
*"Complete business operations command center for entertainment executives"*

### Feature Set (366 Pages of Functionality)

#### Business Operations Dashboard
- `/dashboard` - Executive KPI dashboard
- `/analytics` - Business analytics
- `/analytics/pipeline` - Sales pipeline analytics
- `/analytics/revenue` - Revenue analytics

#### CRM & Sales
- `/crm` - Full CRM system
- `/pipeline` - Sales pipeline management
- `/leads` - Lead management and scoring
- `/opportunities` - Opportunity tracking
- `/contacts` - Contact management
- `/proposals` - Proposal generation
- `/contracts` - Contract management

#### Finance & Accounting
- `/finance` - Finance dashboard
- `/invoices` - Invoice management
- `/expenses` - Expense tracking and approval
- `/budgets` - Budget management
- `/payroll` - Payroll processing
- `/billing` - Client billing
- `/quotes` - Quote generation
- `/purchase-orders` - PO management

#### Project Management
- `/projects` - Project portfolio
- `/productions` - Production management
- `/schedule` - Master scheduling
- `/assets` - Asset inventory
- `/vendors` - Vendor management

#### Compliance & Risk
- `/compliance` - Compliance tracking
- `/risks` - Risk register
- `/audit` - Audit trail
- `/insurance` - Insurance management
- `/permits` - Permit tracking

#### HR & Workforce
- `/employees` - Employee management
- `/workforce` - Workforce planning
- `/training` - Training management
- `/performance` - Performance reviews
- `/timesheets` - Timesheet approval

#### Portals
- `/portal/investor` - Investor relations
- `/portal/sponsor` - Sponsor management
- `/portal/vendor` - Vendor self-service

### Optional 3rd Party Integrations
When staying at Level 2 without COMPVSS:
- **ConnectTeam** - Field workforce management
- **Deputy** - Scheduling and time tracking
- **Homebase** - Team scheduling
- **When I Work** - Employee scheduling
- **7shifts** - Shift management

### Integration Architecture for 3rd Party
```
ATLVS (Level 2)
     │
     ├── Native API Endpoints
     │   ├── /api/integrations/connect-team
     │   ├── /api/integrations/deputy
     │   └── /api/integrations/generic-webhook
     │
     └── Sync Capabilities
         ├── Crew roster sync (one-way push)
         ├── Project details sync
         ├── Schedule sync (bi-directional)
         └── Timesheet import (pull)
```

### Pricing Considerations
- Per-organization pricing
- Tiered by annual revenue or project count
- User seat add-ons for team members
- Integration fees for 3rd party connectors

---

## Level 3a: ATLVS + COMPVSS Bundle

### Target Customer Profile
- **Primary:** Full-service production companies
- **Use Case:** End-to-end project management with native site operations
- **Organization Type:** Vertically integrated producers, large venue operators

### Core Value Proposition
*"Unified command from boardroom to build site"*

### Combined Feature Set (538 Pages)
All ATLVS features (366) + All COMPVSS features (172)

### Key Integration Points

#### Project-to-Production Handoff
```
ATLVS Deal Won → Auto-creates COMPVSS Production
     │
     ├── Budget allocation flows to production
     ├── Vendor contracts sync to site ops
     ├── Schedule milestones propagate
     └── Crew requirements generated
```

#### Unified Data Flow
- `/api/integrations/project-to-event` - Project sync
- `/api/advancing` - Advancing requests flow COMPVSS → ATLVS
- `/api/advances/[id]/approve` - Approval workflow
- `/api/advancing/[id]/fulfill` - Fulfillment tracking

#### Consolidated Reporting
- Unified financial view across office and field
- Consolidated labor costs
- Real-time budget burn from field operations
- Project P&L with operational detail

### Bundle Benefits vs Separate Licenses
| Capability | Separate | Bundle |
|------------|----------|--------|
| Data sync | Manual export/import | Real-time bidirectional |
| User experience | Separate logins | SSO unified |
| Reporting | Separate reports | Consolidated dashboards |
| Workflows | Manual handoffs | Automated triggers |
| Billing | Two invoices | Single invoice |

### Pricing Considerations
- Bundle discount (15-25% vs purchasing separately)
- Unified seat pricing across both platforms
- Shared storage and API limits

---

## Level 3b: ATLVS + GVTEWAY Bundle

### Target Customer Profile
- **Primary:** Promoters focused on ticket sales and fan experience
- **Use Case:** Project management with consumer ticketing integration
- **Organization Type:** Promoters, festival organizers, venue operators with owned ticketing

### Core Value Proposition
*"From deal to door - own the entire fan journey"*

### Combined Feature Set (562 Pages)
All ATLVS features (366) + All GVTEWAY features (196)

### Key Integration Points

#### Deal-to-Event Publishing
```
ATLVS Project Approved → Publishes to GVTEWAY
     │
     ├── Event details (date, venue, lineup)
     ├── Ticket inventory allocation
     ├── Pricing tiers
     └── Marketing assets
```

#### Revenue Integration
- `/api/orders/revenue-sync` - Real-time ticket revenue → ATLVS finance
- Automated settlement reconciliation
- Consolidated financial reporting

#### Consumer Features (GVTEWAY)
- `/events` - Event discovery and listing
- `/tickets` - Ticket purchasing
- `/checkout` - Payment processing
- `/wallet` - Digital wallet
- `/membership` - Membership programs
- `/rewards` - Loyalty program
- `/artists` - Artist following
- `/community` - Fan community

### Use Case: 3rd Party Site Ops
When site operations handled externally:
- Import crew schedules via API
- Push event details to external ops platforms
- Receive settlement data from operations vendor

### Pricing Considerations
- Per-event or transaction-based pricing for GVTEWAY
- Ticket transaction fees (% of GMV)
- Platform fee plus per-ticket fee
- Bundle discount on ATLVS base

---

## Level 4: Full Suite (ATLVS + COMPVSS + GVTEWAY)

### Target Customer Profile
- **Primary:** Vertically integrated entertainment enterprises
- **Use Case:** Complete ecosystem ownership from business to operations to consumer
- **Organization Type:** Major promoters, venue management companies, integrated producers

### Core Value Proposition
*"The complete entertainment operating system"*

### Combined Feature Set (734 Pages)
All ATLVS features (366) + All COMPVSS features (172) + All GVTEWAY features (196)

### Full Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEVEL 4: FULL SUITE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   ATLVS     │◄──►│   COMPVSS   │◄──►│   GVTEWAY   │         │
│  │  Business   │    │  Operations │    │  Consumer   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                 │
│         ▼                  ▼                  ▼                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              UNIFIED DATA LAYER                      │       │
│  │  - Single Supabase instance                         │       │
│  │  - Cross-platform RLS policies                      │       │
│  │  - Shared entity relationships                      │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### End-to-End Workflow Example

```
1. ATLVS: Deal closed for festival
   └── Project created, budget approved
   
2. ATLVS → COMPVSS: Production handoff
   └── Production created, advancing begins
   
3. ATLVS → GVTEWAY: Event published
   └── Tickets on sale, marketing live
   
4. GVTEWAY → ATLVS: Revenue flows
   └── Real-time ticket sales to finance
   
5. COMPVSS: Operations execution
   └── Crew managed, schedules set, punch lists complete
   
6. GVTEWAY: Event day
   └── Check-in, fan engagement, real-time capacity
   
7. COMPVSS → ATLVS: Settlement
   └── Labor actuals, vendor invoices reconciled
   
8. ATLVS: Close & report
   └── Final P&L, investor reporting, audit trail
```

### Enterprise Features (Full Suite Only)
- **Unified Analytics:** Cross-platform dashboards
- **Single Sign-On:** One login, all platforms
- **Consolidated Billing:** Single invoice
- **Priority Support:** Dedicated success manager
- **Custom Integrations:** API priority access
- **Data Warehouse:** Unified reporting layer
- **White-Label Options:** Custom branding per platform

### Pricing Considerations
- Enterprise annual contract
- Maximum bundle discount (30-40% vs à la carte)
- Unlimited users within organization
- Volume-based transaction pricing on GVTEWAY
- Dedicated infrastructure option

---

## Pricing Model Recommendations

### Structure Options

#### Option A: Seat-Based + Transaction Fees
| Tier | Base (Monthly) | Per Seat | Transaction Fee |
|------|---------------|----------|-----------------|
| Level 1 (COMPVSS) | $299 | $29/crew | N/A |
| Level 2 (ATLVS) | $799 | $49/user | N/A |
| Level 3a (A+C) | $999 | $39/user | N/A |
| Level 3b (A+G) | $799 | $49/user | 2.5% + $0.50/ticket |
| Level 4 (Full) | $1,499 | $35/user | 2.0% + $0.40/ticket |

#### Option B: Revenue-Based Tiers
| Annual Revenue | Level 1 | Level 2 | Level 3a | Level 3b | Level 4 |
|----------------|---------|---------|----------|----------|---------|
| <$500K | $199/mo | $499/mo | $649/mo | $649/mo | $899/mo |
| $500K-$2M | $399/mo | $999/mo | $1,299/mo | $1,299/mo | $1,799/mo |
| $2M-$10M | $799/mo | $1,999/mo | $2,599/mo | $2,599/mo | $3,599/mo |
| $10M+ | Custom | Custom | Custom | Custom | Custom |

#### Option C: Hybrid Model (Recommended)
- **Base Platform Fee:** Tiered by organization size
- **Active User Fee:** Per-seat charges for active monthly users
- **Transaction Fee:** GVTEWAY-only, percentage of ticket GMV
- **Overage Pricing:** API calls, storage, beyond base limits

### Discount Structure

| Commitment | Discount |
|------------|----------|
| Monthly | 0% |
| Annual (prepaid) | 15% |
| 2-Year (prepaid) | 25% |
| Enterprise (custom) | 30-40% |

### Upgrade Path Economics

```
Level 1 → Level 3a: Add ATLVS at 80% of standalone price
Level 2 → Level 3a: Add COMPVSS at 75% of standalone price
Level 2 → Level 3b: Add GVTEWAY at 80% of standalone price
Level 3a → Level 4: Add GVTEWAY at 70% of standalone price
Level 3b → Level 4: Add COMPVSS at 65% of standalone price
```

---

## Implementation Considerations

### Technical Requirements

#### Multi-Tenancy Model
- Organization-level data isolation
- Cross-org collaboration for Level 1 JOIN capability
- Subscription-aware feature gating

#### Feature Flags by Tier
```typescript
interface TierFeatures {
  level1: {
    compvss: true,
    atlvs: false,
    gvteway: false,
    joinAtlvsProjects: true,
    apiAccess: 'basic',
  },
  level2: {
    compvss: false,
    atlvs: true,
    gvteway: false,
    thirdPartyIntegrations: true,
    apiAccess: 'standard',
  },
  level3a: {
    compvss: true,
    atlvs: true,
    gvteway: false,
    nativeIntegration: true,
    apiAccess: 'full',
  },
  level3b: {
    compvss: false,
    atlvs: true,
    gvteway: true,
    ticketTransactions: true,
    apiAccess: 'full',
  },
  level4: {
    compvss: true,
    atlvs: true,
    gvteway: true,
    enterprise: true,
    apiAccess: 'unlimited',
  },
}
```

#### Billing Integration
- Stripe subscription management
- Usage-based metering for transactions
- Seat count tracking
- Automated upgrade/downgrade handling

### Database Considerations
- Subscription tier stored at organization level
- Feature access via RLS policies
- Cross-org JOIN permissions table
- Usage metering tables for billing

---

## Migration Path for Existing Users

### From Free/Trial
1. Select primary use case (site ops vs business ops)
2. Start at Level 1 or Level 2
3. 30-day free trial of higher tier features
4. Automatic downgrade or upgrade prompt

### From Single App to Bundle
1. Prorated credit for remaining subscription
2. Data migration handled automatically
3. Unified billing starts next cycle
4. Training resources for new features

---

## Competitive Positioning

### Level 1 (COMPVSS) vs Competitors
- **vs ConnectTeam:** Entertainment-industry-specific
- **vs Deputy:** Production workflow integration
- **vs Crew:** Upgrade path to full suite

### Level 2 (ATLVS) vs Competitors
- **vs Monday.com:** Industry-specific workflows
- **vs Salesforce:** Built for entertainment vertical
- **vs Custom ERP:** Lower TCO, faster deployment

### Level 3-4 (Bundles) vs Competitors
- **vs Point Solutions:** Single vendor, unified data
- **vs Enterprise Suites:** Purpose-built for entertainment
- **vs Custom Build:** Proven platform, faster time-to-value

---

## Success Metrics

### Tier Health Indicators
| Metric | Level 1 | Level 2 | Level 3a | Level 3b | Level 4 |
|--------|---------|---------|----------|----------|---------|
| Target ARPU | $500/mo | $1,500/mo | $2,000/mo | $2,500/mo | $5,000/mo |
| Target Churn | <5%/mo | <4%/mo | <3%/mo | <3%/mo | <2%/mo |
| Upgrade Rate | 15%/yr | 20%/yr | 10%/yr | 10%/yr | N/A |
| NPS Target | 40+ | 45+ | 50+ | 50+ | 60+ |

### Conversion Funnel
```
Awareness → Trial → Level 1/2 → Level 3 → Level 4
   100%      20%      10%        5%        2%
```

---

## Next Steps

### Phase 1: Foundation (Week 1-2)
- [ ] Finalize pricing numbers with finance
- [ ] Define exact feature boundaries per tier
- [ ] Build subscription management infrastructure

### Phase 2: Implementation (Week 3-4)
- [ ] Implement feature flags by tier
- [ ] Configure Stripe products and prices
- [ ] Build upgrade/downgrade flows

### Phase 3: Launch (Week 5-6)
- [ ] Update marketing site with pricing page
- [ ] Train sales team on tier positioning
- [ ] Launch with existing customer migration plan

### Phase 4: Optimization (Ongoing)
- [ ] A/B test pricing levels
- [ ] Monitor conversion and churn by tier
- [ ] Adjust based on market feedback

---

## Appendix: Feature Matrix

| Feature Category | L1 | L2 | L3a | L3b | L4 |
|-----------------|----|----|-----|-----|-----|
| **COMPVSS** |
| Crew Management | ✓ | - | ✓ | - | ✓ |
| Punch Lists | ✓ | - | ✓ | - | ✓ |
| Timekeeping | ✓ | - | ✓ | - | ✓ |
| Site Communications | ✓ | - | ✓ | - | ✓ |
| Safety/Incidents | ✓ | - | ✓ | - | ✓ |
| **ATLVS** |
| CRM/Pipeline | - | ✓ | ✓ | ✓ | ✓ |
| Finance/Accounting | - | ✓ | ✓ | ✓ | ✓ |
| Project Management | - | ✓ | ✓ | ✓ | ✓ |
| Vendor Management | - | ✓ | ✓ | ✓ | ✓ |
| Compliance/Risk | - | ✓ | ✓ | ✓ | ✓ |
| **GVTEWAY** |
| Event Listing | - | - | - | ✓ | ✓ |
| Ticket Sales | - | - | - | ✓ | ✓ |
| Fan Experience | - | - | - | ✓ | ✓ |
| Membership/Rewards | - | - | - | ✓ | ✓ |
| **INTEGRATIONS** |
| JOIN ATLVS Projects | ✓ | - | ✓ | - | ✓ |
| 3rd Party Site Ops | - | ✓ | - | ✓ | - |
| Native ATLVS↔COMPVSS | - | - | ✓ | - | ✓ |
| Native ATLVS↔GVTEWAY | - | - | - | ✓ | ✓ |
| Revenue Sync | - | - | - | ✓ | ✓ |
| Unified SSO | - | - | ✓ | ✓ | ✓ |

---

*Document maintained by Product Team*  
*Last updated: December 19, 2024*
