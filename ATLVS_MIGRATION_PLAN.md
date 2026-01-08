# ATLVS App - UI v2 Migration Plan

**Generated:** 2026-01-08
**App:** atlvs
**Branch:** `claude/ui-v2-rebuild-wpLaO`

---

## 📊 Analysis Results

### Current State
- **Total Files:** 1,128
- **Files with v1 imports:** 188 (17%)
- **Unique v1 components:** 141
- **Total component usages:** 2,062
- **Estimated effort:** 48 hours (~6 days)

### Top Components Used
1. Body - 162 usages
2. Stack - 140 usages
3. Grid - 134 usages
4. Card - 122 usages
5. Button - 107 usages
6. Box - 100 usages
7. Badge - 72 usages
8. Container - 68 usages

### Risk Assessment
- 🟢 **Low Risk:** 6 components (~1 hour)
- 🟡 **Medium Risk:** 7 components (~2 hours)
- 🔴 **High Risk:** 3 components (~2 hours)
- ⚪ **Unknown/Custom:** 125 components (~42 hours)

### Breaking Changes
- ✅ **11 Modal → Dialog** conversions needed
- ✅ **37 Boolean props** with "is" prefix to update

---

## 🎯 Migration Strategy

### Phase 1: Setup & Preparation (Day 1 - 4 hours)

#### 1.1 Install Dependencies
```bash
cd apps/atlvs
pnpm add @ghxstship/ui-v2
# Keep @ghxstship/ui during transition
```

#### 1.2 Set Up Brand Configuration
Create `apps/atlvs/config/brand.ts`:
```typescript
import type { BrandConfig } from '@ghxstship/ui-v2/tokens';

export const atlvsBrand: BrandConfig = {
  identity: {
    name: 'ATLVS',
    brandColor: '#7B68EE', // Adjust to ATLVS brand color
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
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

#### 1.3 Wrap App with BrandProvider
Update root layout:
```typescript
// apps/atlvs/app/layout.tsx or main entry
import { BrandProvider } from '@ghxstship/ui-v2/whitelabel';
import { atlvsBrand } from '../config/brand';
import '@ghxstship/ui-v2/styles/foundation.css';
import '@ghxstship/ui-v2/styles/semantic.css';

export default function RootLayout({ children }) {
  return (
    <BrandProvider brand={atlvsBrand}>
      {children}
    </BrandProvider>
  );
}
```

#### 1.4 Test Setup
- Create a simple test page using v2 components
- Verify BrandProvider works
- Check CSS loads correctly

---

### Phase 2: Automated Transformations (Day 2 - 8 hours)

Run codemods in this order:

#### 2.1 Transform Imports
```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-imports.js apps/atlvs/src
```
**Expected:** ~188 files modified

#### 2.2 Transform Modal to Dialog
```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-modal-to-dialog.js apps/atlvs/src
```
**Expected:** ~11 occurrences updated

#### 2.3 Transform Boolean Props
```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-boolean-props.js apps/atlvs/src
```
**Expected:** ~37 occurrences updated

#### 2.4 Transform Size Props
```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-size-props.js apps/atlvs/src
```

#### 2.5 Transform Stack Components
```bash
npx jscodeshift -t packages/ui-v2/migration/codemods/transform-stack.js apps/atlvs/src
```
**Expected:** ~140 occurrences updated

#### 2.6 Verify TypeScript
```bash
cd apps/atlvs
pnpm typecheck
```
**Action:** Fix any TypeScript errors that arise

---

### Phase 3: Manual Migrations (Days 3-4 - 16 hours)

Migrate complex/custom components that codemods can't handle:

#### Priority 1: Core UI Components (4 hours)
- [ ] Marketing pages (MarketingPage, HeroSection, etc.)
- [ ] Auth layouts (AuthSplitLayout, AuthPage)
- [ ] Form components (Form, FormFieldConfig)

#### Priority 2: Page Templates (6 hours)
- [ ] ListPage → Use v2 ListPage pattern
- [ ] DetailPage → Use v2 DetailPage pattern
- [ ] EditPage → Use v2 EditPage pattern
- [ ] CreatePage → Use v2 CreatePage pattern

**Opportunity:** Replace custom page templates with v2 pattern components!

#### Priority 3: Dashboard Components (4 hours)
- [ ] StatsSection → Use StatCard pattern
- [ ] Dashboard layouts → Use DashboardGrid pattern

#### Priority 4: Specialized Components (2 hours)
- [ ] AIChatLayout and chat components
- [ ] Wizard components
- [ ] Settings pages

---

### Phase 4: Testing & Fixes (Day 5 - 8 hours)

#### 4.1 Unit Tests (2 hours)
- Update component tests
- Fix mocks and imports
- Ensure test coverage maintained

#### 4.2 Integration Tests (2 hours)
- Test user flows
- Verify form submissions
- Check navigation

#### 4.3 Visual Regression (2 hours)
- Take before/after screenshots
- Compare layouts
- Fix styling issues

#### 4.4 Accessibility Testing (2 hours)
- Screen reader testing
- Keyboard navigation
- WCAG compliance check

---

### Phase 5: Optimization & Cleanup (Day 6 - 8 hours)

#### 5.1 Bundle Analysis (2 hours)
```bash
pnpm build
pnpm analyze # If you have bundle analyzer
```
- Verify tree-shaking working
- Check bundle size reduction
- Optimize imports

#### 5.2 Performance Testing (2 hours)
- Lighthouse scores
- Page load times
- Runtime performance

#### 5.3 Remove v1 Dependency (2 hours)
```bash
pnpm remove @ghxstship/ui
```
- Remove any remaining v1 references
- Clean up unused imports
- Update package.json

#### 5.4 Documentation (2 hours)
- Document custom migrations
- Update component usage docs
- Create migration notes for team

---

## 📝 Component-Specific Migrations

### High-Priority Conversions

#### 1. Card Components (122 usages)
Many Card uses can benefit from compound components:

```typescript
// Before
<Card title="User Details" subtitle="View and edit">
  <UserForm />
</Card>

// After
<Card>
  <Card.Header>
    <Card.Title>User Details</Card.Title>
    <Card.Description>View and edit</Card.Description>
  </Card.Header>
  <Card.Content>
    <UserForm />
  </Card.Content>
</Card>
```

#### 2. Table Components
Replace custom Table with v2 Table:

```typescript
// Use new type-safe Table
<Table<User>
  columns={[
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
  ]}
  data={users}
  rowKey="id"
  onRowClick={(user) => navigate(`/users/${user.id}`)}
/>
```

#### 3. Page Templates
**Major Win:** Replace custom page implementations with v2 patterns:

```typescript
// Instead of custom DetailPage
<DetailPage
  title="User Details"
  breadcrumbs={<Breadcrumb items={breadcrumbs} />}
  actions={<Button>Edit</Button>}
  sidebar={<UserSidebar />}
>
  <UserDetails />
</DetailPage>
```

---

## 🚨 Gotchas & Known Issues

### 1. Custom Components
Many "Unknown" components (Body, Section, etc.) appear to be custom. These need:
- Manual inspection
- May benefit from v2 primitives
- Consider replacing with v2 patterns

### 2. Boolean Props
Codemod may miss:
- Spread props: `{...props}` with isOpen inside
- Dynamic prop names
- Props in object literals

**Action:** Manual search for remaining instances

### 3. Imports in Test Files
Codemods work on test files, but may need manual adjustment for:
- Mock imports
- Test utilities
- Snapshot updates

---

## ✅ Success Criteria

Migration complete when:
- [ ] All TypeScript errors resolved
- [ ] All tests passing
- [ ] Visual regression tests pass
- [ ] Bundle size reduced by ~30-40%
- [ ] Accessibility maintained (WCAG AA minimum)
- [ ] Performance metrics maintained or improved
- [ ] No v1 dependency in package.json
- [ ] Documentation updated

---

## 📊 Progress Tracking

### Week 1
- [ ] Day 1: Setup & Preparation
- [ ] Day 2: Automated Transformations
- [ ] Day 3-4: Manual Migrations
- [ ] Day 5: Testing & Fixes
- [ ] Day 6: Optimization & Cleanup

### Metrics to Track
- Files migrated: 0 / 188
- Components migrated: 0 / 2,062
- Tests passing: 0 / X
- Bundle size: Before vs After
- Build time: Before vs After

---

## 🆘 Support & Resources

### Documentation
- [Migration Guide](../packages/ui-v2/MIGRATION_GUIDE.md)
- [Component Mapping](../packages/ui-v2/migration/component-mapping.json)
- [Codemods README](../packages/ui-v2/migration/codemods/README.md)

### Tools
```bash
# Run analyzer anytime
node packages/ui-v2/migration/cli/analyze.js apps/atlvs/src

# Test codemods (dry run)
npx jscodeshift -t [codemod].js --dry --print apps/atlvs/src
```

### Communication
- Slack: #ui-v2-migration
- Questions: Tag UI team
- Issues: GitHub issues with `migration` label

---

## 🎯 Next Steps

1. **Review this plan** with the team
2. **Schedule migration window** (ideally 1-2 weeks)
3. **Create feature branch** from `claude/ui-v2-rebuild-wpLaO`
4. **Run Phase 1** (setup)
5. **Test on staging** before proceeding
6. **Execute phases** 2-5 sequentially
7. **Deploy** after all tests pass

---

**Status:** Ready to Execute
**Owner:** TBD
**Target Completion:** TBD
