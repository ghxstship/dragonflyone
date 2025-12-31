# Dataset Capability Detection System

## Overview

The Dataset Capability Detection System automatically determines which toolbar actions and views should be enabled based on dataset schema analysis. This eliminates hardcoding and ensures features are only available when the data supports them.

## Architecture

The system consists of two layers:

### 1. Config Package (`@ghxstship/config`)
Full-featured capability detection with:
- **Types** (`dataset-capabilities/types.ts`) - All type definitions
- **Capability Registry** (`dataset-capabilities/capability-registry.ts`) - Pattern definitions for all capabilities
- **Detector** (`dataset-capabilities/detector.ts`) - Core detection logic
- **Entity Overrides** (`dataset-capabilities/entity-overrides.ts`) - Per-entity capability overrides
- **React Hook** (`dataset-capabilities/hooks/useDatasetCapabilities.ts`) - Hook for use in components

### 2. UI Package (`@ghxstship/ui`)
Lightweight inline detection in `ListPage` component that:
- Detects scan capabilities from column patterns
- Auto-generates quick actions for detected capabilities
- Merges with user-provided quick actions

## Usage

### Basic Usage (ListPage)

```tsx
<ListPage
  title="Equipment"
  columns={columns}
  data={data}
  entityType="equipment"
  // Enable capability detection
  enableCapabilityDetection
  onScanAction={(capability, route) => router.push(route)}
  capabilityBasePath=""
/>
```

### Detected Capabilities

The system detects the following scan capabilities based on column patterns:

| Capability | Column Patterns |
|------------|-----------------|
| `scannable:qr` | `qr_code`, `qrcode`, `qr_id`, `qr` |
| `scannable:barcode` | `barcode`, `upc`, `sku`, `ean`, `serial_number`, `asset_tag`, `tag`, `badge_id`, `badge_number` |
| `scannable:rfid` | `rfid`, `rfid_tag`, `rfid_id`, `rfid_code` |
| `scannable:nfc` | `nfc`, `nfc_id`, `nfc_tag`, `nfc_code` |

### View Capabilities (via Smart View Detection)

The existing `detectSmartViews` function in ListPage already handles:

| View | Required Columns |
|------|------------------|
| Kanban | `status`, `state`, `stage`, `phase` |
| Calendar | Any date field |
| Timeline | `start_date` + `end_date` |
| Gantt | `start_date` + `end_date` + optional `progress` |
| Map | `latitude`/`longitude` OR `address`/`location` |
| Gallery | `image`, `photo`, `thumbnail`, `avatar` |

## Entity Overrides

For cases where pattern matching isn't sufficient, use entity overrides in `@ghxstship/config`:

```typescript
// packages/config/dataset-capabilities/entity-overrides.ts

export const ENTITY_CAPABILITY_OVERRIDES = {
  crew: {
    enable: ['scannable:barcode', 'scannable:qr'],
    routes: {
      'scannable:barcode': '/credentials/scan',
      'scannable:qr': '/credentials/scan',
    },
  },
  equipment: {
    enable: ['scannable:qr', 'scannable:barcode', 'scannable:rfid'],
  },
};
```

## Advanced Usage (useDatasetCapabilities Hook)

For more control, use the hook directly:

```tsx
import { useDatasetCapabilities } from '@ghxstship/config';

function MyComponent() {
  const {
    capabilities,
    hasCapability,
    getCapabilityFields,
    scanActions,
    viewOptions,
  } = useDatasetCapabilities({
    columns: [{ key: 'barcode' }, { key: 'name' }],
    entityType: 'equipment',
    getIcon: (name) => <LucideIcon name={name} />,
    onScanAction: (cap, route) => router.push(route),
  });

  if (hasCapability('scannable:barcode')) {
    // Show barcode scanner button
  }
}
```

## Migration Guide

### Before (Hardcoded)
```tsx
<ListPage
  quickActions={[
    { id: 'scan', label: 'Scan Badge', icon: <QrCode />, onClick: () => router.push('/credentials/scan') },
  ]}
/>
```

### After (Automatic Detection)
```tsx
<ListPage
  enableCapabilityDetection
  onScanAction={(capability, route) => router.push(route)}
/>
```

## Files Created

| File | Purpose |
|------|---------|
| `packages/config/dataset-capabilities/types.ts` | Type definitions |
| `packages/config/dataset-capabilities/capability-registry.ts` | Pattern definitions |
| `packages/config/dataset-capabilities/detector.ts` | Detection logic |
| `packages/config/dataset-capabilities/entity-overrides.ts` | Entity-specific overrides |
| `packages/config/dataset-capabilities/hooks/useDatasetCapabilities.ts` | React hook |
| `packages/config/dataset-capabilities/index.ts` | Module exports |

## Benefits

1. **Zero hardcoding** - Actions appear/disappear based on data schema
2. **Consistent behavior** - Same rules apply across all apps
3. **Self-documenting** - Capability registry serves as documentation
4. **Extensible** - Easy to add new capabilities
5. **Testable** - Pure functions for detection logic
6. **Override-friendly** - Entity-level overrides when needed
7. **Type-safe** - Full TypeScript support
