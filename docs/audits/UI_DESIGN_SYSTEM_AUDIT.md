# UI Design System Audit Report

## Overview

This audit systematically identified and resolved visual inconsistencies across the UI package by enforcing atomic design principles, design tokens, and global styles.

## Audit Scope

- **Package**: `packages/ui/src`
- **Components Audited**: atoms, molecules, organisms, templates, foundations
- **Token System**: `tokens.ts`, `globals.css`, `config-tailwind`

---

## Findings Summary

### 1. Critical: Invalid Token Access Patterns (FIXED)

**Issue**: Multiple files used invalid token access like `colors.grey400` instead of `colors.grey[400]`.

| File | Occurrences | Status |
|------|-------------|--------|
| `templates/list-page.tsx` | 25+ occurrences | ✅ Fixed |
| `molecules/data-table.tsx` | 8 occurrences | ✅ Fixed |
| `organisms/data-grid.tsx` | 15+ occurrences | ✅ Fixed |
| `organisms/detail-drawer.tsx` | 11 occurrences | ✅ Fixed |
| `molecules/bulk-action-bar.tsx` | 4 occurrences | ✅ Fixed |

### 2. Hardcoded Spacing Values (FIXED)

**Issue**: Components used arbitrary values like `min-h-[48px]` instead of spacing tokens.

| File | Line | Before | After |
|------|------|--------|-------|
| `atoms/button.tsx` | 6 | `min-h-[48px]` | `min-h-12` |
| `atoms/button.tsx` | 16-18 | `min-h-[40px]`, `min-h-[48px]`, `min-h-[56px]` | `min-h-10`, `min-h-12`, `min-h-14` |
| `atoms/spinner.tsx` | 18-19 | `border-[3px]` | `border-3` |
| `molecules/pagination.tsx` | 85 | `min-w-[44px]` | `min-w-11` |

### 3. Hardcoded Typography Values (FIXED)

**Issue**: Components used `text-sm` instead of design system typography tokens.

| File | Line | Before | After |
|------|------|--------|-------|
| `atoms/checkbox.tsx` | 26 | `text-[1rem]` | `text-body-sm` |
| `molecules/tabs.tsx` | 52 | `text-sm` | `text-mono-sm` |
| `molecules/pagination.tsx` | 66, 85, 99 | `text-sm` | `text-mono-sm` |
| `molecules/dropdown.tsx` | 57 | `text-sm` | `text-body-sm` |

### 4. Hardcoded Z-Index Values (FIXED)

**Issue**: Components used arbitrary z-index values instead of design tokens.

| File | Line | Before | After |
|------|------|--------|-------|
| `organisms/modal.tsx` | 39 | `z-[1400]` | `z-modal` |
| `organisms/navigation.tsx` | 25 | `z-[1200]` | `z-fixed` |
| `organisms/navigation.tsx` | 77 | `z-[1100]` | `z-sticky` |

### 5. Inconsistent Transition Durations (FIXED)

**Issue**: Components used `transition-colors` without duration or with `duration-200` instead of `duration-base`.

| File | Before | After |
|------|--------|-------|
| `atoms/button.tsx` | `transition-all duration-200` | `transition-colors duration-base` |
| `molecules/tabs.tsx` | `transition-colors` | `transition-colors duration-base` |
| `molecules/pagination.tsx` | `transition-colors` | `transition-colors duration-base` |
| `molecules/dropdown.tsx` | `transition-colors` | `transition-colors duration-base` |

### 6. Hardcoded RGBA Values (Previously Fixed)

**Issue**: Modal/dialog backdrop overlays used hardcoded `rgba(0, 0, 0, 0.5)` instead of design tokens.

| File | Line | Before | After |
|------|------|--------|-------|
| `molecules/confirm-dialog.tsx` | 109 | `rgba(0, 0, 0, 0.5)` | `overlays.backdrop` |
| `organisms/detail-drawer.tsx` | 154 | `rgba(0, 0, 0, 0.5)` | `overlays.backdrop` |
| `organisms/import-export-dialog.tsx` | 139 | `rgba(0, 0, 0, 0.5)` | `overlays.backdrop` |
| `organisms/record-form-modal.tsx` | 251 | `rgba(0, 0, 0, 0.5)` | `overlays.backdrop` |

---

## New Tokens Added

### `tokens.ts`
```typescript
// Overlay/Backdrop
export const overlays = {
  backdrop: "rgba(0, 0, 0, 0.5)",
  backdropLight: "rgba(0, 0, 0, 0.3)",
} as const;
```

### `globals.css`
```css
/* Overlay/Backdrop Token */
--backdrop: rgba(0, 0, 0, 0.5);
--backdrop-light: rgba(0, 0, 0, 0.3);
```

---

## Atomic Structure Validation

### Current Hierarchy ✅

The codebase correctly follows atomic design principles:

```
atoms/          → 27 components (button, badge, input, typography, etc.)
molecules/      → 35 components (card, field, alert, pagination, etc.)
organisms/      → 22 components (navigation, modal, sidebar, etc.)
templates/      → 6 components (app-shell, list-page, error-page, etc.)
foundations/    → 2 components (layout, semantic)
```

### Composition Patterns ✅

- **Atoms** are self-contained with no dependencies on molecules/organisms
- **Molecules** compose atoms (e.g., `Field` wraps `Input`)
- **Organisms** compose molecules and atoms (e.g., `Modal` uses `Button`)
- **Templates** provide page-level layouts using organisms

---

## Global Style Enforcement

### Typography Scale ✅
All typography now uses the Tailwind token classes:
- Display: `text-display-xl`, `text-display-lg`, `text-display-md`
- Headings: `text-h1-*` through `text-h6-*`
- Body: `text-body-lg`, `text-body-md`, `text-body-sm`, `text-body-xs`
- Mono: `text-mono-lg`, `text-mono-md`, `text-mono-sm`, `text-mono-xs`, `text-mono-xxs`

### Color Usage ✅
- Primary: `colors.black`, `colors.white`
- Greyscale: `colors.grey[100]` through `colors.grey[900]`
- Ink palette: `ink[50]` through `ink[950]`
- Status colors: `statusColors.success`, `.warning`, `.error`, `.info`

### Spacing Rhythm ✅
Components use Tailwind spacing utilities (`gap-4`, `p-6`, `mb-8`) which map to the token system.

### Shadow System ✅
- `shadow-outline`, `shadow-outline-bold`
- `shadow-hard`, `shadow-hard-lg`
- `shadow-hard-white`, `shadow-hard-lg-white`

---

## Files Modified (This Audit)

### Atoms
1. `atoms/button.tsx` - Replaced hardcoded min-height, normalized transitions
2. `atoms/checkbox.tsx` - Replaced hardcoded typography
3. `atoms/spinner.tsx` - Replaced hardcoded border width

### Molecules
4. `molecules/tabs.tsx` - Replaced hardcoded typography, added duration token
5. `molecules/pagination.tsx` - Replaced hardcoded typography and spacing
6. `molecules/dropdown.tsx` - Replaced hardcoded typography, added duration token
7. `molecules/data-table.tsx` - Fixed invalid token access patterns

### Organisms
8. `organisms/modal.tsx` - Replaced hardcoded z-index with token
9. `organisms/navigation.tsx` - Replaced hardcoded z-index values
10. `organisms/data-grid.tsx` - Fixed invalid token access patterns

### Templates
11. `templates/list-page.tsx` - Fixed 25+ invalid token access patterns

### Previously Modified
12. `tokens.ts` - Added `overlays` token
13. `styles/globals.css` - Added CSS custom properties for backdrop
14. `organisms/hero.tsx` - Replaced hardcoded hex colors
15. `atoms/duotone-image.tsx` - Replaced hardcoded hex colors
16. `molecules/confirm-dialog.tsx` - Used overlay token
17. `organisms/detail-drawer.tsx` - Fixed token access + overlay
18. `organisms/import-export-dialog.tsx` - Used overlay token
19. `organisms/record-form-modal.tsx` - Used overlay token

---

## Recommendations

### Immediate Actions
1. ✅ All hardcoded values have been replaced with tokens
2. ✅ Invalid token access patterns fixed (`colors.grey400` → `colors.grey[400]`)
3. ✅ Z-index values normalized to use design tokens
4. ✅ Transition durations standardized to `duration-base`

### Future Considerations
1. **Add ESLint rule** to prevent hardcoded color/spacing values
2. **Add ESLint rule** to enforce correct token access patterns (bracket notation)
3. **Consider refactoring** `list-page.tsx`, `data-table.tsx`, `data-grid.tsx` to use Tailwind classes instead of inline styles for better maintainability
4. **Document** the token system in the UI package README

### Known Pre-existing Issues (Not Related to This Audit)
1. `data-grid.tsx:159` - React Hook `useMemo` has a missing dependency `getCellValue` (ESLint warning)

---

## Audit Date
November 26, 2025 (Updated)
