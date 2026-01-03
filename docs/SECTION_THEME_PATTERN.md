# Section Theme Pattern

This document describes the normalized approach for managing theme variants in marketing section components.

## Overview

Instead of hardcoding dark theme classes (`text-white`, `text-on-dark-*`, `bg-surface-inverse`), marketing components now use **semantic tokens** combined with **section theme CSS classes** that locally override CSS custom properties.

This approach:
- Eliminates inline theme management
- Makes components theme-agnostic
- Enables easy theme switching via a single prop
- Reduces code duplication

## CSS Classes

Three section theme classes are available in `globals.css`:

| Class | Description |
|-------|-------------|
| `.section-dark` | Forces dark theme tokens regardless of page theme |
| `.section-light` | Forces light theme tokens regardless of page theme |
| `.section-inverted` | Inverts tokens relative to current page theme |

### How It Works

These classes locally override CSS custom properties:

```css
.section-dark {
  --surface-primary: #000000;
  --text-primary: #ffffff;
  --text-secondary: #d4d4d4;
  --text-muted: #737373;
  --text-disabled: #525252;
  --border-primary: #404040;
  /* ... */
}
```

Child elements using semantic Tailwind classes automatically respond:

```tsx
// These classes adapt to the section's theme context
<H2 className="text-text-primary">Title</H2>
<Body className="text-text-muted">Description</Body>
```

## Component Implementation

### Props Interface

Replace `background` prop with `variant` or `sectionVariant`:

```tsx
interface MySectionProps {
  /** 
   * Section theme variant
   * - "dark": Force dark theme (default - matches GHXSTSHIP aesthetic)
   * - "light": Force light theme
   * - "inverted": Invert relative to page theme
   */
  variant?: "dark" | "light" | "inverted";
  // ... other props
}
```

### Variant Classes Map

```tsx
const variantClasses = {
  dark: "section-dark bg-surface-primary",
  light: "section-light bg-surface-primary",
  inverted: "section-inverted bg-surface-primary",
};
```

### Section Element

```tsx
<section className={clsx("py-20 md:py-32", variantClasses[variant], className)}>
  {/* Content uses semantic tokens */}
</section>
```

## Token Mapping Reference

When migrating from hardcoded classes to semantic tokens:

| Old (Hardcoded) | New (Semantic) |
|-----------------|----------------|
| `text-white` | `text-text-primary` |
| `text-on-dark-primary` | `text-text-primary` |
| `text-on-dark-secondary` | `text-text-secondary` |
| `text-on-dark-muted` | `text-text-muted` |
| `text-on-dark-disabled` | `text-text-disabled` |
| `bg-surface-inverse` | `bg-surface-primary` (with section class) |
| `bg-black` | `bg-surface-primary` (with section class) |

## Full Example

### Before (Hardcoded)

```tsx
export const MySection = ({ background = "ink" }) => {
  const bgClasses = {
    black: "bg-black text-white",
    ink: "bg-surface-inverse text-on-dark-primary",
  };

  return (
    <section className={bgClasses[background]}>
      <H2 className="text-white">Title</H2>
      <Body className="text-on-dark-muted">Description</Body>
    </section>
  );
};
```

### After (Normalized)

```tsx
export const MySection = ({ variant = "dark" }) => {
  const variantClasses = {
    dark: "section-dark bg-surface-primary",
    light: "section-light bg-surface-primary",
    inverted: "section-inverted bg-surface-primary",
  };

  return (
    <section className={variantClasses[variant]}>
      <H2 className="text-text-primary">Title</H2>
      <Body className="text-text-muted">Description</Body>
    </section>
  );
};
```

## Normalized Marketing Components

The following components have been updated to use this pattern:

- `pricing-section.tsx`
- `hero-section.tsx`
- `cta-banner.tsx`
- `stats-section.tsx`
- `logo-cloud.tsx`
- `feature-grid.tsx`
- `faq-section.tsx`
- `bento-grid.tsx`
- `integration-grid.tsx`
- `testimonial-section.tsx`
- `timeline-section.tsx`
- `team-section.tsx`
- `comparison-table.tsx`
- `video-section.tsx`

## Usage in Pages

```tsx
import { PricingSection, HeroSection, FAQSection } from "@repo/ui";

export default function PricingPage() {
  return (
    <>
      {/* Dark section (default) */}
      <HeroSection variant="dark" title="Pricing" />
      
      {/* Light section for contrast */}
      <PricingSection variant="light" plans={plans} />
      
      {/* Inverted section - adapts to page theme */}
      <FAQSection sectionVariant="inverted" faqs={faqs} />
    </>
  );
}
```

## Best Practices

1. **Default to dark**: The GHXSTSHIP design system uses dark as the primary aesthetic
2. **Use semantic tokens**: Always use `text-text-*` and `bg-surface-*` inside sections
3. **Avoid mixing**: Don't mix hardcoded colors with semantic tokens in the same section
4. **Test both themes**: Verify sections look correct in both light and dark page contexts
5. **Use inverted sparingly**: The inverted variant is best for creating visual contrast on long pages
