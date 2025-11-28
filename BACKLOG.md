# GHXSTSHIP Platform Backlog

This document tracks incomplete, deferred, and planned features that need to be addressed.

---

## Deferred Features

### Vercel Cron Jobs (Disabled - Plan Limit)
**Status:** Temporarily disabled due to Vercel Hobby plan limit (2 crons max)
**Action Required:** Upgrade to Vercel Pro plan, then re-enable crons in vercel.json files

#### ATLVS Crons
- [ ] `/api/cron/sync-ledger` - Daily ledger synchronization (schedule: `0 0 * * *`)
- [ ] `/api/cron/cleanup-sessions` - Daily session cleanup (schedule: `0 0 * * *`)

#### COMPVSS Crons
- [ ] `/api/cron/sync-equipment` - Daily equipment sync (schedule: `0 0 * * *`)
- [ ] `/api/cron/crew-notifications` - Daily crew notifications at 8am (schedule: `0 8 * * *`)

#### GVTEWAY Crons
- [ ] `/api/cron/ticket-reminders` - Daily ticket reminders at 9am (schedule: `0 9 * * *`)
- [ ] `/api/cron/loyalty-points` - Daily loyalty points processing (schedule: `0 0 * * *`)
- [ ] `/api/cron/event-notifications` - Daily event notifications at 6am (schedule: `0 6 * * *`)

---

## Planned Features

### UI Style Guide Refactor (In Progress)
**Status:** Partially complete - key pages refactored
**Reference:** `docs/design/STYLE-GUIDE-PREVIEW.jsx`
**Identified:** November 27, 2025

**Objective:** Refactor all 337 authenticated pages to fully align with the GHXSTSHIP "Bold Contemporary Pop Art Adventure" design system.

**Design System Requirements:**
- Use `PageLayout` wrapper with proper `background` and `header` props
- Use `SectionHeader` for page headers with `kicker`, `title`, `description`, `colorScheme`
- Use `Card` with `variant` and `inverted` props instead of raw className
- Use `StatCard` with `icon`, `trend`, `trendValue`, `inverted` props
- Replace `font-bold` with `font-weight-bold` (design system token)
- Replace `text-ink-*` with semantic classes like `text-on-dark-muted`, `text-on-dark-secondary`
- Hard offset shadows only (no blur) - use `shadow-xs` through `shadow-xl`
- 2px+ borders on interactive elements

**Completed Pages:**
- [x] `apps/atlvs/src/app/analytics/page.tsx` - Full refactor with PageLayout, SectionHeader, StatCard with icons/trends
- [x] `apps/gvteway/src/app/dashboard/page.tsx` - Full refactor with PageLayout, design system tokens
- [x] `apps/gvteway/src/app/settings/page.tsx` - Full refactor with PageLayout, SectionHeader, Card variants
- [x] `apps/gvteway/src/app/profile/page.tsx` - Partial refactor with Card variants
- [x] `apps/compvss/src/app/dashboard/page.tsx` - Full refactor with PageLayout, SectionHeader

**Remaining Work (330+ pages):**
- [ ] GVTEWAY authenticated pages (~150 pages)
- [ ] ATLVS authenticated pages (~100 pages)  
- [ ] COMPVSS authenticated pages (~80 pages)

**Pattern to Apply:**
```tsx
// Before
<Section className="min-h-screen bg-white">
  <Navigation />
  <Container className="py-16">
    <H1>Title</H1>
    ...
  </Container>
</Section>

// After
<PageLayout background="white" header={<Navigation />}>
  <Section className="min-h-screen py-16">
    <Container>
      <SectionHeader
        kicker="App Name"
        title="Page Title"
        description="Page description"
        colorScheme="on-light"
        gap="lg"
      />
      ...
    </Container>
  </Section>
</PageLayout>
```

---

## Technical Debt

### Typography Implementation Audit ✅ COMPLETE
**Status:** Full remediation complete
**Documentation:** See `docs/TYPOGRAPHY_AUDIT_REPORT.md`
**Identified:** November 27, 2025
**Remediated:** November 27, 2025

**Summary:** ~1,800+ typography violations were identified and 100% have been fixed via automated scripts and manual edits.

**Completed:**
- [x] Phase 1: Fix `packages/ui` components (foundation) - ~113 violations fixed
- [x] Phase 2: Fix GVTEWAY app - all violations fixed
- [x] Phase 3: Fix ATLVS and COMPVSS apps - all violations fixed
- [x] Add ESLint rule to prevent future violations (`.eslintrc.js`)

**Scripts Created:**
- `scripts/fix-typography.sh` - Initial remediation script
- `scripts/fix-typography-v2.sh` - Comprehensive remediation script
- `scripts/fix-typography-v3.sh` - Responsive breakpoint fixes
- `scripts/fix-typography-v4.sh` - Template literal fixes
- `scripts/fix-typography-final.sh` - Final cleanup pass

---

### Text Color Visibility Audit ✅ COMPLETE
**Status:** Fully implemented and audited
**Documentation:** See `docs/TEXT_COLOR_VISIBILITY.md`
**Completed:** November 27, 2025

The text color visibility system has been fully implemented across the codebase:

**Design System Foundation:**
- [x] Added `textColors` semantic tokens to `packages/ui/src/tokens.ts`
- [x] Added `textColorPalette` to `packages/config-tailwind/index.js`
- [x] Updated `Kicker` component with `colorScheme` prop
- [x] Updated `SectionHeader` component with `colorScheme` prop

**UI Component Fixes:**
- [x] Fixed `context-breadcrumb.tsx` - swapped inverted color logic
- [x] Fixed `breadcrumb.tsx` - updated separator color
- [x] Fixed `link.tsx` - updated footer variant color
- [x] Fixed `offline-indicator.tsx` - updated muted text colors
- [x] Fixed `bulk-action-bar.tsx` - updated clear button color

**App-Level Audit (All Three Apps):**
- [x] GVTEWAY: Fixed all light-background pages (`text-grey-400` → `text-grey-600`)
- [x] ATLVS: Fixed all light-background pages (`text-grey-400` → `text-grey-600`)
- [x] COMPVSS: Fixed all light-background pages (`text-grey-400` → `text-grey-600`)
- [x] Fixed `text-ink-400`/`text-ink-300` on light backgrounds → `text-ink-600`/`text-ink-700`

**Verification:**
- Zero files with light backgrounds (`bg-white`, `bg-ink-50`) using low-contrast text colors
- All remaining `text-grey-400` and `text-ink-400` instances are correctly on dark backgrounds

---

### Raw Tailwind Migration ✅ COMPLETE
**Status:** Fully remediated
**Identified:** November 27, 2025
**Completed:** November 27, 2025

The design system architecture has been updated to support proper component variants:

**Completed:**
- [x] Added `outlineWhite` and `outlineInk` Button variants to `packages/ui`
- [x] Enhanced `Section` component with `kicker`, `title`, `description`, `align`, `gap` props
- [x] Removed local `section.tsx` wrapper files from all apps
- [x] All apps import `Section`, `SectionHeader` from `@ghxstship/ui`
- [x] Semantic CSS variables added to all `globals.css` files (surface, text, border tokens)
- [x] Semantic CSS variable tokens added to `packages/config-tailwind/index.js`

**Files Fixed (Button raw Tailwind → outlineInk variant):**
- [x] `atlvs/src/app/settings/page.tsx`
- [x] `atlvs/src/app/dashboard/page.tsx`
- [x] `compvss/src/app/settings/page.tsx`
- [x] `compvss/src/app/crew/social/page.tsx`
- [x] `compvss/src/app/knowledge/regulations/page.tsx`
- [x] `gvteway/src/app/profile/page.tsx`
- [x] `gvteway/src/app/auth/signin/page.tsx`
- [x] `gvteway/src/app/auth/signup/page.tsx`
- [x] `gvteway/src/app/artists/page.tsx`
- [x] `gvteway/src/app/events/[id]/landing-builder/page.tsx`
- [x] `gvteway/src/app/onboarding/page.tsx`

**Pattern established:**
```tsx
// Before (raw Tailwind)
<Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">

// After (design system variant)
<Button variant="outlineInk">
```

**Note:** 3 remaining `hover:border-white` instances are on `Card` components (interactive cards), which is a valid pattern for clickable cards.

---

### Theme-Aware Background Migration ✅ COMPLETE
**Status:** Complete - all components migrated or use inverted prop pattern
**Identified:** November 27, 2025
**Completed:** November 27, 2025

**Completed:**
- [x] Added semantic CSS variable tokens to `config-tailwind/index.js`:
  - `semanticSurfaceColors` (surface-primary, surface-secondary, surface-elevated, etc.)
  - `semanticTextColors` (text-primary, text-secondary, text-muted, etc.)
  - `semanticBorderColors` (border-primary, border-secondary, border-focus, etc.)
  - `semanticInteractiveColors` (hover-surface, active-surface, focus-ring)
  - `semanticShadowTokens` (shadow-sm, shadow-md, shadow-lg)
- [x] Added CSS variable definitions to all app `globals.css` files:
  - Dark mode default (GHXSTSHIP aesthetic)
  - Light mode override (`.light`, `[data-theme="light"]`)
- [x] Migrated organisms to semantic tokens:
  - `DataGrid`, `DetailDrawer`, `ImportExportDialog`, `Lightbox`
  - `RecordFormModal`, `Calendar`
- [x] Migrated molecules to semantic tokens:
  - `LanguageSelector`
- [x] Migrated foundations/templates to semantic tokens:
  - `Section`, `Main`, `PageLayout`, `AppShell`
- [x] Verified all other components use `inverted` prop pattern correctly:
  - Atoms: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `Radio`, `Switch`, `Badge`, etc.
  - Molecules: `Card`, `Tabs`, `Dropdown`, `RowActions`, `DataTable`, `Pagination`, etc.
  - Organisms: `Modal`, `Sidebar`, `Navigation`, `UnifiedHeader`, `ResponsiveSidebar`, etc.

**Usage Pattern:**
```tsx
// Semantic tokens (auto theme-aware)
<div className="bg-surface-primary text-text-primary border-border-primary">

// Inverted prop pattern (explicit theme control)
<Button inverted>Dark background button</Button>
<Card inverted>Dark background card</Card>
```

**Theme Switching:**
- Add `class="light"` or `data-theme="light"` to `<html>` for light mode
- Default is dark mode (GHXSTSHIP aesthetic)

---

### Design System Enforcement - ESLint Rules 🔄 IN PROGRESS
**Status:** ESLint rules implemented, violations being tracked
**Identified:** November 27, 2025
**Target:** Upgrade from warnings to errors once all violations are fixed

**ESLint Configuration:**
- [x] Comprehensive ESLint rules added to `.eslintrc.js`
- [x] Rules detect raw Tailwind typography, colors, spacing, shadows, border-radius
- [x] Rules detect arbitrary values (square brackets)
- [x] Tailwindcss plugin configured with design system whitelist
- [x] UI components (`packages/ui/src/**`) exempt (encapsulated design system internals)

**Current Violations (as of Nov 27, 2025):**
- ~33 errors (currently set to warnings during transition)
- Primary violations: `font-normal`, `font-medium`, `rounded-lg`, `rounded-full`, `tracking-wide`

**Remediation Plan:**
- [ ] Phase 1: Fix font weight violations → use `font-weight-normal`, `font-weight-medium`, etc.
- [ ] Phase 2: Fix border radius violations → use `rounded-radius-*`, `rounded-button`, `rounded-card`
- [ ] Phase 3: Fix letter spacing violations → use `tracking-label`, `tracking-kicker`, `tracking-display`
- [ ] Phase 4: Upgrade ESLint rules from "warn" to "error"

**Reference Documents:**
- `ZERO-RAW-TAILWIND-ENFORCEMENT.md` - Zero tolerance policy
- `DESIGN-SYSTEM-ENFORCEMENT-AUDIT.md` - Full audit checklist

---

## Notes

- Vercel Hobby plan allows 2 cron jobs total across all projects
- Vercel Pro plan ($20/month per member) allows more cron jobs
- Consider consolidating cron jobs or using external cron services as alternatives
