# @ghxstship/ui

GHXSTSHIP Design System - Contemporary Minimal Pop Art

## Overview

A comprehensive atomic design system implementing GHXSTSHIP's unique visual identity: stark black and white contrast with strategic greyscale, bold geometric shapes, and high-impact typography.

## Design Philosophy

- **Monochromatic Excellence**: Pure black (#000000) and white (#FFFFFF) with 9 strategic grey tones
- **Bold Typography**: ANTON for display, BEBAS NEUE for headings, SHARE TECH for body, SHARE TECH MONO for metadata
- **Geometric Precision**: Hard edges, no gradients, flat color blocks
- **Pop Art Impact**: High contrast imagery, halftone patterns, screen print aesthetic
- **Accessibility First**: WCAG 2.1 AA compliant, 48px minimum touch targets, semantic HTML

## Installation

```bash
pnpm add @ghxstship/ui
```

## Usage

```tsx
import {
  Button,
  Hero,
  Navigation,
  Footer,
  ProjectCard,
  H2,
  Body,
} from "@ghxstship/ui";

function MyPage() {
  return (
    <div>
      <Hero
        title="GHXSTSHIP"
        subtitle="We Create Beyond Reality"
        background="black"
        pattern="halftone"
        cta={<Button variant="solid">Get Started</Button>}
      />
    </div>
  );
}
```

## Components

### Atoms

**Typography**
- `Display` - Hero headlines (ANTON)
- `H1` - `H6` - Heading hierarchy (ANTON/BEBAS NEUE)
- `Body` - Paragraph text (SHARE TECH)
- `Label` - Metadata, tags (SHARE TECH MONO)

**Form Inputs**
- `Input` - Text input
- `Textarea` - Multi-line input
- `Select` - Dropdown select
- `Checkbox` - Checkbox input
- `Radio` - Radio button
- `Switch` - Toggle switch

**UI Elements**
- `Button` - Primary actions (solid, outline, ghost variants)
- `Badge` - Status indicators
- `Divider` - Section separators
- `Spinner` - Loading indicator
- `Icon` - Geometric icons (Arrow, Check, X, Menu, etc.)
- `SocialIcon` - Social media icons (Instagram, Twitter, LinkedIn, etc.)

### Molecules

- `Field` - Form field with label and validation
- `Card` / `CardHeader` / `CardBody` / `CardFooter` - Content containers
- `ButtonGroup` - Button groupings
- `StatCard` - Metric display cards
- `ProjectCard` - Project showcase cards with images
- `ServiceCard` - Service offering cards
- `Alert` - Notification messages (success, error, warning, info)
- `Table` / `TableHeader` / `TableBody` / `TableRow` / `TableHead` / `TableCell` - Data tables
- `Pagination` - Page navigation
- `Breadcrumb` / `BreadcrumbItem` - Navigation trail
- `Tabs` / `TabsList` / `Tab` / `TabPanel` - Tab interface
- `Dropdown` / `DropdownItem` - Dropdown menus
- `Newsletter` - Email signup form

### Organisms

- `Modal` / `ModalHeader` / `ModalBody` / `ModalFooter` - Dialog overlays
- `Navigation` / `NavLink` - Site header navigation
- `Footer` / `FooterColumn` / `FooterLink` - Site footer
- `Hero` - Full-screen hero sections with patterns
- `FormWizard` / `FormStep` - Multi-step forms
- `ImageGallery` - Photo galleries with lightbox

### Templates

- `PageLayout` - Full page wrapper with header/footer
- `SectionLayout` - Content section wrapper

### Foundations

- `Container` - Max-width content wrapper
- `Section` - Semantic section element
- `Grid` - Grid layout system
- `Stack` - Vertical/horizontal stacking

## Design Tokens

```tsx
import { colors, typography, spacing, fontSizes } from "@ghxstship/ui";

// Colors
colors.black // #000000
colors.white // #FFFFFF
colors.grey100 - colors.grey900 // Greyscale palette

// Typography
typography.display // ANTON
typography.heading // BEBAS NEUE
typography.body // SHARE TECH
typography.mono // SHARE TECH MONO

// Spacing
spacing[0] - spacing[32] // 0 to 128px

// Transitions
transitions.fast // 100ms
transitions.base // 200ms
transitions.slow // 300ms
```

## Font Loading

```tsx
import { getGoogleFontsUrl, fontVariables } from "@ghxstship/ui";

// In Next.js app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <link href={getGoogleFontsUrl()} rel="stylesheet" />
      </head>
      <body style={fontVariables}>{children}</body>
    </html>
  );
}
```

## Examples

See `/apps/gvteway/src/app/design-system/page.tsx` for comprehensive component examples.

## Contributing

Follow atomic design principles:
1. **Atoms** - Basic building blocks (buttons, inputs, typography)
2. **Molecules** - Simple component groups (cards, form fields)
3. **Organisms** - Complex UI sections (navigation, modals)
4. **Templates** - Page-level layouts

All components must:
- Use design system tokens
- Include TypeScript types
- Support ref forwarding
- Follow accessibility guidelines
- Include proper ARIA labels

## License

Proprietary - GHXSTSHIP Industries © 2024
