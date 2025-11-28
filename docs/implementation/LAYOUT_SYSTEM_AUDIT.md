# Page Layout System Audit

> **Phase 1 Deliverable** — Layout inventory, classification, and gap analysis  
> **Date**: November 2024  
> **Reference**: `docs/design/STYLE-GUIDE-PREVIEW.jsx`

---

## Executive Summary

The current layout system has **functional foundations** but suffers from:
1. **Inconsistent usage patterns** across apps
2. **Redundant/deprecated components** still in codebase
3. **Missing semantic layout templates** for common page patterns
4. **Inline styling overrides** bypassing the design system

This audit identifies all existing layouts, classifies them, and recommends a rationalized system.

---

## 1. Existing Layout Inventory

### 1.1 Foundation Layouts (`packages/ui/src/foundations/layout.tsx`)

| Component | Status | Description | Usage |
|-----------|--------|-------------|-------|
| `Container` | **ACTIVE** | Max-width wrapper with responsive padding | High - used across all apps |
| `Section` | **ACTIVE** | Semantic section with background, border, header support | High - primary section wrapper |
| `Grid` | **ACTIVE** | Responsive grid system (1-12 cols) | High - content layouts |
| `Stack` | **ACTIVE** | Flexbox vertical/horizontal stacking | High - ubiquitous |

**Assessment**: These primitives are well-designed and should be **preserved**.

### 1.2 Template Layouts (`packages/ui/src/templates/`)

| Component | Status | Description | Issues |
|-----------|--------|-------------|--------|
| `PageLayout` | **ACTIVE** | Full-height page wrapper with header/footer slots | Limited - only `black`/`white` backgrounds |
| `SectionLayout` | **DEPRECATED** | Alias for `Section` | Remove - just re-exports `Section` |
| `AppShell` | **ACTIVE** | Sidebar + content layout | Underutilized - not used by any app |
| `ListPage` | **ACTIVE** | Data table page template | Good - used for asset/list pages |
| `ErrorPage` | **ACTIVE** | Error state template | Good - consistent error handling |
| `NotFoundPage` | **ACTIVE** | 404 template | Good - consistent 404 handling |

### 1.3 App-Level Layouts

#### ATLVS (`apps/atlvs/src/`)

| Component | Location | Status | Description |
|-----------|----------|--------|-------------|
| `RootLayout` | `app/layout.tsx` | **ACTIVE** | Next.js root with fonts, providers |
| `AtlvsAppLayout` | `components/app-layout.tsx` | **ACTIVE** | App wrapper with nav, footer, grid pattern |
| `AtlvsLoadingLayout` | `components/app-layout.tsx` | **ACTIVE** | Loading state wrapper |
| `AtlvsEmptyLayout` | `components/app-layout.tsx` | **ACTIVE** | Empty state wrapper |

**Issues**:
- Homepage (`page.tsx`) uses raw `Section` + `Container` instead of `AtlvsAppLayout`
- Inconsistent: some pages use `ListPage`, others use manual layouts
- Grid pattern background duplicated inline

#### COMPVSS (`apps/compvss/src/`)

| Component | Location | Status | Description |
|-----------|----------|--------|-------------|
| `RootLayout` | `app/layout.tsx` | **ACTIVE** | Next.js root with fonts, providers |
| `CompvssAppLayout` | `components/app-layout.tsx` | **ACTIVE** | App wrapper (light/dark support) |
| `CompvssLoadingLayout` | `components/app-layout.tsx` | **ACTIVE** | Loading state wrapper |
| `CompvssEmptyLayout` | `components/app-layout.tsx` | **ACTIVE** | Empty state wrapper |

**Issues**:
- Homepage uses raw `Section` + `Container` instead of `CompvssAppLayout`
- Default background is `white` but most content is dark-themed
- Same grid pattern duplicated inline

#### GVTEWAY (`apps/gvteway/src/`)

| Component | Location | Status | Description |
|-----------|----------|--------|-------------|
| `RootLayout` | `app/layout.tsx` | **ACTIVE** | Next.js root with fonts, providers |
| `GvtewayAppLayout` | `components/app-layout.tsx` | **ACTIVE** | App wrapper with multiple nav variants |
| `GvtewayLoadingLayout` | `components/app-layout.tsx` | **ACTIVE** | Loading state wrapper |
| `GvtewayEmptyLayout` | `components/app-layout.tsx` | **ACTIVE** | Empty state wrapper |

**Issues**:
- Homepage uses `PageLayout` directly instead of `GvtewayAppLayout`
- Halftone pattern background duplicated inline
- Events page correctly uses `GvtewayAppLayout` (good example)

---

## 2. Classification Summary

### ✅ ACTIVE (Keep & Enhance)

| Component | Rationale |
|-----------|-----------|
| `Container` | Core primitive, well-designed |
| `Section` | Core primitive with header support |
| `Grid` | Essential responsive grid |
| `Stack` | Essential flex utility |
| `PageLayout` | Good base, needs enhancement |
| `ListPage` | Excellent data page template |
| `ErrorPage` | Consistent error handling |
| `NotFoundPage` | Consistent 404 handling |
| `*AppLayout` (per app) | App-specific wrappers needed |

### ⚠️ LEGACY (Deprecate)

| Component | Rationale | Action |
|-----------|-----------|--------|
| `SectionLayout` | Just an alias for `Section` | Remove, update imports |

### 🔴 REDUNDANT (Remove)

| Pattern | Location | Action |
|---------|----------|--------|
| Inline grid patterns | All app homepages | Extract to shared component |
| Inline halftone patterns | GVTEWAY pages | Extract to shared component |
| Manual `Section` + `Container` | Homepages | Use `*AppLayout` wrappers |

---

## 3. Gap Analysis

### 3.1 Missing Layout Primitives

| Gap | Description | Priority |
|-----|-------------|----------|
| `PageHeader` | Standardized page header with kicker, title, description, actions | **HIGH** |
| `PageContent` | Main content area with consistent padding | **HIGH** |
| `Sidebar` | Collapsible sidebar for dashboard layouts | **MEDIUM** |
| `SplitLayout` | Two-column layouts (main + aside) | **MEDIUM** |
| `FullBleedSection` | Edge-to-edge section without container | **LOW** |

### 3.2 Missing Page Templates

| Gap | Description | Priority |
|-----|-------------|----------|
| `DashboardPage` | Sidebar + header + content grid | **HIGH** |
| `DetailPage` | Entity detail view with tabs/sections | **HIGH** |
| `FormPage` | Full-page form with validation | **MEDIUM** |
| `LandingPage` | Marketing/public page template | **MEDIUM** |
| `AuthPage` | Authentication flow template | **LOW** |

### 3.3 Missing Background Patterns

| Gap | Description | Priority |
|-----|-------------|----------|
| `GridPattern` | Reusable grid background overlay | **HIGH** |
| `HalftonePattern` | Reusable halftone/dot pattern | **HIGH** |
| `StripesPattern` | Diagonal stripes pattern | **LOW** |

---

## 4. Deprecation Recommendations

### 4.1 Immediate Deprecations

```typescript
// packages/ui/src/templates/section-layout.tsx
// STATUS: REMOVE ENTIRELY
// This file just re-exports Section - no value added
```

### 4.2 Pattern Consolidations

**Before** (current - duplicated in each app):
```tsx
// apps/*/src/components/app-layout.tsx
<div
  className="pointer-events-none absolute inset-0 opacity-[0.03]"
  style={{
    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
    backgroundSize: "24px 24px",
  }}
/>
```

**After** (proposed - shared component):
```tsx
// packages/ui/src/atoms/patterns.tsx
export const GridPattern = ({ opacity = 0.03, size = 24, inverted = true }) => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      opacity,
      backgroundImage: `linear-gradient(${inverted ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${inverted ? '#fff' : '#000'} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
    }}
    aria-hidden="true"
  />
);
```

### 4.3 Homepage Standardization

All three app homepages should use their respective `*AppLayout` wrappers instead of raw `Section` + `Container`.

---

## 5. Proposed Layout Architecture

### 5.1 Atomic Design Hierarchy

```
FOUNDATIONS (primitives)
├── Container      - Max-width wrapper
├── Section        - Semantic section
├── Grid           - Responsive grid
├── Stack          - Flex stacking
└── Box            - Generic container

PATTERNS (decorative)
├── GridPattern    - Grid background
├── HalftonePattern - Dot pattern
└── StripesPattern - Diagonal stripes

REGIONS (semantic areas)
├── PageHeader     - Title + actions
├── PageContent    - Main content area
├── PageFooter     - Page-level footer
├── Sidebar        - Navigation sidebar
└── Aside          - Secondary content

TEMPLATES (full pages)
├── PageLayout     - Base page structure
├── DashboardPage  - Sidebar + content
├── ListPage       - Data table page
├── DetailPage     - Entity detail
├── FormPage       - Full-page form
├── LandingPage    - Marketing page
├── ErrorPage      - Error state
└── NotFoundPage   - 404 state

APP WRAPPERS (app-specific)
├── AtlvsAppLayout
├── CompvssAppLayout
└── GvtewayAppLayout
```

### 5.2 Spacing & Sizing Tokens

Per `STYLE-GUIDE-PREVIEW.jsx`:

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-1` | 4px | Micro gaps |
| `spacing-2` | 8px | Tight gaps |
| `spacing-4` | 16px | Base padding |
| `spacing-6` | 24px | Section padding |
| `spacing-8` | 32px | Large gaps |
| `spacing-12` | 48px | Section margins |
| `spacing-16` | 64px | Page sections |

### 5.3 Container Widths

| Size | Max Width | Usage |
|------|-----------|-------|
| `sm` | 640px | Narrow content |
| `md` | 768px | Medium content |
| `lg` | 1024px | Default content |
| `xl` | 1280px | Wide content |
| `full` | 100% | Full width |

---

## 6. Migration Path

### Phase 2: Redesign & Standardize

1. **Create pattern components** (`GridPattern`, `HalftonePattern`)
2. **Create region components** (`PageHeader`, `PageContent`, `Sidebar`)
3. **Enhance `PageLayout`** with pattern and region support
4. **Create missing templates** (`DashboardPage`, `DetailPage`)
5. **Update app wrappers** to use new primitives

### Phase 3: Migrate & Implement

1. **Update homepages** to use `*AppLayout` wrappers
2. **Replace inline patterns** with pattern components
3. **Standardize page headers** across all pages
4. **Remove `SectionLayout`** and update imports
5. **Validate all routes** for consistency

---

## 7. Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Layout components in UI package | 10 | 18 |
| Inline pattern definitions | 6+ | 0 |
| Pages using app wrappers | ~60% | 100% |
| Deprecated layout exports | 1 | 0 |
| Layout-related ESLint violations | Unknown | 0 |

---

## Appendix A: File Inventory

### UI Package Layout Files

```
packages/ui/src/
├── foundations/
│   └── layout.tsx          # Container, Section, Grid, Stack
└── templates/
    ├── app-shell.tsx       # AppShell (sidebar layout)
    ├── error-page.tsx      # ErrorPage
    ├── list-page.tsx       # ListPage
    ├── not-found-page.tsx  # NotFoundPage
    ├── page-layout.tsx     # PageLayout
    └── section-layout.tsx  # DEPRECATED - remove
```

### App Layout Files

```
apps/atlvs/src/
├── app/layout.tsx              # RootLayout
└── components/app-layout.tsx   # AtlvsAppLayout, Loading, Empty

apps/compvss/src/
├── app/layout.tsx              # RootLayout
└── components/app-layout.tsx   # CompvssAppLayout, Loading, Empty

apps/gvteway/src/
├── app/layout.tsx              # RootLayout
└── components/app-layout.tsx   # GvtewayAppLayout, Loading, Empty
```

---

## Appendix B: Page Count by App

| App | Total Pages | Using AppLayout | Using ListPage | Manual Layout |
|-----|-------------|-----------------|----------------|---------------|
| ATLVS | 47+ | ~40 | 5+ | 2+ |
| COMPVSS | 47+ | ~40 | 3+ | 4+ |
| GVTEWAY | 46+ | ~42 | 0 | 4+ |

---

*Document generated as part of Layout System Overhaul Phase 1*
