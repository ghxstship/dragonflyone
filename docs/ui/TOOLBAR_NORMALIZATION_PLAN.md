# Toolbar Normalization Plan

## Overview

This plan addresses the inconsistent toolbar implementation across 115 ListPage-based pages and establishes a standardized approach for search, filters, sort, import, export, and bulk actions.

---

## Phase 1: Infrastructure Improvements (Priority: High)

### 1.1 Create Shared Export Utility

**Location**: `/packages/config/export-utils.ts`

```typescript
export interface ExportConfig<T> {
  data: T[];
  columns: { key: keyof T; label: string }[];
  filename: string;
  format?: 'csv' | 'json' | 'xlsx';
}

export function exportToCSV<T>(config: ExportConfig<T>): void;
export function exportToJSON<T>(config: ExportConfig<T>): void;
export function createExportHandler<T>(config: ExportConfig<T>): () => void;
```

**Benefits**:
- Eliminates 87+ duplicate export implementations
- Consistent formatting and encoding
- Easy to add new formats (Excel, PDF)

### 1.2 Create Shared Import Utility

**Location**: `/packages/config/import-utils.ts`

```typescript
export interface ImportConfig<T> {
  entityType: string;
  columns: ColumnConfig[];
  onImport: (records: T[]) => Promise<void>;
  validateRow?: (row: Record<string, unknown>) => ValidationResult;
}

export function createImportHandler<T>(config: ImportConfig<T>): () => void;
```

### 1.3 Create Enhanced ListPage Wrapper

**Location**: `/packages/ui/src/templates/enhanced-list-page.tsx`

Extends `ListPage` with:
- Auto-wired import/export using utilities
- Default bulk actions (export selected, delete selected)
- Integrated `ImportExportDialog`
- Column visibility toggle
- Saved filter presets

---

## Phase 2: Fix Immediate Issues (Priority: Critical)

### 2.1 Fix TODO Export Implementations

**Files to fix (4 total)**:

1. `/apps/compvss/src/app/artists/page.tsx:181`
2. `/apps/compvss/src/app/availability/page.tsx:184`
3. `/apps/compvss/src/app/certifications/page.tsx:238`
4. `/apps/compvss/src/app/credentials/page.tsx:275`

**Action**: Replace `/* TODO: Implement export */` with actual CSV export logic matching the pattern used in other pages.

### 2.2 Add Missing Export to ListPage Users

**28 pages** use ListPage but don't pass `onExport`. Add export functionality to all.

---

## Phase 3: Bulk Actions Normalization (Priority: High)

### 3.1 Define Standard Bulk Actions

Every data list page should have these bulk actions:

```typescript
const standardBulkActions: ListPageBulkAction[] = [
  { id: 'export', label: 'Export Selected', icon: <Download /> },
  { id: 'delete', label: 'Delete', icon: <Trash2 />, variant: 'danger' },
];
```

Entity-specific additions:
- **Crew/Employees**: Assign to Project, Send Message
- **Assets/Equipment**: Check Out, Schedule Maintenance
- **Invoices/Expenses**: Mark Paid, Generate Report
- **Deliveries**: Print Manifest, Mark Received

### 3.2 Implementation Scope

Add bulk actions to remaining **99 ListPage users** that don't have them.

---

## Phase 4: Import Functionality (Priority: Medium)

### 4.1 Identify Import-Eligible Pages

Pages that manage entity data and should support import:

**Atlvs App**:
- /assets, /contacts, /contracts, /employees, /invoices
- /vendors, /workforce, /projects, /procurement

**Compvss App**:
- /crew, /equipment, /artists, /certifications
- /credentials, /deliveries, /expenses

**Gvteway App**:
- /admin/promo-codes, /admin/users

### 4.2 Implementation Pattern

```tsx
const [importDialogOpen, setImportDialogOpen] = useState(false);

// In ListPage props:
onImport={() => setImportDialogOpen(true)}

// Add dialog:
<ImportExportDialog
  open={importDialogOpen}
  onClose={() => setImportDialogOpen(false)}
  mode="import"
  entityType="crew"
  sampleFields={['name', 'role', 'department', 'rate']}
  onImport={async (file, mapping) => {
    // Parse and create records
  }}
/>
```

---

## Phase 5: Advanced Search Integration (Priority: Medium)

### 5.1 Connect AdvancedSearchEngine to UI

Create a hook that wraps the search engine:

**Location**: `/packages/config/hooks/useAdvancedSearch.ts`

```typescript
export function useAdvancedSearch(entityTypes: string[]) {
  const [results, setResults] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [history, setHistory] = useState([]);
  
  const search = async (query: SearchQuery) => { ... };
  const saveSearch = async (name: string) => { ... };
  
  return { results, search, savedSearches, saveSearch, history };
}
```

### 5.2 Add Search Features to ListPage

- Saved search dropdown
- Recent searches
- Search suggestions (typeahead)
- Full-text search across all columns

---

## Phase 6: Filter Enhancements (Priority: Low)

### 6.1 Standardize Filter Definitions

Create entity-specific filter presets:

**Location**: `/packages/config/filter-presets.ts`

```typescript
export const crewFilters: ListPageFilter[] = [
  { key: 'department', label: 'Department', options: [...] },
  { key: 'availability', label: 'Availability', options: [...] },
  { key: 'certification', label: 'Certification', options: [...] },
];

export const assetFilters: ListPageFilter[] = [...];
```

### 6.2 Add Filter Presets

Allow users to save and load filter combinations:
- "Available Crew Only"
- "Overdue Invoices"
- "Expiring Certifications"

---

## Implementation Order

### Week 1: Critical Fixes
1. Fix 4 TODO exports
2. Create `export-utils.ts`
3. Migrate 10 pages to use shared export utility

### Week 2: Export Normalization
1. Add export to 28 missing pages
2. Migrate remaining 77 pages to shared utility

### Week 3: Bulk Actions
1. Add standard bulk actions to 50 pages
2. Add entity-specific bulk actions

### Week 4: Import Foundation
1. Create `import-utils.ts`
2. Implement import for 10 high-priority pages

### Week 5-6: Import Rollout
1. Add import to remaining eligible pages
2. Test all import/export flows

### Week 7-8: Advanced Features
1. Integrate AdvancedSearchEngine
2. Add saved searches UI
3. Implement filter presets

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pages with Export | 87 (75%) | 115 (100%) |
| Pages with Import | 0 (0%) | 40+ (35%+) |
| Pages with Bulk Actions | 16 (14%) | 115 (100%) |
| TODO comments | 4 | 0 |
| Duplicate export code | 87 instances | 1 utility |

---

## Files to Create

1. `/packages/config/export-utils.ts`
2. `/packages/config/import-utils.ts`
3. `/packages/config/hooks/useAdvancedSearch.ts`
4. `/packages/config/filter-presets.ts`
5. `/packages/ui/src/templates/enhanced-list-page.tsx`

## Files to Modify

- All 115 ListPage-using pages
- `/packages/ui/src/templates/list-page.tsx` (add default behaviors)
- `/packages/ui/src/index.ts` (export new utilities)

---

## Testing Strategy

1. **Unit Tests**: Export/import utilities
2. **Integration Tests**: Full import/export flow per entity type
3. **E2E Tests**: Bulk action workflows
4. **Visual Regression**: Toolbar appearance consistency

---

## Rollback Plan

All changes are additive. If issues arise:
1. Revert to inline export implementations
2. Remove import buttons (feature flag)
3. Disable bulk actions per-page
