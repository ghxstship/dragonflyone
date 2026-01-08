# UI v2 Migration Guide

**From:** `@ghxstship/ui` v1.x
**To:** `@ghxstship/ui-v2` v2.0
**Last Updated:** 2026-01-08

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Migration Strategy](#migration-strategy)
4. [Component Mapping](#component-mapping)
5. [API Changes](#api-changes)
6. [White Label Setup](#white-label-setup)
7. [Step-by-Step Migration](#step-by-step-migration)
8. [Automated Migration Tools](#automated-migration-tools)
9. [Common Patterns](#common-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Overview

UI v2 is a complete rebuild of the design system with a focus on:
- **White label first**: Built for multi-tenant from the ground up
- **Tree-shakeable**: Modular architecture reduces bundle size by ~60%
- **Token-based theming**: Single brand color generates complete palette
- **Type safety**: Full TypeScript with improved generic types
- **RSC compatible**: Works with React Server Components
- **Accessibility**: WCAG AAA compliance built-in

### Key Improvements

- **Bundle Size**: 165 components → 60 components (~180KB → ~100KB)
- **Tree Shaking**: Modular exports with 8 entry points
- **White Label**: Zero FOUC with build-time CSS injection
- **Patterns**: 15 new opinionated page/feature templates
- **Accessibility**: Full ARIA support, keyboard navigation
- **Performance**: Optimized for React 18/19

---

## Breaking Changes

### 1. Package Name Change
```typescript
// ❌ Old
import { Button } from '@ghxstship/ui';

// ✅ New
import { Button } from '@ghxstship/ui-v2/primitives';
```

### 2. Modular Imports Required
```typescript
// ❌ Old - All components from one entry
import { Button, Card, Badge } from '@ghxstship/ui';

// ✅ New - Import from specific paths for tree-shaking
import { Button } from '@ghxstship/ui-v2/primitives';
import { Card, Badge } from '@ghxstship/ui-v2/components';
```

### 3. White Label Setup Required
```typescript
// ❌ Old - No setup needed
import '@ghxstship/ui/styles.css';

// ✅ New - Wrap app with BrandProvider
import { BrandProvider } from '@ghxstship/ui-v2/whitelabel';
import '@ghxstship/ui-v2/styles/foundation.css';
import '@ghxstship/ui-v2/styles/semantic.css';

<BrandProvider brand={brandConfig}>
  <App />
</BrandProvider>
```

### 4. Component API Changes

Many components have simplified APIs with better TypeScript support:

```typescript
// ❌ Old
<Button variant="primary" size="large" loading={true}>

// ✅ New
<Button variant="primary" size="lg" loading>
```

### 5. Compound Components

Several components now use compound component pattern:

```typescript
// ❌ Old
<Card title="Title" description="Desc" footer={<Button />}>
  Content
</Card>

// ✅ New
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Desc</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>
    <Button />
  </Card.Footer>
</Card>
```

---

## Migration Strategy

### Recommended Approach: Gradual Migration

1. **Phase 1: Setup** (1 day)
   - Install `@ghxstship/ui-v2`
   - Keep `@ghxstship/ui` installed
   - Set up BrandProvider
   - Configure brand tokens

2. **Phase 2: New Features** (1 week)
   - Use v2 for all new components
   - Use pattern components for new pages
   - Build confidence with v2 APIs

3. **Phase 3: Page-by-Page** (2-4 weeks)
   - Migrate one page at a time
   - Start with simple pages
   - Use codemods for bulk changes
   - Test thoroughly after each page

4. **Phase 4: Cleanup** (1 week)
   - Remove v1 dependency
   - Clean up unused imports
   - Performance optimization
   - Final testing

### Alternative: Big Bang Migration

For smaller apps (<20 components), you can migrate all at once:

1. Run codemods across entire codebase
2. Fix TypeScript errors
3. Update imports
4. Test thoroughly
5. Deploy

---

## Component Mapping

### Primitives

| v1 Component | v2 Component | Import Path | Changes |
|--------------|--------------|-------------|---------|
| `Button` | `Button` | `primitives` | Size prop: `large` → `lg`, `small` → `sm` |
| `Input` | `Input` | `primitives` | Added `error` prop |
| `Text` | `Text` | `primitives` | Added polymorphic `as` prop |
| `Heading` | `Heading` | `primitives` | Added `level` prop for semantic HTML |
| `Box` | `Box` | `primitives` | New polymorphic component |
| `Stack` | `Stack` | `primitives` | Replaces `VStack`/`HStack` |
| `Grid` | `Grid` | `primitives` | Simplified API |
| `Flex` | `Flex` | `primitives` | New component |

### Compositions

| v1 Component | v2 Component | Import Path | Changes |
|--------------|--------------|-------------|---------|
| `Card` | `Card` | `components` | Now uses compound components |
| `Badge` | `Badge` | `components` | Simplified variants |
| `Alert` | `Alert` | `components` | Added `title` prop |
| `Modal` | `Dialog` | `components` | Renamed, improved API |
| `Tooltip` | `Tooltip` | `components` | Added placement options |
| `Dropdown` | `Dropdown` | `components` | Simplified menu API |
| `Tabs` | `Tabs` | `components` | Added variant support |
| `Table` | `Table` | `components` | Complete rewrite with TypeScript generics |

### Removed Components

These components have been consolidated or replaced:

| v1 Component | v2 Replacement | Reason |
|--------------|----------------|--------|
| `PrimaryButton` | `<Button variant="primary">` | Use variant prop |
| `SecondaryButton` | `<Button variant="secondary">` | Use variant prop |
| `VStack` | `<Stack direction="vertical">` | Consolidated |
| `HStack` | `<Stack direction="horizontal">` | Consolidated |
| `FormLabel` | `<Label>` | Renamed for clarity |
| `FormHelperText` | `<Field hint="...">` | Part of Field component |

### New Components

v2 includes many new components not in v1:

**Primitives:**
- `Container`, `Separator`, `Code`, `Label`, `Progress`, `Skeleton`, `Avatar`

**Compositions:**
- `Chip`, `EmptyState`, `Banner`, `Toast`, `ErrorBoundary`, `Nav`, `Sidebar`, `Menu`, `Popover`, `Sheet`, `Fieldset`, `FormGroup`

**Patterns (NEW):**
- `AppShell`, `PageHeader`, `PageContent`, `PageFooter`
- `SignInForm`, `SignUpForm`, `ResetPasswordForm`, `MFAForm`
- `ListPage`, `GridPage`, `BoardPage`, `DetailPage`, `EditPage`, `CreatePage`
- `DashboardGrid`, `WidgetContainer`, `StatCard`

---

## API Changes

### Button

```typescript
// ❌ v1
<Button
  variant="primary"
  size="large"
  loading={true}
  disabled={true}
>

// ✅ v2
<Button
  variant="primary"
  size="lg"
  loading
  disabled
>
```

### Card

```typescript
// ❌ v1
<Card
  title="Title"
  subtitle="Subtitle"
  actions={<Button>Action</Button>}
>
  Content
</Card>

// ✅ v2
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Subtitle</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

### Modal → Dialog

```typescript
// ❌ v1
<Modal
  isOpen={open}
  onClose={onClose}
  title="Title"
>
  Content
</Modal>

// ✅ v2
<Dialog
  open={open}
  onClose={onClose}
  title="Title"
>
  Content
</Dialog>
```

### Table

```typescript
// ❌ v1
<Table
  columns={['Name', 'Email', 'Role']}
  data={users}
/>

// ✅ v2 - Type-safe with generics
<Table<User>
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' }
  ]}
  data={users}
  rowKey="id"
/>
```

### Form Fields

```typescript
// ❌ v1
<FormControl>
  <FormLabel>Email</FormLabel>
  <Input type="email" />
  <FormHelperText>Enter your email</FormHelperText>
  <FormErrorMessage>Invalid email</FormErrorMessage>
</FormControl>

// ✅ v2 - Simplified with Field
<Field
  label="Email"
  hint="Enter your email"
  error={errors.email}
>
  <Input type="email" />
</Field>
```

---

## White Label Setup

### 1. Create Brand Configuration

```typescript
// config/brand.ts
import type { BrandConfig } from '@ghxstship/ui-v2/tokens';

export const defaultBrand: BrandConfig = {
  identity: {
    name: 'ATLVS',
    brandColor: '#7B68EE', // Medium Purple
  },
  colors: {
    // Optional: Override specific colors
    // Will use generated palette if not specified
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'Fira Code, monospace',
    },
  },
  design: {
    radius: 'md',
    mode: 'rounded',
  },
  features: {
    animations: true,
    darkMode: true,
  },
};
```

### 2. Wrap Application

```typescript
// app/layout.tsx or app/App.tsx
import { BrandProvider } from '@ghxstship/ui-v2/whitelabel';
import { defaultBrand } from './config/brand';
import '@ghxstship/ui-v2/styles/foundation.css';
import '@ghxstship/ui-v2/styles/semantic.css';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <BrandProvider brand={defaultBrand}>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
```

### 3. Server-Side Rendering (Optional)

```typescript
// For zero FOUC with SSR
import { BrandStyles } from '@ghxstship/ui-v2/whitelabel';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <BrandStyles brand={defaultBrand} />
      </head>
      <body>
        <BrandProvider brand={defaultBrand}>
          {children}
        </BrandProvider>
      </body>
    </html>
  );
}
```

---

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
# Install v2
pnpm add @ghxstship/ui-v2

# Keep v1 during migration (optional)
# pnpm add @ghxstship/ui (keep existing)
```

### Step 2: Set Up Brand Configuration

1. Create `config/brand.ts` with your brand configuration
2. Add CSS imports to your root layout
3. Wrap app with `BrandProvider`

### Step 3: Update Imports (Automated)

Run the migration CLI:

```bash
npx @ghxstship/ui-v2-migrate imports ./src
```

Or manually update:

```typescript
// Before
import { Button, Card, Badge } from '@ghxstship/ui';

// After
import { Button } from '@ghxstship/ui-v2/primitives';
import { Card, Badge } from '@ghxstship/ui-v2/components';
```

### Step 4: Update Component Props

```bash
npx @ghxstship/ui-v2-migrate props ./src
```

This will:
- Convert `isOpen` → `open`
- Convert size props (`large` → `lg`, `small` → `sm`)
- Update variant names
- Convert to compound components where applicable

### Step 5: Test & Fix

1. Run TypeScript compiler: `pnpm typecheck`
2. Fix any remaining TypeScript errors
3. Test each page manually
4. Run automated tests

### Step 6: Clean Up

```bash
# Remove v1 once migration is complete
pnpm remove @ghxstship/ui
```

---

## Automated Migration Tools

### CLI Tool

```bash
# Install migration CLI
pnpm add -D @ghxstship/ui-v2-migrate

# Analyze codebase
npx ui-v2-migrate analyze ./src

# Run all migrations
npx ui-v2-migrate all ./src

# Run specific migrations
npx ui-v2-migrate imports ./src
npx ui-v2-migrate props ./src
npx ui-v2-migrate compound ./src
```

### Codemods

```bash
# Using jscodeshift directly
npx jscodeshift -t node_modules/@ghxstship/ui-v2-migrate/codemods/imports.js ./src
npx jscodeshift -t node_modules/@ghxstship/ui-v2-migrate/codemods/props.js ./src
npx jscodeshift -t node_modules/@ghxstship/ui-v2-migrate/codemods/compound.js ./src
```

---

## Common Patterns

### Pattern 1: Modal → Dialog

```typescript
// Before
<Modal isOpen={open} onClose={onClose} title="Confirm">
  <ModalBody>Are you sure?</ModalBody>
  <ModalFooter>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Confirm</Button>
  </ModalFooter>
</Modal>

// After
<Dialog open={open} onClose={onClose} title="Confirm">
  Are you sure?
  <Flex gap="2">
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="primary" onClick={onConfirm}>Confirm</Button>
  </Flex>
</Dialog>
```

### Pattern 2: Form with Validation

```typescript
// Before
<form>
  <FormControl isInvalid={!!errors.email}>
    <FormLabel>Email</FormLabel>
    <Input type="email" {...register('email')} />
    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
  </FormControl>
</form>

// After
<form>
  <Field label="Email" error={errors.email?.message}>
    <Input type="email" {...register('email')} />
  </Field>
</form>
```

### Pattern 3: Using New Pattern Components

```typescript
// Before - Manual layout
<div>
  <header>
    <h1>{title}</h1>
    <Button>Create</Button>
  </header>
  <Table />
  <Pagination />
</div>

// After - Use ListPage pattern
<ListPage
  title={title}
  actions={<Button>Create</Button>}
  columns={columns}
  data={data}
  pagination={<Pagination />}
/>
```

---

## Troubleshooting

### Issue: "Module not found"

**Problem:** Import paths are incorrect

**Solution:** Use modular imports:
```typescript
import { Button } from '@ghxstship/ui-v2/primitives';
import { Card } from '@ghxstship/ui-v2/components';
```

### Issue: "Styles not applied"

**Problem:** Missing CSS imports or BrandProvider

**Solution:**
```typescript
// Add to root
import '@ghxstship/ui-v2/styles/foundation.css';
import '@ghxstship/ui-v2/styles/semantic.css';

// Wrap with provider
<BrandProvider brand={config}>
```

### Issue: "Type errors with Table component"

**Problem:** Generic types not specified

**Solution:**
```typescript
// Add type parameter
<Table<User> columns={columns} data={data} />
```

### Issue: "Compound component props not working"

**Problem:** Trying to use old prop-based API

**Solution:** Convert to compound components:
```typescript
// Instead of <Card title="...">
<Card>
  <Card.Title>...</Card.Title>
</Card>
```

---

## Support

- **Documentation:** [Link to docs]
- **Examples:** `packages/ui-v2/examples`
- **Issues:** GitHub Issues
- **Migration Help:** Slack #ui-v2-migration

---

**Last Updated:** 2026-01-08
**Version:** 2.0.0-alpha.1
