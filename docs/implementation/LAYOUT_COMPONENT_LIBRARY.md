# Layout Component Library

> **Phase 2 Deliverable** — Normalized layout system documentation  
> **Date**: November 2024  
> **Reference**: `docs/design/STYLE-GUIDE-PREVIEW.jsx`

---

## Overview

The GHXSTSHIP layout system follows atomic design principles with a **Bold Contemporary Pop Art Adventure** aesthetic. This document describes all available layout components and their usage.

---

## Architecture

```
FOUNDATIONS (primitives)
├── Container      - Max-width wrapper with responsive padding
├── Section        - Semantic section with background, border, header
├── Grid           - Responsive grid system (1-12 cols)
├── Stack          - Flexbox vertical/horizontal stacking
├── Box            - Generic container with variants
└── Semantic       - Main, Header, Article, Aside, Nav, Figure

PAGE REGIONS (semantic areas)
├── PageHeader     - Standardized page header with kicker, title, actions
├── PageContent    - Main content area with consistent padding
├── PageFooter     - Page-level footer (distinct from site footer)
├── SplitLayout    - Two-column layout (main + aside)
├── FullBleedSection - Edge-to-edge section with pattern support
└── ContentRegion  - Generic content region with semantic meaning

TEMPLATES (full pages)
├── PageLayout     - Base page structure with header/footer slots
├── DashboardPage  - Sidebar + content layout
├── DetailPage     - Entity detail view with tabs/sidebar
├── ListPage       - Data table page with filters/actions
├── ErrorPage      - Error state template
└── NotFoundPage   - 404 state template

PATTERNS (decorative)
├── GridPattern    - Grid background overlay
├── HalftonePattern - Dot/halftone pattern
└── HeroHalftone   - Pre-configured hero overlay
```

---

## Foundation Components

### Container

Max-width wrapper with responsive horizontal padding.

```tsx
import { Container } from "@ghxstship/ui";

<Container size="lg">
  {/* Content constrained to max-width */}
</Container>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"lg"` | Max-width constraint |
| `className` | `string` | - | Additional classes |

**Size Reference:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `full`: 100%

---

### Section

Semantic section wrapper with optional header, background, and border.

```tsx
import { Section } from "@ghxstship/ui";

<Section
  kicker="Platform Overview"
  title="Dashboard"
  description="Monitor your operations in real-time"
  background="black"
  border
>
  {/* Section content */}
</Section>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `background` | `"white" \| "black" \| "grey" \| "ink" \| "transparent"` | - | Background color |
| `fullWidth` | `boolean` | `false` | Skip container wrapper |
| `noPadding` | `boolean` | `false` | Remove vertical padding |
| `border` | `boolean` | `false` | Add border styling |
| `kicker` | `string` | - | Small text above title |
| `title` | `string \| ReactNode` | - | Section title |
| `description` | `string \| ReactNode` | - | Description below title |
| `align` | `"left" \| "center" \| "right"` | `"left"` | Header alignment |
| `gap` | `number` | `6` | Gap between elements |

---

### Grid

Responsive grid layout with configurable columns.

```tsx
import { Grid } from "@ghxstship/ui";

<Grid cols={3} gap={6}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` / `columns` | `1 \| 2 \| 3 \| 4 \| 6 \| 12` | `1` | Number of columns |
| `gap` | `number \| "sm" \| "md" \| "lg" \| "xl"` | `6` | Gap between items |

**Responsive Behavior:**
- 1 col: Always 1 column
- 2 cols: 1 on mobile, 2 on md+
- 3 cols: 1 on mobile, 2 on md, 3 on lg+
- 4 cols: 1 on mobile, 2 on md, 4 on lg+

---

### Stack

Flexbox stacking utility for vertical/horizontal layouts.

```tsx
import { Stack } from "@ghxstship/ui";

<Stack direction="horizontal" gap={4}>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Stack>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `"vertical" \| "horizontal"` | `"vertical"` | Stack direction |
| `gap` | `number` | `4` | Gap between items |

---

## Page Region Components

### PageHeader

Standardized page header with kicker, title, description, and actions.

```tsx
import { PageHeader, Button } from "@ghxstship/ui";

<PageHeader
  kicker="Asset Management"
  title="Equipment Inventory"
  description="Track and manage all production equipment"
  actions={
    <Button variant="solid">Add Asset</Button>
  }
  inverted
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `kicker` | `string` | - | Small text above title |
| `title` | `string \| ReactNode` | **required** | Main title |
| `description` | `string \| ReactNode` | - | Description text |
| `actions` | `ReactNode` | - | Action buttons |
| `align` | `"left" \| "center"` | `"left"` | Content alignment |
| `displayTitle` | `boolean` | `false` | Use Display typography |
| `inverted` | `boolean` | `true` | Dark theme |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Size variant |

---

### PageContent

Main content area with consistent padding and container.

```tsx
import { PageContent } from "@ghxstship/ui";

<PageContent size="lg" padding="md">
  {/* Page content */}
</PageContent>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"lg"` | Container size |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Vertical padding |
| `inverted` | `boolean` | `true` | Dark theme |

---

### SplitLayout

Two-column layout with main content and sidebar.

```tsx
import { SplitLayout } from "@ghxstship/ui";

<SplitLayout
  main={<MainContent />}
  aside={<Sidebar />}
  asidePosition="right"
  asideWidth={4}
  gap="lg"
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `main` | `ReactNode` | **required** | Main content |
| `aside` | `ReactNode` | **required** | Sidebar content |
| `asidePosition` | `"left" \| "right"` | `"right"` | Sidebar position |
| `asideWidth` | `3 \| 4 \| 5` | `4` | Sidebar width (out of 12) |
| `gap` | `"sm" \| "md" \| "lg"` | `"md"` | Gap between columns |
| `stackOnMobile` | `boolean` | `true` | Stack on mobile |
| `reverseOnMobile` | `boolean` | `false` | Reverse order on mobile |

---

### FullBleedSection

Edge-to-edge section with optional pattern overlay.

```tsx
import { FullBleedSection, Container } from "@ghxstship/ui";

<FullBleedSection background="black" pattern="grid" patternOpacity={0.03}>
  <Container className="py-16">
    {/* Full-width content */}
  </Container>
</FullBleedSection>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `background` | `"black" \| "white" \| "grey" \| "ink" \| "primary" \| "accent"` | `"black"` | Background color |
| `pattern` | `"grid" \| "halftone" \| "none"` | `"none"` | Pattern overlay |
| `patternOpacity` | `number` | `0.03` | Pattern opacity |

---

## Template Components

### PageLayout

Base page structure with header and footer slots.

```tsx
import { PageLayout, Navigation, Footer } from "@ghxstship/ui";

<PageLayout
  background="black"
  header={<Navigation />}
  footer={<Footer />}
>
  {/* Page content */}
</PageLayout>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | - | Header/navigation |
| `footer` | `ReactNode` | - | Footer content |
| `background` | `"white" \| "black"` | `"white"` | Background color |

---

### DashboardPage

Sidebar navigation layout for dashboard-style pages.

```tsx
import { DashboardPage } from "@ghxstship/ui";

const navigation = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <HomeIcon /> },
      { label: "Projects", href: "/projects", icon: <FolderIcon /> },
    ],
  },
];

<DashboardPage
  navigation={navigation}
  currentPath="/dashboard"
  logo={<Logo />}
  header={{
    kicker: "Overview",
    title: "Dashboard",
    description: "Welcome back",
    actions: <Button>New Project</Button>,
  }}
>
  {/* Dashboard content */}
</DashboardPage>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navigation` | `SidebarSection[]` | **required** | Sidebar navigation |
| `currentPath` | `string` | **required** | Current active path |
| `logo` | `ReactNode` | - | Logo element |
| `sidebarFooter` | `ReactNode` | - | Sidebar footer |
| `header` | `object` | - | Page header config |
| `inverted` | `boolean` | `true` | Dark theme |

---

### DetailPage

Entity detail view with optional tabs and sidebar.

```tsx
import { DetailPage } from "@ghxstship/ui";

<DetailPage
  navigation={<Navigation />}
  header={{
    kicker: "Asset Details",
    title: "Meyer Sound LEO Array",
    description: "Production audio equipment",
  }}
  backButton={{ label: "Back to Assets", href: "/assets" }}
  actions={<Button>Edit</Button>}
  tabs={[
    { id: "overview", label: "Overview", content: <Overview /> },
    { id: "history", label: "History", content: <History /> },
    { id: "maintenance", label: "Maintenance", content: <Maintenance /> },
  ]}
  sidebar={<AssetSidebar />}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navigation` | `ReactNode` | - | Navigation component |
| `header` | `object` | **required** | Page header config |
| `actions` | `ReactNode` | - | Action buttons |
| `backButton` | `object` | - | Back navigation config |
| `children` | `ReactNode` | - | Main content (if no tabs) |
| `tabs` | `DetailPageTab[]` | - | Tab configuration |
| `defaultTabIndex` | `number` | `0` | Default active tab |
| `sidebar` | `ReactNode` | - | Sidebar content |
| `sidebarPosition` | `"left" \| "right"` | `"right"` | Sidebar position |
| `inverted` | `boolean` | `true` | Dark theme |

---

### ListPage

Data table page with search, filters, and actions.

```tsx
import { ListPage } from "@ghxstship/ui";

<ListPage
  title="Assets"
  subtitle="Production equipment inventory"
  data={assets}
  columns={columns}
  rowKey="id"
  filters={filters}
  rowActions={rowActions}
  bulkActions={bulkActions}
  onCreate={() => setCreateModalOpen(true)}
  onExport={() => exportData()}
  stats={[
    { label: "Total Assets", value: 156 },
    { label: "Total Value", value: "$2.4M" },
  ]}
  header={<Navigation />}
/>
```

See `ListPage` component documentation for full props reference.

---

## Pattern Components

### GridPattern / HalftonePattern

Decorative background patterns.

```tsx
import { GridPattern, HalftonePattern } from "@ghxstship/ui";

// Grid pattern overlay
<GridPattern variant="subtle">
  {children}
</GridPattern>

// Halftone pattern
<HalftonePattern
  pattern="dots"
  size={4}
  spacing={8}
  color="white"
  opacity={0.1}
  overlay
>
  {children}
</HalftonePattern>
```

---

## App Layout Wrappers

Each app has its own layout wrapper that combines the base templates with app-specific navigation and styling.

### Usage Pattern

```tsx
// apps/atlvs/src/components/app-layout.tsx
import { PageLayout, Footer, Container, Section } from "@ghxstship/ui";

export function AtlvsAppLayout({ children, variant, ...props }) {
  return (
    <PageLayout
      background="black"
      header={<Navigation variant={variant} />}
      footer={<Footer />}
    >
      <Section background="black" className="relative min-h-screen">
        <GridPattern />
        <Container className="relative z-10 py-8">
          {children}
        </Container>
      </Section>
    </PageLayout>
  );
}
```

### Available Wrappers

| App | Component | Default Theme |
|-----|-----------|---------------|
| ATLVS | `AtlvsAppLayout` | Dark (B2B) |
| COMPVSS | `CompvssAppLayout` | Light/Dark |
| GVTEWAY | `GvtewayAppLayout` | Dark (Consumer) |

---

## Migration Guide

### From Raw Section + Container

**Before:**
```tsx
<Section className="relative min-h-screen bg-ink-950">
  <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{...}} />
  <Container className="py-8">
    <h1>Page Title</h1>
    {children}
  </Container>
</Section>
```

**After:**
```tsx
<FullBleedSection background="ink" pattern="grid">
  <PageContent>
    <PageHeader title="Page Title" />
    {children}
  </PageContent>
</FullBleedSection>
```

### From Manual Headers

**Before:**
```tsx
<Stack gap={6}>
  <Label className="text-on-dark-muted uppercase tracking-wider">Kicker</Label>
  <H1 className="text-white">Page Title</H1>
  <Body className="text-on-dark-secondary">Description</Body>
</Stack>
```

**After:**
```tsx
<PageHeader
  kicker="Kicker"
  title="Page Title"
  description="Description"
  inverted
/>
```

---

## Spacing Reference

Per the style guide, use these spacing values:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Micro gaps |
| `gap-2` | 8px | Tight gaps |
| `gap-4` | 16px | Base padding |
| `gap-6` | 24px | Section padding |
| `gap-8` | 32px | Large gaps |
| `gap-12` | 48px | Section margins |
| `py-16` | 64px | Page sections |

---

## Accessibility

All layout components include:
- Semantic HTML elements (`<main>`, `<header>`, `<section>`, `<article>`, `<aside>`)
- Proper ARIA attributes where needed
- `aria-hidden="true"` on decorative elements
- Focus management in interactive layouts

---

*Document generated as part of Layout System Overhaul Phase 2*
