# Codemods for UI v2 Migration

Automated code transformation scripts using [jscodeshift](https://github.com/facebook/jscodeshift).

## Available Codemods

### 1. Import Path Transform
**File:** `transform-imports.js`

Transforms v1 imports to v2 modular imports.

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-imports.js apps/atlvs/src
```

**Before:**
```typescript
import { Button, Card, Badge } from '@ghxstship/ui';
```

**After:**
```typescript
import { Button } from '@ghxstship/ui-v2/primitives';
import { Card, Badge } from '@ghxstship/ui-v2/components';
```

### 2. Boolean Props Transform
**File:** `transform-boolean-props.js`

Removes `is` prefix from boolean props.

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-boolean-props.js apps/atlvs/src
```

**Before:**
```typescript
<Modal isOpen={true} />
<Button isLoading={loading} isDisabled={disabled} />
```

**After:**
```typescript
<Modal open />
<Button loading={loading} disabled={disabled} />
```

### 3. Size Props Transform
**File:** `transform-size-props.js`

Converts size prop values.

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-size-props.js apps/atlvs/src
```

**Before:**
```typescript
<Button size="large" />
<Input size="small" />
```

**After:**
```typescript
<Button size="lg" />
<Input size="sm" />
```

### 4. Modal to Dialog Transform
**File:** `transform-modal-to-dialog.js`

Converts Modal components to Dialog.

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-modal-to-dialog.js apps/atlvs/src
```

**Before:**
```typescript
<Modal isOpen={open} onClose={onClose} />
```

**After:**
```typescript
<Dialog open={open} onClose={onClose} />
```

### 5. Card Compound Transform
**File:** `transform-card-compound.js`

Converts prop-based Card to compound components.

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-card-compound.js apps/atlvs/src
```

**Before:**
```typescript
<Card title="Title" subtitle="Subtitle">Content</Card>
```

**After:**
```typescript
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Subtitle</Card.Description>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

### 6. Stack Transform
**File:** `transform-stack.js`

Converts VStack/HStack to Stack component.

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-stack.js apps/atlvs/src
```

**Before:**
```typescript
<VStack spacing={4}>
<HStack spacing={2}>
```

**After:**
```typescript
<Stack direction="vertical" gap="4">
<Stack direction="horizontal" gap="2">
```

## Installation

```bash
# Install jscodeshift globally
npm install -g jscodeshift

# Or use with npx (no installation needed)
npx jscodeshift --help
```

## Usage

### Run Single Codemod

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/[codemod-name].js [target-directory]
```

### Run All Codemods

```bash
# Create a script or run sequentially
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-imports.js apps/atlvs/src
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-boolean-props.js apps/atlvs/src
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-size-props.js apps/atlvs/src
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-modal-to-dialog.js apps/atlvs/src
```

### Dry Run (Preview Changes)

```bash
npx jscodeshift -t [codemod].js --dry --print [target-directory]
```

### Options

- `--dry` - Dry run (no changes written)
- `--print` - Print transformed files
- `--parser` - Parser to use (babylon, flow, ts, tsx)
- `--extensions` - File extensions to transform (default: js)

## Testing Codemods

Test on a single file first:

```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-imports.js apps/atlvs/src/pages/index.tsx --dry --print
```

## Contributing

To add a new codemod:

1. Create new file in this directory
2. Follow jscodeshift patterns
3. Add documentation to this README
4. Test on sample files
5. Add to the migration CLI

## Resources

- [jscodeshift Documentation](https://github.com/facebook/jscodeshift)
- [AST Explorer](https://astexplorer.net/) - Test transformations
- [jscodeshift Recipes](https://github.com/facebook/jscodeshift/wiki/jscodeshift-recipes)
