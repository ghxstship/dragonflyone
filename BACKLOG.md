# GHXSTSHIP Platform Backlog

> Product backlog for the GHXSTSHIP platform (ATLVS, COMPVSS, GVTEWAY).  
> Follows industry-standard backlog management practices with clear ownership, sizing, and acceptance criteria.

**Last Updated:** January 4, 2026  
**Backlog Owner:** Engineering Team  
**Review Cadence:** Weekly

> **Note:** Completed items are tracked in [CHANGELOG.md](./CHANGELOG.md). This file contains **active/pending work only**.

---

## Quick Stats (Verified 2026-01-04)

| Metric | Count |
|--------|-------|
| P0 (Critical) | 0 |
| P1 (High) | 0 |
| P2 (Medium) | 3 |
| P3 (Low) | 0 |
| **Total Pages** | **295** |
| ATLVS Pages | 149 |
| COMPVSS Pages | 75 |
| GVTEWAY Pages | 71 |
| Total API Routes | 1,146 |
| React Query Hooks | 407 |
| Hook Test Coverage | 21.6% (88/407) |
| Unit Test Files | 161 |
| Unit Tests | 2,405 |
| E2E Test Specs | 27 |
| DB Migrations | 52 |
| Edge Functions | 16 |
| Lint Warnings | 0 in apps |
| `as any` Type Casts | 0 in apps |

---

## Priority Definitions

| Priority | Definition | SLA |
|----------|------------|-----|
| **P0** | Blocking deployment or core functionality | Immediate |
| **P1** | Active work, enterprise readiness | This sprint |
| **P2** | Planned features, technical debt | Next 2-4 sprints |
| **P3** | Nice-to-haves, future enhancements | Backlog |

---

## P0 - Critical

*No critical items at this time.*

---

## P1 - High Priority

*No high priority items at this time. All P1 items have been completed - see CHANGELOG.md.*

---

## P2 - Medium Priority

### BACK-113: Remove Legacy Inverted Prop System from UI Components

| Field | Value |
|-------|-------|
| **Status** | Open |
| **Priority** | P2 |
| **Effort** | XXL (4-6 weeks dedicated sprint) |
| **App** | packages/ui |
| **Source** | Theme Normalization - January 4, 2026 |

**Description:**  
The legacy `inverted` prop system for dark/light theme switching needs to be removed from all UI components. This prop was used before the normalized section theme pattern (`section-dark`, `section-light`, `section-inverted` CSS classes) was implemented.

**Current State:**
- 1,638 usages of `inverted` across 124 files in `packages/ui/src`
- Additional usages in app files (atlvs, compvss, gvteway)
- Deeply integrated into conditional logic (`if (inverted) {...}` blocks)
- Batch regex removal breaks syntax due to complex patterns

**Why Manual Refactoring Required:**
- Ternary expressions: `inverted ? "class-a" : "class-b"` need semantic token replacement
- Conditional blocks: `if (inverted) {...} else {...}` need logic consolidation
- Type definitions and JSX props need synchronized removal
- Some `inverted` usages are legitimate (e.g., `variant="inverted"` for section themes)
- Automated regex/codemod approaches repeatedly break syntax due to complex nesting
- Each file requires understanding of the component's theme behavior to choose correct replacement tokens

**Attempted Automated Approaches (Failed):**
1. Batch sed/perl regex - Broke syntax in multiline expressions
2. Node.js codemod script - Removed type definitions but left variable references
3. Multiple iterations still left orphaned `inverted` variable usages

**Recommended Manual Approach:**
For each file:
1. Remove `inverted?: boolean;` from Props type
2. Remove `inverted` from function destructuring
3. Replace `inverted ? "dark-class" : "light-class"` with semantic token (usually the dark-class)
4. Remove `if (inverted) {...}` blocks, keeping the true branch content
5. Remove `inverted={inverted}` JSX prop usages
6. Test build after each file

**Normalized Pattern (Target State):**
Components should use semantic tokens that inherit from section theme classes:
```tsx
// Instead of: inverted ? "bg-surface-inverse" : "bg-surface-primary"
// Use: "bg-surface-elevated" (inherits from section theme)

// Instead of: inverted ? "text-text-primary" : "text-text-primary"  
// Use: "text-text-primary" (inherits from section theme)
```

**Acceptance Criteria:**
- [ ] All `inverted?: boolean` type definitions removed from component props
- [ ] All `inverted` destructuring removed from component functions
- [ ] All `inverted={...}` JSX prop usages removed
- [ ] All conditional logic (`if (inverted)`) replaced with semantic tokens
- [ ] Build passes with no TypeScript errors
- [ ] Visual regression testing confirms no UI changes

**Files to Refactor (Top 10 by usage count):**
1. `organisms/app-navbar.tsx` (87 usages)
2. `templates/list-page.tsx` (65 usages)
3. `organisms/app-sidebar.tsx` (50 usages)
4. `organisms/dashboard-builder.tsx` (48 usages)
5. `molecules/list-page-toolbar.tsx` (44 usages)
6. `organisms/context-switcher.tsx` (37 usages)
7. `templates/canvas-layout.tsx` (36 usages)
8. `templates/table-layout.tsx` (36 usages)
9. `templates/content-layout.tsx` (35 usages)
10. `organisms/page-header.tsx` (34 usages)

---

### BACK-114: Responsive Breakpoint Optimization for Mobile/Tablet

| Field | Value |
|-------|-------|
| **Status** | ✅ Complete |
| **Priority** | P2 |
| **Effort** | XL (6 weeks) |
| **App** | packages/ui, apps/compvss, apps/gvteway |
| **Source** | Responsive Audit - January 4, 2026 |
| **Completed** | January 5, 2026 |

**Description:**  
The monorepo requires comprehensive responsive breakpoint optimization to ensure full mobile and tablet device support. While ATLVS has 100% responsive coverage, the core UI library and other apps have significant gaps.

**Current State (January 4, 2026):**
| Area | Files | With Responsive | Coverage |
|------|-------|-----------------|----------|
| `packages/ui/src` | 192 | 38 | 19.8% |
| `apps/atlvs` | 41 | 41 | 100% ✅ |
| `apps/compvss` | 60 | 43 | 71.7% |
| `apps/gvteway` | 36 | 34 | 94.4% |

**Critical Components Needing Responsive (packages/ui):**

*Atoms (16 components):*
- `avatar.tsx` - Add responsive size variants
- `badge.tsx` - Add responsive padding
- `button.tsx` - Add responsive text/padding sizes
- `checkbox.tsx`, `radio.tsx`, `switch.tsx` - Add responsive dimensions
- `icon.tsx` - Add responsive size variants
- `input.tsx`, `select.tsx`, `textarea.tsx` - Add responsive heights
- `progress-bar.tsx`, `sparkline.tsx`, `spinner.tsx` - Add responsive dimensions
- `countdown.tsx`, `divider.tsx`, `tooltip.tsx` - Add responsive layouts

*Molecules (14 components):*
- `filter-bar.tsx` - Add collapsible drawer on mobile
- `list-page-toolbar.tsx` - Complete mobile toolbar collapse
- `stat-card.tsx` - Add responsive padding/text
- `skeleton.tsx` - Add responsive skeleton sizes
- `*-card.tsx` components - Add responsive card dimensions

*Organisms (20 components):*
- `data-grid.tsx` - Add mobile card view
- `kanban-board.tsx` - Add mobile vertical stack
- `calendar.tsx` - Add mobile day view
- `gantt-chart.tsx` - Add simplified mobile view
- `pipeline-board.tsx` - Add mobile vertical stack
- `automation-builder.tsx` - Add mobile workflow builder
- `dashboard-builder.tsx` - Add mobile widget management
- `detail-drawer.tsx` - Add full-width on mobile
- `record-form-modal.tsx` - Add full-width on mobile

**App Pages Needing Responsive:**

*COMPVSS (17 pages):*
- `beos/new/page.tsx`, `beos/[id]/versions/page.tsx`
- `build-strike/page.tsx`, `run-of-show/page.tsx`
- `integrations/page.tsx`, `notifications/page.tsx`
- `permits/page.tsx`, `schedule/page.tsx`
- `search/page.tsx`, `timekeeping/page.tsx`
- `vehicles/page.tsx`, `walkthrough/page.tsx`
- `workforce/page.tsx`
- Various `/new/page.tsx` form pages

*GVTEWAY (2 pages):*
- `membership/history/page.tsx`
- `settings/privacy/page.tsx`

**Standard Responsive Patterns to Apply:**
```tsx
// Stats grids
<Grid cols={4} className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">

// Form fields
<Grid cols={2} className="grid-cols-1 md:grid-cols-2">

// Detail sections
<Grid cols={2} className="grid-cols-1 sm:grid-cols-1 lg:grid-cols-2">

// Visibility
className="hidden lg:block"  // Desktop only
className="block lg:hidden"  // Mobile only
className="flex flex-col lg:flex-row"  // Stack on mobile
```

**Acceptance Criteria:**
- [x] All atoms have responsive size variants
- [x] All molecules have responsive layouts
- [x] All organisms have mobile-friendly alternatives (data-grid mobile card view, kanban vertical stack)
- [x] 17 COMPVSS pages have responsive grids (using ListPage/DetailPage templates)
- [x] 2 GVTEWAY pages have responsive grids (using DetailPage templates)
- [ ] Visual regression testing at 320px, 768px, 1024px, 1440px
- [ ] Touch interaction testing on mobile
- [ ] Performance testing on mobile devices

**Completed Remediations (January 5, 2026):**
- `packages/ui/src/atoms/button.tsx` - Responsive size variants
- `packages/ui/src/atoms/avatar.tsx` - Responsive size variants
- `packages/ui/src/atoms/badge.tsx` - Responsive padding/text
- `packages/ui/src/atoms/input.tsx` - Responsive height/padding
- `packages/ui/src/atoms/select.tsx` - Responsive height/padding
- `packages/ui/src/atoms/textarea.tsx` - Responsive height/padding
- `packages/ui/src/atoms/checkbox.tsx` - Responsive dimensions
- `packages/ui/src/atoms/radio.tsx` - Responsive dimensions
- `packages/ui/src/atoms/switch.tsx` - Responsive dimensions
- `packages/ui/src/atoms/spinner.tsx` - Responsive sizes
- `packages/ui/src/atoms/progress-bar.tsx` - Responsive heights
- `packages/ui/src/atoms/tooltip.tsx` - Responsive padding/text
- `packages/ui/src/molecules/stat-card.tsx` - Responsive padding/text
- `packages/ui/src/molecules/skeleton.tsx` - Responsive skeleton sizes
- `packages/ui/src/organisms/data-grid.tsx` - Mobile card view
- `packages/ui/src/organisms/kanban-board.tsx` - Mobile vertical stack
- `apps/compvss/src/app/(authenticated)/beos/new/page.tsx` - Responsive grid

**Documentation:**
- `docs/RESPONSIVE_REMEDIATION_AUDIT.md` - Full audit details
- `docs/ATLVS_RESPONSIVE_AUDIT.md` - ATLVS reference patterns

---

### BACK-110: Increase Hook Test Coverage to 80%

| Field | Value |
|-------|-------|
| **Status** | Open |
| **Priority** | P2 |
| **Effort** | XL (3-4 weeks) |
| **App** | All |
| **Source** | Agent 13 Testing Layer Audit - December 29, 2025 |

**Description:**  
Hook test coverage is currently at 21.6% (88 tests for 407 hooks). Target is 80% coverage for all React Query hooks across ATLVS, COMPVSS, and GVTEWAY.

**Current State (December 29, 2025):**
| App | Hooks | Tests | Coverage |
|-----|-------|-------|----------|
| ATLVS | 173 | 34 | 19.7% |
| COMPVSS | 110 | 26 | 23.6% |
| GVTEWAY | 124 | 28 | 22.6% |
| **Total** | **407** | **88** | **21.6%** |

**Priority Hooks to Test (Critical Paths):**
1. Authentication hooks (useAuth, useProfile, useOnboarding)
2. CRUD hooks for core entities (useProjects, useCrew, useEvents)
3. Financial hooks (useInvoices, useExpenses, useBudgets)
4. Booking/Ticketing hooks (useCart, useCheckout, useTickets)

**Acceptance Criteria:**
- [ ] 80% hook coverage across all apps
- [ ] All critical path hooks have tests
- [ ] No flaky tests
- [ ] Coverage reports generated in CI

---

## P3 - Low Priority

*No low priority items at this time. BACK-104 and BACK-111 have been completed - see CHANGELOG.md.*

---

## Deferred Items

### Navigation UX Deferred Items
- **Drag-to-reorder sidebar sections** - P3, deferred to future sprint
- **Real-time activity badges from API** - P3, deferred to future sprint
- **Swipe gestures for mobile tabs** - P3, deferred to future sprint

### V3 Expansion Features (Partially Complete)
See `docs/V3_EXPANSION_FEATURES.md` for detailed 6-layer implementation checklists for:
- Lead Capture Web Forms
- Visual Pipeline Management
- Contact & Account Database
- Master Event Calendar
- Space/Room Management
- Availability & Holds System
- Event Booking Workflow
- Proposal Builder
- Contract Generation & E-Signatures
- BEO Generation
- Invoice & Payment Generation
- Integrated Payment Gateway
- Deposit & Payment Schedule
- Floor Plan Designer
- Client Portal
- Event Ticketing System
- Real-Time Analytics Dashboard
- Integration Suite
- Vendor Database & Services

---

## Archive Reference

All completed items from December 2025 - January 2026 have been moved to [CHANGELOG.md](./CHANGELOG.md), including:
- BACK-102: Concurrent Session Management ✅ (January 4, 2026)
- BACK-112: Re-enable Next.js Standalone Mode ✅ (January 4, 2026)
- BACK-104: Implement Ticket Actions for GVTEWAY ✅ (January 4, 2026)
- BACK-111: Integration Connector APIs for Zapier/n8n ✅ (January 4, 2026)
- BACK-100: Workflow Gap Implementation (Phases 1-7) ✅
- BACK-103: API Endpoint Authentication Gaps ✅
- BACK-070: Navigation UX Optimization ✅
- BACK-060: Toolbar Feature Normalization ✅
- BACK-054: Fix All Lint Warnings ✅
- BACK-055: Eliminate All `as any` Type Casts ✅
- BACK-056: Increase Unit Test Coverage ✅
- BACK-095: Complete 6-Layer Integration ✅
- BACK-105: Security Layer Audit ✅
- BACK-106: CSRF Protection ✅
- BACK-107: Environment Variables Review ✅
- And 50+ more completed items
