# Migration Analysis Guide

Use this checklist to analyze your codebase before migrating.

## Pre-Migration Checklist

### 1. Inventory Components

Run this command to find all UI v1 component usage:

```bash
# Find all imports from @ghxstship/ui
grep -r "from '@ghxstship/ui'" ./src

# Count component usage
grep -r "from '@ghxstship/ui'" ./src | wc -l
```

**Record:**
- Total files importing from v1: _______
- Most used components: _______
- Complex components (Table, Modal, Form): _______

### 2. Identify Breaking Changes

Check your codebase for:

- [ ] **Modal components** → Need to convert to Dialog
- [ ] **Card components with props** → Need compound component pattern
- [ ] **FormControl/FormLabel** → Need to convert to Field
- [ ] **VStack/HStack** → Need to convert to Stack
- [ ] **Boolean props** (isOpen, isLoading, etc.) → Need to remove 'is' prefix
- [ ] **Size props** (large, small) → Need to convert to lg, sm
- [ ] **Custom styled components** → May need redesign with new tokens

### 3. Assess Risk

**Low Risk** (Easy migration):
- [ ] Simple Button usage
- [ ] Basic Input/Textarea
- [ ] Text/Heading components
- [ ] Badge components
- [ ] Simple layouts (Box, Flex)

**Medium Risk** (Moderate changes):
- [ ] Card with multiple props
- [ ] Forms with FormControl
- [ ] Tables
- [ ] Navigation components
- [ ] Alert/Toast usage

**High Risk** (Significant refactoring):
- [ ] Custom styled components
- [ ] Complex forms with validation
- [ ] Complex data tables
- [ ] Custom theme overrides
- [ ] Heavy use of v1-specific patterns

### 4. Estimate Migration Effort

Use this formula:

```
Low Risk Components × 5 minutes = _____ minutes
Medium Risk Components × 15 minutes = _____ minutes
High Risk Components × 30 minutes = _____ minutes
Setup & Testing × 2 hours = 120 minutes

Total Estimated Time: _____ minutes (_____ hours)
```

### 5. Plan Migration Order

**Recommended Order:**

1. **Setup** (Day 1)
   - Install v2
   - Configure BrandProvider
   - Set up brand tokens
   - Test in one component

2. **New Features** (Week 1)
   - Use v2 for all new code
   - Build confidence with APIs
   - Use pattern components for new pages

3. **Simple Pages** (Week 2)
   - Static pages
   - Pages with minimal components
   - Marketing/landing pages

4. **Medium Complexity** (Week 3)
   - Forms
   - List/grid views
   - Dashboard pages

5. **Complex Pages** (Week 4)
   - Custom components
   - Complex forms
   - Data-heavy tables

6. **Cleanup** (Week 5)
   - Remove v1 dependency
   - Optimize bundle size
   - Final testing

### 6. Testing Strategy

- [ ] **Unit Tests**: Update component tests
- [ ] **Integration Tests**: Test user flows
- [ ] **Visual Regression**: Compare before/after screenshots
- [ ] **Accessibility**: Test with screen readers
- [ ] **Performance**: Measure bundle size reduction
- [ ] **Browser Testing**: Test on all supported browsers

### 7. Rollback Plan

**If migration fails:**
- [ ] Keep v1 dependency until fully migrated
- [ ] Use feature flags for gradual rollout
- [ ] Have rollback commit ready
- [ ] Document issues encountered

## Analysis Script

Save this as `analyze-migration.sh`:

```bash
#!/bin/bash

echo "=== UI v1 Migration Analysis ==="
echo ""

echo "📊 Component Usage:"
echo "Total v1 imports:"
grep -r "from '@ghxstship/ui'" ./src --include="*.tsx" --include="*.ts" | wc -l

echo ""
echo "Most used components:"
grep -roh "import {[^}]*} from '@ghxstship/ui'" ./src | \
  grep -o "\w\+" | \
  grep -v "import\|from\|ghxstship\|ui" | \
  sort | uniq -c | sort -rn | head -10

echo ""
echo "🚨 Breaking Changes Detected:"

echo "Modal usage (needs Dialog):"
grep -r "<Modal" ./src --include="*.tsx" | wc -l

echo "VStack/HStack usage (needs Stack):"
grep -r "<VStack\|<HStack" ./src --include="*.tsx" | wc -l

echo "FormControl usage (needs Field):"
grep -r "<FormControl" ./src --include="*.tsx" | wc -l

echo "Boolean props (isOpen, isLoading, etc.):"
grep -r "is[A-Z]\w*=" ./src --include="*.tsx" | wc -l

echo ""
echo "📁 Files to migrate:"
grep -r "from '@ghxstship/ui'" ./src --include="*.tsx" --include="*.ts" -l | wc -l

echo ""
echo "✅ Analysis complete!"
```

## Post-Migration Verification

After migration, verify:

- [ ] All imports resolved correctly
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Visual regression tests pass
- [ ] Accessibility maintained
- [ ] Bundle size reduced
- [ ] Performance maintained or improved
- [ ] Dark mode still works
- [ ] All browsers supported

## Resources

- Migration Guide: `../MIGRATION_GUIDE.md`
- Component Mapping: `./component-mapping.json`
- Support: #ui-v2-migration
