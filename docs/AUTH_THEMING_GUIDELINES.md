# Auth Page Theming Guidelines

## Overview

This document outlines the correct theming approach for authentication pages in the GHXSTSHIP design system. The auth pages use a **dark-first** design that aligns with the "Bold Contemporary Pop Art Adventure" aesthetic.

## Core Principle: Dark Theme Consistency

All auth pages use the `AuthSplitLayout` component which provides:
- **Brand Panel** (left): Gradient background with brand content
- **Form Panel** (right): Dark background (`bg-surface-primary`) with form content

### ❌ INCORRECT: Light Background with Dark Components

```tsx
// DON'T: Using bg-surface-inverse creates a WHITE background in dark mode
<div className="bg-surface-inverse">
  <input className="text-on-dark-primary" /> {/* Dark text on white = invisible */}
</div>
```

### ✅ CORRECT: Dark Background with Dark-Theme Components

```tsx
// DO: Use bg-surface-primary for dark backgrounds
<div className="bg-surface-primary">
  <input className="text-on-dark-primary" /> {/* Light text on dark = visible */}
</div>
```

## Semantic Color Token Reference

### Surface Colors (Backgrounds)

| Token | Dark Mode Value | Use Case |
|-------|----------------|----------|
| `bg-surface-primary` | `#000000` | Main dark backgrounds |
| `bg-surface-secondary` | `#171717` | Slightly elevated surfaces |
| `bg-surface-tertiary` | `#262626` | Input backgrounds, cards |
| `bg-surface-inverse` | `#ffffff` | **AVOID** - Creates white in dark mode |

### Text Colors

| Token | Dark Mode Value | Use Case |
|-------|----------------|----------|
| `text-on-dark-primary` | `#ffffff` | Primary text on dark backgrounds |
| `text-on-dark-secondary` | `#d4d4d4` | Secondary text on dark backgrounds |
| `text-on-dark-muted` | `#737373` | Muted/disabled text on dark backgrounds |
| `text-on-dark-disabled` | `#525252` | Disabled text on dark backgrounds |

### Border Colors

| Token | Dark Mode Value | Use Case |
|-------|----------------|----------|
| `border-border` | `#404040` | Standard borders |
| `border-primary` | `#404040` | Primary borders |

## Component-Specific Guidelines

### AuthSplitLayout

The layout uses:
- Form panel: `bg-surface-primary` (dark)
- Mobile header: `bg-surface-primary/95` (dark with transparency)
- Footer: `bg-surface-secondary` (slightly elevated dark)

### AuthInput / AuthFormField

```tsx
// Correct styling for inputs on dark backgrounds
className="bg-surface-inverse/50 text-on-dark-primary placeholder:text-on-dark-disabled border-border"
```

### SocialAuthButton

All social auth buttons use consistent dark styling:
```tsx
bgClass: "bg-surface-tertiary hover:bg-surface-muted text-on-dark-primary border-border"
```

This ensures Google, Microsoft, Apple, and GitHub buttons all look consistent on dark backgrounds.

### Primary Buttons

```tsx
<Button variant="primary" /> // Uses primary color with proper contrast
```

## Common Mistakes to Avoid

### 1. Theme Context Mismatch

**Problem**: Using `bg-surface-inverse` (white) as a container but `text-on-dark-*` for text inside.

**Solution**: Always match the background context with the text context:
- Dark background → `text-on-dark-*`
- Light background → `text-on-light-*`

### 2. Hardcoded Colors

**Problem**: Using hardcoded hex values like `#ffffff` or `rgba(255,255,255,0.5)`.

**Solution**: Use semantic tokens that respond to theme changes:
```tsx
// ❌ Bad
className="text-[#ffffff]"

// ✅ Good
className="text-on-dark-primary"
```

### 3. Inconsistent Social Button Styling

**Problem**: Different backgrounds for different social providers.

**Solution**: All social buttons should use the same base styling (`bg-surface-tertiary`) with provider-specific icons.

## Next.js Dynamic Rendering

Auth pages require `export const dynamic = "force-dynamic"` because they:
- Access browser APIs (`window.location`)
- Use Supabase auth which requires client-side execution
- Cannot be statically generated

```tsx
"use client";

export const dynamic = "force-dynamic";

// ... rest of the page
```

## Testing Checklist

When creating or modifying auth pages, verify:

- [ ] Form panel has dark background (`bg-surface-primary`)
- [ ] All text uses `text-on-dark-*` variants
- [ ] Inputs use `bg-surface-inverse/50` or `bg-surface-tertiary`
- [ ] Social buttons all have consistent styling
- [ ] No hardcoded color values
- [ ] `export const dynamic = "force-dynamic"` is present
- [ ] Page builds without errors

## Files Modified in This Fix

### UI Package (`packages/ui`)
- `src/templates/auth-split-layout.tsx` - Changed form panel to `bg-surface-primary`
- `src/molecules/auth-form-field.tsx` - Unified social button styling

### App Auth Pages
All auth pages in `atlvs`, `compvss`, and `gvteway` were updated with:
- `export const dynamic = "force-dynamic"`

## Related Documentation

- [GHXSTSHIP Design System](./DESIGN_SYSTEM.md)
- [Tailwind Configuration](../packages/config-tailwind/index.js)
- [Global CSS Variables](../packages/config/globals.css)
