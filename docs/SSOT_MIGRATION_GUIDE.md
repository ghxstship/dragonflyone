# Single Source of Truth (SSOT) Migration Guide

## Executive Summary

**Current State: NOT SSOT Compliant**

Despite having a comprehensive Entity Registry System, the codebase has **critical SSOT violations** that must be addressed for enterprise-grade scalability and maintainability.

### Violation Metrics

| Violation Type | Count | Files Affected |
|---------------|-------|----------------|
| `STATUS_COLORS` duplications | 58+ | 29 files |
| `statusColors` duplications | 85+ | 46 files |
| Hardcoded `columns` arrays | 50+ | 50+ pages |
| Hardcoded `filters` arrays | 50+ | 50+ pages |
| Local `formatCurrency` functions | 20+ | 20+ files |
| Local `formatDate` functions | 20+ | 20+ files |

### Impact

- **Maintenance Nightmare**: Changing a status color requires editing 29+ files
- **Inconsistency Risk**: Different pages may have different status color mappings
- **Testing Burden**: Each page must be tested independently
- **Onboarding Friction**: New developers must understand per-page patterns

---

## Architecture: Current vs Target

### Current (Anti-Pattern)

```
┌─────────────────────────────────────────────────────────────┐
│                      PAGE COMPONENT                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ const STATUS_COLORS = { active: 'success', ... }        ││
│  │ const columns = [ { key: 'name', ... }, ... ]           ││
│  │ const filters = [ { key: 'status', ... }, ... ]         ││
│  │ const rowActions = [ ... ]                              ││
│  │ const formatCurrency = (amount) => ...                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  return <ListPage columns={columns} filters={filters} ... />│
└─────────────────────────────────────────────────────────────┘
```

### Target (SSOT Compliant)

```
┌─────────────────────────────────────────────────────────────┐
│                      PAGE COMPONENT                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ const { columns, filters, rowActions, statusColors }    ││
│  │   = useEntityConfig({ entityName: 'budgets' });         ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  return <ListPage columns={columns} filters={filters} ... />│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    ENTITY REGISTRY                           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ budgetsEntity = {                                       ││
│  │   columns: [...],                                       ││
│  │   filters: [...],                                       ││
│  │   rowActions: [...],                                    ││
│  │   statusColors: BUDGET_STATUS_COLORS,                   ││
│  │   legendMapping: { table: 'legend_documents', ... }     ││
│  │ }                                                       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    LEGEND 3NF SCHEMA                         │
│  legend_documents → docs_profile_budget                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Migration Strategy

### Phase 1: Consolidate Status Colors (Priority: HIGH)

**Goal**: Single source of truth for all status color mappings

**Location**: `packages/config/entity-registry/status-mappings.ts`

**Action Items**:

1. Audit all `STATUS_COLORS` and `statusColors` definitions
2. Consolidate into `status-mappings.ts`
3. Export from entity-registry index
4. Update all pages to import from config

**Before**:
```tsx
// apps/atlvs/src/app/(authenticated)/finance/budgets/page.tsx
const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  active: 'success',
  closed: 'info',
  over_budget: 'error',
};
```

**After**:
```tsx
// apps/atlvs/src/app/(authenticated)/finance/budgets/page.tsx
import { BUDGET_STATUS_COLORS } from '@ghxstship/config';
// Use BUDGET_STATUS_COLORS directly
```

### Phase 2: Create Missing Entity Configurations (Priority: HIGH)

**Missing Entities** (based on page analysis):

| Entity | App | Status |
|--------|-----|--------|
| `budgets` | atlvs | ✅ Created |
| `expenses` | atlvs | ❌ Missing |
| `proposals` | atlvs | ❌ Missing |
| `purchase-orders` | atlvs | ❌ Missing |
| `people` | atlvs | ❌ Missing |
| `places` | atlvs | ❌ Missing |
| `organizations` | atlvs | ❌ Missing |
| `productions` | atlvs | ❌ Missing |

**Template for New Entity**:
```typescript
// packages/config/entity-registry/entities/[entity].ts
import type { EntityConfig } from '../types';
import { viewAction, editAction, deleteAction, exportBulkAction, deleteBulkAction } from '../common-actions';

export const [ENTITY]_STATUS_COLORS: Record<string, StatusVariant> = {
  // Define all status colors here
};

export const [entity]Entity: EntityConfig = {
  name: '[entity]',
  singular: '[Entity]',
  plural: '[Entities]',
  // ... full configuration
  legendMapping: {
    table: 'legend_[table]',
    typeColumn: '[type_column]',
    typeValue: '[type_value]',
    profileTable: '[profile_table]',
    profileForeignKey: '[foreign_key]',
  },
};
```

### Phase 3: Migrate Pages to useEntityConfig (Priority: MEDIUM)

**Goal**: All list pages consume entity registry via hook

**Migration Pattern**:

```tsx
// BEFORE: 150+ lines of hardcoded config
export default function BudgetsPage() {
  const STATUS_COLORS = { ... };
  const columns = [ ... ];
  const filters = [ ... ];
  const rowActions = [ ... ];
  
  return (
    <ListPage
      columns={columns}
      filters={filters}
      rowActions={rowActions}
      // ...
    />
  );
}

// AFTER: 30 lines using entity registry
export default function BudgetsPage() {
  const router = useRouter();
  const { 
    columns, 
    filters, 
    rowActions, 
    statusColors,
    search,
    emptyState,
  } = useEntityConfig({ 
    entityName: 'budgets',
    router,
  });
  
  const { data, isLoading, error, refetch } = useBudgets();
  
  return (
    <ListPage
      title="Budgets"
      data={data}
      columns={columns}
      filters={filters}
      rowActions={rowActions}
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder={search.placeholder}
      emptyMessage={emptyState.message}
      entityType="budgets"
    />
  );
}
```

### Phase 4: Consolidate Utility Functions (Priority: LOW)

**Duplicated Functions**:

| Function | Occurrences | Target Location |
|----------|-------------|-----------------|
| `formatCurrency` | 20+ | `packages/config/formatters.ts` |
| `formatDate` | 20+ | `packages/config/formatters.ts` |
| `formatNumber` | 10+ | `packages/config/formatters.ts` |
| `formatPercentage` | 5+ | `packages/config/formatters.ts` |

---

## Implementation Checklist

### Immediate Actions (Week 1)

- [ ] Create all missing entity configurations
- [ ] Export all status colors from `status-mappings.ts`
- [ ] Create `formatters.ts` with consolidated utility functions
- [ ] Update entity-registry index with all exports

### Short-Term (Weeks 2-3)

- [ ] Migrate ATLVS pages to use `useEntityConfig`
- [ ] Migrate COMPVSS pages to use `useEntityConfig`
- [ ] Migrate GVTEWAY pages to use `useEntityConfig`
- [ ] Remove all local `STATUS_COLORS` definitions

### Medium-Term (Weeks 4-6)

- [ ] Add Zod validation schemas to entity configs
- [ ] Implement real-time subscription config
- [ ] Add field-level permissions
- [ ] Create automated SSOT compliance linting

---

## Validation Commands

### Check for SSOT Violations

```bash
# Find duplicate STATUS_COLORS definitions
grep -r "STATUS_COLORS" apps/ --include="*.tsx" | wc -l

# Find duplicate statusColors definitions  
grep -r "statusColors" apps/ --include="*.tsx" | wc -l

# Find hardcoded columns arrays
grep -r "const columns:" apps/ --include="*.tsx" | wc -l

# Find local formatCurrency functions
grep -r "formatCurrency" apps/ --include="*.tsx" | wc -l
```

### Target Metrics

| Metric | Current | Target |
|--------|---------|--------|
| STATUS_COLORS in apps/ | 58+ | 0 |
| statusColors in apps/ | 85+ | 0 |
| Hardcoded columns | 50+ | 0 |
| Local formatCurrency | 20+ | 0 |

---

## Benefits of Full SSOT Compliance

### Developer Experience
- **Faster Development**: New pages require ~30 lines instead of 150+
- **Consistency**: All pages behave identically
- **Discoverability**: All entity config in one place

### Maintainability
- **Single Change Point**: Update status color once, applies everywhere
- **Reduced Testing**: Test entity config once, not per-page
- **Clear Ownership**: Entity registry owns all UI metadata

### Scalability
- **New Entities**: Add config file, entity appears everywhere
- **New Apps**: Import entity registry, instant feature parity
- **API Changes**: Update entity config, UI updates automatically

### Performance
- **Tree Shaking**: Import only needed entities
- **Caching**: Entity configs are static, highly cacheable
- **Bundle Size**: Shared code, not duplicated per-page

---

## Related Documentation

- [Entity Registry System](./ENTITY_REGISTRY_SYSTEM.md)
- [Dataset Capability Detection](./DATASET_CAPABILITY_DETECTION.md)
- [Database Normalization Plan](./DATABASE_NORMALIZATION_PLAN.md)
