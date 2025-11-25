# Shared Packages & Infrastructure Inventory

**Purpose:** Shared UI components, utilities, configurations, and backend services  
**Last Updated:** November 23, 2025

---

## Packages Overview

| Package | Type | Purpose | Status |
|---------|------|---------|--------|
| `@ghxstship/ui` | UI Library | Shared components & design system | ✅ Complete |
| `@ghxstship/config` | Utilities | Shared configurations & contexts | ✅ Complete |
| `config-eslint` | Config | ESLint configuration | ✅ Complete |
| `config-postcss` | Config | PostCSS configuration | ✅ Complete |
| `config-tailwind` | Config | Tailwind configuration | ✅ Complete |
| `config-typescript` | Config | TypeScript configuration | ✅ Complete |
| `api-specs` | Documentation | OpenAPI specifications | 🟡 In Progress |

---

## UI Component Library (@ghxstship/ui)

### Atomic Design Structure

The UI library follows atomic design principles:
- **Atoms** - Basic building blocks
- **Molecules** - Simple component combinations
- **Organisms** - Complex UI sections
- **Templates** - Page-level layouts
- **Foundations** - Layout & spacing utilities

### Atoms (13 Components)

| Component | File Path | Purpose | Key Props |
|-----------|-----------|---------|-----------|
| `Badge` | `src/atoms/badge.tsx` | Status indicators | variant, size |
| `Button` | `src/atoms/button.tsx` | Action triggers | variant, size, disabled |
| `Checkbox` | `src/atoms/checkbox.tsx` | Boolean input | checked, onChange |
| `Divider` | `src/atoms/divider.tsx` | Visual separator | orientation |
| `Icon` | `src/atoms/icon.tsx` | Icon wrapper | name, size |
| `Input` | `src/atoms/input.tsx` | Text input | type, placeholder, value |
| `Radio` | `src/atoms/radio.tsx` | Radio button | checked, value |
| `Select` | `src/atoms/select.tsx` | Dropdown select | options, value |
| `SocialIcon` | `src/atoms/social-icon.tsx` | Social media icons | platform |
| `Spinner` | `src/atoms/spinner.tsx` | Loading indicator | size |
| `Switch` | `src/atoms/switch.tsx` | Toggle switch | checked, onChange |
| `Textarea` | `src/atoms/textarea.tsx` | Multi-line input | rows, value |
| `Typography` | `src/atoms/typography.tsx` | Text styles | variant, as |

### Molecules (15 Components)

| Component | File Path | Purpose | Key Props |
|-----------|-----------|---------|-----------|
| `Alert` | `src/molecules/alert.tsx` | Alert messages | type, title, message |
| `Breadcrumb` | `src/molecules/breadcrumb.tsx` | Navigation breadcrumbs | items |
| `ButtonGroup` | `src/molecules/button-group.tsx` | Grouped buttons | buttons, orientation |
| `Card` | `src/molecules/card.tsx` | Content container | title, children |
| `Dropdown` | `src/molecules/dropdown.tsx` | Dropdown menu | items, trigger |
| `EmptyState` | `src/molecules/empty-state.tsx` | No data placeholder | title, description, action |
| `Field` | `src/molecules/field.tsx` | Form field wrapper | label, error, hint |
| `LoadingSpinner` | `src/molecules/loading-spinner.tsx` | Loading state | message |
| `Newsletter` | `src/molecules/newsletter.tsx` | Newsletter signup | onSubmit |
| `Pagination` | `src/molecules/pagination.tsx` | Page navigation | current, total, onChange |
| `ProjectCard` | `src/molecules/project-card.tsx` | Project display | project data |
| `ServiceCard` | `src/molecules/service-card.tsx` | Service display | service data |
| `Skeleton` | `src/molecules/skeleton.tsx` | Loading placeholder | variant |
| `StatCard` | `src/molecules/stat-card.tsx` | Statistic display | label, value, change |
| `Table` | `src/molecules/table.tsx` | Data table | columns, data |
| `Tabs` | `src/molecules/tabs.tsx` | Tab navigation | tabs, active, onChange |

### Organisms (5 Components)

| Component | File Path | Purpose | Key Props |
|-----------|-----------|---------|-----------|
| `Footer` | `src/organisms/footer.tsx` | Site footer | links, social |
| `FormWizard` | `src/organisms/form-wizard.tsx` | Multi-step form | steps, onSubmit |
| `Hero` | `src/organisms/hero.tsx` | Hero section | title, subtitle, cta |
| `ImageGallery` | `src/organisms/image-gallery.tsx` | Image gallery | images |
| `Modal` | `src/organisms/modal.tsx` | Modal dialog | isOpen, onClose, children |
| `Navigation` | `src/organisms/navigation.tsx` | Main navigation | items, user |

### Templates (2 Components)

| Component | File Path | Purpose | Key Props |
|-----------|-----------|---------|-----------|
| `PageLayout` | `src/templates/page-layout.tsx` | Page wrapper | children, title |
| `SectionLayout` | `src/templates/section-layout.tsx` | Section wrapper | children |

### Foundations (1 Component)

| Component | File Path | Purpose | Key Props |
|-----------|-----------|---------|-----------|
| `Layout` | `src/foundations/layout.tsx` | Layout utilities | Container, Grid, Flex |

---

## Config Package (@ghxstship/config)

### Utility Files (20 Total)

| File | Purpose | Exports |
|------|---------|---------|
| `analytics-client.ts` | Analytics integration | Analytics client setup |
| `api-client.ts` | API client | Axios/fetch wrapper |
| `auth-context.tsx` | Auth state management | AuthProvider, useAuth |
| `auth-utils.ts` | Auth helpers | Token management |
| `constants.ts` | App constants | API URLs, feature flags |
| `date-utils.ts` | Date formatting | formatDate, parseDate |
| `error-handler.ts` | Error handling | Error boundaries |
| `feature-flags.ts` | Feature toggles | isFeatureEnabled |
| `format-utils.ts` | Data formatting | Currency, numbers |
| `hooks.ts` | Custom React hooks | useDebounce, useAsync |
| `logger.ts` | Logging utility | log, warn, error |
| `media-queries.ts` | Responsive breakpoints | useMediaQuery |
| `permissions.ts` | Permission checks | hasPermission |
| `rate-limiter.ts` | Rate limiting | Rate limit logic |
| `retry-logic.ts` | Retry failed requests | retry, exponentialBackoff |
| `storage.ts` | LocalStorage wrapper | get, set, remove |
| `supabase-client.ts` | Supabase setup | Supabase client instance |
| `theme.ts` | Theme configuration | Colors, fonts, spacing |
| `types.ts` | Shared TypeScript types | Common interfaces |
| `validation.ts` | Form validation | Validation schemas |
| `package.json` | Package config | Dependencies |

---

## Backend Infrastructure

### Supabase Edge Functions (14 Total)

| Function | Directory | Purpose | Trigger |
|----------|-----------|---------|---------|
| automation-actions | `automation-actions/` | Execute automated workflows | Manual/scheduled |
| automation-triggers | `automation-triggers/` | Listen for automation events | Database events |
| broadcast-updates | `broadcast-updates/` | Real-time notifications | Database changes |
| cache-warmer | `cache-warmer/` | Pre-warm caches | Scheduled |
| cleanup-jobs | `cleanup-jobs/` | Data cleanup tasks | Scheduled |
| deal-project-handoff | `deal-project-handoff/` | Transfer deals to projects | API call |
| email-notifications | `email-notifications/` | Send transactional emails | Database events |
| file-upload | `file-upload/` | Handle file uploads | HTTP request |
| health-check | `health-check/` | System health monitoring | HTTP request |
| integration-webhook-ingest | `integration-webhook-ingest/` | Process external webhooks | HTTP POST |
| webhook-gvteway | `webhook-gvteway/` | GVTEWAY webhooks | HTTP POST |
| webhook-stripe | `webhook-stripe/` | Stripe payment webhooks | HTTP POST |
| webhook-twilio | `webhook-twilio/` | Twilio SMS webhooks | HTTP POST |
| _shared | `_shared/` | Shared utilities | (library) |

### Database Migrations (29 Total)

| # | Migration | Purpose | Tables Created/Modified |
|---|-----------|---------|------------------------|
| 0001 | core_schema.sql | Foundation schema | Core tables & types |
| 0002 | ops_finance.sql | Operations & finance | Budgets, ledger, POs |
| 0003 | event_roles_auth.sql | Events & roles | Events, tickets, roles |
| 0004 | integration_sync.sql | Integration support | Sync tables, webhooks |
| 0005 | client_feedback_kpi.sql | Analytics | Feedback, KPIs |
| 0006 | automation_catalog.sql | Automation rules | Workflows, triggers |
| 0007 | audit_security.sql | Audit logging | Audit tables |
| 0008 | security_controls.sql | Security features | RLS policies |
| 0009 | webhook_events.sql | Webhook logging | Event logs |
| 0010 | auth_role_mapping.sql | Auth roles | Role mappings |
| 0011 | role_workflows.sql | Workflow permissions | Workflow tables |
| 0012 | rls_full_coverage.sql | RLS policies | Policy updates |
| 0013 | rls_missing_policies.sql | Additional RLS | Policy fixes |
| 0014 | business_logic_rpcs.sql | Stored procedures | RPCs & functions |
| 0015 | role_definitions_complete.sql | Role definitions | Role enums |
| 0016 | seed_data.sql | Initial data | Sample data |
| 0017 | database_triggers.sql | Database triggers | Trigger functions |
| 0018 | advanced_rpcs.sql | Advanced functions | Complex RPCs |
| 0019 | event_role_tables.sql | Event roles | Event permissions |
| 0020 | indexes_optimization.sql | Performance indexes | Database indexes |
| 0021 | dashboard_views.sql | Dashboard data | Materialized views |
| 0022 | analytics_functions.sql | Analytics RPCs | Reporting functions |
| 0023 | validation_constraints.sql | Data validation | Check constraints |
| 0024 | cascade_deletes.sql | Referential integrity | Foreign keys |
| 0025 | realtime_config.sql | Real-time setup | Realtime config |
| 0026 | performance_tuning.sql | Query optimization | Query improvements |
| 0027 | security_hardening.sql | Security enhancements | Security updates |
| 0028 | log_retention_policy.sql | Log management | Log retention |
| 0029 | alert_thresholds.sql | Monitoring alerts | Alert configs |

---

## Configuration Packages

### ESLint Config (config-eslint)
**File:** `index.js`  
**Features:**
- Next.js rules
- TypeScript support
- React hooks rules
- Import sorting
- Accessibility checks

### PostCSS Config (config-postcss)
**File:** `index.js`  
**Plugins:**
- Tailwind CSS
- Autoprefixer
- CSS nesting
- CSS imports

### Tailwind Config (config-tailwind)
**File:** `index.js`  
**Customization:**
- Brand colors
- Typography scales
- Spacing system
- Breakpoints
- Custom utilities

### TypeScript Config (config-typescript)
**File:** `tsconfig.json`  
**Options:**
- Strict mode enabled
- Path aliases
- JSX support
- Module resolution

---

## API Specifications

### OpenAPI Specs (api-specs)

| App | Directory | Status | Description |
|-----|-----------|--------|-------------|
| ATLVS | `atlvs/` | 🟡 | Business ops API spec |
| COMPVSS | `compvss/` | 🟡 | Production API spec |
| GVTEWAY | `gvteway/` | 🟡 | Marketplace API spec |
| Shared | `shared-schemas/` | 🟡 | Common schemas |

**Tools:**
- OpenAPI 3.0 format
- Spectral linting (`.spectral.yaml`)
- Auto-generated types (planned)

---

## Scripts & Utilities

### Deployment Scripts (scripts/)

| Script | Purpose | Usage |
|--------|---------|-------|
| `backup-restore.sh` | Database backup/restore | `./scripts/backup-restore.sh` |
| `rollback.sh` | Deployment rollback | `./scripts/rollback.sh` |
| `rotate-keys.sh` | Rotate API keys | `./scripts/rotate-keys.sh` |
| `setup-env.sh` | Environment setup | `./scripts/setup-env.sh` |

---

## CI/CD Workflows (.github/workflows)

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Backup | `backup.yml` | Scheduled | Database backups |
| CI | `ci.yml` | Push, PR | Tests & linting |
| Deploy | `deploy.yml` | Main branch | Production deploy |
| Additional | Various | Various | Other workflows |

---

## Design Tokens & Theme

### Color Palette
```typescript
// From theme configuration
colors: {
  ink: { /* 50-950 scale */ },
  primary: { /* Brand colors */ },
  secondary: { /* Accent colors */ },
  success: { /* Green tones */ },
  warning: { /* Yellow tones */ },
  error: { /* Red tones */ }
}
```

### Typography Scale
- Font families: Display, Body, Code
- Font sizes: xs → 5xl
- Font weights: 400, 500, 600, 700, 800
- Line heights: Optimized per size

### Spacing System
- Base unit: 4px (0.25rem)
- Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

### Breakpoints
- xs: 0px
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

## Shared Build Checklist

### UI Library ✅
- [x] All atomic components
- [x] All molecule components
- [x] All organism components
- [x] Template components
- [x] Foundation utilities
- [x] Documentation (partial)
- [ ] Storybook setup
- [ ] Component tests

### Config Package ✅
- [x] API client setup
- [x] Auth utilities
- [x] Supabase client
- [x] Custom hooks
- [x] Type definitions
- [x] Validation schemas
- [ ] Full test coverage

### Database ✅
- [x] All migrations
- [x] RLS policies
- [x] Database functions
- [x] Triggers
- [x] Indexes
- [x] Views
- [ ] Performance monitoring

### Edge Functions ✅
- [x] All function scaffolds
- [x] Shared utilities
- [x] Webhook handlers
- [ ] Full implementation
- [ ] Error handling
- [ ] Monitoring

### CI/CD 🟡
- [x] Basic workflows
- [ ] Automated testing
- [ ] Deployment automation
- [ ] Environment management
- [ ] Rollback procedures

---

## Usage Guidelines

### When to Use Shared Components
✅ **Use shared UI components for:**
- Common UI patterns across apps
- Consistent design language
- Reusable form elements
- Layout structures

❌ **Don't use shared components for:**
- App-specific business logic
- One-off custom designs
- Experimental features

### When to Add to Config Package
✅ **Add utilities that:**
- Are used in 2+ apps
- Provide common functionality
- Have no app-specific dependencies

### When to Create Edge Functions
✅ **Create edge functions for:**
- Webhook processing
- Scheduled jobs
- Complex server-side logic
- Third-party integrations

---

## Maintenance Notes

**Component Library:**
- Review new component requests
- Maintain backward compatibility
- Document breaking changes
- Version appropriately

**Database Migrations:**
- Never edit existing migrations
- Always create new migrations
- Test migrations thoroughly
- Document breaking changes

**Edge Functions:**
- Monitor function logs
- Track execution times
- Implement retries
- Handle errors gracefully
