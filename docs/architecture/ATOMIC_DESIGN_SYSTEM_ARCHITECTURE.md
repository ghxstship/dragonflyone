# GHXSTSHIP Atomic Design System Architecture

## Overview

This document provides a comprehensive architecture outline of the entire atomic design system, mapping from route groups down to the lowest-level atoms across all three applications. The system follows the **Bold Contemporary Pop Art Adventure** aesthetic with enterprise-grade component normalization.

**Last Updated:** December 29, 2024
**Normalization Status:** Phase 1-8 Complete

---

## 1. Route Group → Layout Factory Mapping

### ATLVS (Business Operations Platform)

| Route Group | Layout Factory | Shell/Template | Auth Type | App Layout Variant |
|-------------|---------------|----------------|-----------|-------------------|
| `(authenticated)/` | `createAuthenticatedLayout` | `AuthenticatedShell` | Session | `authenticated` |
| `(marketing)/` | Direct wrapper | `PageLayout` | None | `public` |
| `(portal)/` | `createPortalLayout` | `PageLayout` (minimal) | Token | `portal` |
| `p/[productionId]/` | Direct wrapper | `AuthenticatedShell` | Session | `authenticated` |
| `auth/` | Direct wrapper | `PageLayout` | None | `auth` |

### COMPVSS (Production Management Platform)

| Route Group | Layout Factory | Shell/Template | Auth Type | App Layout Variant |
|-------------|---------------|----------------|-----------|-------------------|
| `(authenticated)/` | `createAuthenticatedLayout` | `AuthenticatedShell` | Session | `authenticated` |
| `(marketing)/` | `createMarketingLayout` | `PageLayout` | None | `marketing` |
| `(portal)/` | `createPortalLayout` | `PageLayout` (minimal) | Token | `portal` |
| `p/[productionId]/` | Direct wrapper | `AuthenticatedShell` | Session | `authenticated` |
| `auth/` | Direct wrapper | `PageLayout` | None | `auth` |

### GVTEWAY (Consumer Experience Platform)

| Route Group | Layout Factory | Shell/Template | Auth Type | App Layout Variant |
|-------------|---------------|----------------|-----------|-------------------|
| `(authenticated)/` | `createAuthenticatedLayout` | `AuthenticatedShell` | Session | `authenticated` |
| `(consumer)/` | `createConsumerLayout` | `PageLayout` | Optional | `consumer` |
| `(marketing)/` | `createMarketingLayout` | `PageLayout` | None | `marketing` |
| `(portal)/` | `createPortalLayout` | `PageLayout` (minimal) | Token/Public | `portal` |
| `e/[eventId]/` | Direct wrapper | `PageLayout` | Optional | `consumer` |
| `admin/` | Direct wrapper | `AuthenticatedShell` | Session | `authenticated` |
| `auth/` | Direct wrapper | `PageLayout` | None | `auth` |

---

## 2. Template Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LAYOUT FACTORIES                                   │
│  packages/config/layouts/                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  createAuthenticatedLayout  │  createMarketingLayout  │  createPortalLayout │
│  createConsumerLayout       │  createClientPortalLayout                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APP LAYOUT WRAPPERS                                │
│  apps/*/src/components/app-layout.tsx                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  AtlvsAppLayout        │  CompvssAppLayout     │  GvtewayAppLayout          │
│  Variants:             │  Variants:            │  Variants:                 │
│  - authenticated       │  - authenticated      │  - authenticated           │
│  - public              │  - marketing          │  - consumer                │
│  - portal              │  - portal             │  - marketing               │
│  - consumer-auth       │                       │  - portal                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SHELL TEMPLATES                                 │
│  packages/ui/src/templates/                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  AuthenticatedShell    │  ClientPortalShell    │  PageLayout                │
│  - AppSidebar nav      │  - Org branding       │  - Header/footer           │
│  - Context breadcrumbs │  - Client info        │  - Loading/error states    │
│  - Command palette     │  - Portal navigation  │  - Responsive container    │
│  - Mobile bottom nav   │  - Loading/error      │                            │
│  - Keyboard shortcuts  │                       │                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PAGE TEMPLATES                                   │
│  packages/ui/src/templates/                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  CRUD Pages:                                                                 │
│  ├── ListPage          - Data tables with filters, bulk actions, pagination │
│  ├── DetailPage        - Single record view with tabs                       │
│  ├── CreatePage        - Multi-section forms                                │
│  ├── EditPage          - Pre-populated edit forms                           │
│  └── WizardPage        - Multi-step guided flows                            │
│                                                                              │
│  Dashboard Pages:                                                            │
│  ├── DashboardPage     - Stats, charts, activity feeds                      │
│  └── SettingsHubPage   - Settings categories and sections                   │
│                                                                              │
│  Marketing Pages:                                                            │
│  ├── MarketingPage     - Full-width sections with patterns                  │
│  └── AuthPage          - Centered auth forms                                │
│                                                                              │
│  Error Pages:                                                                │
│  ├── ErrorPage         - Error states with retry                            │
│  └── NotFoundPage      - 404 states                                         │
│                                                                              │
│  Content Layouts:                                                            │
│  ├── PageLayout        - Basic page wrapper                                 │
│  ├── CenteredLayout    - Single focal point                                 │
│  ├── SingleColumnLayout- Linear scrolling                                   │
│  ├── GridLayout        - Multi-item grid                                    │
│  ├── TableLayout       - Data display                                       │
│  ├── CanvasLayout      - Free-form workspace                                │
│  └── OverlayLayout     - Modal/drawer wrapper                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Template → Component Dependencies

### ListPage Template
```
ListPage
├── EnterprisePageHeader (organism)
│   ├── Breadcrumb (molecule)
│   ├── Tabs (molecule)
│   ├── Button (atom)
│   └── Dropdown (molecule)
├── SearchFilter (molecule)
│   ├── Input (atom)
│   ├── Select (atom)
│   ├── Button (atom)
│   └── Badge (atom)
├── BulkActionBar (molecule)
│   ├── Checkbox (atom)
│   ├── Button (atom)
│   └── Dropdown (molecule)
├── DataGrid (organism)
│   ├── Table (molecule)
│   ├── Checkbox (atom)
│   ├── Badge (atom)
│   ├── StatusBadge (atom)
│   ├── RowActions (molecule)
│   └── Pagination (molecule)
├── DetailDrawer (organism)
│   ├── Modal (organism)
│   ├── Tabs (molecule)
│   ├── Button (atom)
│   └── Form fields (atoms)
├── ConfirmDialog (molecule)
│   ├── Modal (organism)
│   ├── Button (atom)
│   └── Body (atom)
└── EmptyState (molecule)
    ├── Icon (atom)
    ├── H2 (atom)
    ├── Body (atom)
    └── Button (atom)
```

### DetailPage Template
```
DetailPage
├── EnterprisePageHeader (organism)
│   ├── Breadcrumb (molecule)
│   ├── StatusBadge (atom)
│   ├── Button (atom)
│   └── Dropdown (molecule)
├── Tabs (molecule)
│   ├── TabsList
│   ├── Tab
│   └── TabPanel
├── Card (molecule)
│   ├── CardHeader
│   ├── CardBody
│   └── CardFooter
├── StatCard (molecule)
│   ├── Label (atom)
│   ├── Display (atom)
│   └── Sparkline (atom)
├── Timeline (molecule)
│   ├── Avatar (atom)
│   ├── Body (atom)
│   └── Badge (atom)
└── ActivityFeed (organism)
    ├── Avatar (atom)
    ├── Body (atom)
    └── Link (atom)
```

### CreatePage / EditPage Template
```
CreatePage / EditPage
├── EnterprisePageHeader (organism)
│   ├── Breadcrumb (molecule)
│   └── Button (atom)
├── Form (atom)
│   ├── Field (molecule)
│   │   ├── Label (atom)
│   │   ├── Input (atom)
│   │   ├── Select (atom)
│   │   ├── Textarea (atom)
│   │   ├── Checkbox (atom)
│   │   ├── Radio (atom)
│   │   └── Switch (atom)
│   ├── PhoneInput (atom)
│   ├── AddressInput (atom)
│   ├── FileUpload (molecule)
│   └── MaskedInput (atom)
├── Card (molecule)
│   └── Form sections
├── Stepper (molecule) [for multi-step]
│   ├── Step indicators
│   └── Progress
└── Button (atom)
    ├── Submit
    ├── Cancel
    └── Save Draft
```

### DashboardPage Template
```
DashboardPage
├── EnterprisePageHeader (organism)
├── Grid (foundation)
│   └── StatCard (molecule) × N
│       ├── Label (atom)
│       ├── Display (atom)
│       ├── Sparkline (atom)
│       └── Badge (atom)
├── Card (molecule)
│   ├── Charts (external)
│   ├── DataTable (molecule)
│   └── Timeline (molecule)
├── ActivityFeed (organism)
├── Calendar (organism)
└── KanbanBoard (organism)
```

### MarketingPage Template
```
MarketingPage
├── FullBleedSection (foundation) × N
│   ├── HeroSection (marketing)
│   │   ├── Display (atom)
│   │   ├── Body (atom)
│   │   ├── Button (atom)
│   │   └── HalftonePattern (atom)
│   ├── FeatureGrid (marketing)
│   │   ├── FeatureCard (molecule)
│   │   └── Icon (atom)
│   ├── PricingSection (marketing)
│   │   ├── Card (molecule)
│   │   ├── PriceDisplay (molecule)
│   │   └── Button (atom)
│   ├── TestimonialSection (marketing)
│   │   ├── Card (molecule)
│   │   ├── Avatar (atom)
│   │   └── Body (atom)
│   ├── FAQSection (marketing)
│   │   └── Accordion items
│   └── CTABanner (marketing)
│       ├── Display (atom)
│       ├── Body (atom)
│       └── Button (atom)
└── Footer (organism)
    ├── FooterColumn
    └── FooterLink
```

---

## 4. Complete Atomic Hierarchy

### FOUNDATIONS (Layout Primitives)
```
packages/ui/src/foundations/
├── layout.tsx
│   ├── Container      - Max-width wrapper
│   ├── Section        - Semantic section
│   ├── Grid           - CSS Grid wrapper
│   └── Stack          - Flexbox stack
├── page-regions.tsx
│   ├── PageHeader     - Page header region
│   ├── PageContent    - Main content region
│   ├── PageFooter     - Page footer region
│   ├── SplitLayout    - Two-panel layout
│   ├── FullBleedSection - Full-width section
│   └── ContentRegion  - Content wrapper
└── semantic.tsx
    ├── Main           - <main> wrapper
    ├── Header         - <header> wrapper
    ├── Article        - <article> wrapper
    ├── Aside          - <aside> wrapper
    ├── Nav            - <nav> wrapper
    ├── Figure         - <figure> wrapper
    ├── Box            - Generic div wrapper
    └── GridOverlay    - Dev grid overlay
```

### ATOMS (34 components)
```
packages/ui/src/atoms/
├── Typography
│   ├── typography.tsx     - Display, H1-H6, Body, Label
│   ├── text.tsx           - Text component
│   └── kicker.tsx         - Kicker/eyebrow text
├── Form Inputs
│   ├── input.tsx          - Text input
│   ├── textarea.tsx       - Multi-line input
│   ├── select.tsx         - Dropdown select
│   ├── checkbox.tsx       - Checkbox
│   ├── radio.tsx          - Radio button
│   ├── switch.tsx         - Toggle switch
│   ├── phone-input.tsx    - Phone number input
│   ├── address-input.tsx  - Address autocomplete
│   ├── password-input.tsx - Password with visibility
│   ├── masked-input.tsx   - Formatted input (SSN, CC)
│   └── form.tsx           - Form wrapper
├── Interactive
│   ├── button.tsx         - Button variants
│   ├── link.tsx           - Styled link
│   ├── tooltip.tsx        - Tooltip overlay
│   └── icon.tsx           - Icon wrapper + common icons
├── Display
│   ├── badge.tsx          - Label badge
│   ├── status-badge.tsx   - Status indicator
│   ├── urgency-badge.tsx  - Urgency indicator
│   ├── avatar.tsx         - User avatar
│   ├── divider.tsx        - Horizontal/vertical divider
│   ├── spinner.tsx        - Loading spinner
│   ├── progress-bar.tsx   - Progress indicator
│   ├── countdown.tsx      - Countdown timer
│   ├── sparkline.tsx      - Mini chart
│   └── list.tsx           - Styled list
├── Media
│   ├── duotone-image.tsx  - Duotone image effect
│   ├── social-icon.tsx    - Social media icons
│   └── success-animation.tsx - Success checkmark
├── Decorative
│   ├── halftone-pattern.tsx  - Halftone/grid patterns
│   ├── geometric-shapes.tsx  - Decorative shapes
│   └── page-transition.tsx   - Page transitions
```

### MOLECULES (53 components)
```
packages/ui/src/molecules/
├── Data Display
│   ├── card.tsx              - Card container
│   ├── stat-card.tsx         - Statistic card
│   ├── content-card.tsx      - Content/feature card
│   ├── event-card.tsx        - Event display card
│   ├── ticket-card.tsx       - Ticket display card
│   ├── crew-card.tsx         - Crew member card
│   ├── deal-card.tsx         - Deal/opportunity card
│   ├── project-card.tsx      - Project card
│   ├── service-card.tsx      - Service card
│   ├── client-event-card.tsx - Client event card
│   └── skeleton.tsx          - Loading skeleton
├── Tables & Lists
│   ├── table.tsx             - Basic table
│   ├── data-table.tsx        - Enhanced data table
│   ├── scrollable-table-wrapper.tsx - Horizontal scroll
│   ├── pagination.tsx        - Page navigation
│   ├── row-actions.tsx       - Row action menu
│   ├── bulk-action-bar.tsx   - Bulk selection actions
│   └── virtualized-list.tsx  - Virtual scrolling
├── Navigation
│   ├── breadcrumb.tsx        - Breadcrumb trail
│   ├── context-breadcrumb.tsx - Context-aware breadcrumb
│   ├── tabs.tsx              - Tab navigation
│   ├── stepper.tsx           - Step indicator
│   └── timeline.tsx          - Timeline display
├── Forms
│   ├── field.tsx             - Form field wrapper
│   ├── file-upload.tsx       - File upload
│   ├── search-filter.tsx     - Search with filters
│   ├── payment-form.tsx      - Payment form
│   ├── payment-method-selector.tsx - Payment method
│   ├── signature-capture.tsx - Signature pad
│   └── collaborative-field.tsx - Real-time field
├── Feedback
│   ├── alert.tsx             - Alert message
│   ├── empty-state.tsx       - Empty state display
│   ├── error-state.tsx       - Error state display
│   ├── notification-toast.tsx - Toast notification
│   ├── confirm-dialog.tsx    - Confirmation dialog
│   ├── refund-dialog.tsx     - Refund dialog
│   └── offline-indicator.tsx - Offline status
├── Media
│   ├── video-player.tsx      - Video player
│   ├── scroll-reveal.tsx     - Scroll animations
│   └── invoice-preview.tsx   - Invoice preview
├── Specialized
│   ├── button-group.tsx      - Button group
│   ├── dropdown.tsx          - Dropdown menu
│   ├── newsletter.tsx        - Newsletter signup
│   ├── price-display.tsx     - Price formatting
│   ├── section-header.tsx    - Section header
│   ├── pipeline-stage.tsx    - Pipeline stage
│   ├── presence-avatars.tsx  - Presence indicators
│   ├── deal-quick-view.tsx   - Deal preview
│   ├── quick-add-fab.tsx     - Quick add FAB
│   ├── language-selector.tsx - Language picker
│   ├── age-verification-modal.tsx - Age gate
│   ├── floor-plan-object-library.tsx - Floor plan objects
│   └── floor-plan-toolbar.tsx - Floor plan tools
```

### ORGANISMS (50 components)
```
packages/ui/src/organisms/
├── Navigation
│   ├── navigation.tsx        - Top navigation
│   ├── app-navigation.tsx    - App navigation
│   ├── sidebar.tsx           - Basic sidebar
│   ├── app-sidebar.tsx       - Enhanced sidebar
│   ├── responsive-sidebar.tsx - Responsive sidebar
│   ├── mobile-bottom-nav.tsx - Mobile bottom nav
│   ├── unified-header.tsx    - Unified header
│   ├── context-switcher.tsx  - Context switcher
│   ├── command-palette.tsx   - Command palette
│   └── global-search.tsx     - Global search
├── Page Sections
│   ├── page-header.tsx       - Enterprise page header
│   ├── footer.tsx            - Page footer
│   ├── hero.tsx              - Hero section
│   └── notification-center.tsx - Notification center
├── Data Views
│   ├── data-grid.tsx         - Advanced data grid
│   ├── kanban-board.tsx      - Kanban board
│   ├── calendar.tsx          - Calendar view
│   ├── gantt-chart.tsx       - Gantt chart
│   ├── timeline-view.tsx     - Timeline view
│   ├── map-view.tsx          - Map view
│   ├── gallery-view.tsx      - Gallery view
│   ├── seating-chart.tsx     - Seating chart
│   ├── pipeline-board.tsx    - Pipeline board
│   └── stats-dashboard.tsx   - Stats dashboard
├── Modals & Overlays
│   ├── modal.tsx             - Modal dialog
│   ├── detail-drawer.tsx     - Detail drawer
│   ├── lightbox.tsx          - Image lightbox
│   ├── record-form-modal.tsx - Record form modal
│   ├── import-export-dialog.tsx - Import/export
│   ├── bulk-edit-modal.tsx   - Bulk edit modal
│   ├── keyboard-shortcuts-modal.tsx - Shortcuts
│   └── saved-filter-builder.tsx - Filter builder
├── Forms & Wizards
│   ├── form-wizard.tsx       - Form wizard
│   ├── onboarding-wizard.tsx - Onboarding flow
│   ├── invoice-builder.tsx   - Invoice builder
│   ├── proposal-builder.tsx  - Proposal builder
│   ├── automation-builder.tsx - Automation builder
│   ├── dashboard-builder.tsx - Dashboard builder
│   └── custom-field-renderer.tsx - Custom fields
├── Activity & Timeline
│   ├── activity-feed.tsx     - Activity feed
│   ├── audit-timeline.tsx    - Audit log
│   └── workflow-timeline.tsx - Workflow timeline
├── Specialized
│   ├── floor-plan-canvas.tsx - Floor plan editor
│   ├── image-gallery.tsx     - Image gallery
│   ├── cookie-consent-banner.tsx - Cookie consent
│   ├── privacy-preference-center.tsx - Privacy prefs
│   └── notification-provider.tsx - Notification context
├── Error Handling
│   ├── error-boundary.tsx    - Error boundary
│   ├── api-error-boundary.tsx - API error boundary
│   └── protected-route.tsx   - Protected route
```

### MARKETING (15 components)
```
packages/ui/src/marketing/
├── hero-section.tsx          - Hero with CTA
├── feature-grid.tsx          - Feature cards grid
├── bento-grid.tsx            - Bento box layout
├── pricing-section.tsx       - Pricing cards
├── testimonial-section.tsx   - Testimonials
├── faq-section.tsx           - FAQ accordion
├── cta-banner.tsx            - Call-to-action banner
├── stats-section.tsx         - Statistics display
├── team-section.tsx          - Team members
├── timeline-section.tsx      - Timeline display
├── logo-cloud.tsx            - Logo carousel
├── comparison-table.tsx      - Feature comparison
├── integration-grid.tsx      - Integration logos
└── video-section.tsx         - Video embed
```

---

## 5. Use Case → Component Mapping

### CRUD Operations

| Use Case | Template | Key Components |
|----------|----------|----------------|
| List records | `ListPage` | DataGrid, SearchFilter, Pagination, BulkActionBar |
| View record | `DetailPage` | Tabs, Card, StatCard, Timeline, ActivityFeed |
| Create record | `CreatePage` | Form, Field, FileUpload, Stepper |
| Edit record | `EditPage` | Form, Field, pre-populated data |
| Delete record | `ConfirmDialog` | Modal, Button |
| Bulk edit | `BulkEditModal` | Modal, Form, Checkbox |
| Import data | `ImportExportDialog` | FileUpload, DataTable |
| Export data | `ImportExportDialog` | Select, Button |

### Dashboard & Analytics

| Use Case | Template | Key Components |
|----------|----------|----------------|
| Overview dashboard | `DashboardPage` | StatCard, Charts, ActivityFeed |
| KPI display | `StatCard` | Display, Sparkline, Badge |
| Activity timeline | `ActivityFeed` | Avatar, Body, Timeline |
| Calendar view | `Calendar` | Calendar, EventCard |
| Kanban board | `KanbanBoard` | KanbanColumn, Card |
| Gantt chart | `GanttChart` | GanttTask, Timeline |

### Settings & Configuration

| Use Case | Template | Key Components |
|----------|----------|----------------|
| Settings hub | `SettingsHubPage` | SettingsCategory, Card |
| Profile settings | `EditPage` | Form, Avatar, FileUpload |
| Preferences | `Card` | Switch, Select, Radio |
| Integrations | `GridLayout` | Card, Button, Badge |
| Billing | `DetailPage` | Card, Table, Button |

### Authentication

| Use Case | Template | Key Components |
|----------|----------|----------------|
| Sign in | `AuthPage` + `SignInForm` | Form, Input, Button |
| Sign up | `AuthPage` + `WizardPage` | Form, Stepper, Input |
| Password reset | `AuthPage` | Form, Input, Button |
| MFA | `AuthPage` | Input, Button |

### Marketing & Public

| Use Case | Template | Key Components |
|----------|----------|----------------|
| Landing page | `MarketingPage` | HeroSection, FeatureGrid, CTABanner |
| Pricing page | `MarketingPage` | PricingSection, FAQSection |
| About page | `MarketingPage` | TeamSection, Timeline |
| Blog/Content | `SingleColumnLayout` | Article, Body, Image |

### Portal & External

| Use Case | Template | Key Components |
|----------|----------|----------------|
| Token access page | `PageLayout` (portal) | Card, Body, Button |
| Client dashboard | `ClientPortalShell` | Sidebar, Card, Table |
| Invoice view | `DetailPage` | InvoicePreview, Button |
| Proposal accept | `DetailPage` | Card, Button, SignatureCapture |

---

## 6. Normalization Status (December 2024)

### ✅ Completed Normalizations

| Phase | Action | Status | Details |
|-------|--------|--------|---------|
| **1** | Delete deprecated `AppShell` | ✅ Complete | Removed `app-shell.tsx`, updated all exports |
| **2** | Consolidate PageHeader | ✅ Complete | `MarketingPageHeader` (foundations) + `AppPageHeader` (organisms) |
| **3** | Consolidate Sidebar | ✅ Complete | Deleted `sidebar.tsx`, `responsive-sidebar.tsx`; kept `AppSidebar` |
| **4** | Consolidate Tables | ✅ Complete | Deleted `data-table.tsx`; kept `Table` (primitive) + `DataGrid` (full) |
| **5** | Consolidate Breadcrumb types | ✅ Complete | Created canonical `BreadcrumbItem` in `types/breadcrumb.ts` |
| **6** | Analyze Modal/Drawer | ✅ Complete | Kept separate (different semantic purposes) |
| **7** | Update app imports | ✅ Complete | All apps using normalized components |
| **8** | Verify builds | ✅ Complete | All packages and apps build successfully |

### 🟡 Remaining Optimization Opportunities

| Opportunity | Current State | Recommendation | Priority |
|-------------|---------------|----------------|----------|
| **Marketing sections** | 14 separate components | Create `MarketingSection` factory with variants | Medium |
| **Form field patterns** | Repeated Field + Input patterns | Create `FormField` compound component | Medium |
| **Domain cards** | 7 specialized cards (Event, Crew, Deal, etc.) | Keep separate but ensure all use base `Card` internally | Low |
| **Loading states** | Multiple skeleton patterns | Standardize skeleton variants | Low |
| **Navigation components** | 4 navigation components | Already consolidated to core set | Done |

### 🟢 Canonical Component Mapping

| Use Case | Canonical Component | Deprecated/Removed |
|----------|--------------------|--------------------|
| **App sidebar navigation** | `AppSidebar`, `MobileAppSidebar` | `Sidebar`, `MobileSidebar`, `ResponsiveSidebar` |
| **Page header (app pages)** | `AppPageHeader` | `EnterprisePageHeader` (alias) |
| **Page header (marketing)** | `MarketingPageHeader` | `PageHeader` (foundations), `SimplePageHeader` |
| **Data tables** | `DataGrid` (full) or `Table` (primitive) | `DataTable` |
| **Breadcrumb type** | `BreadcrumbItem` from `types/breadcrumb.ts` | Local definitions in templates |
| **App shell** | `AuthenticatedShell` | `AppShell` |

---

## 7. Future Architecture Improvements

### Phase 9: Form Field Compound Component (Recommended)
Create a unified `FormField` that combines label, input, validation, and error display:
```tsx
<FormField
  name="email"
  label="Email Address"
  type="email"
  required
  validation={emailValidation}
  helpText="We'll never share your email"
/>
```

### Phase 10: Marketing Section Factory (Recommended)
Create a `MarketingSection` factory to reduce the 14 marketing components:
```tsx
<MarketingSection
  variant="hero" | "features" | "pricing" | "testimonials" | "faq" | "cta"
  data={sectionData}
  theme="dark" | "light"
/>
```

### Phase 11: Domain Card Standardization (Low Priority)
Ensure all domain-specific cards (EventCard, CrewCard, DealCard, etc.) internally use the base `Card` component for consistent styling while maintaining their semantic interfaces.

### Phase 12: Skeleton Standardization (Low Priority)
Create skeleton variants that match each page template:
- `ListPageSkeleton`
- `DetailPageSkeleton`
- `DashboardPageSkeleton`

---

## 8. Component Count Summary (Post-Normalization)

| Category | Count | Notes |
|----------|-------|-------|
| **Foundations** | 14 | Layout primitives (Container, Section, Grid, Stack, semantic elements) |
| **Atoms** | 34 | Basic building blocks (typography, inputs, buttons, badges) |
| **Molecules** | 46 | Composed components (cards, tables, navigation, forms, feedback) |
| **Organisms** | 46 | Complex components (navigation, data views, modals, builders) |
| **Templates** | 22 | Page-level layouts (CRUD, dashboard, marketing, auth, error) |
| **Marketing** | 14 | Landing page sections (hero, features, pricing, testimonials) |
| **Layout Factories** | 5 | Route group layouts (authenticated, marketing, portal, consumer, client-portal) |
| **Shared Types** | 2 | Canonical types (BreadcrumbItem, BreadcrumbContextItem) |
| **Total** | **183** | Unique components (reduced from 195 after normalization) |

### Files Removed in Normalization
- `packages/ui/src/templates/app-shell.tsx` (deprecated)
- `packages/ui/src/organisms/sidebar.tsx` (consolidated to AppSidebar)
- `packages/ui/src/organisms/responsive-sidebar.tsx` (unused)
- `packages/ui/src/molecules/data-table.tsx` (consolidated to DataGrid)

---

## 9. Dependency Graph (Post-Normalization)

```
Route Groups (Next.js App Router)
    │
    ├── (authenticated)/ ─────────────────────────────────────────────────────┐
    ├── (marketing)/ ─────────────────────────────────────────────────────────┤
    ├── (portal)/ ────────────────────────────────────────────────────────────┤
    ├── (consumer)/ [GVTEWAY only] ───────────────────────────────────────────┤
    ├── p/[productionId]/ [ATLVS/COMPVSS] ────────────────────────────────────┤
    ├── e/[eventId]/ [GVTEWAY] ───────────────────────────────────────────────┤
    └── admin/ [GVTEWAY] ─────────────────────────────────────────────────────┤
                                                                               │
                                                                               ▼
Layout Factories (packages/config/layouts/)
    │
    ├── createAuthenticatedLayout ──▶ Session auth, RBAC
    ├── createMarketingLayout ──────▶ Public, no auth
    ├── createPortalLayout ─────────▶ Token auth
    ├── createConsumerLayout ───────▶ Optional auth
    └── createClientPortalLayout ───▶ Full portal dashboard
    │
    ▼
App Layout Wrappers (apps/*/components/app-layout.tsx)
    │
    ├── AtlvsAppLayout (variants: authenticated, public, portal, consumer-auth)
    ├── CompvssAppLayout (variants: authenticated, marketing, portal)
    └── GvtewayAppLayout (variants: authenticated, consumer, marketing, portal)
    │
    ▼
Shell Templates (packages/ui/src/templates/)
    │
    ├──▶ AuthenticatedShell
    │    ├── AppSidebar ──▶ SidebarNavSection ──▶ SidebarNavItem
    │    ├── MobileAppSidebar
    │    ├── CommandPalette ──▶ Modal ──▶ Input, Button
    │    ├── MobileBottomNav ──▶ Button, Badge
    │    ├── ContextBreadcrumb ──▶ Breadcrumb ──▶ BreadcrumbItem
    │    └── NotificationCenter ──▶ Dropdown, Badge
    │
    ├──▶ ClientPortalShell
    │    ├── Navigation ──▶ NavLink, Button
    │    ├── Footer ──▶ FooterColumn ──▶ FooterLink
    │    └── Card ──▶ CardHeader, CardBody
    │
    └──▶ PageLayout
         ├── Header ──▶ Navigation
         ├── Footer ──▶ FooterColumn ──▶ FooterLink
         └── Container ──▶ children
    │
    ▼
Page Templates
    │
    ├──▶ ListPage
    │    ├── AppPageHeader ──▶ Breadcrumb, Tabs, Button, Dropdown
    │    ├── SearchFilter ──▶ Input, Select, Button, Badge
    │    ├── BulkActionBar ──▶ Checkbox, Button, Dropdown
    │    ├── DataGrid ──▶ Table, Checkbox, Badge, StatusBadge, RowActions, Pagination
    │    ├── DetailDrawer ──▶ Tabs, Button, Form fields
    │    ├── ConfirmDialog ──▶ Modal, Button, Body
    │    └── EmptyState ──▶ Icon, H2, Body, Button
    │
    ├──▶ DetailPage
    │    ├── AppPageHeader ──▶ Breadcrumb, StatusBadge, Button, Dropdown
    │    ├── Tabs ──▶ TabsList, Tab, TabPanel
    │    ├── Card ──▶ CardHeader, CardBody, CardFooter
    │    ├── StatCard ──▶ Label, Display, Sparkline
    │    ├── Timeline ──▶ Avatar, Body, Badge
    │    └── ActivityFeed ──▶ Avatar, Body, Link
    │
    ├──▶ CreatePage / EditPage
    │    ├── AppPageHeader ──▶ Breadcrumb, Button
    │    ├── Form ──▶ Field ──▶ Label, Input, Select, Textarea, Checkbox, Radio, Switch
    │    ├── PhoneInput, AddressInput, MaskedInput
    │    ├── FileUpload ──▶ Button, ProgressBar
    │    ├── Card ──▶ Form sections
    │    ├── Stepper ──▶ Step indicators
    │    └── Button (Submit, Cancel, Save Draft)
    │
    ├──▶ DashboardPage
    │    ├── MarketingPageHeader ──▶ Kicker, Display, Body
    │    ├── Grid ──▶ StatCard × N
    │    ├── Card ──▶ Charts, DataGrid, Timeline
    │    ├── ActivityFeed
    │    ├── Calendar
    │    └── KanbanBoard
    │
    ├──▶ WizardPage
    │    ├── Stepper ──▶ Step indicators
    │    ├── Form ──▶ Field ──▶ Input components
    │    └── Button (Next, Back, Submit)
    │
    └──▶ MarketingPage
         ├── FullBleedSection × N
         │    ├── HeroSection ──▶ Display, Body, Button, HalftonePattern
         │    ├── FeatureGrid ──▶ FeatureCard, Icon
         │    ├── PricingSection ──▶ Card, PriceDisplay, Button
         │    ├── TestimonialSection ──▶ Card, Avatar, Body
         │    ├── FAQSection ──▶ Accordion items
         │    └── CTABanner ──▶ Display, Body, Button
         └── Footer ──▶ FooterColumn ──▶ FooterLink
    │
    ▼
Atoms (Terminal Nodes - 34 components)
    │
    ├── Typography
    │    ├── Display, H1, H2, H3, H4, H5, H6
    │    ├── Body, Label, Text
    │    └── Kicker
    │
    ├── Form Inputs
    │    ├── Input, InputGroup
    │    ├── Textarea, TextareaGroup
    │    ├── Select, SelectGroup
    │    ├── Checkbox, Radio, Switch
    │    ├── PhoneInput, AddressInput, PasswordInput, MaskedInput
    │    └── Form
    │
    ├── Interactive
    │    ├── Button
    │    ├── Link
    │    └── Tooltip
    │
    ├── Display
    │    ├── Badge, StatusBadge, UrgencyBadge
    │    ├── Avatar, AvatarGroup
    │    ├── Divider
    │    ├── Spinner, ProgressBar
    │    ├── Countdown, Sparkline
    │    └── List, ListItem
    │
    ├── Media
    │    ├── Icon, IconBox
    │    ├── SocialIcon
    │    ├── DuotoneImage, ImageWithOverlay
    │    └── SuccessAnimation
    │
    └── Decorative
         ├── HalftonePattern, HeroHalftone, GridPattern
         ├── GeometricShape, GeometricPattern
         └── PageTransition, StaggeredTransition
```

---

## 10. Design System Tokens

### Bold Contemporary Pop Art Adventure Aesthetic

| Token Category | Values | Usage |
|----------------|--------|-------|
| **Shadows** | `shadow-xs` to `shadow-xl`, `shadow-primary`, `shadow-accent` | Hard offset only (e.g., `4px 4px 0`) |
| **Borders** | `border-2`, `border-thick`, `border-heavy` | 2px+ on interactive elements |
| **Radius** | `rounded-button` (4px), `rounded-card` (8px), `rounded-modal` (16px), `rounded-badge` (2px) | Sharp on actions, rounded on containers |
| **Animations** | `animate-pop-in`, `animate-slide-up-bounce`, `animate-shake`, `animate-comic-appear` | Bounce, snappy (100-200ms) |
| **Easings** | `ease-bounce`, `ease-snap`, `ease-spring` | Dynamic transforms |
| **Patterns** | `bg-halftone`, `bg-stripes`, `bg-grid`, `bg-benday`, `bg-crosshatch` | Pop art decorative |

### Color Tokens (Preserved)
- **Primary:** #6366f1 (Indigo)
- **Secondary:** #8b5cf6 (Purple)
- **Accent:** #f59e0b (Amber)
- **Success:** #10b981 (Emerald)
- **Warning:** #f59e0b (Amber)
- **Error:** #ef4444 (Red)
- **Ink:** #0f172a to #f8fafc (Slate scale)

---

## 11. Import Guidelines

### Canonical Imports from @ghxstship/ui

```tsx
// Atoms
import { Button, Input, Select, Badge, Avatar, Spinner } from "@ghxstship/ui";

// Molecules
import { Card, StatCard, Field, Breadcrumb, Tabs, Pagination } from "@ghxstship/ui";

// Organisms
import { AppSidebar, DataGrid, Modal, DetailDrawer, AppPageHeader } from "@ghxstship/ui";

// Templates
import { ListPage, DetailPage, CreatePage, AuthenticatedShell } from "@ghxstship/ui";

// Foundations
import { Container, Section, Grid, Stack, MarketingPageHeader } from "@ghxstship/ui";

// Types
import type { BreadcrumbItem, SidebarNavSection, DataGridColumn } from "@ghxstship/ui";
```

### Deprecated Imports (Do Not Use)

```tsx
// ❌ DEPRECATED - Use AppSidebar instead
import { Sidebar, MobileSidebar, ResponsiveSidebar } from "@ghxstship/ui";

// ❌ DEPRECATED - Use DataGrid instead
import { DataTable } from "@ghxstship/ui";

// ❌ DEPRECATED - Use AuthenticatedShell instead
import { AppShell } from "@ghxstship/ui";

// ❌ DEPRECATED - Use MarketingPageHeader instead
import { PageHeader } from "@ghxstship/ui"; // from foundations
```

---

*Document generated: December 2024*
*Last updated: December 29, 2024 - Normalization Phase 1-8 Complete*
*Next review: After Phase 9-12 implementation*
