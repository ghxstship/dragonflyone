# UI/UX Normalization & Whitelabeling Audit Report

> **Generated**: Phase 0 Discovery & Audit  
> **Reference Model**: ClickUp 4.0  
> **Status**: COMPLETE

---

## Executive Summary

This comprehensive audit catalogs the current state of the UI system across the Dragonflyone monorepo. The analysis reveals a mature component library with **194 UI components** across atoms/molecules/organisms/templates, **91 React Query hooks**, and **4 Zustand stores**. However, significant gaps exist between the current "Bold Contemporary Pop Art" aesthetic and the ClickUp 4.0 target specification.

### Key Metrics

| Category | Count | Notes |
|----------|-------|-------|
| **Total UI Components** | 194 | `.tsx` files in `packages/ui/src/` |
| **Atoms** | 34 | Fundamental building blocks |
| **Molecules** | 60 | Composed components |
| **Organisms** | 49 | Complex feature components |
| **Templates** | 26 | Page-level layouts |
| **Marketing Components** | 15 | Landing page sections |
| **App Pages** | 327 | `page.tsx` files across all apps |
| **React Query Hooks** | 91 | Data fetching hooks in `packages/config/hooks/` |
| **Zustand Stores** | 4 | `ui-store`, `cart-store`, `filters-store`, `index` |
| **Hardcoded Color Values** | 120+ | Across atoms/molecules/organisms |
| **Inline Styles** | 135+ | `style={}` usages in components |
| **Accessibility Attributes** | 53 | `aria-*` and `role=` in atoms |
| **Dark Mode Classes** | 18 | `dark:` Tailwind classes in UI |

---

## 0.1 Component Inventory

### Atomic Hierarchy Analysis

#### Atoms (34 components) - `packages/ui/src/atoms/`

| Component | File Size | Classification | Notes |
|-----------|-----------|----------------|-------|
| `address-input.tsx` | 11.5KB | Input | Complex, has 4 hardcoded colors |
| `avatar.tsx` | 6.2KB | Display | Proper atomic |
| `badge.tsx` | 3.7KB | Display | 1 hardcoded color |
| `button.tsx` | 8.4KB | Action | Core atom, well-structured |
| `checkbox.tsx` | 3.8KB | Input | Proper atomic |
| `countdown.tsx` | 4.9KB | Display | 2 hardcoded colors |
| `divider.tsx` | 1.3KB | Layout | Minimal, proper |
| `duotone-image.tsx` | 6.9KB | Media | Has inline styles |
| `form.tsx` | 1.1KB | Container | Minimal wrapper |
| `geometric-shapes.tsx` | 9.6KB | Decorative | 11 inline styles |
| `halftone-pattern.tsx` | 4.8KB | Decorative | Pop-art specific |
| `icon.tsx` | 7.4KB | Display | Lucide wrapper |
| `input.tsx` | 4.6KB | Input | Core atom |
| `kicker.tsx` | 1.9KB | Typography | Proper atomic |
| `link.tsx` | 3.0KB | Navigation | Proper atomic |
| `list.tsx` | 2.1KB | Layout | Proper atomic |
| `masked-input.tsx` | 5.9KB | Input | Specialized |
| `page-transition.tsx` | 5.4KB | Animation | Motion component |
| `password-input.tsx` | 3.8KB | Input | 6 hardcoded colors |
| `phone-input.tsx` | 12.6KB | Input | Complex, internationalized |
| `progress-bar.tsx` | 4.4KB | Feedback | Proper atomic |
| `radio.tsx` | 2.7KB | Input | Proper atomic |
| `select.tsx` | 5.6KB | Input | Core atom |
| `social-icon.tsx` | 5.4KB | Display | 2 hardcoded colors |
| `sparkline.tsx` | 5.6KB | Data Viz | 6 hardcoded colors |
| `spinner.tsx` | 2.4KB | Feedback | Proper atomic |
| `status-badge.tsx` | 3.7KB | Display | Status-specific |
| `success-animation.tsx` | 3.9KB | Feedback | Animation |
| `switch.tsx` | 3.1KB | Input | Proper atomic |
| `text.tsx` | 1.8KB | Typography | Proper atomic |
| `textarea.tsx` | 4.7KB | Input | Core atom |
| `tooltip.tsx` | 4.0KB | Overlay | Proper atomic |
| `typography.tsx` | 6.2KB | Typography | Display/H1-H6/Body/Label |
| `urgency-badge.tsx` | 3.5KB | Display | 2 hardcoded colors |

#### Molecules (60 components) - `packages/ui/src/molecules/`

**Key molecules with issues:**
- `floor-plan-object-library.tsx` (5.9KB) - **26 hardcoded colors**
- `auth-form-field.tsx` (17.6KB) - **10 hardcoded colors**
- `signature-capture.tsx` (7.5KB) - 3 hardcoded colors
- `list-page-toolbar.tsx` (25.5KB) - Complex, needs refactor
- `context-breadcrumb.tsx` (14.9KB) - Complex navigation

**Well-structured molecules:**
- `card.tsx`, `alert.tsx`, `tabs.tsx`, `pagination.tsx`
- `ai-chat-*.tsx` components (4 files) - Modern chat UI
- `empty-state.tsx`, `error-state.tsx` - Proper state handling

#### Organisms (49 components) - `packages/ui/src/organisms/`

**Complex organisms with hardcoded values:**
- `map-view.tsx` (15KB) - 9 hardcoded colors, 8 inline styles
- `gantt-chart.tsx` (17KB) - 8 hardcoded colors, 11 inline styles
- `stats-dashboard.tsx` (8.5KB) - 8 hardcoded colors
- `calendar.tsx` (12KB) - 6 hardcoded colors
- `timeline-view.tsx` (10.6KB) - 6 hardcoded colors
- `seating-chart.tsx` (9.4KB) - 10 inline styles

**Core organisms (require ClickUp 4.0 alignment):**
- `app-sidebar.tsx` (33.2KB) - Main navigation
- `app-navbar.tsx` (39.1KB) - Header/toolbar
- `data-grid.tsx` (43.3KB) - Table view
- `kanban-board.tsx` (12.9KB) - Board view
- `command-palette.tsx` (13.5KB) - Quick actions
- `dashboard-builder.tsx` (27.7KB) - Widget system

#### Templates (26 components) - `packages/ui/src/templates/`

| Template | Size | Purpose |
|----------|------|---------|
| `list-page.tsx` | 68.5KB | **Largest** - List/table pages |
| `table-layout.tsx` | 29KB | Data table wrapper |
| `canvas-layout.tsx` | 24.5KB | Drawing/whiteboard |
| `detail-page.tsx` | 18.4KB | Entity detail view |
| `content-layout.tsx` | 17.9KB | Content areas |
| `overlay-layout.tsx` | 17.9KB | Modal/drawer layouts |
| `grid-layout.tsx` | 17.3KB | Grid-based pages |
| `single-column-layout.tsx` | 14.4KB | Single column |
| `auth-split-layout.tsx` | 13.9KB | Auth pages |
| `edit-page.tsx` | 13.6KB | Edit forms |
| `wizard-page.tsx` | 12.1KB | Multi-step flows |
| `ai-chat-layout.tsx` | 11.2KB | AI chat interface |
| `authenticated-shell.tsx` | 11.9KB | App shell |
| `sign-in-form.tsx` | 11.8KB | Auth form |
| `dashboard-page.tsx` | 10.5KB | Dashboard layout |
| `centered-layout.tsx` | 10.2KB | Centered content |
| `page-layout.tsx` | 10.2KB | Base page |
| `auth-page.tsx` | 10KB | Legacy auth |
| `error-page.tsx` | 9.9KB | Error states |
| `create-page.tsx` | 9.2KB | Create forms |
| `hub-page.tsx` | 9.1KB | Hub/index pages |
| `settings-hub-page.tsx` | 8.4KB | Settings |
| `not-found-page.tsx` | 7.5KB | 404 page |
| `marketing-page.tsx` | 7KB | Marketing layout |
| `index.ts` | 6.1KB | Exports |

### Component Dependencies Map

```
Templates → Organisms → Molecules → Atoms → Design Tokens
    ↓           ↓           ↓          ↓
  Pages     Features    Compounds   Primitives
```

---

## 0.2 Style Analysis

### Current Design System Architecture

```
packages/
├── config/
│   └── globals.css          # 1118 lines - Primary CSS tokens
├── ui/src/
│   ├── tokens.ts            # 409 lines - TS token exports
│   ├── design-system/
│   │   └── tokens/
│   │       ├── index.ts     # 277 lines - Token factory
│   │       ├── types.ts     # 160 lines - Token types
│   │       └── css-generator.ts # 5.2KB - CSS var generator
│   └── whitelabel/
│       ├── brand-config.ts  # 104 lines - Brand defaults
│       ├── theme-provider.tsx # 3.7KB - Theme context
│       ├── logo.tsx         # 1.9KB - Logo component
│       ├── powered-by.tsx   # 1.1KB - Attribution
│       └── tenant-config.schema.ts # 1.7KB - Tenant schema
```

### Token Coverage Analysis

| Token Category | Current State | ClickUp 4.0 Required |
|----------------|---------------|---------------------|
| **Colors - Brand** | ✅ Partial (monochrome + accents) | Full brand palette with hover/active/subtle |
| **Colors - Semantic** | ✅ Present (success/warning/error/info) | ✅ Matches |
| **Colors - Neutral** | ⚠️ Ink palette (dark-first) | Neutral 0-950 scale |
| **Colors - Surface** | ✅ Present in token factory | Light/dark variants |
| **Colors - Text** | ✅ Present | Primary/secondary/tertiary/disabled |
| **Colors - Border** | ✅ Present | Default/subtle/strong/focus |
| **Typography - Families** | ⚠️ Pop-art fonts (Anton/Bebas/ShareTech) | Inter/system fonts |
| **Typography - Scale** | ✅ Present | xs through 5xl |
| **Typography - Weights** | ✅ Present | normal/medium/semibold/bold |
| **Typography - Line Heights** | ✅ Present | tight through loose |
| **Typography - Letter Spacing** | ✅ Present | tighter through widest |
| **Spacing** | ✅ Present (0-96 scale) | ✅ Matches |
| **Layout** | ✅ Present (sidebar/content/header/card) | ✅ Matches |
| **Border Radius** | ❌ All set to 0px (pop-art) | xs(2px) through 3xl(24px) |
| **Shadows** | ❌ Hard offset (pop-art) | Subtle depth shadows |
| **Motion - Duration** | ✅ Present | instant through slowest |
| **Motion - Easing** | ✅ Present | linear through bounce |
| **Z-Index** | ✅ Present | dropdown through max |
| **Breakpoints** | ✅ Present | xs through 2xl |

### Hardcoded Values Audit

**Files with most hardcoded colors:**
1. `floor-plan-object-library.tsx` - 26 occurrences
2. `auth-form-field.tsx` - 10 occurrences
3. `map-view.tsx` - 9 occurrences
4. `gantt-chart.tsx` - 8 occurrences
5. `stats-dashboard.tsx` - 8 occurrences
6. `password-input.tsx` - 6 occurrences
7. `sparkline.tsx` - 6 occurrences
8. `calendar.tsx` - 6 occurrences
9. `timeline-view.tsx` - 6 occurrences

**Inline styles distribution:**
- `geometric-shapes.tsx` - 11 inline styles
- `gantt-chart.tsx` - 11 inline styles
- `seating-chart.tsx` - 10 inline styles
- `collaborative-field.tsx` - 9 inline styles
- `map-view.tsx` - 8 inline styles

### Dark Mode Implementation

Current dark mode support is **minimal**:
- Only 18 `dark:` Tailwind classes across entire UI package
- Global CSS uses `.light` class override pattern
- Default is dark theme (`:root { color-scheme: dark; }`)
- No system preference detection in base CSS

---

## 0.3 Data Flow Analysis

### State Management Patterns

**Zustand Stores** (`packages/config/stores/`):
1. `ui-store.ts` (4.4KB) - UI state (sidebar, modals, preferences)
2. `cart-store.ts` (5.1KB) - Shopping cart state
3. `filters-store.ts` (3.4KB) - Filter persistence
4. `index.ts` (230B) - Store exports

**React Query Hooks** (`packages/config/hooks/`):
- 91 custom hooks for data fetching
- 716 total `useQuery`/`useMutation` usages
- Proper cache invalidation patterns
- Optimistic update support via `useOptimisticUpdate.ts`

**Component State Patterns:**
- 343 `useState`/`useReducer`/`useContext` usages in UI components
- Most components use local state appropriately
- Some organisms have complex state that could be normalized

### SSOT Compliance Assessment

| Pattern | Status | Notes |
|---------|--------|-------|
| Entity normalization | ⚠️ Partial | Some components accept full objects instead of IDs |
| Referential integrity | ✅ Good | Foreign key patterns in hooks |
| No transitive dependencies | ⚠️ Partial | Some derived state stored |
| Separation of concerns | ✅ Good | Clear data/UI separation |

---

## 0.4 Inconsistency Report

### Design Language Conflicts

| Current (Pop Art) | Required (ClickUp 4.0) |
|-------------------|------------------------|
| Zero border radius | 2-24px radius scale |
| Hard offset shadows | Subtle depth shadows |
| Monochrome palette | Full neutral scale |
| Bold display fonts | Clean system fonts |
| Comic-book aesthetic | Professional density |

### Accessibility Gaps

- **ARIA attributes**: 53 usages in atoms (good baseline)
- **Focus states**: Pop-art shadows may not meet WCAG
- **Color contrast**: Hardcoded colors need verification
- **Keyboard navigation**: Present in some organisms, needs audit

### Component Structure Issues

**Current structure:**
```
packages/ui/src/atoms/button.tsx  # Single file
```

**Required structure:**
```
packages/ui/src/atoms/Button/
├── index.ts
├── Button.tsx
├── Button.types.ts
├── Button.variants.ts
├── Button.stories.tsx
└── Button.test.tsx
```

---

## 0.5 Whitelabeling Assessment

### Current Infrastructure

**Existing whitelabel components:**
- `brand-config.ts` - ATLVS defaults with deep merge
- `theme-provider.tsx` - Context with CSS var injection
- `logo.tsx` - Dynamic logo component
- `powered-by.tsx` - Attribution component
- `tenant-config.schema.ts` - Tenant validation

**Token factory** (`design-system/tokens/index.ts`):
- `createDesignTokens(brandConfig)` function exists
- Generates full token object from brand config
- CSS generator creates CSS variables

### Gaps

1. **Global CSS overrides**: `globals.css` hardcodes values that override generated vars
2. **Inconsistent provider usage**: Only ATLVS uses `WhitelabelThemeProvider`
3. **Limited brand coverage**: Only colors/fonts configurable, not spacing/shadows/radius
4. **No tenant API**: `loadBrandConfig` fetches from `/api/tenants/{id}/brand-config` but endpoint may not exist

---

## 0.6 Migration Registry

### Components Requiring Migration

| Priority | Component | Current | Target | Effort |
|----------|-----------|---------|--------|--------|
| P0 | Design Tokens | Pop-art | ClickUp 4.0 | High |
| P0 | Button | Single file | Multi-file + CVA | Medium |
| P0 | Input | Single file | Multi-file + CVA | Medium |
| P0 | Card | Single file | Multi-file + CVA | Medium |
| P1 | AppSidebar | Functional | ClickUp sidebar | High |
| P1 | DataGrid | Functional | ClickUp table | High |
| P1 | CommandPalette | Functional | ClickUp palette | Medium |
| P1 | Modal | Functional | ClickUp modal | Medium |
| P2 | All atoms | Various | Standardized | High |
| P2 | All molecules | Various | Standardized | High |
| P3 | All organisms | Various | Standardized | High |

---

## Recommendations

### Phase 1: Design Token Foundation (CRITICAL)

1. **Update token factory** to ClickUp 4.0 specification
2. **Replace globals.css** hardcoded values with CSS var references
3. **Add missing token categories**: radius, shadows (subtle), motion
4. **Update typography** to Inter/system fonts

### Phase 2: Atomic Component Architecture

1. **Restructure atoms** to multi-file pattern with types/variants
2. **Implement CVA** (Class Variance Authority) for all variants
3. **Add Storybook stories** for all components
4. **Add unit tests** with >80% coverage

### Phase 3: ClickUp View Implementations

1. **Enhance DataGrid** with virtualization, inline editing
2. **Enhance KanbanBoard** with drag-drop, WIP limits
3. **Add missing views**: Calendar, Gantt, Timeline, Activity, Workload

### Phase 4: Whitelabeling Infrastructure

1. **Unify theme providers** across all apps
2. **Extend brand config** to cover all token categories
3. **Implement tenant API** for runtime brand loading
4. **Add brand components**: Logo variants, PoweredBy, BrandedFooter

### Phase 5: Migration Protocol

1. **Build new components** before deprecating old
2. **Verify feature parity** before migration
3. **Update all dependents** before removal
4. **Document breaking changes**

---

## Appendix: File Inventory

### Apps Page Count

| App | Pages |
|-----|-------|
| ATLVS | ~150 |
| COMPVSS | ~100 |
| GVTEWAY | ~77 |
| **Total** | **327** |

### Package Structure

```
packages/
├── api-specs/           # OpenAPI specifications
├── config/              # Shared configuration
│   ├── hooks/           # 91 React Query hooks
│   ├── stores/          # 4 Zustand stores
│   └── globals.css      # Global styles
├── config-eslint/       # ESLint config
├── config-postcss/      # PostCSS config
├── config-tailwind/     # Tailwind config
├── integrations/        # Third-party integrations
├── sdk-atlvs/           # ATLVS SDK
├── tsconfig/            # TypeScript configs
├── types/               # Shared types
└── ui/                  # UI component library
    └── src/
        ├── atoms/       # 34 components
        ├── molecules/   # 60 components
        ├── organisms/   # 49 components
        ├── templates/   # 26 components
        ├── marketing/   # 15 components
        ├── foundations/ # 3 layout files
        ├── navigation/  # 4 nav utilities
        ├── hooks/       # 12 UI hooks
        ├── utils/       # 18 utility files
        ├── whitelabel/  # 5 brand files
        └── design-system/tokens/ # 3 token files
```

---

**Audit Complete** - Ready for Phase 1 Implementation
