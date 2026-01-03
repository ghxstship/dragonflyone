# Color Theme Remediation Plan

## Problem Statement

The GHXSTSHIP design system has **massive inconsistency** in how dark/light theme colors are applied across 118+ UI component files. This creates:

1. **Visual inconsistency** - Same semantic meaning rendered with different colors
2. **Theme switching breaks** - Raw palette colors don't respond to light/dark mode
3. **Maintenance nightmare** - No single source of truth for color application

## Current State (Audit Results)

### Pattern 1: Raw Palette Colors (WRONG)
- **402 matches** across 53 files
- Example: `text-ink-400`, `text-ink-500`, `text-ink-900`
- Problem: These are raw palette values that don't adapt to theme

### Pattern 2: Context-Aware Semantic Colors (CORRECT for `inverted` prop)
- **581 matches** across 118 files
- Example: `text-on-dark-muted`, `text-on-light-secondary`
- Usage: When component has `inverted` prop to toggle dark/light

### Pattern 3: CSS Variable Semantic Colors (CORRECT for auto-theme)
- Limited usage
- Example: `text-primary`, `text-secondary`, `text-muted`
- Usage: When component should auto-adapt to theme without prop

### Pattern 4: Direct Colors (SOMETIMES CORRECT)
- Example: `text-white`, `text-black`
- Usage: Only for absolute colors that never change

## Correct Usage Guidelines

### Rule 1: Use `text-on-dark-*` / `text-on-light-*` with `inverted` prop

When a component has an `inverted` prop:

```tsx
// CORRECT
className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}

// WRONG
className={inverted ? "text-ink-400" : "text-ink-500"}
```

### Rule 2: Use CSS Variable Colors for Auto-Theme

When a component should auto-adapt without prop:

```tsx
// CORRECT - auto-adapts to theme
className="text-primary"
className="text-secondary"
className="text-muted"

// WRONG - doesn't adapt
className="text-ink-400"
```

### Rule 3: Never Use Raw Palette for Text

```tsx
// WRONG - raw palette
className="text-ink-400"
className="text-grey-500"

// CORRECT - semantic
className="text-on-dark-muted"
className="text-muted"
```

## Semantic Color Mapping

| Semantic Purpose | On Dark Background | On Light Background | Auto-Theme |
|------------------|-------------------|---------------------|------------|
| Primary text | `text-on-dark-primary` | `text-on-light-primary` | `text-primary` |
| Secondary text | `text-on-dark-secondary` | `text-on-light-secondary` | `text-secondary` |
| Muted text | `text-on-dark-muted` | `text-on-light-muted` | `text-muted` |
| Disabled text | `text-on-dark-disabled` | `text-on-light-disabled` | `text-tertiary` |
| Success | `text-success-400` | `text-success-600` | `text-success` |
| Error | `text-error-400` | `text-error-600` | `text-error` |
| Warning | `text-warning-400` | `text-warning-600` | `text-warning` |

## Files Requiring Remediation (Priority Order)

### Critical (50+ matches)
1. `organisms/app-navbar.tsx` - 53 matches
2. `templates/authenticated-shell.tsx` - 40 matches
3. `organisms/app-sidebar.tsx` - 36 matches
4. `organisms/page-header.tsx` - 34 matches
5. `organisms/dashboard-builder.tsx` - 31 matches

### High (20-50 matches)
6. `organisms/context-switcher.tsx` - 21 matches
7. `organisms/command-palette.tsx` - 19 matches
8. `organisms/gallery-view.tsx` - 16 matches
9. `templates/content-layout.tsx` - 13 matches
10. `organisms/kanban-board.tsx` - 11 matches

### Medium (10-20 matches)
11. `organisms/map-view.tsx` - 10 matches
12. `organisms/gantt-chart.tsx` - 9 matches
13. `organisms/privacy-preference-center.tsx` - 8 matches
14. `templates/client-portal-shell.tsx` - 7 matches

## Remediation Strategy

### Phase 1: Establish Pattern (This Session)
- Fix 2-3 critical files to establish the correct pattern
- Document the before/after for each fix

### Phase 2: Automated Migration (Future)
- Create codemod script to replace patterns
- Run across all files
- Manual review of edge cases

### Phase 3: ESLint Rule (Future)
- Add ESLint rule to prevent raw palette usage
- Enforce semantic color tokens

## Completed Fixes

### 2025-01-02: Raw Tailwind Color Fixes
- `organisms/stats-dashboard.tsx`: `text-green-*` → `text-success-*`, `text-red-*` → `text-error-*`
- `molecules/stat-card.tsx`: `text-green-*` → `text-success-*`, `text-red-*` → `text-error-*`
- `organisms/privacy-preference-center.tsx`: `text-green-*` → `text-success-*`, `text-red-*` → `text-error-*`
- `molecules/age-verification-modal.tsx`: `text-red-600` → `text-error`

### 2025-01-02: Semantic Color Token Migration (Phase 1)
- `organisms/app-navbar.tsx`: 53 instances of `text-ink-*` → `text-on-dark-*`/`text-on-light-*`
- `templates/authenticated-shell.tsx`: 40 instances of `text-ink-*` → `text-on-dark-*`/`text-on-light-*`
- `organisms/app-sidebar.tsx`: 36 instances of `text-ink-*` → `text-on-dark-*`/`text-on-light-*`

## Remaining Files (Priority Order)

### High Priority (20+ matches)
- `organisms/page-header.tsx` - ~34 matches
- `organisms/dashboard-builder.tsx` - ~31 matches
- `organisms/context-switcher.tsx` - ~21 matches
- `organisms/command-palette.tsx` - ~19 matches
- `organisms/gallery-view.tsx` - ~16 matches

### Medium Priority (10-20 matches)
- `templates/content-layout.tsx` - ~13 matches
- `organisms/kanban-board.tsx` - ~11 matches
- `organisms/map-view.tsx` - ~10 matches
- `organisms/gantt-chart.tsx` - ~9 matches
- `organisms/navigation.tsx` - ~8 matches
- `organisms/modal.tsx` - ~7 matches

### Lower Priority (<10 matches)
- Multiple molecules and atoms with scattered usage

## Next Steps

1. Create automated codemod script to replace remaining patterns
2. Add ESLint rule to prevent raw palette color usage in new code
3. Continue manual remediation of high-priority files
