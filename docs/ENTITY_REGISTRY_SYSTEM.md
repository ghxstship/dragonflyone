# Entity Registry System

A centralized configuration system for normalizing hardcoded UI/workflow elements across the monorepo.

## Overview

The Entity Registry System eliminates hardcoded columns, filters, actions, form fields, and status mappings by providing a single source of truth for all entity configurations.

## Problem Solved

Before this system, each list page had:
- **77 files** with hardcoded column definitions
- **75 files** with hardcoded filter configurations  
- **73 files** with hardcoded row actions
- **28 files** with hardcoded bulk actions
- **22 files** with hardcoded form fields
- **16+ files** with inconsistent status color mappings

## Architecture

```
packages/config/entity-registry/
├── types.ts                 # Type definitions
├── status-mappings.ts       # Centralized status → color mappings
├── formatters.ts            # Date, currency, number formatters
├── common-columns.ts        # Reusable column definitions
├── common-filters.ts        # Reusable filter definitions
├── common-actions.ts        # Reusable action definitions
├── common-form-fields.ts    # Reusable form field definitions
├── registry.ts              # Central registry with lookup functions
├── generators.ts            # Value formatters and helpers
├── hooks/
│   └── useEntityConfig.ts   # React hook for page consumption
├── entities/
│   ├── index.ts             # Entity exports and registration
│   ├── credentials.ts       # Credentials entity config
│   ├── bills.ts             # Bills entity config
│   ├── orders.ts            # Orders entity config
│   ├── tickets.ts           # Tickets entity config
│   ├── sops.ts              # SOPs entity config
│   ├── crew.ts              # Crew entity config
│   ├── equipment.ts         # Equipment entity config
│   ├── events.ts            # Events entity config
│   ├── projects.ts          # Projects entity config
│   └── invoices.ts          # Invoices entity config
└── index.ts                 # Module exports
```

## Usage

### Basic Usage with Hook

```tsx
import { useEntityConfig } from '@ghxstship/config';

function CredentialsPage() {
  const {
    entity,
    columns,
    filters,
    rowActions,
    bulkActions,
    quickActions,
    formFields,
    stats,
    features,
    helpers,
  } = useEntityConfig({ entityName: 'credentials' });

  return (
    <ListPage
      title={entity.plural}
      columns={columns}
      filters={filters}
      rowActions={rowActions}
      bulkActions={bulkActions}
      quickActions={quickActions}
      // ...
    />
  );
}
```

### With Overrides

```tsx
const { columns, filters } = useEntityConfig({
  entityName: 'credentials',
  excludeColumns: ['created_at', 'updated_at'],
  excludeFilters: ['category'],
  userRoles: ['admin', 'manager'],
});
```

### Direct Registry Access

```tsx
import { 
  getEntity, 
  getEntityColumns, 
  getEntityFilters,
  getEntityRowActions,
} from '@ghxstship/config';

// Get full entity config
const entity = getEntity('credentials');

// Get specific parts
const columns = getEntityColumns('credentials');
const filters = getEntityFilters('credentials');
const actions = getEntityRowActions('credentials', { userRoles: ['admin'] });
```

### Using Common Columns

```tsx
import {
  nameColumn,
  statusColumn,
  createdAtColumn,
  amountColumn,
  vendorColumn,
} from '@ghxstship/config';

const columns = [
  nameColumn,
  vendorColumn,
  amountColumn('total', 'Total Amount'),
  statusColumn({ statusColors: FINANCIAL_STATUS_COLORS }),
  createdAtColumn,
];
```

### Using Common Actions

```tsx
import {
  viewAction,
  editAction,
  deleteAction,
  standardRowActions,
  standardBulkActions,
} from '@ghxstship/config';

// Individual actions
const rowActions = [
  viewAction,
  editAction('/bills/[id]/edit'),
  deleteAction({ titleField: 'bill_number' }),
];

// Or use standard sets
const rowActions = standardRowActions('/bills', { titleField: 'bill_number' });
const bulkActions = standardBulkActions({ includeExport: true, includeDelete: true });
```

### Using Status Mappings

```tsx
import {
  getStatusColor,
  getEntityStatusColor,
  FINANCIAL_STATUS_COLORS,
  CREDENTIAL_STATUS_COLORS,
} from '@ghxstship/config';

// Get color for any status
const color = getStatusColor('pending'); // 'warning'

// Get color for entity-specific status
const color = getEntityStatusColor('credentials', 'active'); // 'success'

// Use in Badge component
<Badge variant={getStatusColor(row.status)}>
  {row.status}
</Badge>
```

### Using Formatters

```tsx
import {
  formatDate,
  formatCurrency,
  formatName,
  formatPhone,
  formatStatus,
} from '@ghxstship/config';

// Format values
formatDate('2024-01-15'); // 'Jan 15, 2024'
formatCurrency(1500); // '$1,500'
formatName('John', 'Doe'); // 'John Doe'
formatPhone('5551234567'); // '(555) 123-4567'
formatStatus('in_progress'); // 'In Progress'
```

## Creating New Entity Configurations

### 1. Create Entity File

```typescript
// packages/config/entity-registry/entities/my-entity.ts

import type { EntityConfig } from '../types';
import { nameColumn, statusColumn, createdAtColumn } from '../common-columns';
import { statusFilter } from '../common-filters';
import { viewAction, editAction, deleteAction } from '../common-actions';
import { UNIVERSAL_STATUS_COLORS } from '../status-mappings';

export const myEntityEntity: EntityConfig = {
  name: 'my-entity',
  singular: 'My Entity',
  plural: 'My Entities',
  description: 'Description of the entity',
  icon: 'Package',
  
  routes: {
    list: '/my-entity',
    detail: '/my-entity/[id]',
    create: '/my-entity/new',
    edit: '/my-entity/[id]/edit',
  },
  
  api: {
    endpoint: '/api/my-entity',
    statsEndpoint: '/api/my-entity/stats',
  },
  
  columns: [
    nameColumn,
    statusColumn({ statusColors: UNIVERSAL_STATUS_COLORS }),
    createdAtColumn,
  ],
  
  filters: [
    statusFilter(),
  ],
  
  rowActions: [
    viewAction,
    editAction('/my-entity/[id]/edit'),
    deleteAction({ titleField: 'name' }),
  ],
  
  bulkActions: [],
  quickActions: [],
  formFields: [],
  detailSections: [],
  stats: [],
  
  search: {
    placeholder: 'Search...',
    fields: ['name'],
  },
  
  emptyState: {
    message: 'No items found',
    actionLabel: 'Create First Item',
    actionRoute: '/my-entity/new',
  },
  
  features: {
    create: true,
    edit: true,
    delete: true,
    export: true,
    import: false,
  },
};
```

### 2. Register Entity

```typescript
// packages/config/entity-registry/entities/index.ts

import { myEntityEntity } from './my-entity';

export { myEntityEntity } from './my-entity';

export const allEntities = [
  // ... existing entities
  myEntityEntity,
];
```

## Status Color Mappings

### Available Mappings

| Entity Type | Import |
|-------------|--------|
| Universal | `UNIVERSAL_STATUS_COLORS` |
| Credentials | `CREDENTIAL_STATUS_COLORS` |
| Financial (Bills/Invoices) | `FINANCIAL_STATUS_COLORS` |
| Orders | `ORDER_STATUS_COLORS` |
| Payments | `PAYMENT_STATUS_COLORS` |
| Tickets | `TICKET_STATUS_COLORS` |
| Documents/SOPs | `DOCUMENT_STATUS_COLORS` |
| Tasks/Issues | `TASK_STATUS_COLORS` |
| Equipment/Assets | `EQUIPMENT_STATUS_COLORS` |
| Crew/Personnel | `CREW_STATUS_COLORS` |
| Events | `EVENT_STATUS_COLORS` |
| Projects | `PROJECT_STATUS_COLORS` |
| Certifications | `CERTIFICATION_STATUS_COLORS` |
| Incidents | `INCIDENT_STATUS_COLORS` |
| Deliveries | `DELIVERY_STATUS_COLORS` |
| Maintenance | `MAINTENANCE_STATUS_COLORS` |
| Priority | `PRIORITY_COLORS` |
| Severity | `SEVERITY_COLORS` |
| Risk | `RISK_COLORS` |

### Status Variants

- `success` - Green (active, approved, completed, paid)
- `warning` - Yellow (pending, processing, expiring)
- `error` - Red (cancelled, failed, expired, revoked)
- `info` - Blue (new, open, scheduled, assigned)
- `ghost` - Gray (draft, archived, inactive)
- `outline` - Outlined (refunded, transferred)

## Common Columns Reference

| Column | Description |
|--------|-------------|
| `idColumn` | Shortened UUID display |
| `nameColumn` | Simple name field |
| `titleColumn` | Title field |
| `fullNameColumn()` | First + last name |
| `contactNameColumn` | Nested contact name |
| `statusColumn()` | Status with color mapping |
| `createdAtColumn` | Created timestamp |
| `updatedAtColumn` | Updated timestamp |
| `dateColumn()` | Generic date |
| `dateTimeColumn()` | Date with time |
| `dueDateColumn` | Due date with overdue highlight |
| `amountColumn()` | Currency amount |
| `vendorColumn` | Nested vendor name |
| `projectColumn` | Nested project name |
| `eventColumn` | Nested event name |
| `categoryColumn` | Category name |
| `priorityColumn` | Priority with colors |

## Common Actions Reference

### Row Actions

| Action | Description |
|--------|-------------|
| `viewAction` | Opens detail drawer |
| `viewPageAction(route)` | Navigates to detail page |
| `editAction(route)` | Navigates to edit page |
| `deleteAction(options)` | Delete with confirmation |
| `archiveAction(options)` | Archive with confirmation |
| `approveAction` | Approve status change |
| `rejectAction` | Reject status change |
| `suspendAction` | Suspend (hidden if not active) |
| `reactivateAction` | Reactivate (hidden if not suspended) |
| `revokeAction(options)` | Revoke with confirmation |
| `cancelAction(options)` | Cancel with confirmation |

### Bulk Actions

| Action | Description |
|--------|-------------|
| `exportBulkAction` | Export selected |
| `deleteBulkAction` | Delete selected with confirmation |
| `archiveBulkAction` | Archive selected |
| `approveBulkAction` | Approve selected |
| `suspendBulkAction` | Suspend selected |
| `revokeBulkAction` | Revoke selected |

### Quick Actions

| Action | Description |
|--------|-------------|
| `createQuickAction(label, route)` | Primary create action |
| `importQuickAction` | Import modal |
| `scanQuickAction(route)` | QR/barcode scan |
| `manageQuickAction(label, route)` | Settings/manage link |

## Migration Guide

### Before (Hardcoded)

```tsx
const statusColors = {
  active: 'success',
  pending: 'warning',
  // ... duplicated in every file
};

const columns = [
  { key: 'name', label: 'Name', accessor: 'name', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true,
    render: (value) => <Badge variant={statusColors[value]}>{value}</Badge>
  },
  // ... 50+ lines of column definitions
];

const filters = [
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    // ... duplicated options
  ]},
];
```

### After (Entity Registry)

```tsx
import { useEntityConfig } from '@ghxstship/config';

const { columns, filters, rowActions, bulkActions } = useEntityConfig({
  entityName: 'my-entity',
});
```

## Benefits

1. **Single Source of Truth** - All entity configurations in one place
2. **Consistency** - Same status colors, formatters, and patterns everywhere
3. **Maintainability** - Change once, apply everywhere
4. **Type Safety** - Full TypeScript support
5. **Extensibility** - Easy to add new entities or override specific parts
6. **Reduced Duplication** - No more copy-paste of columns/filters/actions
7. **Permission Integration** - Built-in role-based action filtering

## System Integration

### Dataset Capability Detection System

The entity registry is fully integrated with the Dataset Capability Detection System. Each entity configuration can specify:

- **`capabilities`**: Array of `DatasetCapabilityType` values (e.g., `'scannable:qr'`, `'view:kanban'`)
- **`capabilityRoutes`**: Custom routes for capability actions

```tsx
import { 
  getEntityCapabilities,
  getEntityScanCapabilities,
  getEntityViewCapabilities,
  entityHasCapability,
  generateAllCapabilityOverrides,
} from '@ghxstship/config';

// Get all capabilities for an entity
const caps = getEntityCapabilities('credentials');
// ['scannable:qr', 'scannable:barcode', 'scannable:nfc']

// Check if entity has a specific capability
if (entityHasCapability('equipment', 'view:map')) {
  // Show map view option
}

// Generate capability overrides for all entities
// (can be used to sync with ENTITY_CAPABILITY_OVERRIDES)
const overrides = generateAllCapabilityOverrides();
```

### Legend 3NF Schema Integration

Each entity configuration includes a `legendMapping` that maps to the normalized Legend schema:

```tsx
import {
  getEntityLegendTable,
  getEntityLegendType,
  buildLegendQueryFilter,
  getEntitiesByLegendTable,
} from '@ghxstship/config';

// Get the Legend table for an entity
const table = getEntityLegendTable('vendors');
// 'legend_organizations'

// Get the type discriminator
const type = getEntityLegendType('vendors');
// { column: 'org_type', value: 'vendor' }

// Build a query filter for Supabase
const filter = buildLegendQueryFilter('equipment');
// { product_type: 'equipment' }

// Get all entities that map to a Legend table
const peopleEntities = getEntitiesByLegendTable('legend_people');
// [credentialsEntity, crewEntity, contactsEntity]
```

### Legend Schema Mappings

| Entity | Legend Table | Type Column | Type Value |
|--------|-------------|-------------|------------|
| credentials | `legend_people` | - | - |
| crew | `legend_people` | - | - |
| contacts | `legend_people` | - | - |
| vendors | `legend_organizations` | `org_type` | `vendor` |
| equipment | `legend_products` | `product_type` | `equipment` |
| assets | `legend_products` | `product_type` | `asset` |
| tickets | `legend_products` | `product_type` | `ticket` |
| events | `legend_events` | `event_type` | `event` |
| projects | `legend_events` | `event_type` | `production` |
| bills | `legend_documents` | `document_type` | `invoice` |
| orders | `legend_documents` | `document_type` | `invoice` |
| invoices | `legend_documents` | `document_type` | `invoice` |
| sops | `legend_documents` | `document_type` | `policy` |
| incidents | `legend_documents` | `document_type` | `report` |

## Files Created

| File | Purpose |
|------|---------|
| `entity-registry/types.ts` | Type definitions including Legend and Capability types |
| `entity-registry/status-mappings.ts` | 16 status color mappings + helpers |
| `entity-registry/formatters.ts` | 20+ formatting functions |
| `entity-registry/common-columns.ts` | 30+ reusable column definitions |
| `entity-registry/common-filters.ts` | 15+ filter definitions + options |
| `entity-registry/common-actions.ts` | 30+ action definitions |
| `entity-registry/common-form-fields.ts` | 40+ form field definitions |
| `entity-registry/registry.ts` | Central registry with 20+ lookup functions |
| `entity-registry/generators.ts` | Value formatters and helpers |
| `entity-registry/capability-bridge.ts` | Integration with dataset-capabilities system |
| `entity-registry/hooks/useEntityConfig.ts` | React hook for page consumption |
| `entity-registry/entities/*.ts` | 15 entity configurations |
| `entity-registry/index.ts` | Module exports |
| `docs/ENTITY_REGISTRY_SYSTEM.md` | Comprehensive documentation |
