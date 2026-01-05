# Phase 1: Design Token Foundation - Complete

> **Status**: COMPLETE  
> **Date**: January 4, 2026  
> **Reference**: ClickUp 4.0 Design System

---

## Summary

Phase 1 establishes a comprehensive, whitelabel-ready design token system that supports both the ClickUp 4.0 aesthetic (subtle shadows, rounded corners) and the original GHXSTSHIP Pop Art aesthetic (hard shadows, sharp corners) through configuration.

## Files Modified

### 1. Token Types (`packages/ui/src/design-system/tokens/types.ts`)

**Changes:**
- Extended `BrandConfig` interface with:
  - `fonts.mono` - Monospace font family
  - `radius` - Override object for border radius values
  - `shadows` - Override object for shadow values
  - `features.sharpCorners` - Enable pop-art sharp corners
  - `features.hardShadows` - Enable pop-art hard offset shadows

### 2. Token Factory (`packages/ui/src/design-system/tokens/index.ts`)

**Changes:**
- Added `defaultRadius` preset (ClickUp 4.0 style: 2-24px scale)
- Added `sharpRadius` preset (Pop Art style: all 0px except full)
- Added `defaultShadows` preset (ClickUp 4.0 style: subtle depth)
- Added `hardShadows` preset (Pop Art style: hard offset)
- Updated `createDesignTokens()` to:
  - Read `features.sharpCorners` and `features.hardShadows` flags
  - Select appropriate radius/shadow presets based on flags
  - Merge brand config overrides on top of presets

### 3. Brand Config (`packages/ui/src/whitelabel/brand-config.ts`)

**Changes:**
- Added `fonts.mono` to default config
- Added `features.sharpCorners: false` (ClickUp 4.0 default)
- Added `features.hardShadows: false` (ClickUp 4.0 default)
- Updated `deepMerge()` to handle:
  - `fonts.mono`
  - `radius` overrides
  - `shadows` overrides
  - `features.sharpCorners`
  - `features.hardShadows`

---

## Token Architecture

```
BrandConfig (input)
    ↓
createDesignTokens(brandConfig)
    ↓
DesignTokens (output)
    ↓
generateCSSVariables(tokens, mode)
    ↓
CSS Custom Properties (injected into :root)
```

## Usage

### ClickUp 4.0 Style (Default)

```typescript
import { defaultBrandConfig } from '@ghxstship/ui/whitelabel/brand-config';
import { createDesignTokens } from '@ghxstship/ui/design-system/tokens';

const tokens = createDesignTokens(defaultBrandConfig);
// tokens.radius = { none: "0", xs: "2px", sm: "4px", md: "6px", ... }
// tokens.shadows = { sm: "0 1px 3px rgba(0,0,0,0.06)...", ... }
```

### Pop Art Style

```typescript
const popArtConfig: BrandConfig = {
  ...defaultBrandConfig,
  features: {
    ...defaultBrandConfig.features,
    sharpCorners: true,
    hardShadows: true,
  },
};

const tokens = createDesignTokens(popArtConfig);
// tokens.radius = { none: "0", xs: "0", sm: "0", md: "0", ... }
// tokens.shadows = { sm: "3px 3px 0 rgba(0,0,0,0.2)", ... }
```

### Custom Overrides

```typescript
const customConfig: BrandConfig = {
  ...defaultBrandConfig,
  radius: {
    sm: "8px",  // Override just sm
    lg: "16px", // Override just lg
  },
  shadows: {
    card: "0 2px 8px rgba(0,0,0,0.1)", // Custom card shadow
  },
};
```

---

## Token Values

### Radius (ClickUp 4.0 Default)

| Token | Value |
|-------|-------|
| `none` | 0 |
| `xs` | 2px |
| `sm` | 4px |
| `md` | 6px |
| `lg` | 8px |
| `xl` | 12px |
| `2xl` | 16px |
| `3xl` | 24px |
| `full` | 9999px |

### Radius (Pop Art)

| Token | Value |
|-------|-------|
| `none` | 0 |
| `xs` | 0 |
| `sm` | 0 |
| `md` | 0 |
| `lg` | 0 |
| `xl` | 0 |
| `2xl` | 0 |
| `3xl` | 0 |
| `full` | 9999px |

### Shadows (ClickUp 4.0 Default)

| Token | Value |
|-------|-------|
| `none` | none |
| `xs` | 0 1px 2px rgba(0,0,0,0.04) |
| `sm` | 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04) |
| `md` | 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04) |
| `lg` | 0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.03) |
| `xl` | 0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04) |
| `2xl` | 0 25px 50px rgba(0,0,0,0.12) |
| `card` | 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02) |
| `modal` | 0 24px 48px rgba(0,0,0,0.16), 0 8px 16px rgba(0,0,0,0.08) |
| `focus` | 0 0 0 3px rgba(123,104,238,0.25) |

### Shadows (Pop Art)

| Token | Value |
|-------|-------|
| `none` | none |
| `xs` | 2px 2px 0 rgba(0,0,0,0.15) |
| `sm` | 3px 3px 0 rgba(0,0,0,0.2) |
| `md` | 4px 4px 0 rgba(0,0,0,0.2) |
| `lg` | 6px 6px 0 rgba(0,0,0,0.25) |
| `xl` | 8px 8px 0 rgba(0,0,0,0.3) |
| `2xl` | 12px 12px 0 rgba(0,0,0,0.35) |
| `card` | 4px 4px 0 rgba(0,0,0,0.15) |
| `modal` | 8px 8px 0 rgba(0,0,0,0.25) |
| `focus` | 0 0 0 3px rgba(0,0,0,0.3) |

---

## CSS Variables Generated

The `generateCSSVariables()` function produces:

```css
:root {
  /* RADIUS */
  --radius-none: 0;
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-3xl: 24px;
  --radius-full: 9999px;

  /* SHADOWS */
  --shadow-none: none;
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04);
  /* ... etc */
}
```

---

## Next Steps

Phase 2 will restructure atomic components to use these tokens exclusively via CSS variables, eliminating all hardcoded values.
