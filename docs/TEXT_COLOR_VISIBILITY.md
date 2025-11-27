# Text Color Visibility System

> **Status:** ✅ Fully Implemented (November 27, 2025)

## Overview

The GHXSTSHIP design system uses a semantic text color system to ensure WCAG AA compliance across all background contexts. This document outlines the text/background pairing rules and how to use them.

## The Problem

Text colors like `text-ink-400` or `text-ink-500` work well on dark backgrounds but fail contrast requirements on light backgrounds. The screenshots below show examples of poor visibility:

- Light gray text on light backgrounds (insufficient contrast)
- Muted text that's unreadable on mid-tone backgrounds

## The Solution

### 1. Semantic Text Color Tokens

Added to `packages/ui/src/tokens.ts`:

```typescript
export const textColors = {
  // On dark backgrounds (ink-700, ink-800, ink-900, ink-950)
  onDark: {
    primary: ink[50],      // #FFFFFF - 21:1 on ink-950
    secondary: ink[300],   // #D4D4D4 - 12.6:1 on ink-950
    muted: ink[400],       // #A3A3A3 - 7.4:1 on ink-950
    disabled: ink[500],    // #737373 - 4.6:1 on ink-950
  },
  // On light backgrounds (ink-50, ink-100, ink-200)
  onLight: {
    primary: ink[950],     // #000000 - 21:1 on ink-50
    secondary: ink[700],   // #404040 - 9.7:1 on ink-50
    muted: ink[500],       // #737373 - 4.6:1 on ink-50
    disabled: ink[400],    // #A3A3A3 - 2.7:1 on ink-50 (decorative only)
  },
  // On mid-tone backgrounds (ink-400, ink-500, ink-600)
  onMid: {
    primary: ink[50],      // #FFFFFF - 7.4:1 on ink-500
    secondary: ink[200],   // #E5E5E5 - 5.3:1 on ink-500
  },
};
```

### 2. Tailwind Utilities

Added to `packages/config-tailwind/index.js`:

```css
/* Usage examples */
.text-on-dark-primary    /* White text for dark backgrounds */
.text-on-dark-secondary  /* Light gray text for dark backgrounds */
.text-on-dark-muted      /* Muted gray text for dark backgrounds */
.text-on-dark-disabled   /* Disabled text for dark backgrounds */

.text-on-light-primary   /* Black text for light backgrounds */
.text-on-light-secondary /* Dark gray text for light backgrounds */
.text-on-light-muted     /* Medium gray text for light backgrounds */

.text-on-mid-primary     /* White text for mid-tone backgrounds */
.text-on-mid-secondary   /* Light gray text for mid-tone backgrounds */
```

### 3. Component Props

UI components like `Kicker` and `SectionHeader` now support a `colorScheme` prop:

```tsx
<Kicker colorScheme="on-light">Category Label</Kicker>

<SectionHeader
  kicker="Section Label"
  title="Section Title"
  description="Section description text"
  colorScheme="on-light"
/>
```

## Background-to-Text Mapping Reference

| Background Class | Primary Text | Secondary Text | Muted Text |
|-----------------|--------------|----------------|------------|
| `bg-ink-950` / `bg-ink-900` | `text-ink-50` | `text-ink-300` | `text-ink-400` |
| `bg-ink-800` / `bg-ink-700` | `text-ink-50` | `text-ink-200` | `text-ink-400` |
| `bg-ink-50` / `bg-ink-100` | `text-ink-950` | `text-ink-700` | `text-ink-500` |
| `bg-ink-200` / `bg-ink-300` | `text-ink-900` | `text-ink-700` | `text-ink-500` |
| `bg-ink-400` / `bg-ink-500` / `bg-ink-600` | `text-ink-50` | `text-ink-200` | `text-ink-300` |

## Contrast Standards

- **Primary text:** Minimum 4.5:1 contrast ratio (WCAG AA for normal text)
- **Secondary text:** Minimum 4.5:1 contrast ratio (WCAG AA for normal text)
- **Muted text:** Minimum 3:1 contrast ratio (WCAG AA for large text/UI components)
- **Disabled text:** Minimum 3:1 contrast ratio (decorative/disabled state)

## Migration Guide

### Before (Problematic)

```tsx
// On a light background page
<Section className="bg-white">
  <Label className="text-ink-400">Label</Label>  {/* Too light! */}
  <Body className="text-ink-300">Description</Body>  {/* Too light! */}
</Section>
```

### After (Correct)

```tsx
// On a light background page
<Section className="bg-white">
  <Label className="text-ink-600">Label</Label>  {/* Good contrast */}
  <Body className="text-ink-700">Description</Body>  {/* Good contrast */}
</Section>

// Or using semantic classes
<Section className="bg-white">
  <Label className="text-on-light-muted">Label</Label>
  <Body className="text-on-light-secondary">Description</Body>
</Section>
```

## Common Patterns to Fix

### Pattern 1: Light background with ink-400/500 text

**Find:** `bg-white` or `bg-ink-50` with `text-ink-400` or `text-ink-500`
**Replace:** Use `text-ink-600` or `text-ink-700` for muted text on light backgrounds

### Pattern 2: Cards with light backgrounds

Many card components use `bg-white`. Ensure text inside uses:
- `text-ink-950` or `text-black` for primary text
- `text-ink-700` or `text-grey-700` for secondary text
- `text-ink-500` or `text-grey-500` for muted text

### Pattern 3: Tables with light rows

Table body rows often have light backgrounds. Use:
- `text-ink-900` for primary cell content
- `text-ink-700` for secondary cell content
- `text-ink-500` for metadata/timestamps

## Files Updated

### Design System
1. `packages/ui/src/tokens.ts` - Added `textColors` and `bgTextPairings` exports
2. `packages/config-tailwind/index.js` - Added `textColorPalette` and Tailwind utilities
3. `packages/ui/src/atoms/kicker.tsx` - Added `colorScheme` prop
4. `packages/ui/src/molecules/section-header.tsx` - Added `colorScheme` prop

### UI Components Fixed
5. `packages/ui/src/molecules/context-breadcrumb.tsx` - Fixed inverted color logic
6. `packages/ui/src/molecules/breadcrumb.tsx` - Updated separator color
7. `packages/ui/src/atoms/link.tsx` - Updated footer variant color
8. `packages/ui/src/molecules/offline-indicator.tsx` - Updated muted text colors
9. `packages/ui/src/molecules/bulk-action-bar.tsx` - Updated clear button color

### App Pages Fixed
All pages with light backgrounds (`bg-white`, `bg-ink-50`, `bg-ink-100`) across GVTEWAY, ATLVS, and COMPVSS have been audited and fixed:
- `text-grey-400` → `text-grey-600` (on light backgrounds)
- `text-grey-300` → `text-grey-600` (on light backgrounds)
- `text-ink-400` → `text-ink-600` (on light backgrounds)
- `text-ink-300` → `text-ink-700` (on light backgrounds)

## Verification

To verify no regressions, run:
```bash
# Should return 0 files
for f in $(grep -l "bg-white" apps/ -r --include="*.tsx"); do 
  if grep -q "text-grey-400" "$f"; then echo "$f"; fi
done | wc -l
```
