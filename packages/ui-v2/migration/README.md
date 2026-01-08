# UI v2 Migration Tools

Automated migration utilities to help migrate from `@ghxstship/ui` v1 to v2.

## Contents

- **component-mapping.json** - Complete mapping of v1 → v2 components
- **MIGRATION_GUIDE.md** - Comprehensive migration guide (../MIGRATION_GUIDE.md)
- **codemods/** - JSCodeshift codemods for automated refactoring (coming soon)
- **cli/** - CLI tool for migration assistance (coming soon)

## Usage

### 1. Component Mapping

The `component-mapping.json` file contains:
- Component renames
- Import path changes
- Prop name changes
- Value transformations
- Removed/replaced components
- New components

Use this for reference or programmatic migrations.

### 2. Manual Migration

Follow the migration guide in `../MIGRATION_GUIDE.md` for step-by-step instructions.

### 3. Automated Migration (Coming Soon)

```bash
# Install migration CLI
pnpm add -D @ghxstship/ui-v2-migrate

# Analyze codebase
npx ui-v2-migrate analyze ./src

# Run migrations
npx ui-v2-migrate all ./src
```

## Migration Strategy

1. **Gradual Migration** (Recommended)
   - Migrate one page/feature at a time
   - Keep v1 and v2 side-by-side during transition
   - Test thoroughly after each migration

2. **Big Bang Migration**
   - For smaller codebases
   - Use codemods for bulk changes
   - Test extensively before deploying

## Common Transformations

### Import Path Changes

```typescript
// Before
import { Button, Card } from '@ghxstship/ui';

// After
import { Button } from '@ghxstship/ui-v2/primitives';
import { Card } from '@ghxstship/ui-v2/components';
```

### Prop Changes

```typescript
// Boolean props: isOpen → open
<Modal isOpen={true} />
<Dialog open />

// Size values: large → lg, small → sm
<Button size="large" />
<Button size="lg" />

// Renamed props: isInvalid → error
<Input isInvalid />
<Input error="Error message" />
```

### Compound Components

```typescript
// Before: Prop-based
<Card title="Title">Content</Card>

// After: Compound components
<Card>
  <Card.Title>Title</Card.Title>
  <Card.Content>Content</Card.Content>
</Card>
```

## Support

For migration help:
- See `../MIGRATION_GUIDE.md`
- Check component mapping in `component-mapping.json`
- Contact #ui-v2-migration on Slack

## Development

To extend these migration tools:

1. Add new mappings to `component-mapping.json`
2. Create codemods in `codemods/` directory
3. Update CLI tool in `cli/` directory
4. Update migration guide

## License

MIT
