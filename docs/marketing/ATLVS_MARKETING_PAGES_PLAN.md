# ATLVS Marketing Pages Enhancement Plan

> Comprehensive plan for enhancing ATLVS public marketing pages with V3Expansion features and new page structures.

**Created:** December 17, 2025  
**Status:** Planning  
**Owner:** Engineering Team

---

## Executive Summary

This plan enhances the ATLVS public marketing pages by:
1. **Integrating V3Expansion features** (47 new features) IN ADDITION TO existing platform capabilities
2. **Adding comprehensive Products pages** for ATLVS, COMPVSS, and GVTEWAY
3. **Creating 15 Solution pages** targeting specific user personas
4. **Expanding Resources and Pricing** with detailed information
5. **Updating the public header navigation** with mega-menu dropdowns

---

## Current State Analysis

### Existing Marketing Pages
| Page | Path | Status |
|------|------|--------|
| Landing Page | `/` | Complete |
| Features | `/features` | Basic - needs V3 expansion |
| Pricing | `/pricing` | Basic - needs detail |
| Verticals | `/verticals/*` | 4 pages (productions, activations, installations, destinations) |
| About | `/about` | Exists |
| Contact | `/contact` | Exists |
| Demo | `/demo` | Exists |
| Blog | `/blog` | Exists |
| Help | `/help/*` | Multiple pages |
| Legal | `/legal/*` | Multiple pages |

### Existing Navigation Structure
```
ATLVS Logo | Features | Pricing | About | [Get Started] [Sign In]
```

---

## Part 1: V3Expansion Features Integration

The V3Expansion document introduces **47 new features** across three categories. These must be integrated INTO existing marketing content, not replace it.

### Category A: Venue Management (22 features)
These features expand ATLVS's capabilities for venue-based event management.

| Feature ID | Feature Name | Priority | Integration Target |
|------------|--------------|----------|-------------------|
| LM-001 | Lead Capture Web Forms | CRITICAL | Products/ATLVS, Solutions/Venues |
| LM-002 | Visual Pipeline Management | CRITICAL | Products/ATLVS, Solutions/Producers |
| LM-003 | Contact & Account Database | CRITICAL | Products/ATLVS, Features |
| BK-001 | Master Event Calendar | CRITICAL | Products/ATLVS, Features |
| BK-002 | Space/Room Management | CRITICAL | Solutions/Venues |
| BK-003 | Availability & Holds System | CRITICAL | Solutions/Venues |
| BK-004 | Event Booking Workflow | CRITICAL | Products/ATLVS, Solutions/Venues |
| DG-001 | Proposal Builder | CRITICAL | Products/ATLVS, Solutions/Producers |
| DG-002 | Contract Generation & E-Signatures | CRITICAL | Products/ATLVS, Features |
| DG-003 | BEO Generation | CRITICAL | Solutions/Venues, Solutions/Producers |
| DG-004 | Invoice & Payment Generation | CRITICAL | Products/ATLVS, Features |
| PM-001 | Integrated Payment Gateway | CRITICAL | Products/ATLVS, Features |
| PM-002 | Deposit & Payment Schedule | CRITICAL | Products/ATLVS, Features |
| FP-001 | 2D Floor Plan Designer | HIGH | Products/ATLVS, Features |
| FP-002 | 3D Venue Visualization | MEDIUM | Products/ATLVS, Features |
| CP-001 | Client Self-Service Portal | HIGH | Products/ATLVS, Solutions/Producers |
| CP-002 | Email Management & Tracking | HIGH | Products/ATLVS, Features |
| TK-001 | Event Ticketing Platform | HIGH | Products/GVTEWAY, Features |
| TK-002 | Self-Service Booking | HIGH | Products/GVTEWAY, Solutions/Venues |
| RP-001 | Real-Time Analytics Dashboard | HIGH | Products/ATLVS, Features |
| RP-002 | Custom Report Builder | HIGH | Products/ATLVS, Features |
| MB-001 | Venue Staff Mobile App | HIGH | Products/ATLVS, Features |
| INT-001 | Core Integration Suite | HIGH | Products/ATLVS, Features |

### Category B: Vendor Services (21 features)
These features add comprehensive vendor/supplier management capabilities.

| Feature ID | Feature Name | Priority | Integration Target |
|------------|--------------|----------|-------------------|
| VD-001 | Vendor/Supplier Database | CRITICAL | Products/ATLVS, Solutions/Vendors |
| VD-002 | Preferred Vendor Lists | HIGH | Solutions/Vendors, Solutions/Venues |
| VD-003 | Vendor Performance Tracking | HIGH | Products/ATLVS, Solutions/Contractors |
| PC-001 | Global Product/Service Catalog | CRITICAL | Products/ATLVS, Features |
| PC-002 | Production Technical Catalog | CRITICAL | Products/COMPVSS, Solutions/Crews |
| PC-003 | Site Operations Catalog | HIGH | Products/ATLVS, Solutions/Contractors |
| PC-004 | People & Services Catalog | HIGH | Products/COMPVSS, Solutions/Staffing |
| PC-005 | Logistics & Travel Catalog | MEDIUM | Products/ATLVS, Features |
| PC-006 | Marketing & Merchandise Catalog | MEDIUM | Products/GVTEWAY, Features |
| VO-001 | Vendor Order/Request System | CRITICAL | Products/ATLVS, Solutions/Vendors |
| VO-002 | RFP/Quote Request System | HIGH | Products/ATLVS, Solutions/Producers |
| VO-003 | Purchase Order Management | HIGH | Products/ATLVS, Features |
| IM-001 | Equipment Inventory System | HIGH | Products/ATLVS, Solutions/Contractors |
| IM-002 | Rental Management System | HIGH | Products/ATLVS, Solutions/Venues |
| IM-003 | Consumables & Supplies Tracking | MEDIUM | Products/ATLVS, Features |
| VF-001 | Vendor Invoice Management | HIGH | Products/ATLVS, Features |
| VF-002 | Vendor Payment Processing | HIGH | Products/ATLVS, Features |
| VF-003 | Event Cost Tracking & Profitability | HIGH | Products/ATLVS, Solutions/Producers |
| VS-001 | Vendor Scheduling & Load-In | HIGH | Products/COMPVSS, Solutions/Crews |
| VS-002 | Vendor Communication Hub | HIGH | Products/ATLVS, Features |
| VS-003 | Vendor Contracts & Agreements | HIGH | Products/ATLVS, Features |

### Category C: Differentiation Features (4 features)
Unique blue-ocean features that no competitor offers.

| Feature ID | Feature Name | Priority | Integration Target |
|------------|--------------|----------|-------------------|
| DF-001 | Immersive Experience Design Studio | HIGH | Products/ATLVS, Landing Page |
| DF-002 | XYZ Spatial-Temporal Experience Engine | MEDIUM | Products/ATLVS, Features |
| DF-003 | Pre-Event Engagement & Gamification | HIGH | Products/GVTEWAY, Features |
| DF-004 | Global Asset Category Intelligence | HIGH | Products/ATLVS, Features |

---

## Part 2: Updated Public Header Navigation

### New Navigation Structure

```
ATLVS Logo | Products ▾ | Solutions ▾ | Resources ▾ | Pricing | [Get Started] [Sign In]
```

### Mega-Menu Dropdowns

#### Products Dropdown
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PRODUCTS                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ [ATLVS]                    [COMPVSS]                [GVTEWAY]               │
│ Production Management      Crew & Operations        Ticketing & Experience  │
│ The command center for     Workforce management     Fan-facing platform     │
│ live event production.     for production crews.    for ticket sales.       │
│                                                                              │
│ • Project Management       • Crew Database          • Event Discovery       │
│ • Financial Tools          • Scheduling             • Ticket Sales          │
│ • Asset Tracking           • Timekeeping            • Fan Engagement        │
│ • Vendor Management        • Communications         • Merch & Upsells       │
│                                                                              │
│ [View All Features →]      [View All Features →]    [View All Features →]   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ PLATFORM                                                                     │
│ [Compare Products] [Integrations] [Security] [API Documentation]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Solutions Dropdown
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SOLUTIONS BY ROLE                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ BUSINESS LEADERS           OPERATIONS               WORKFORCE               │
│ ─────────────────          ──────────               ─────────               │
│ • Producers                • Project Managers       • Production Crews      │
│ • Promoters                • Contractors            • Event Staff           │
│ • Investors                • Subcontractors         • Brand Ambassadors     │
│ • Sponsors                 • Independent Contractors                        │
│                                                                              │
│ VENUES & DESTINATIONS      CREATIVE                 SAFETY & SERVICES       │
│ ─────────────────────      ────────                 ─────────────────       │
│ • Venues                   • Artists                • Public Safety Teams   │
│ • Destinations             • Vendors                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ BY VERTICAL                                                                  │
│ [Productions] [Brand Activations] [Art Installations] [Destination Events]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Resources Dropdown
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ RESOURCES                                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ LEARN                      SUPPORT                  COMPANY                 │
│ ─────                      ───────                  ───────                 │
│ • Help Center              • Contact Support        • About Us              │
│ • Guides & Tutorials       • System Status          • Careers               │
│ • API Documentation        • Community              • Press                 │
│ • Blog                     • Training               • Partners              │
│ • Case Studies             • Webinars               • Contact               │
│ • Templates                • Office Hours                                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ FEATURED                                                                     │
│ [Getting Started Guide] [Watch Demo] [Request Demo] [Changelog]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: New Marketing Pages Structure

### 3.1 Products Pages

#### `/products` - Products Overview
Landing page showcasing all three products with comparison matrix.

#### `/products/atlvs` - ATLVS Product Page
**Headline:** THE COMMAND CENTER FOR LIVE EVENT PRODUCTION

**Sections:**
1. **Hero** - Overview with key value props
2. **Core Capabilities** (existing + V3Expansion)
   - Project Management
   - Financial Tools (invoicing, budgets, payments)
   - Asset Tracking (inventory, maintenance, depreciation)
   - Vendor Management (NEW: VD-001, VO-001, VS-003)
   - Document Generation (NEW: DG-001, DG-002, DG-003)
   - Floor Plans & Visualization (NEW: FP-001, FP-002)
3. **Venue Management Module** (NEW from V3Expansion)
   - Lead Capture & CRM (LM-001, LM-002, LM-003)
   - Booking & Availability (BK-001, BK-002, BK-003, BK-004)
   - Client Portal (CP-001, CP-002)
   - Payment Processing (PM-001, PM-002)
4. **Analytics & Reporting** (existing + RP-001, RP-002)
5. **Integrations** (existing + INT-001)
6. **Mobile App** (NEW: MB-001)
7. **Differentiators**
   - Immersive Experience Design Studio (DF-001)
   - Global Asset Category Intelligence (DF-004)
8. **Testimonials & Social Proof**
9. **CTA** - Start Free Trial

#### `/products/compvss` - COMPVSS Product Page
**Headline:** WORKFORCE MANAGEMENT FOR PRODUCTION CREWS

**Sections:**
1. **Hero** - Overview with key value props
2. **Crew Management**
   - Crew Database & Profiles
   - Skills & Certifications
   - Availability Tracking
   - Background Checks
3. **Scheduling & Operations**
   - Shift Management
   - Load-In/Load-Out (NEW: VS-001)
   - Show Calls & Day Sheets
   - Vendor Scheduling (NEW: VS-001, VS-002)
4. **People & Services Catalog** (NEW: PC-002, PC-003, PC-004)
5. **Communications**
   - Channel Management
   - Vendor Communication Hub (NEW: VS-002)
   - Push Notifications
6. **Timekeeping & Payroll**
   - Clock In/Out
   - Overtime Tracking
   - Integration with Payroll
7. **Mobile-First Experience**
8. **CTA** - Start Free Trial

#### `/products/gvteway` - GVTEWAY Product Page
**Headline:** THE FAN-FACING PLATFORM FOR LIVE EXPERIENCES

**Sections:**
1. **Hero** - Overview with key value props
2. **Ticketing Platform** (existing + TK-001)
   - Multiple Ticket Types
   - Dynamic Pricing
   - Anti-Scalping
   - QR Code Tickets
3. **Self-Service Booking** (NEW: TK-002)
4. **Event Discovery**
   - Search & Browse
   - Recommendations
   - Social Proof
5. **Fan Engagement**
   - Pre-Event Gamification (NEW: DF-003)
   - Community Features
   - UGC & Social Walls
6. **Merchandise & Upsells**
   - Marketing Catalog (NEW: PC-006)
   - Bundles & Packages
7. **Marketing Tools**
   - Email Campaigns
   - SMS Marketing
   - Social Integration
8. **CTA** - Start Free Trial

#### `/products/compare` - Product Comparison
Side-by-side comparison matrix of ATLVS, COMPVSS, and GVTEWAY features.

---

### 3.2 Solutions Pages (15 User Personas)

Each solution page follows this structure:
1. **Hero** - Role-specific headline and value prop
2. **Pain Points** - Problems this persona faces
3. **How [Product] Helps** - Feature highlights mapped to pain points
4. **Key Features** - Top 6-8 features for this role
5. **Workflow Example** - Day-in-the-life scenario
6. **Testimonial** - Quote from similar user
7. **Related Solutions** - Links to adjacent personas
8. **CTA** - Role-specific trial signup

#### Business Leaders (4 pages)

| Path | Persona | Primary Product | Key Features |
|------|---------|-----------------|--------------|
| `/solutions/producers` | Producers | ATLVS | Pipeline management, proposal builder, financial tools, client portal |
| `/solutions/promoters` | Promoters | ATLVS + GVTEWAY | Marketing tools, ticketing, analytics, ROI tracking |
| `/solutions/investors` | Investors | ATLVS | Financial reporting, portfolio tracking, risk analysis |
| `/solutions/sponsors` | Sponsors | ATLVS + GVTEWAY | Activation tracking, brand exposure, ROI measurement |

#### Operations (4 pages)

| Path | Persona | Primary Product | Key Features |
|------|---------|-----------------|--------------|
| `/solutions/project-managers` | Project Managers | ATLVS | Timeline management, task tracking, resource allocation |
| `/solutions/contractors` | Contractors | ATLVS | Purchase orders, equipment inventory, subcontractor mgmt |
| `/solutions/subcontractors` | Subcontractors | COMPVSS | Scheduling, invoicing, availability, certifications |
| `/solutions/independent-contractors` | Independent Contractors | COMPVSS | Gig matching, timesheets, payments, tax documents |

#### Venues & Destinations (2 pages)

| Path | Persona | Primary Product | Key Features |
|------|---------|-----------------|--------------|
| `/solutions/venues` | Venues | ATLVS | Booking, availability, BEOs, client portal, floor plans |
| `/solutions/destinations` | Destinations | ATLVS + GVTEWAY | Multi-venue coordination, destination marketing |

#### Creative (2 pages)

| Path | Persona | Primary Product | Key Features |
|------|---------|-----------------|--------------|
| `/solutions/artists` | Artists | COMPVSS + GVTEWAY | Rider management, tech specs, hospitality, fan engagement |
| `/solutions/vendors` | Vendors | ATLVS | Order management, invoicing, performance tracking, catalog |

#### Workforce (3 pages)

| Path | Persona | Primary Product | Key Features |
|------|---------|-----------------|--------------|
| `/solutions/production-crews` | Production Crews | COMPVSS | Scheduling, show calls, load-in/out, communications |
| `/solutions/event-staff` | Event Staff | COMPVSS | Shift management, training, credentials, mobile app |
| `/solutions/brand-ambassadors` | Brand Ambassadors | COMPVSS | Activation schedules, reporting, photo documentation |

#### Safety & Services (1 page)

| Path | Persona | Primary Product | Key Features |
|------|---------|-----------------|--------------|
| `/solutions/public-safety` | Public Safety Teams | COMPVSS | Emergency protocols, crowd management, incident reporting |

---

### 3.3 Resources Pages

#### `/resources` - Resources Hub
Central hub linking to all resources.

#### Learning Resources
| Path | Page | Description |
|------|------|-------------|
| `/help` | Help Center | Searchable knowledge base |
| `/guides` | Guides & Tutorials | Step-by-step walkthroughs |
| `/docs/api` | API Documentation | Developer reference |
| `/blog` | Blog | Industry news and insights |
| `/case-studies` | Case Studies | Customer success stories |
| `/templates` | Templates | Downloadable templates |
| `/webinars` | Webinars | Live and recorded sessions |

#### Support Resources
| Path | Page | Description |
|------|------|-------------|
| `/contact` | Contact Support | Support request form |
| `/status` | System Status | Real-time platform status |
| `/community` | Community | User forums and discussions |
| `/training` | Training | Certification programs |

#### Company Resources
| Path | Page | Description |
|------|------|-------------|
| `/about` | About Us | Company story and mission |
| `/careers` | Careers | Job listings |
| `/press` | Press | Media kit and news |
| `/partners` | Partners | Partner program |

---

### 3.4 Pricing Page Enhancement

#### `/pricing` - Enhanced Pricing Page

**Structure:**
1. **Hero** - Pricing headline with toggle (Monthly/Annual)
2. **Pricing Tiers**
   - **Starter** - For small teams (1-5 users)
   - **Professional** - For growing teams (6-25 users)
   - **Enterprise** - For large organizations (25+ users)
3. **Feature Comparison Matrix**
   - Detailed feature breakdown by tier
   - Check/cross indicators
   - "Contact Sales" for enterprise features
4. **Add-Ons Section**
   - Additional modules/features purchasable separately
   - V3Expansion features as premium add-ons
5. **Product-Specific Pricing**
   - ATLVS pricing breakdown
   - COMPVSS pricing breakdown
   - GVTEWAY pricing breakdown
   - Bundle discounts
6. **FAQ Section**
   - Common pricing questions
   - Billing/payment info
   - Enterprise/custom pricing info
7. **Trust Signals**
   - SOC 2 badge
   - Customer logos
   - Testimonial
8. **CTA** - Start Free Trial / Contact Sales

---

## Part 4: Implementation Roadmap

### Phase 1: Navigation & Infrastructure (Week 1)
- [ ] Create `PublicNavigationMegaMenu` component with dropdown support
- [ ] Update `CreatorNavigationPublic` to use mega-menu
- [ ] Add navigation data structure for Products/Solutions/Resources
- [ ] Update footer to match new structure
- [ ] Create shared layout components for marketing pages

### Phase 2: Products Pages (Week 2)
- [ ] Create `/products/page.tsx` - Overview
- [ ] Create `/products/atlvs/page.tsx` - Full product page with V3 features
- [ ] Create `/products/compvss/page.tsx` - Full product page
- [ ] Create `/products/gvteway/page.tsx` - Full product page
- [ ] Create `/products/compare/page.tsx` - Comparison matrix
- [ ] Add product data files with feature lists

### Phase 3: Solutions Pages - Business & Operations (Week 3)
- [ ] Create solutions page template component
- [ ] Create `/solutions/page.tsx` - Solutions hub
- [ ] Create `/solutions/producers/page.tsx`
- [ ] Create `/solutions/promoters/page.tsx`
- [ ] Create `/solutions/investors/page.tsx`
- [ ] Create `/solutions/sponsors/page.tsx`
- [ ] Create `/solutions/project-managers/page.tsx`
- [ ] Create `/solutions/contractors/page.tsx`
- [ ] Create `/solutions/subcontractors/page.tsx`
- [ ] Create `/solutions/independent-contractors/page.tsx`

### Phase 4: Solutions Pages - Venues, Creative, Workforce (Week 4)
- [ ] Create `/solutions/venues/page.tsx`
- [ ] Create `/solutions/destinations/page.tsx`
- [ ] Create `/solutions/artists/page.tsx`
- [ ] Create `/solutions/vendors/page.tsx`
- [ ] Create `/solutions/production-crews/page.tsx`
- [ ] Create `/solutions/event-staff/page.tsx`
- [ ] Create `/solutions/brand-ambassadors/page.tsx`
- [ ] Create `/solutions/public-safety/page.tsx`

### Phase 5: Resources & Pricing Enhancement (Week 5)
- [ ] Create `/resources/page.tsx` - Resources hub
- [ ] Create `/webinars/page.tsx`
- [ ] Create `/community/page.tsx`
- [ ] Create `/training/page.tsx`
- [ ] Enhance `/pricing/page.tsx` with detailed tiers
- [ ] Add pricing comparison matrix
- [ ] Add product-specific pricing sections

### Phase 6: Content & Polish (Week 6)
- [ ] Update landing page with V3 features
- [ ] Enhance existing `/features/page.tsx` with V3 features
- [ ] Add testimonials and case studies
- [ ] SEO optimization (meta tags, OG images)
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile responsiveness audit

---

## Part 5: Data Structure

### Navigation Data File Updates

**File:** `apps/atlvs/src/data/atlvs.ts`

```typescript
// New export for public navigation
export const atlvsPublicNavigation = {
  products: {
    label: "Products",
    items: [
      {
        label: "ATLVS",
        href: "/products/atlvs",
        description: "Production Management",
        features: ["Project Management", "Financial Tools", "Asset Tracking", "Vendor Management"],
      },
      {
        label: "COMPVSS",
        href: "/products/compvss",
        description: "Crew & Operations",
        features: ["Crew Database", "Scheduling", "Timekeeping", "Communications"],
      },
      {
        label: "GVTEWAY",
        href: "/products/gvteway",
        description: "Ticketing & Experience",
        features: ["Event Discovery", "Ticket Sales", "Fan Engagement", "Merch & Upsells"],
      },
    ],
    quickLinks: [
      { label: "Compare Products", href: "/products/compare" },
      { label: "Integrations", href: "/integrations" },
      { label: "Security", href: "/security" },
      { label: "API Documentation", href: "/docs/api" },
    ],
  },
  solutions: {
    label: "Solutions",
    groups: [
      {
        title: "Business Leaders",
        items: [
          { label: "Producers", href: "/solutions/producers" },
          { label: "Promoters", href: "/solutions/promoters" },
          { label: "Investors", href: "/solutions/investors" },
          { label: "Sponsors", href: "/solutions/sponsors" },
        ],
      },
      {
        title: "Operations",
        items: [
          { label: "Project Managers", href: "/solutions/project-managers" },
          { label: "Contractors", href: "/solutions/contractors" },
          { label: "Subcontractors", href: "/solutions/subcontractors" },
          { label: "Independent Contractors", href: "/solutions/independent-contractors" },
        ],
      },
      {
        title: "Venues & Destinations",
        items: [
          { label: "Venues", href: "/solutions/venues" },
          { label: "Destinations", href: "/solutions/destinations" },
        ],
      },
      {
        title: "Creative",
        items: [
          { label: "Artists", href: "/solutions/artists" },
          { label: "Vendors", href: "/solutions/vendors" },
        ],
      },
      {
        title: "Workforce",
        items: [
          { label: "Production Crews", href: "/solutions/production-crews" },
          { label: "Event Staff", href: "/solutions/event-staff" },
          { label: "Brand Ambassadors", href: "/solutions/brand-ambassadors" },
        ],
      },
      {
        title: "Safety & Services",
        items: [
          { label: "Public Safety Teams", href: "/solutions/public-safety" },
        ],
      },
    ],
    verticals: [
      { label: "Productions", href: "/verticals/productions" },
      { label: "Brand Activations", href: "/verticals/activations" },
      { label: "Art Installations", href: "/verticals/installations" },
      { label: "Destination Events", href: "/verticals/destinations" },
    ],
  },
  resources: {
    label: "Resources",
    groups: [
      {
        title: "Learn",
        items: [
          { label: "Help Center", href: "/help" },
          { label: "Guides & Tutorials", href: "/guides" },
          { label: "API Documentation", href: "/docs/api" },
          { label: "Blog", href: "/blog" },
          { label: "Case Studies", href: "/case-studies" },
          { label: "Templates", href: "/templates" },
        ],
      },
      {
        title: "Support",
        items: [
          { label: "Contact Support", href: "/contact" },
          { label: "System Status", href: "/status" },
          { label: "Community", href: "/community" },
          { label: "Training", href: "/training" },
          { label: "Webinars", href: "/webinars" },
        ],
      },
      {
        title: "Company",
        items: [
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: "Press", href: "/press" },
          { label: "Partners", href: "/partners" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    featured: [
      { label: "Getting Started Guide", href: "/guides/getting-started" },
      { label: "Watch Demo", href: "/demo" },
      { label: "Request Demo", href: "/demo/request" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
};
```

---

## Part 6: V3Expansion Feature Highlights for Marketing

### Venue Management Module (NEW)
**Marketing Message:** "Complete venue sales and event management in one platform"

**Key Selling Points:**
- Lead capture forms that convert 40% better with AI optimization
- Visual Kanban pipeline with predictive win probability
- Proposal builder with interactive client customization
- E-signature contracts with smart clause assembly
- BEO generation with department-specific views
- Client portal reducing email back-and-forth by 60%

### Vendor Services Module (NEW)
**Marketing Message:** "The industry's most comprehensive vendor management system"

**Key Selling Points:**
- Global Asset Catalog with 329+ standardized items across 24 categories
- Vendor database with automatic insurance verification
- RFP system reducing procurement costs by 10-20%
- Three-way matching (PO → Receipt → Invoice) preventing fraud
- Real-time profitability tracking per event
- Smart vendor scheduling with load-in optimization

### Blue Ocean Differentiators (NEW)
**Marketing Message:** "Features no one else has"

**Key Selling Points:**
- **Immersive Experience Design Studio** - Plan multi-sensory experiences with 5-senses framework
- **XYZ Spatial-Temporal Engine** - Map guest journeys through space and time
- **Pre-Event Gamification** - Build anticipation with challenges, badges, and rewards
- **Global Asset Category Intelligence** - Benchmark costs against industry averages

---

## Part 7: Component Requirements

### New Components to Create

| Component | Location | Purpose |
|-----------|----------|---------|
| `PublicMegaMenu` | `packages/ui` | Mega-menu dropdown for public nav |
| `ProductCard` | `packages/ui` | Product showcase card |
| `SolutionCard` | `packages/ui` | Solution/persona card |
| `FeatureGrid` | `packages/ui` | Grid of feature highlights |
| `ComparisonTable` | `packages/ui` | Feature comparison matrix |
| `PricingCard` | `packages/ui` | Pricing tier card |
| `TestimonialCard` | `packages/ui` | Customer testimonial |
| `SolutionPageTemplate` | `apps/atlvs` | Template for solution pages |
| `ProductPageTemplate` | `apps/atlvs` | Template for product pages |

### Existing Components to Use
- `FullBleedSection` - Full-width sections
- `Container` - Content container
- `Card` - Content cards
- `Grid` - Layout grids
- `Stack` - Flexbox stacks
- `Button` - CTAs
- `Display`, `H1`, `H3`, `Body`, `Label` - Typography

---

## Part 8: SEO & Meta Requirements

### Page Titles
```
/products/atlvs → ATLVS - Production Management Platform | GHXSTSHIP
/products/compvss → COMPVSS - Crew & Operations Management | GHXSTSHIP
/products/gvteway → GVTEWAY - Ticketing & Fan Experience | GHXSTSHIP
/solutions/producers → ATLVS for Producers | Production Management Software
/solutions/venues → ATLVS for Venues | Event Venue Management Software
```

### Meta Descriptions
- 150-160 characters
- Include primary keyword
- Include value proposition
- Include CTA

### Open Graph Images
- 1200x630px per page
- Product-specific branding
- Key value prop text

---

## Acceptance Criteria

### Navigation
- [ ] Mega-menu dropdowns work on desktop
- [ ] Mobile navigation collapses properly
- [ ] All links navigate correctly
- [ ] Active state indicators work

### Products Pages
- [ ] All 5 product pages complete
- [ ] V3Expansion features integrated
- [ ] Screenshots/illustrations in place
- [ ] CTAs link to signup

### Solutions Pages
- [ ] All 15 solution pages complete
- [ ] Role-specific messaging
- [ ] Feature highlights relevant to persona
- [ ] Related solutions linked

### Pricing Page
- [ ] All tiers displayed
- [ ] Feature comparison matrix
- [ ] Product-specific pricing
- [ ] FAQ section

### Quality
- [ ] Mobile responsive (320px+)
- [ ] Performance (LCP < 2.5s)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] SEO meta tags

---

## File Structure Summary

```
apps/atlvs/src/app/
├── products/
│   ├── page.tsx              # Products overview
│   ├── atlvs/page.tsx        # ATLVS product
│   ├── compvss/page.tsx      # COMPVSS product
│   ├── gvteway/page.tsx      # GVTEWAY product
│   └── compare/page.tsx      # Comparison matrix
├── solutions/
│   ├── page.tsx              # Solutions hub
│   ├── producers/page.tsx
│   ├── promoters/page.tsx
│   ├── investors/page.tsx
│   ├── sponsors/page.tsx
│   ├── project-managers/page.tsx
│   ├── contractors/page.tsx
│   ├── subcontractors/page.tsx
│   ├── independent-contractors/page.tsx
│   ├── venues/page.tsx
│   ├── destinations/page.tsx
│   ├── artists/page.tsx
│   ├── vendors/page.tsx
│   ├── production-crews/page.tsx
│   ├── event-staff/page.tsx
│   ├── brand-ambassadors/page.tsx
│   └── public-safety/page.tsx
├── resources/
│   └── page.tsx              # Resources hub
├── webinars/
│   └── page.tsx
├── community/
│   └── page.tsx
├── training/
│   └── page.tsx
└── pricing/
    └── page.tsx              # Enhanced pricing
```

---

## Next Steps

1. **Review and approve** this plan
2. **Create navigation data** in `atlvs.ts`
3. **Build mega-menu component** in `packages/ui`
4. **Implement Phase 1** (Navigation & Infrastructure)
5. **Proceed through phases 2-6**

---

*Document generated: December 17, 2025*
