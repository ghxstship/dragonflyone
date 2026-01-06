# UI Package Rebuild Proposal
## Complete Modernization with Native White Label Architecture

**Project:** DragonFlyOne UI Package Rebuild
**Version:** 2.0.0
**Date:** January 6, 2026
**Status:** Proposal for Review

---

## Executive Summary

This proposal outlines a comprehensive rebuild of the `@ghxstship/ui` package, transforming it from a feature-rich but complex component library into a **lean, modern, white-label-first design system** optimized for multi-tenant SaaS applications.

**Key Goals:**
- **Architectural Convergence**: Unified component hierarchy inspired by ClickUp 4.0's personalized navigation system
- **Native White Label**: Deep theming architecture that makes white labeling effortless (not an afterthought)
- **Performance First**: Reduce bundle size by 60%, improve tree-shaking, optimize for RSC (React Server Components)
- **Developer Experience**: Simpler APIs, better TypeScript inference, composition over configuration
- **Modern Standards**: CSS Layers, Container Queries, View Transitions API, RSC-ready

**Strategic Direction:**
Transform from a "component library with theming" to a "white label design system with composable components."

---

## Current State Analysis

### Strengths ✅
- **165+ production-ready components** across atomic hierarchy
- **Enterprise-grade whitelabel system** with runtime theming
- **Strong design tokens** with semantic naming
- **Type-safe** with comprehensive TypeScript support
- **Well-tested** with 80% coverage threshold
- **Storybook documentation** for all components

### Pain Points ⚠️
1. **Bundle Size**: 495-line export barrel, heavy initial payload
2. **Complexity**: 165+ components = high maintenance burden
3. **Theming Limitations**: CSS variables injected at runtime (FOUC risk)
4. **RSC Compatibility**: Heavy reliance on client-side hooks
5. **Dependency Weight**: Some underutilized dependencies (@radix-ui, dnd-kit)
6. **Component Coupling**: Tight coupling between atoms/molecules/organisms
7. **Design Drift**: Two competing design languages (ClickUp 4.0 vs Pop Art)

### Technical Debt
- Legacy text color palette in config-tailwind (deprecated but kept for BC)
- Manual CSS variable injection (performance bottleneck)
- Mobile optimizations incomplete
- Hook test coverage at 21.6%
- No React Server Component strategy

---

## Vision & Strategic Goals

### Design Philosophy

**"White Label Native, Component Second"**

Instead of:
```
Component → Style Variants → Theme Overrides → White Label
```

We build:
```
Brand Identity → Design Tokens → Component Primitives → Compositions
```

### Strategic Goals

#### 1. **Convergence Architecture** (ClickUp 4.0 Inspired)
- **Unified Navigation System**: Single customizable shell component
- **Personalized Workspaces**: User-configurable layouts with drag-drop
- **Context-Aware Components**: Components adapt to their container context
- **Deep Integration**: Seamless data flow between tasks, docs, chat, AI

#### 2. **White Label Excellence** (Phantom/RockNashville Pattern)
- **Instant Brand Application**: Upload logo + color palette = fully themed app
- **Per-Tenant Isolation**: Complete CSS/JS isolation per tenant
- **Dynamic Asset Loading**: CDN-hosted tenant assets with intelligent caching
- **Multi-Brand Support**: Single codebase, infinite brand expressions

#### 3. **Performance Targets**
- **Initial Bundle**: < 50KB gzipped (currently ~180KB)
- **Component Load**: < 5KB per component average
- **LCP**: < 1.2s for authenticated pages
- **CLS**: < 0.1 (zero layout shift from theming)
- **TTI**: < 2.5s on 3G networks

#### 4. **Developer Experience**
- **Minimal API Surface**: Fewer props, more composition
- **TypeScript Inference**: Smart prop inference from context
- **Zero Config**: Works out of the box with sensible defaults
- **Error Messages**: Actionable guidance when misused

---

## Architectural Principles

### 1. **Token-First Design System**

```typescript
// Current Approach (Component-First)
<Button variant="primary" size="lg" rounded="md" shadow="soft">
  Click Me
</Button>

// New Approach (Token-First)
<Button intent="primary" scale="lg">
  Click Me
</Button>
// ↑ Automatically inherits radius/shadow from brand config
```

**Benefits:**
- Fewer props to maintain
- Automatic brand consistency
- Easier to theme
- Better tree-shaking

### 2. **Layered Theme Architecture**

```
Layer 1: Foundation Tokens (color primitives, spacing scale)
         ↓
Layer 2: Semantic Tokens (text-primary, surface-elevated)
         ↓
Layer 3: Component Tokens (button-bg, input-border)
         ↓
Layer 4: Brand Overrides (tenant-specific customization)
```

**Implementation:**
```css
/* Foundation Layer */
@layer foundation {
  :root {
    --color-purple-500: #7B68EE;
    --spacing-4: 1rem;
  }
}

/* Semantic Layer */
@layer semantic {
  :root {
    --text-primary: var(--brand-text-primary, var(--color-gray-900));
    --surface-elevated: var(--brand-surface-elevated, var(--color-white));
  }
}

/* Component Layer */
@layer components {
  .button {
    background: var(--button-bg, var(--text-primary));
    border-radius: var(--button-radius, var(--radius-md));
  }
}

/* Brand Layer */
@layer brand {
  [data-tenant="acme"] {
    --brand-text-primary: #FF0000;
    --button-radius: 0px;
  }
}
```

### 3. **Composition Over Configuration**

```typescript
// ❌ Old: Configuration Hell
<DataTable
  columns={columns}
  data={data}
  sortable
  filterable
  searchable
  pagination
  selection
  rowActions={actions}
  toolbarActions={toolbarActions}
  emptyState={<EmptyState />}
  loadingState={<LoadingState />}
  errorState={<ErrorState />}
/>

// ✅ New: Composable Primitives
<Table.Root data={data}>
  <Table.Toolbar>
    <Table.Search />
    <Table.Filters />
    <Table.Actions />
  </Table.Toolbar>

  <Table.Content columns={columns} />

  <Table.Footer>
    <Table.Selection />
    <Table.Pagination />
  </Table.Footer>
</Table.Root>
```

**Benefits:**
- Tree-shakeable (only import what you use)
- Easier to customize layouts
- Clearer component boundaries
- Better for RSC (server/client split)

### 4. **RSC-First Architecture**

```typescript
// Server Components (Default)
export {
  Button,      // Renders on server by default
  Card,
  Typography,
  Layout,
}

// Client Components (Explicit)
export {
  Dialog,      // "use client" - needs interactivity
  Toast,
  CommandPalette,
  ThemeProvider,
}
```

**Strategy:**
- 80% of components as server components
- Client boundary at interaction points only
- Shared types between server/client
- Hydration-optimized for themed components

---

## White Label Architecture

### Inspiration: Phantom.com & RockNashville.com

**Key Observations:**
1. **Instant Brand Recognition**: Logo, colors, fonts applied consistently
2. **Contextual Theming**: Components adapt to light/dark/brand modes seamlessly
3. **Dynamic Asset Loading**: Images, fonts, styles loaded per-tenant
4. **Performance**: No perceivable loading delay despite heavy customization

### Proposed Architecture

#### 1. **Tenant Configuration Schema**

```typescript
interface TenantBrand {
  // Identity
  id: string;
  slug: string;
  domain: string;

  // Visual Identity
  identity: {
    name: string;
    tagline?: string;
    logo: {
      light: string;  // CDN URL
      dark: string;
      mark: string;   // Icon only
      favicon: string;
    };
  };

  // Color System
  colors: {
    brand: string;        // Primary brand color
    brandLight: string;
    brandDark: string;
    accent?: string;      // Optional accent

    // Auto-generated palette
    palette?: ColorPalette; // Generated from brand color
  };

  // Typography
  typography: {
    fontFamily: string;   // Google Font name or custom URL
    fontUrl?: string;     // Custom font CDN
    scale: 'compact' | 'comfortable' | 'spacious';
    weights: [400, 500, 600, 700];
  };

  // Design Language
  design: {
    radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadows: 'none' | 'subtle' | 'soft' | 'hard';
    borders: 'none' | 'subtle' | 'strong';
    animations: boolean;
  };

  // Feature Flags
  features: {
    darkMode: boolean;
    customDomain: boolean;
    removeBranding: boolean;
    customAuth: boolean;
  };

  // Content
  content: {
    copyrightHolder: string;
    supportEmail: string;
    legalLinks: {
      terms: string;
      privacy: string;
      security?: string;
    };
  };
}
```

#### 2. **Dynamic Theme Loading**

```typescript
// Server-Side (RSC)
export async function BrandProvider({
  children,
  tenantId
}: {
  children: React.ReactNode;
  tenantId: string;
}) {
  // Load tenant config at build/request time
  const brand = await fetchTenantBrand(tenantId);

  // Generate design tokens
  const tokens = generateTokens(brand);

  // Inject as CSS variables (no runtime flash)
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: generateThemeCSS(tokens)
      }} />
      <BrandContext.Provider value={brand}>
        {children}
      </BrandContext.Provider>
    </>
  );
}
```

**Benefits:**
- Zero FOUC (Flash of Unstyled Content)
- SSR-compatible
- CDN-cacheable per tenant
- No runtime CSS injection

#### 3. **Intelligent Color Palette Generation**

```typescript
// Input: Single brand color
const brandColor = "#7B68EE";

// Output: Full accessible palette
const palette = generatePalette(brandColor);
// {
//   50: "#F5F3FF",   // Auto-generated light shades
//   100: "#EDE9FE",
//   ...
//   900: "#2E1065",  // Auto-generated dark shades
//
//   text: {
//     onBrand: "#FFFFFF",      // Auto-calculated contrast
//     onBrandSubtle: "#E0E0E0"
//   },
//
//   states: {
//     hover: darken(brandColor, 10%),
//     active: darken(brandColor, 20%),
//     disabled: fade(brandColor, 50%)
//   }
// }
```

**Algorithm:**
- HSL color space manipulation for shades
- WCAG AAA contrast checking for text colors
- Automatic state color generation
- Colorblind-safe palette validation

#### 4. **Multi-Tenant Isolation**

```typescript
// URL-based tenant detection
subdomain.dragonflyone.io     → tenant: "subdomain"
custom-domain.com             → tenant: lookup(domain)

// CSS isolation via data attributes
<html data-tenant="acme" data-theme="light">
  <!-- All styles scoped to [data-tenant="acme"] -->
</html>

// Asset CDN structure
cdn.dragonflyone.io/
  ├── tenants/
  │   ├── acme/
  │   │   ├── logo.svg
  │   │   ├── fonts/inter.woff2
  │   │   └── theme.css
  │   └── techcorp/
  │       └── ...
  └── shared/
      └── ui/components/...
```

---

## Component Strategy

### Component Reduction Plan

**Current:** 165+ components (45 atoms, 68 molecules, 52 organisms, 22 templates)
**Target:** ~60 core components (20 primitives, 25 compositions, 15 patterns)

#### Primitives (20) - Basic Building Blocks
```
Layout:     Box, Stack, Grid, Flex, Container, Separator
Typography: Text, Heading, Label, Code
Form:       Input, Textarea, Select, Checkbox, Radio, Switch
Feedback:   Spinner, Progress, Skeleton
Media:      Image, Icon, Avatar
```

#### Compositions (25) - Common Patterns
```
Navigation: Nav, Sidebar, Breadcrumb, Tabs, Pagination
Overlay:    Dialog, Popover, Tooltip, Dropdown, Sheet
Data:       Table, List, Card, Badge, Chip
Form:       Field, FormGroup, Fieldset
Action:     Button, IconButton, ButtonGroup, Menu
Feedback:   Alert, Toast, Banner, EmptyState, ErrorBoundary
```

#### Patterns (15) - Page-Level Layouts
```
Shell:      AppShell, PageHeader, PageContent, PageFooter
Auth:       SignInForm, SignUpForm, ResetPasswordForm
Lists:      ListPage, GridPage, BoardPage
Details:    DetailPage, EditPage, CreatePage
Dashboard:  DashboardGrid, WidgetContainer, StatCard
```

### Component Design Principles

#### 1. **Unstyled Primitives with Styled Variants**

```typescript
// Unstyled base (headless)
import { Button as ButtonPrimitive } from '@ghxstship/ui/primitives';

// Styled variant (opinionated)
import { Button } from '@ghxstship/ui';

// Custom variant (user-defined)
const MyButton = styled(ButtonPrimitive, {
  // Custom styles using brand tokens
});
```

#### 2. **Polymorphic Components**

```typescript
// Render as different elements
<Button as="a" href="/home">Link Button</Button>
<Button as="div" onClick={handler}>Div Button</Button>
<Heading as="h1" level={1}>Title</Heading>
<Heading as="h2" level={1}>Looks like H1, semantic H2</Heading>
```

#### 3. **Smart Defaults from Context**

```typescript
<BrandProvider brand={acmeBrand}>
  {/* Automatically uses ACME's primary color */}
  <Button>ACME Branded Button</Button>

  {/* Override when needed */}
  <Button color="secondary">Secondary Button</Button>
</BrandProvider>
```

#### 4. **Compound Components**

```typescript
// Self-documenting API
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content here
  </Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

---

## Technical Architecture

### Tech Stack

#### Core
- **React 19**: Server Components, Server Actions, `use` hook
- **TypeScript 5.7**: Type inference improvements, decorators
- **Vite 6**: Fast builds, RSC plugin
- **Tailwind CSS 4.0**: CSS-in-JS alternative, @layer support

#### White Label
- **Vanilla Extract**: Zero-runtime CSS-in-TS
- **Stitches / Panda CSS**: Consider for runtime theming
- **PostCSS**: Custom properties, color functions
- **Sharp**: Server-side image processing for tenant assets

#### Quality
- **Vitest 4**: Fast unit tests with RSC support
- **Playwright**: E2E tests with tenant-specific snapshots
- **Chromatic**: Visual regression per tenant
- **TypeDoc**: Auto-generated docs

#### Developer Tools
- **Storybook 9**: RSC support, brand switcher addon
- **Ladle**: Lightweight Storybook alternative
- **Biome**: Faster ESLint + Prettier replacement

### Build Architecture

```
packages/ui/
├── src/
│   ├── primitives/           # Unstyled headless components
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.types.ts
│   │   │   └── index.ts
│   │   └── ...
│   │
│   ├── components/           # Styled components (brand-aware)
│   │   ├── button/
│   │   │   ├── button.tsx    # Re-exports primitive with styles
│   │   │   ├── button.styles.css.ts  # Vanilla Extract
│   │   │   └── index.ts
│   │   └── ...
│   │
│   ├── patterns/             # Composite patterns
│   │   ├── app-shell/
│   │   ├── data-table/
│   │   └── ...
│   │
│   ├── tokens/               # Design tokens
│   │   ├── foundation.css    # Base CSS variables
│   │   ├── semantic.css      # Semantic tokens
│   │   ├── brand.schema.ts   # Zod schema for tenant config
│   │   └── generator.ts      # Token generation utilities
│   │
│   ├── whitelabel/           # White label system
│   │   ├── brand-provider.tsx
│   │   ├── theme-loader.ts
│   │   ├── palette-generator.ts
│   │   └── cdn-manager.ts
│   │
│   ├── hooks/                # Reusable hooks
│   │   ├── use-brand.ts
│   │   ├── use-theme.ts
│   │   └── use-tokens.ts
│   │
│   └── utils/                # Utilities
│       ├── cn.ts             # Class name utility
│       ├── polymorphic.ts    # Type utilities
│       └── accessibility.ts  # A11y helpers
│
├── dist/                     # Build output
│   ├── primitives/           # Tree-shakeable primitives
│   ├── components/           # Tree-shakeable components
│   ├── patterns/             # Tree-shakeable patterns
│   └── styles/               # Extracted CSS
│
└── package.json
```

### Export Strategy

```typescript
// Before: Barrel export (495 lines)
export * from './atoms/Button';
export * from './atoms/Input';
// ... 165+ exports

// After: Modular exports
// Main entry (minimal)
export { BrandProvider, useTheme } from './whitelabel';

// Primitives (headless)
export * from './primitives';

// Components (styled)
export * from './components';

// Patterns (compositions)
export * from './patterns';

// Tokens (for custom styling)
export * from './tokens';
```

**Usage:**
```typescript
// Import only what you need
import { Button, Card } from '@ghxstship/ui/components';
import { AppShell } from '@ghxstship/ui/patterns';
import { ButtonPrimitive } from '@ghxstship/ui/primitives';
```

### Bundle Size Strategy

**Target Breakdown:**
```
Core Runtime:        15KB  (BrandProvider, hooks, utilities)
Primitives (avg):     2KB  (per primitive)
Components (avg):     5KB  (per component)
Patterns (avg):      12KB  (per pattern)
Styles (shared):     10KB  (foundation + semantic tokens)
Total (minimal):     32KB  (core + 3 components)
Total (full import): 180KB (same as current, but now optional)
```

**Optimization Techniques:**
1. **Tree-shaking**: ES modules only, no barrel exports
2. **Code splitting**: Dynamic imports for heavy components
3. **CSS splitting**: Per-component CSS files
4. **Dead code elimination**: Remove unused variants
5. **Shared chunks**: Common dependencies bundled separately

---

## Migration Strategy

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: Token System
- [ ] Define foundation tokens (colors, spacing, typography)
- [ ] Create semantic token layer
- [ ] Build brand configuration schema (Zod)
- [ ] Implement palette generator
- [ ] Write token generation utilities

#### Week 2: Build Infrastructure
- [ ] Set up new package structure
- [ ] Configure Vite 6 with RSC support
- [ ] Implement modular export system
- [ ] Set up Vanilla Extract / Panda CSS
- [ ] Configure Storybook 9 with brand switcher

#### Week 3: White Label Core
- [ ] Build BrandProvider (RSC-compatible)
- [ ] Implement theme loader with CDN support
- [ ] Create CSS layer architecture
- [ ] Build tenant isolation system
- [ ] Write documentation

#### Week 4: Developer Experience
- [ ] Create CLI for component generation
- [ ] Build migration guide from v1 to v2
- [ ] Set up visual regression testing
- [ ] Create brand configuration validator
- [ ] Write TypeScript utilities (polymorphic, etc.)

### Phase 2: Primitives (Weeks 5-8)

#### Week 5-6: Core Primitives (20 components)
- [ ] Layout primitives (Box, Stack, Grid, Flex)
- [ ] Typography primitives (Text, Heading, Label)
- [ ] Form primitives (Input, Select, Checkbox, Radio, Switch)
- [ ] Feedback primitives (Spinner, Progress, Skeleton)
- [ ] Media primitives (Image, Icon, Avatar)

#### Week 7-8: Styled Components
- [ ] Style primitives with brand tokens
- [ ] Create component variants
- [ ] Write comprehensive tests (80% coverage)
- [ ] Document in Storybook
- [ ] Create usage examples

### Phase 3: Compositions (Weeks 9-14)

#### Week 9-10: Navigation & Overlay (10 components)
- [ ] Nav, Sidebar, Breadcrumb, Tabs, Pagination
- [ ] Dialog, Popover, Tooltip, Dropdown, Sheet

#### Week 11-12: Data & Forms (10 components)
- [ ] Table, List, Card, Badge, Chip
- [ ] Field, FormGroup, Fieldset, Button, ButtonGroup

#### Week 13-14: Feedback (5 components)
- [ ] Alert, Toast, Banner, EmptyState, ErrorBoundary

### Phase 4: Patterns (Weeks 15-18)

#### Week 15-16: App Shell & Auth (8 components)
- [ ] AppShell, PageHeader, PageContent, PageFooter
- [ ] SignInForm, SignUpForm, ResetPasswordForm, MFAForm

#### Week 17-18: Pages & Dashboard (7 components)
- [ ] ListPage, GridPage, BoardPage
- [ ] DetailPage, EditPage, CreatePage
- [ ] DashboardGrid, WidgetContainer, StatCard

### Phase 5: Migration & Launch (Weeks 19-24)

#### Week 19-20: Codemods & Migration Tools
- [ ] Write codemods for automatic migration
- [ ] Create migration script for apps
- [ ] Build backward compatibility layer
- [ ] Test migration on one app (atlvs)

#### Week 21-22: Rollout
- [ ] Migrate atlvs app
- [ ] Migrate compvss app
- [ ] Migrate gvteway app
- [ ] Fix migration issues

#### Week 23: Performance Optimization
- [ ] Bundle size analysis
- [ ] Lazy loading optimizations
- [ ] CDN configuration
- [ ] Caching strategy

#### Week 24: Documentation & Launch
- [ ] Complete documentation site
- [ ] Record tutorial videos
- [ ] Write migration guides
- [ ] Announce v2.0 launch

---

## Success Metrics

### Performance
- [ ] Bundle size reduced by 60% (180KB → 70KB for typical app)
- [ ] LCP < 1.2s (currently ~2.1s)
- [ ] CLS < 0.1 (currently ~0.3 due to theme flash)
- [ ] TTI < 2.5s on 3G

### Developer Experience
- [ ] Component creation time reduced by 50%
- [ ] TypeScript inference accuracy > 95%
- [ ] Zero-config setup for new apps
- [ ] Migration codemods cover 90% of changes

### White Label
- [ ] New tenant onboarding < 5 minutes
- [ ] Brand application takes < 30 seconds
- [ ] Zero visual regressions across 10+ test tenants
- [ ] 100% feature parity with current system

### Quality
- [ ] 90%+ test coverage
- [ ] 100% TypeScript (no `any` types)
- [ ] Zero accessibility violations (aXe)
- [ ] A+ Lighthouse scores across all apps

---

## Risk Assessment

### High Risk ⚠️

**1. Breaking Changes for Existing Apps**
- **Mitigation**: Backward compatibility layer, codemods, phased rollout
- **Contingency**: Keep v1 in maintenance mode for 6 months

**2. RSC Adoption Learning Curve**
- **Mitigation**: Comprehensive docs, examples, training sessions
- **Contingency**: Hybrid approach (support both patterns)

**3. White Label Complexity**
- **Mitigation**: Extensive testing with 10+ mock tenants
- **Contingency**: Simplified initial launch, advanced features in 2.1

### Medium Risk ⚙️

**4. Bundle Size Regression**
- **Mitigation**: Automated size budgets, CI/CD checks
- **Contingency**: Aggressive code splitting, lazy loading

**5. Design System Inconsistencies**
- **Mitigation**: Token-driven design, automated lint rules
- **Contingency**: Design review process, Figma sync

### Low Risk ✅

**6. Timeline Overrun**
- **Mitigation**: Weekly check-ins, adjust scope if needed
- **Contingency**: MVP launch, iterate on feedback

---

## Open Questions

1. **CSS-in-JS Choice**: Vanilla Extract vs Panda CSS vs Stitches?
   - *Recommendation*: Vanilla Extract (zero runtime, best TypeScript)

2. **RSC Adoption Timeline**: Full RSC or hybrid approach?
   - *Recommendation*: Hybrid (80% RSC, 20% client for interactivity)

3. **Storybook vs Ladle**: Continue with Storybook or switch to Ladle?
   - *Recommendation*: Storybook 9 (better RSC support, team familiarity)

4. **Backward Compatibility**: How long to support v1?
   - *Recommendation*: 6 months maintenance, 12 months security fixes

5. **Radix UI Dependency**: Keep or remove?
   - *Recommendation*: Selective use (Dialog, Popover) for accessibility

---

## Conclusion

This rebuild transforms `@ghxstship/ui` from a comprehensive component library into a **modern, white-label-first design system** optimized for multi-tenant SaaS applications.

**Key Differentiators:**
- ✅ Native white labeling (not bolted on)
- ✅ 60% smaller bundle size
- ✅ RSC-ready for modern React
- ✅ Token-driven design system
- ✅ Composable components over configuration
- ✅ Best-in-class developer experience

**Inspired By:**
- **ClickUp 4.0**: Convergent architecture, personalized navigation
- **Phantom/RockNashville**: Seamless white labeling, instant brand recognition
- **Modern Best Practices**: CSS Layers, RSC, design tokens, composition

**Timeline:** 24 weeks (6 months)
**Team Size:** 2-3 engineers + 1 designer
**Budget:** [To be determined based on team allocation]

---

## Appendix

### A. Comparison: Current vs Proposed

| Aspect | Current (v1) | Proposed (v2) |
|--------|-------------|---------------|
| **Components** | 165+ | ~60 core |
| **Bundle Size** | ~180KB | ~70KB (60% reduction) |
| **White Label** | Runtime CSS injection | Build-time CSS generation |
| **Architecture** | Monolithic exports | Modular primitives |
| **React Support** | Client-only | RSC + Client |
| **Theming** | CSS variables (runtime) | CSS Layers (build-time) |
| **TypeScript** | Good | Excellent (full inference) |
| **Tree Shaking** | Limited | Full support |
| **Accessibility** | Manual ARIA | Automatic (Radix-based) |
| **Documentation** | Storybook 7 | Storybook 9 + docs site |

### B. Reference Links

**ClickUp 4.0:**
- [ClickUp 4.0: The End of Work Sprawl](https://clickup.com/blog/clickup-4-0/)
- [Intro to ClickUp 4.0](https://help.clickup.com/hc/en-us/articles/31142608907543-Intro-to-ClickUp-4-0)
- [ClickUp 4.0 Debuts AI-Powered Revamp](https://www.techrepublic.com/article/news-clickup-ai-overhaul/)

**White Label Design Systems:**
- [White-labeling: Putting the Design System in Users' Hands](https://www.designsystems.com/white-labeling-putting-the-design-system-in-users-hands/)
- [Building a White-Label Design System](https://www.nachos.design/white-label-design-system)
- [White Label Designs](https://www.uxpin.com/studio/blog/white-label-designs/)

**Modern CSS & Design Tokens:**
- [Design Tokens & Theming: Scalable UI Systems 2025](https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025)
- [Modern Design Systems for React in 2025](https://inwald.com/2025/11/modern-design-systems-for-react-in-2025-a-pragmatic-comparison/)
- [CSS Color Variables and Custom Properties 2025](https://chromacreator.com/blog/css-color-variables-guide)

### C. Glossary

- **RSC**: React Server Components
- **CVA**: class-variance-authority
- **FOUC**: Flash of Unstyled Content
- **LCP**: Largest Contentful Paint
- **CLS**: Cumulative Layout Shift
- **TTI**: Time to Interactive
- **Tree-shaking**: Removing unused code from bundles
- **Polymorphic Component**: Component that can render as different HTML elements
- **Design Token**: Named entity storing visual design attributes
- **Compound Component**: Component composed of multiple sub-components

---

**Next Steps:**
1. Review this proposal with the team
2. Validate assumptions with stakeholders
3. Prototype key architectural decisions
4. Finalize timeline and resource allocation
5. Kick off Phase 1: Foundation

*End of Proposal*
