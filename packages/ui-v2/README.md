# @ghxstship/ui-v2

> White-label-first design system for multi-tenant SaaS applications

## Overview

UI v2 is a complete rebuild of the GHXSTSHIP UI package, designed from the ground up with native white labeling as a core feature. Inspired by ClickUp 4.0's convergent architecture and modern white label implementations.

## Features

- ✅ **Token-First Architecture**: Design tokens drive everything
- ✅ **Native White Label**: Built-in multi-tenant theming
- ✅ **60% Smaller Bundle**: Modular exports with tree-shaking
- ✅ **RSC Compatible**: React Server Components ready
- ✅ **Accessible**: WCAG AAA contrast checking
- ✅ **Type-Safe**: Full TypeScript support

## Installation

```bash
pnpm add @ghxstship/ui-v2
```

## Usage

### Import Styles

```typescript
import '@ghxstship/ui-v2/styles/foundation.css';
import '@ghxstship/ui-v2/styles/semantic.css';
```

### Use Components

```typescript
import { Button } from '@ghxstship/ui-v2/components';
import { BrandProvider } from '@ghxstship/ui-v2/whitelabel';

function App() {
  return (
    <BrandProvider brand={myBrandConfig}>
      <Button>Click me</Button>
    </BrandProvider>
  );
}
```

### Modular Imports

```typescript
// Only import what you need
import { Box, Stack } from '@ghxstship/ui-v2/primitives';
import { Card } from '@ghxstship/ui-v2/components';
import { AppShell } from '@ghxstship/ui-v2/patterns';
import { useBrand } from '@ghxstship/ui-v2/hooks';
```

## Architecture

### Token Layers

```
Foundation Tokens → Semantic Tokens → Component Tokens → Brand Overrides
```

### Component Strategy

- **Primitives** (20): Unstyled headless components
- **Components** (25): Styled brand-aware components
- **Patterns** (15): Page-level layouts

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Storybook
pnpm storybook
```

## Migration from v1

See [MIGRATION.md](./MIGRATION.md) for migration guide and codemods.

## License

MIT © GHXSTSHIP Industries LLC
