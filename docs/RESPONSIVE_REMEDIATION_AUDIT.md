# Monorepo Responsive Breakpoint Optimization - Remediation Audit

**Generated:** January 4, 2026  
**Scope:** Full monorepo (`packages/ui`, `apps/atlvs`, `apps/compvss`, `apps/gvteway`)  
**Verification Method:** Comprehensive grep analysis of responsive classes

---

## Executive Summary

| Area | Files | With Responsive | Coverage | Status |
|------|-------|-----------------|----------|--------|
| `packages/ui/src` | 192 | 38 | 19.8% | 🔴 NEEDS REMEDIATION |
| `apps/atlvs` | 41 | 41 | 100% | ✅ COMPLETE |
| `apps/compvss` | 60 | 43 | 71.7% | 🟡 PARTIAL |
| `apps/gvteway` | 36 | 34 | 94.4% | 🟢 GOOD |

---

## LAYER 1: packages/ui - Core Component Library

### 🔴 CRITICAL: Atoms Without Responsive Breakpoints

The following atom components have **NO responsive breakpoint classes** and need remediation:

| Component | Issue | Remediation |
|-----------|-------|-------------|
| `atoms/avatar.tsx` | Fixed sizes only | Add `sm:size-8 md:size-10 lg:size-12` variants |
| `atoms/badge.tsx` | Fixed padding/text | Add responsive padding `sm:px-2 md:px-3` |
| `atoms/button.tsx` | Fixed sizes | Add `sm:text-sm md:text-base` for size variants |
| `atoms/checkbox.tsx` | Fixed dimensions | Add responsive sizing |
| `atoms/countdown.tsx` | Fixed layout | Add responsive grid/flex |
| `atoms/divider.tsx` | No responsive | Add responsive margins |
| `atoms/icon.tsx` | Fixed sizes | Add responsive `sm:size-4 md:size-5 lg:size-6` |
| `atoms/input.tsx` | Fixed height/padding | Add responsive height variants |
| `atoms/progress-bar.tsx` | Fixed height | Add responsive height |
| `atoms/radio.tsx` | Fixed dimensions | Add responsive sizing |
| `atoms/select.tsx` | Fixed height | Add responsive height |
| `atoms/sparkline.tsx` | Fixed dimensions | Add responsive width/height |
| `atoms/spinner.tsx` | Fixed sizes | Add responsive size variants |
| `atoms/switch.tsx` | Fixed dimensions | Add responsive sizing |
| `atoms/textarea.tsx` | Fixed height | Add responsive min-height |
| `atoms/tooltip.tsx` | Fixed max-width | Add responsive max-width |

### 🔴 CRITICAL: Molecules Without Responsive Breakpoints

| Component | Issue | Remediation |
|-----------|-------|-------------|
| `molecules/ai-chat-*.tsx` | Limited responsive | Add mobile-first chat layout |
| `molecules/bulk-action-bar.tsx` | Fixed layout | Add responsive stacking |
| `molecules/context-breadcrumb.tsx` | Truncation only | Add responsive hiding of middle items |
| `molecules/crew-card.tsx` | Fixed card size | Add responsive card dimensions |
| `molecules/deal-card.tsx` | Fixed layout | Add responsive grid |
| `molecules/event-card.tsx` | Fixed layout | Add responsive stacking |
| `molecules/filter-bar.tsx` | No responsive | Add collapsible filter drawer on mobile |
| `molecules/floor-plan-object-library.tsx` | Fixed panel | Add responsive panel width |
| `molecules/list-page-toolbar.tsx` | Partial | Complete mobile toolbar collapse |
| `molecules/pipeline-stage.tsx` | Fixed width | Add responsive width |
| `molecules/project-card.tsx` | Fixed layout | Add responsive grid |
| `molecules/skeleton.tsx` | Fixed dimensions | Add responsive skeleton sizes |
| `molecules/stat-card.tsx` | No responsive | Add responsive padding/text |
| `molecules/video-player.tsx` | Fixed aspect | Add responsive aspect ratios |

### 🔴 CRITICAL: Organisms Without Responsive Breakpoints

| Component | Issue | Remediation |
|-----------|-------|-------------|
| `organisms/automation-builder.tsx` | Desktop-only | Add mobile workflow builder |
| `organisms/calendar.tsx` | Limited responsive | Add day/week view on mobile |
| `organisms/command-palette.tsx` | Fixed width | Add responsive width |
| `organisms/cookie-consent-banner.tsx` | Fixed layout | Add responsive stacking |
| `organisms/dashboard-builder.tsx` | Desktop-only | Add mobile widget management |
| `organisms/data-grid.tsx` | Table scroll only | Add card view on mobile |
| `organisms/detail-drawer.tsx` | Fixed width | Add full-width on mobile |
| `organisms/floor-plan-canvas.tsx` | Desktop-only | Add mobile pan/zoom controls |
| `organisms/gantt-chart.tsx` | Desktop-only | Add simplified mobile view |
| `organisms/image-gallery.tsx` | Fixed grid | Add responsive columns |
| `organisms/kanban-board.tsx` | Horizontal scroll | Add vertical stack on mobile |
| `organisms/keyboard-shortcuts-modal.tsx` | Fixed width | Add responsive width |
| `organisms/lightbox.tsx` | Fixed controls | Add mobile touch gestures |
| `organisms/map-view.tsx` | Limited responsive | Add mobile map controls |
| `organisms/notification-center.tsx` | Fixed width | Add full-width on mobile |
| `organisms/onboarding-wizard.tsx` | Fixed layout | Add responsive step layout |
| `organisms/pipeline-board.tsx` | Horizontal scroll | Add vertical stack on mobile |
| `organisms/privacy-preference-center.tsx` | Fixed width | Add responsive width |
| `organisms/record-form-modal.tsx` | Fixed width | Add full-width on mobile |
| `organisms/timeline-view.tsx` | Fixed layout | Add responsive timeline |

### 🟡 PARTIAL: Templates With Incomplete Responsive

| Template | Current State | Remediation Needed |
|----------|---------------|-------------------|
| `templates/list-page.tsx` | Stats responsive, table scroll | Add card view toggle on mobile |
| `templates/detail-page.tsx` | Tabs responsive | Add collapsible sidebar on mobile |
| `templates/dashboard-page.tsx` | Grid responsive | Complete widget responsive |
| `templates/canvas-layout.tsx` | Fixed sidebar | Add collapsible sidebar |
| `templates/table-layout.tsx` | Scroll only | Add card view option |
| `templates/hub-page.tsx` | Limited | Add mobile navigation |

### ✅ GOOD: Components With Adequate Responsive

- `templates/authenticated-shell.tsx` - 10 responsive patterns
- `templates/client-portal-shell.tsx` - 7 responsive patterns
- `templates/auth-split-layout.tsx` - 6 responsive patterns
- `organisms/app-navbar.tsx` - 8 responsive patterns
- `organisms/app-navigation.tsx` - 5 responsive patterns
- `organisms/public-navbar.tsx` - 4 responsive patterns
- `organisms/footer.tsx` - 4 responsive patterns

---

## LAYER 2: apps/atlvs - Event Management Platform

### ✅ COMPLETE - All 41 pages have responsive breakpoints

See `docs/ATLVS_RESPONSIVE_AUDIT.md` for detailed documentation.

**Standard Patterns Used:**
- Stats grids: `sm:grid-cols-2 lg:grid-cols-4`
- Form fields: `grid-cols-1 md:grid-cols-2`
- Detail sections: `sm:grid-cols-1 lg:grid-cols-2`
- Date/time fields: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

---

## LAYER 3: apps/compvss - Production Management Platform

### 🟡 PARTIAL - 43 of 60 pages have responsive breakpoints

**Pages WITH responsive classes (43):**
- `settlement/page.tsx` (5 patterns)
- `tech-rehearsal/page.tsx` (5 patterns)
- `advancing/page.tsx` (4 patterns)
- `punch-list/page.tsx` (4 patterns)
- `risk-register/page.tsx` (4 patterns)
- `soundcheck/page.tsx` (4 patterns)
- `dashboard/page.tsx` (3 patterns)
- `drawings/page.tsx` (3 patterns)
- `set-times/page.tsx` (3 patterns)
- ... and 34 more

**Pages WITHOUT responsive classes (17) - NEEDS REMEDIATION:**

| Page | Issue | Remediation |
|------|-------|-------------|
| `beos/new/page.tsx` | No responsive grid | Add form field responsive |
| `beos/[id]/versions/page.tsx` | No responsive | Add version list responsive |
| `build-strike/page.tsx` | No responsive | Add timeline responsive |
| `integrations/page.tsx` | No responsive | Add card grid responsive |
| `notifications/page.tsx` | No responsive | Add notification list responsive |
| `permits/page.tsx` | No responsive | Add permit list responsive |
| `run-of-show/page.tsx` | No responsive | Add timeline responsive |
| `schedule/page.tsx` | No responsive | Add calendar responsive |
| `search/page.tsx` | No responsive | Add search results responsive |
| `sops/new/page.tsx` | No responsive | Add form responsive |
| `spec-sheets/new/page.tsx` | No responsive | Add form responsive |
| `templates/new/page.tsx` | No responsive | Add form responsive |
| `timekeeping/page.tsx` | No responsive | Add timesheet responsive |
| `vehicles/page.tsx` | No responsive | Add vehicle list responsive |
| `walkthrough/page.tsx` | No responsive | Add checklist responsive |
| `weather-contingency/new/page.tsx` | No responsive | Add form responsive |
| `workforce/page.tsx` | No responsive | Add workforce grid responsive |

---

## LAYER 4: apps/gvteway - Fan Portal Platform

### 🟢 GOOD - 34 of 36 pages have responsive breakpoints

**Pages WITH responsive classes (34):**
- `apply/page.tsx` (10 patterns) - Excellent
- `dashboard/page.tsx` (9 patterns) - Excellent
- `chat/page.tsx` (4 patterns)
- `settings/webhooks/page.tsx` (4 patterns)
- `venues/[id]/page.tsx` (4 patterns)
- ... and 29 more

**Pages WITHOUT responsive classes (2) - NEEDS REMEDIATION:**

| Page | Issue | Remediation |
|------|-------|-------------|
| `membership/history/page.tsx` | No responsive | Add history list responsive |
| `settings/privacy/page.tsx` | No responsive | Add settings form responsive |

---

## REMEDIATION PRIORITY MATRIX

### P0 - Critical (Blocks Mobile Usage)

1. **`packages/ui` atoms** - Core components used everywhere
   - `button.tsx` - Add responsive size variants
   - `input.tsx` - Add responsive height
   - `select.tsx` - Add responsive height
   - Effort: **M (1 week)**

2. **`packages/ui` organisms** - Complex interactive components
   - `data-grid.tsx` - Add mobile card view
   - `kanban-board.tsx` - Add mobile vertical stack
   - `calendar.tsx` - Add mobile day view
   - Effort: **L (2 weeks)**

### P1 - High (Degraded Mobile Experience)

3. **`packages/ui` molecules** - Supporting components
   - `filter-bar.tsx` - Add collapsible drawer
   - `list-page-toolbar.tsx` - Complete mobile collapse
   - `stat-card.tsx` - Add responsive padding
   - Effort: **M (1 week)**

4. **`apps/compvss` pages** - 17 pages need responsive
   - Add standard grid patterns
   - Effort: **M (1 week)**

### P2 - Medium (Minor Mobile Issues)

5. **`packages/ui` templates** - Layout templates
   - `canvas-layout.tsx` - Collapsible sidebar
   - `table-layout.tsx` - Card view option
   - Effort: **S (3 days)**

6. **`apps/gvteway` pages** - 2 pages need responsive
   - Add standard patterns
   - Effort: **XS (1 day)**

---

## RECOMMENDED RESPONSIVE PATTERNS

### Standard Grid Patterns (Use Consistently)

```tsx
// Stats/KPIs (4 items)
<Grid cols={4} className="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">

// Form fields (2 columns)
<Grid cols={2} className="grid-cols-1 md:grid-cols-2">

// Form fields (3 columns)
<Grid cols={3} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Date/time fields (4 columns)
<Grid cols={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Detail sections (2 columns)
<Grid cols={2} className="grid-cols-1 sm:grid-cols-1 lg:grid-cols-2">

// Card grids (3 columns)
<Grid cols={3} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// Card grids (4 columns)
<Grid cols={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

### Standard Visibility Patterns

```tsx
// Hide on mobile, show on desktop
className="hidden lg:block"

// Show on mobile, hide on desktop
className="block lg:hidden"

// Flex on desktop, stack on mobile
className="flex flex-col lg:flex-row"

// Full width on mobile, fixed on desktop
className="w-full lg:w-64"
```

### Standard Text Patterns

```tsx
// Responsive text sizes
className="text-sm md:text-base lg:text-lg"

// Responsive headings
className="text-xl md:text-2xl lg:text-3xl"

// Truncate on mobile
className="truncate lg:whitespace-normal"
```

### Standard Spacing Patterns

```tsx
// Responsive padding
className="p-4 md:p-6 lg:p-8"

// Responsive gaps
className="gap-4 md:gap-6 lg:gap-8"

// Responsive margins
className="mt-4 md:mt-6 lg:mt-8"
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Core UI Components (Week 1-2)
- [ ] Audit all atoms for responsive gaps
- [ ] Add responsive variants to button, input, select
- [ ] Add responsive variants to badge, avatar, icon
- [ ] Update molecules with responsive patterns
- [ ] Test on mobile devices

### Phase 2: Complex Organisms (Week 3-4)
- [ ] Add mobile card view to data-grid
- [ ] Add mobile vertical stack to kanban-board
- [ ] Add mobile day view to calendar
- [ ] Add mobile controls to gantt-chart
- [ ] Add mobile drawer to filter-bar

### Phase 3: App Pages (Week 5)
- [ ] Remediate 17 compvss pages
- [ ] Remediate 2 gvteway pages
- [ ] Verify all atlvs pages maintain responsive

### Phase 4: Testing & Validation (Week 6)
- [ ] Visual regression testing at all breakpoints
- [ ] Touch interaction testing
- [ ] Performance testing on mobile
- [ ] Accessibility testing on mobile

---

## TOTAL EFFORT ESTIMATE

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: Core UI | L | 2 weeks |
| Phase 2: Organisms | L | 2 weeks |
| Phase 3: App Pages | M | 1 week |
| Phase 4: Testing | M | 1 week |
| **Total** | **XL** | **6 weeks** |

---

**Audit Complete:** Monorepo requires significant responsive remediation in `packages/ui` core components.
