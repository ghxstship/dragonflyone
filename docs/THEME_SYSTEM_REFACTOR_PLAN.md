# Theme System Refactor Plan

## Executive Summary

This document outlines the comprehensive plan to refactor and rebuild the dark/light/system theme implementation across the GHXSTSHIP platform. The goal is to create a unified, flawless theme switching experience with:

- **Dark theme** as default for authenticated/app pages
- **Light theme** as default for marketing/public pages
- **System theme** option that respects user OS preferences
- Seamless toggling between themes with persistence

---

## Current State Analysis

### What Exists

1. **ThemeProvider** (`packages/ui/src/providers/theme-provider.tsx`)
   - Supports `dark`, `light`, `system` themes
   - Persists to localStorage
   - Applies `.dark`/`.light` class to `<html>`
   - Manually sets CSS variables via JavaScript (problematic)

2. **ThemeToggle** (`packages/ui/src/components/theme-toggle.tsx`)
   - Icon variant (simple toggle)
   - Dropdown variant (dark/light/system options)
   - Uses `useThemeSafe` hook

3. **CSS Variables** (`packages/config/globals.css`)
   - `:root` defines dark mode defaults
   - `.light, [data-theme="light"]` selector for light mode overrides
   - Comprehensive semantic tokens defined

4. **Tailwind Config** (`packages/config-tailwind/index.js`)
   - `darkMode: 'class'` configured
   - Semantic color tokens defined
   - `text-on-dark-*` / `text-on-light-*` palette

5. **App Providers** (`packages/config/providers.tsx`)
   - Does NOT include ThemeProvider currently
   - Apps don't have theme switching enabled

### Problems Identified

1. **ThemeProvider duplicates CSS variable logic** - Variables are defined in CSS AND set via JS
2. **ThemeProvider not integrated** - Not included in `AppProviders`, apps can't toggle themes
3. **Inconsistent color usage** - Components use mix of `inverted` prop, raw colors, semantic tokens
4. **No route-based defaults** - Marketing pages should default to light, app pages to dark
5. **Flash of incorrect theme** - No SSR-safe theme initialization script
6. **Missing `dark:` Tailwind classes** - Components don't use Tailwind's dark mode utilities

---

## Target Architecture

### 1. CSS-First Theme System

All theme switching should happen via CSS classes, not JavaScript variable manipulation.

```css
/* globals.css */
:root {
  /* Dark mode is default (GHXSTSHIP aesthetic) */
  --surface-primary: #000000;
  --text-primary: #ffffff;
  /* ... all dark mode values ... */
}

.light {
  /* Light mode overrides */
  --surface-primary: #ffffff;
  --text-primary: #000000;
  /* ... all light mode values ... */
}

/* System preference support */
@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    /* Light mode values when no explicit class */
  }
}
```

### 2. Enhanced ThemeProvider

```tsx
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  forcedTheme?: "dark" | "light"; // For route-based forcing
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}
```

### 3. Route-Based Theme Defaults

```
/                     → light (marketing)
/(marketing)/*        → light (public pages)
/(authenticated)/*    → dark (app pages)
/(portal)/*           → dark (portal pages)
/auth/*               → dark (auth pages)
```

### 4. SSR-Safe Theme Script

Inject a blocking script to prevent flash of wrong theme:

```tsx
// In layout.tsx <head>
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      const stored = localStorage.getItem('ghxstship-theme');
      const theme = stored || 'dark';
      if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(systemDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(theme);
      }
    })();
  `
}} />
```

---

## Implementation Plan

### Phase 1: CSS Variable Consolidation (Day 1)

**Goal:** Single source of truth for all theme colors in CSS

1. **Audit `globals.css`**
   - Ensure ALL semantic variables have both dark and light values
   - Add missing variables for complete coverage
   - Remove any hardcoded colors

2. **Update light mode selector**
   - Change from `.light, [data-theme="light"]` to just `.light`
   - Ensure all variables are overridden

3. **Add transition utilities**
   ```css
   .theme-transition,
   .theme-transition *,
   .theme-transition *::before,
   .theme-transition *::after {
     transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
   }
   ```

### Phase 2: ThemeProvider Refactor (Day 1-2)

**Goal:** Clean, SSR-safe theme provider

1. **Remove JS variable manipulation**
   - Delete all `root.style.setProperty()` calls
   - Theme switching only via class toggle

2. **Add SSR-safe initialization**
   - Create `ThemeScript` component for `<head>`
   - Prevent flash of wrong theme

3. **Add `forcedTheme` support**
   - Allow layouts to force a specific theme
   - Useful for marketing pages

4. **Improve system theme handling**
   - Listen for `prefers-color-scheme` changes
   - Update immediately when system preference changes

### Phase 3: Provider Integration (Day 2)

**Goal:** Theme system available throughout apps

1. **Update `AppProviders`**
   ```tsx
   export function AppProviders({ 
     children,
     platform = 'atlvs',
     defaultTheme = 'dark',
   }) {
     return (
       <QueryClientProvider>
         <ThemeProvider defaultTheme={defaultTheme}>
           <CookieConsentProvider>
             <AuthProvider>
               <AppContextProvider platform={platform}>
                 {children}
               </AppContextProvider>
             </AuthProvider>
           </CookieConsentProvider>
         </ThemeProvider>
       </QueryClientProvider>
     );
   }
   ```

2. **Update root layouts**
   - Add `ThemeScript` to `<head>` in each app's root layout
   - Pass appropriate `defaultTheme` to providers

### Phase 4: Route-Based Theming (Day 2-3)

**Goal:** Different defaults for different route groups

1. **Marketing layout** (`(marketing)/layout.tsx`)
   ```tsx
   <ThemeProvider forcedTheme="light">
     {children}
   </ThemeProvider>
   ```

2. **Authenticated layout** (`(authenticated)/layout.tsx`)
   ```tsx
   <ThemeProvider defaultTheme="dark">
     {children}
   </ThemeProvider>
   ```

3. **Portal layout** (`(portal)/layout.tsx`)
   ```tsx
   <ThemeProvider defaultTheme="dark">
     {children}
   </ThemeProvider>
   ```

### Phase 5: Component Migration (Day 3-5)

**Goal:** All components use semantic tokens and respond to theme

1. **Remove `inverted` prop pattern**
   - Replace with CSS variable-based colors
   - Components auto-adapt to theme

2. **Add `dark:` Tailwind classes where needed**
   - For components that need explicit dark/light variants
   - Example: `bg-white dark:bg-ink-900`

3. **Priority components to migrate:**
   - `AppNavbar` ✅ (already uses semantic tokens)
   - `AppSidebar` ✅ (already uses semantic tokens)
   - `AuthenticatedShell` ✅ (already uses semantic tokens)
   - `page-header.tsx`
   - `dashboard-builder.tsx`
   - `modal.tsx`
   - `navigation.tsx`
   - All marketing components

### Phase 6: Theme Toggle Integration (Day 5)

**Goal:** Users can toggle themes from the UI

1. **Add ThemeToggle to AppNavbar**
   - In user menu dropdown
   - Show current theme state

2. **Add ThemeToggle to settings pages**
   - Full dropdown variant with all options
   - Preview of each theme

3. **Persist preference**
   - Already handled by ThemeProvider localStorage

---

## File Changes Summary

### New Files
- `packages/ui/src/components/theme-script.tsx` - SSR-safe initialization script

### Modified Files

| File | Changes |
|------|---------|
| `packages/config/globals.css` | Complete light mode variable coverage |
| `packages/ui/src/providers/theme-provider.tsx` | Remove JS variable manipulation, add forcedTheme |
| `packages/config/providers.tsx` | Add ThemeProvider integration |
| `apps/atlvs/src/app/layout.tsx` | Add ThemeScript to head |
| `apps/atlvs/src/app/(marketing)/layout.tsx` | Force light theme |
| `apps/atlvs/src/app/(authenticated)/layout.tsx` | Default dark theme |
| `apps/compvss/src/app/layout.tsx` | Add ThemeScript to head |
| `apps/gvteway/src/app/layout.tsx` | Add ThemeScript to head |
| `packages/ui/src/organisms/app-navbar.tsx` | Add ThemeToggle to user menu |

---

## CSS Variable Reference

### Surface Colors
| Variable | Dark | Light |
|----------|------|-------|
| `--surface-primary` | `#000000` | `#ffffff` |
| `--surface-secondary` | `#171717` | `#f5f5f5` |
| `--surface-tertiary` | `#262626` | `#e5e5e5` |
| `--surface-elevated` | `#262626` | `#ffffff` |
| `--surface-overlay` | `rgba(0,0,0,0.8)` | `rgba(0,0,0,0.5)` |
| `--surface-inverse` | `#ffffff` | `#000000` |
| `--surface-muted` | `#404040` | `#d4d4d4` |

### Text Colors
| Variable | Dark | Light |
|----------|------|-------|
| `--text-primary` | `#ffffff` | `#000000` |
| `--text-secondary` | `#d4d4d4` | `#404040` |
| `--text-tertiary` | `#a3a3a3` | `#525252` |
| `--text-muted` | `#737373` | `#737373` |
| `--text-inverse` | `#000000` | `#ffffff` |

### Border Colors
| Variable | Dark | Light |
|----------|------|-------|
| `--border-primary` | `#404040` | `#000000` |
| `--border-secondary` | `#262626` | `#d4d4d4` |
| `--border-muted` | `#171717` | `#e5e5e5` |
| `--border-focus` | `#737373` | `#737373` |

---

## Testing Checklist

- [ ] Theme persists across page refreshes
- [ ] Theme persists across browser sessions
- [ ] No flash of wrong theme on page load
- [ ] System theme responds to OS preference changes
- [ ] Marketing pages default to light theme
- [ ] Authenticated pages default to dark theme
- [ ] Theme toggle works in navbar
- [ ] Theme toggle works in settings
- [ ] All components render correctly in both themes
- [ ] Transitions are smooth when switching themes
- [ ] Focus states visible in both themes
- [ ] Status colors (success/error/warning) work in both themes

---

## Migration Strategy for `inverted` Prop

The current codebase uses an `inverted` prop pattern extensively. Here's the migration path:

### Before (inverted prop)
```tsx
function Component({ inverted = true }) {
  return (
    <div className={inverted ? "bg-ink-900 text-white" : "bg-white text-ink-900"}>
      ...
    </div>
  );
}
```

### After (CSS variables)
```tsx
function Component() {
  return (
    <div className="bg-surface-primary text-text-primary">
      ...
    </div>
  );
}
```

The component no longer needs to know about themes - it uses semantic tokens that automatically adapt.

### Transition Period

During migration, components can support both patterns:
```tsx
function Component({ inverted }: { inverted?: boolean }) {
  // If inverted is explicitly passed, use legacy behavior
  // Otherwise, use semantic tokens (auto-theming)
  if (inverted !== undefined) {
    return <div className={inverted ? "..." : "..."}>...</div>;
  }
  return <div className="bg-surface-primary text-text-primary">...</div>;
}
```

---

## Success Criteria

1. **Zero flash** - No visible theme flash on any page load
2. **Instant toggle** - Theme switches immediately with smooth transition
3. **Persistent** - User preference remembered across sessions
4. **Route-aware** - Correct defaults for marketing vs app pages
5. **System-aware** - Respects OS preference when set to "system"
6. **Accessible** - All contrast ratios meet WCAG AA in both themes
7. **Consistent** - All components look correct in both themes

---

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: CSS Consolidation | 1 day | Pending |
| Phase 2: ThemeProvider Refactor | 1-2 days | Pending |
| Phase 3: Provider Integration | 1 day | Pending |
| Phase 4: Route-Based Theming | 1-2 days | Pending |
| Phase 5: Component Migration | 2-3 days | Pending |
| Phase 6: Theme Toggle Integration | 1 day | Pending |

**Total Estimated Time: 7-10 days**

---

## Next Steps

1. Review and approve this plan
2. Begin Phase 1: CSS Variable Consolidation
3. Create tracking issue for progress
