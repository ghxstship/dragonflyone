# Page Template & Layout Normalization Audit Report

**Date:** December 27, 2024  
**Scope:** ATLVS, COMPVSS, GVTEWAY apps  
**Purpose:** Identify consolidation opportunities for improved UI/UX consistency

---

## Executive Summary

This audit analyzed 340+ pages across three applications to identify page template patterns, layout inconsistencies, and consolidation opportunities. The codebase has a strong foundation with shared UI components from `@ghxstship/ui`, but there are significant opportunities to reduce code duplication and improve consistency.

### Key Findings

| Category | Current State | Opportunity |
|----------|--------------|-------------|
| App Layouts | 3 separate implementations (~1,800 lines) | Consolidate to 1 shared layout (~600 lines) |
| Page Templates | 5 distinct patterns with variations | Standardize to 4 canonical templates |
| Auth Layouts | 3 near-identical files (71 lines each) | Extract to shared package |
| Loading/Error States | Duplicated across apps | Centralize in shared hooks |
| Recent Pages Hook | 3 copies (~60 lines each) | Extract to `@ghxstship/config/hooks` |

**Estimated Code Reduction:** ~40% reduction in layout/template code (~2,400 lines)

---

## 1. App Layout Analysis

### Current State

Each app has its own `app-layout.tsx` with significant duplication:

| App | File | Lines | Key Components |
|-----|------|-------|----------------|
| ATLVS | `src/components/app-layout.tsx` | 651 | `AtlvsAppLayout`, `AtlvsLoadingLayout`, `AtlvsEmptyLayout`, `AtlvsSkeletonLayout` |
| COMPVSS | `src/components/app-layout.tsx` | 614 | `CompvssAppLayout`, `CompvssLoadingLayout`, `CompvssEmptyLayout`, `CompvssSkeletonLayout` |
| GVTEWAY | `src/components/app-layout.tsx` | 559 | `GvtewayAppLayout`, `GvtewayLoadingLayout`, `GvtewayEmptyLayout`, `GvtewaySkeletonLayout` |

### Duplicated Patterns (90%+ similarity)

1. **`useRecentPages` hook** - Identical logic, only storage key differs
2. **Loading/Empty/Skeleton layouts** - Same structure, minor styling differences
3. **Command palette integration** - Same pattern across all apps
4. **Mobile bottom navigation** - Same implementation
5. **Context breadcrumb building** - Same logic with different demo data
6. **Keyboard shortcuts** - Same pattern (Cmd+1-5)

### Differences (App-Specific)

| Feature | ATLVS | COMPVSS | GVTEWAY |
|---------|-------|---------|---------|
| Default Background | `black` | `white` | `black` |
| Default Variant | `authenticated` | `authenticated` | `consumer-public` |
| Navigation Data | `atlvsSidebarNavigation` | `compvssSidebarNavigation` | `gvtewaySidebarNavigation` |
| Logo Text | "ATLVS" | "COMPVSS" | "GVTEWAY" |
| Storage Key | `atlvs-*` | `compvss-*` | `gvteway-*` |
| Quick Actions | Deal/Project/Contact/Invoice | Crew/Schedule/Equipment | Events/Tickets/Venues |
| Variant Options | `public`, `authenticated` | `public`, `authenticated` | 7 variants (consumer-public, consumer-auth, consumer-shell, event-shell, membership, creator-public, creator-auth) |

### Recommendation: Shared Base Layout

Create `@ghxstship/config/layouts/BaseAppLayout.tsx`:

```typescript
interface BaseAppLayoutConfig {
  appName: 'atlvs' | 'compvss' | 'gvteway';
  defaultBackground: 'black' | 'white';
  navigation: SidebarNavSection[];
  productionNavigation?: SidebarNavSection[];
  quickActions: QuickAction[];
  bottomNavigation: BottomNavItem[];
  demoData: {
    organizations: Organization[];
    productions: Production[];
    teams: Team[];
    workspaces: Workspace[];
  };
  contextualCommands: ContextualCommand[];
  footerConfig: FooterConfig;
}
```

---

## 2. Page Template Patterns

### Pattern 1: ListPage Template (Most Common - ~60% of pages)

**Used by:** Projects, Crew, Equipment, Tickets, Contacts, Vendors, etc.

**Standard Structure:**
```tsx
export default function EntityPage() {
  // 1. Hooks (data, auth, state)
  const { data, isLoading, error, refetch } = useEntity();
  const { hasRole } = useAuthContext();
  const [modalState, setModalState] = useState();
  
  // 2. RBAC check
  const canManage = ADMIN_ROLES.some(role => hasRole(role));
  
  // 3. Column/Filter/Action definitions
  const columns: ListPageColumn<Entity>[] = [...];
  const filters: ListPageFilter[] = [...];
  const rowActions: ListPageAction<Entity>[] = [...];
  
  // 4. Handlers
  const handleCreate = async (data) => {...};
  const handleDelete = async () => {...};
  
  // 5. Render
  return (
    <>
      <ListPage<Entity>
        title="..."
        data={data}
        columns={columns}
        ...
      />
      <RecordFormModal ... />
      <DetailDrawer ... />
      <ConfirmDialog ... />
    </>
  );
}
```

**Inconsistencies Found:**
- Some pages use `EnterprisePageHeader` + `MainContent` + `ListPage` (redundant)
- Some pages use just `ListPage` (correct - ListPage includes header)
- Stats calculation logic duplicated across pages

**Recommendation:** Standardize on `ListPage` alone (it includes header internally)

---

### Pattern 2: Dashboard Template

**Used by:** Dashboard pages in all apps

**Standard Structure:**
```tsx
export default function DashboardPage() {
  // 1. Auth & data hooks
  const { user, hasRole } = useAuthContext();
  const { data: entities } = useEntities();
  const { data: activity } = useActivityFeed();
  
  // 2. RBAC check
  const canViewDashboard = VIEW_ROLES.some(role => hasRole(role));
  
  // 3. KPI calculations
  const kpis = calculateKPIs(data);
  
  // 4. Loading/Error/Unauthorized states
  if (isLoading) return <LoadingLayout />;
  if (error) return <ErrorCard />;
  if (!canViewDashboard) return <UnauthorizedCard />;
  
  // 5. Render
  return (
    <>
      <EnterprisePageHeader ... />
      <Grid cols={4}>{kpis.map(kpi => <StatCard ... />)}</Grid>
      <Section><Table ... /></Section>
      <Grid cols={2}>{/* Activity & Quick Links */}</Grid>
    </>
  );
}
```

**Inconsistencies Found:**
- ATLVS uses `Section` + `SectionHeader` components
- COMPVSS uses `H2` + `Card` directly
- GVTEWAY uses `Kicker` + `H2` + `Card`

**Recommendation:** Standardize on `Section` + `SectionHeader` pattern

---

### Pattern 3: Settings Hub Template

**Used by:** Settings index pages

**Standard Structure:**
```tsx
const SETTINGS_SECTIONS = [
  { id, name, icon, description, path },
  ...
];

export default function SettingsPage() {
  return (
    <>
      <EnterprisePageHeader title="Settings" ... />
      <MainContent padding="lg">
        <Container size="md">
          <Stack gap={4}>
            {SETTINGS_SECTIONS.map(section => (
              <Card onClick={() => router.push(section.path)}>
                <Icon /><Title /><Description /><ChevronRight />
              </Card>
            ))}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
```

**Inconsistencies Found:**
- ATLVS uses `EnterprisePageHeader`
- GVTEWAY uses inline `Kicker` + `H2` + `Body`

**Recommendation:** Create `SettingsHubPage` component

---

### Pattern 4: Form/Detail Page Template

**Used by:** Entity detail pages, edit pages

**Standard Structure:**
```tsx
export default function EntityDetailPage({ params }) {
  const { id } = params;
  const { data, isLoading, error } = useEntity(id);
  
  if (isLoading) return <LoadingLayout />;
  if (error) return <ErrorState />;
  if (!data) return <NotFoundState />;
  
  return (
    <>
      <EnterprisePageHeader
        title={data.name}
        subtitle={data.description}
        primaryAction={{ label: 'Edit', onClick: ... }}
      />
      <MainContent padding="lg">
        <Container>
          <Grid cols={3}>
            <Box className="col-span-2">{/* Main content */}</Box>
            <Box>{/* Sidebar */}</Box>
          </Grid>
        </Container>
      </MainContent>
    </>
  );
}
```

---

### Pattern 5: Grid/Card Gallery Template

**Used by:** Vendors, Events, Venues

**Standard Structure:**
```tsx
export default function GalleryPage() {
  const { data, isLoading, error } = useEntities();
  
  return (
    <>
      <EnterprisePageHeader ... />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            {/* Search & Filters */}
            <Stack direction="horizontal" gap={4}>
              <Input placeholder="Search..." />
              <Select>{/* Filters */}</Select>
            </Stack>
            
            {/* Grid */}
            {data.length === 0 ? (
              <EmptyState ... />
            ) : (
              <Grid cols={3} gap={4}>
                {data.map(item => <Card ... />)}
              </Grid>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
```

---

## 3. Authenticated Layout Analysis

### Current State

All three apps have nearly identical `(authenticated)/layout.tsx` files:

```tsx
// 71 lines each, 95%+ identical
export default function AuthenticatedLayout({ children }) {
  const { isAuthenticated, isLoading, canAccessPlatform } = useAuthContext();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/signin?redirect=...");
    }
  }, [...]);
  
  useEffect(() => {
    if (!isLoading && isAuthenticated && !canAccessPlatform("PLATFORM")) {
      router.replace("/auth/unauthorized?platform=PLATFORM");
    }
  }, [...]);
  
  // Loading states...
  
  return <AppLayout variant="authenticated">{children}</AppLayout>;
}
```

**Only Differences:**
- Platform name: `atlvs` | `compvss` | `gvteway`
- Login redirect path: `/auth/signin` | `/login`
- Background color: `bg-ink-950` | `bg-white`
- Layout component: `AtlvsAppLayout` | `CompvssAppLayout` | `GvtewayAppLayout`

### Recommendation: Shared Auth Layout Factory

Create `@ghxstship/config/layouts/createAuthenticatedLayout.tsx`:

```typescript
export function createAuthenticatedLayout(config: {
  platform: 'atlvs' | 'compvss' | 'gvteway';
  loginPath: string;
  unauthorizedPath: string;
  backgroundColor: string;
  LayoutComponent: React.ComponentType<{ children: ReactNode; variant: string }>;
}) {
  return function AuthenticatedLayout({ children }) {
    // Shared logic here
  };
}
```

---

## 4. Shared Hooks Consolidation

### Hooks to Extract to `@ghxstship/config/hooks`

| Hook | Current Location | Lines | Apps Using |
|------|-----------------|-------|------------|
| `useRecentPages` | Each app-layout.tsx | ~60 | All 3 |
| `useContextBreadcrumbs` | Each app-layout.tsx | ~50 | All 3 |
| `useContextualNavigation` | Each app-layout.tsx | ~30 | All 3 |
| `useTopNavShortcuts` | Each app-layout.tsx | ~20 | All 3 |

### Proposed Shared Hook

```typescript
// @ghxstship/config/hooks/useAppNavigation.ts
export function useAppNavigation(config: {
  appName: string;
  navigation: SidebarNavSection[];
  productionNavigation?: SidebarNavSection[];
  demoData: DemoData;
}) {
  const recentPages = useRecentPages(config.appName);
  const contextBreadcrumbs = useContextBreadcrumbs(config.demoData);
  const contextualNavigation = useContextualNavigation(config);
  
  return {
    recentPages,
    contextBreadcrumbs,
    contextualNavigation,
    // ... other navigation utilities
  };
}
```

---

## 5. Component Usage Inconsistencies

### Header Components

| Pattern | Usage Count | Apps |
|---------|-------------|------|
| `EnterprisePageHeader` only | 180+ | All |
| `EnterprisePageHeader` + `MainContent` | 120+ | All |
| `ListPage` (includes header) | 60+ | All |
| Inline `Kicker` + `H2` + `Body` | 15+ | GVTEWAY |

**Recommendation:** Standardize:
- Use `ListPage` for list/table pages (includes header)
- Use `EnterprisePageHeader` + `MainContent` for other pages
- Remove inline header patterns

### Loading States

| Pattern | Usage |
|---------|-------|
| `<AppLoadingLayout text="..." />` | Correct |
| `<Spinner />` inline | Inconsistent |
| `<Skeleton />` components | Correct |
| Custom loading cards | Inconsistent |

**Recommendation:** Always use `AppLoadingLayout` or `AppSkeletonLayout`

### Error States

| Pattern | Usage |
|---------|-------|
| `<EmptyState title="Error" ... />` | Common |
| Custom error cards | Inconsistent |
| `if (error) return <ErrorCard />` | Correct |

**Recommendation:** Create `ErrorState` component in `@ghxstship/ui`

---

## 6. Implementation Plan

### Phase 1: Extract Shared Hooks (Low Risk)

**Effort:** 1-2 days  
**Impact:** High code reduction, no UI changes

1. Create `@ghxstship/config/hooks/useRecentPages.ts`
2. Create `@ghxstship/config/hooks/useAppNavigation.ts`
3. Update all three app-layout.tsx files to use shared hooks
4. Remove duplicated hook code

### Phase 2: Create Shared Auth Layout Factory (Medium Risk)

**Effort:** 1 day  
**Impact:** Reduces 213 lines to ~50 lines

1. Create `@ghxstship/config/layouts/createAuthenticatedLayout.tsx`
2. Update each app's `(authenticated)/layout.tsx` to use factory
3. Test auth flows in all apps

### Phase 3: Standardize Page Templates (Medium Risk)

**Effort:** 3-5 days  
**Impact:** Consistent UX across all apps

1. Audit all pages using `EnterprisePageHeader` + `ListPage` (redundant)
2. Remove redundant headers from ListPage usages
3. Standardize dashboard pages to use `Section` + `SectionHeader`
4. Create `SettingsHubPage` template component

### Phase 4: Create Base App Layout (Higher Risk)

**Effort:** 3-5 days  
**Impact:** Major code reduction, requires thorough testing

1. Create `@ghxstship/config/layouts/BaseAppLayout.tsx`
2. Create app-specific config objects
3. Migrate each app to use BaseAppLayout
4. Remove duplicated layout code

### Phase 5: Create Error/Loading Components (Low Risk)

**Effort:** 1 day  
**Impact:** Consistent error handling

1. Create `ErrorState` component in `@ghxstship/ui`
2. Update pages to use consistent error patterns
3. Document standard loading/error patterns

---

## 7. Priority Matrix

| Task | Effort | Impact | Priority |
|------|--------|--------|----------|
| Extract `useRecentPages` hook | Low | High | **P1** |
| Remove redundant headers from ListPage | Low | Medium | **P1** |
| Create auth layout factory | Medium | High | **P2** |
| Standardize dashboard sections | Medium | Medium | **P2** |
| Create BaseAppLayout | High | Very High | **P3** |
| Create ErrorState component | Low | Medium | **P3** |
| Create SettingsHubPage template | Low | Low | **P4** |

---

## 8. Metrics & Success Criteria

### Before Normalization
- Total layout code: ~1,824 lines (3 files)
- Total auth layout code: ~213 lines (3 files)
- Duplicated hook code: ~180 lines
- Inconsistent page patterns: 40+ pages

### After Normalization (Target)
- Total layout code: ~800 lines (shared + configs)
- Total auth layout code: ~80 lines (factory + configs)
- Duplicated hook code: 0 lines
- Inconsistent page patterns: 0 pages

### Success Criteria
- [ ] All apps use shared `useRecentPages` hook
- [ ] All apps use shared auth layout factory
- [ ] All ListPage usages have no redundant headers
- [ ] All dashboard pages use `Section` + `SectionHeader`
- [ ] All error states use `ErrorState` component
- [ ] Build passes for all three apps
- [ ] No visual regressions in UI

---

## Appendix A: Files to Modify

### Phase 1 Files
- `packages/config/hooks/useRecentPages.ts` (new)
- `packages/config/hooks/useAppNavigation.ts` (new)
- `packages/config/hooks/index.ts` (update exports)
- `apps/atlvs/src/components/app-layout.tsx`
- `apps/compvss/src/components/app-layout.tsx`
- `apps/gvteway/src/components/app-layout.tsx`

### Phase 2 Files
- `packages/config/layouts/createAuthenticatedLayout.tsx` (new)
- `packages/config/layouts/index.ts` (new)
- `apps/atlvs/src/app/(authenticated)/layout.tsx`
- `apps/compvss/src/app/(authenticated)/layout.tsx`
- `apps/gvteway/src/app/(authenticated)/layout.tsx`

### Phase 3 Files (Sample - 40+ pages)
- `apps/compvss/src/app/(authenticated)/equipment/page.tsx`
- `apps/compvss/src/app/(authenticated)/dashboard/page.tsx`
- `apps/gvteway/src/app/(authenticated)/settings/page.tsx`
- (See grep results for full list)

---

## Appendix B: Component Import Standardization

### Current Import Patterns (Inconsistent)

```tsx
// Pattern 1: Direct imports
import { ListPage, Badge, ... } from '@ghxstship/ui';

// Pattern 2: Destructured imports
import {
  ListPage,
  Badge,
  RecordFormModal,
  // ... 20+ imports
} from '@ghxstship/ui';

// Pattern 3: Mixed with config
import { ListPage } from '@ghxstship/ui';
import { useAuthContext } from '@ghxstship/config';
```

### Recommended Pattern

```tsx
// UI components
import {
  // Layout
  ListPage,
  EnterprisePageHeader,
  MainContent,
  Container,
  // Data display
  Badge,
  Card,
  Grid,
  Stack,
  // Forms
  RecordFormModal,
  ConfirmDialog,
  // Types
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';

// Config/hooks
import {
  useAuthContext,
  createExportHandler,
  ADMIN_ROLES,
} from '@ghxstship/config';

// App-specific hooks
import { useEntity } from '@/hooks/useEntity';
```

---

*Report generated by Cascade AI - December 27, 2024*
