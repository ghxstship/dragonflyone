# GHXSTSHIP Platform Backlog

> Product backlog for the GHXSTSHIP platform (ATLVS, COMPVSS, GVTEWAY).  
> Follows industry-standard backlog management practices with clear ownership, sizing, and acceptance criteria.

**Last Updated:** December 4, 2025  
**Backlog Owner:** Engineering Team  
**Review Cadence:** Weekly

---

## Quick Stats

| Metric | Count |
|--------|-------|
| P0 (Critical) | 1 |
| P1 (High) | 2 |
| P2 (Medium) | 5 |
| P3 (Low) | 5 |
| Completed (Last 30 Days) | 8 |
| Total Pages | 512 |
| Design System Violations | 0 |

---

## Priority Definitions

| Priority | Definition | SLA |
|----------|------------|-----|
| **P0** | Blocking deployment or core functionality | Immediate |
| **P1** | Active work, enterprise readiness | This sprint |
| **P2** | Planned features, technical debt | Next 2-4 sprints |
| **P3** | Nice-to-haves, future enhancements | Backlog |

---

## P0 - Critical

### BACK-001: ExperienceGeneratorSchema Database Deployment

| Field | Value |
|-------|-------|
| **Status** | Blocked - Pending Deployment |
| **Owner** | Unassigned |
| **Effort** | S (1-2 hours) |
| **Created** | Dec 3, 2025 |
| **Blocked By** | Manual Supabase deployment required |
| **Blocks** | Credentials, Sponsorship, SOPs features |

**Description:**  
Deploy database migrations for ExperienceGeneratorSchema to enable new platform features.

**Acceptance Criteria:**
- [ ] Migrations deployed via `npx supabase db push`
- [ ] TypeScript types regenerated via `npx supabase gen types typescript`
- [ ] `supabase-types.ts` updated with new table definitions
- [ ] UI components created for credentials, sponsorship, SOPs
- [ ] API routes added for new functionality

**References:**
- `docs/EXPERIENCE_GENERATOR_GAP_ANALYSIS.md`
- `supabase/migrations/0142_experience_generator_system.sql`

---

## P1 - High Priority

### BACK-002: Navigation Architecture - Phase 8

| Field | Value |
|-------|-------|
| **Status** | In Progress (87% complete) |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 2024 |
| **Dependencies** | None |

**Description:**  
Complete cross-app integration for the navigation architecture restructure.

**Progress:**
- [x] Phase 1-4: Infrastructure & app configs
- [x] Phase 5: ATLVS production pages (40 pages)
- [x] Phase 6: COMPVSS production pages (32 pages)
- [x] Phase 7: GVTEWAY event pages (15 pages)
- [ ] Phase 8: Cross-app integration

**Acceptance Criteria:**
- [ ] Deep linking between apps (ATLVS <-> COMPVSS <-> GVTEWAY)
- [ ] Unified search across all apps
- [ ] Role-based navigation filtering (`filterByRole` implementation)

**References:**
- `docs/NAVIGATION_ARCHITECTURE.md`
- `packages/ui/src/navigation/`

---

### BACK-003: Design System ESLint Enforcement

| Field | Value |
|-------|-------|
| **Status** | In Progress (95% complete) |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Nov 27, 2025 |
| **Violations** | 0 PROHIBITED, ~4200 warnings |

**Description:**  
Fix remaining ESLint violations and upgrade rules from warnings to errors.

**Progress (Dec 4, 2025):**
- [x] Fix font weight violations (`font-normal`, `font-medium`, `font-bold`, `font-semibold`) → `font-weight-*`
- [x] Fix border radius violations (`rounded-lg`, `rounded-full`, `rounded-md`, etc.) → `rounded-button/card/modal/avatar`
- [x] Fix letter spacing violations (`tracking-wide`, `tracking-widest`, etc.) → `tracking-label`
- [x] Fix arbitrary hex colors → `brand-pink`, `brand-cyan` tokens
- [x] Fix arbitrary shadows → `shadow-brand-*`, `shadow-subtle-*` tokens
- [x] Fix raw text sizes (`text-sm`, `text-xs`, etc.) → `text-body-*`, `text-mono-*`
- [x] Fix slow animation durations → `duration-slow`
- [x] Add brand colors to design system (`#FF006E`, `#00BFFF`)
- [x] Add brand shadow tokens to design system
- [ ] Upgrade ESLint rules from "warn" to "error"
- [ ] Zero warnings in CI pipeline

**Remaining Warnings (not blocking):**
- ~1500 `@typescript-eslint/no-explicit-any` - TypeScript strictness
- ~250 `@typescript-eslint/no-unused-vars` - Unused supabase clients
- ~1700 `tailwindcss/classnames-order` - Class ordering
- ~160 `border` warnings - Default 1px border on non-interactive elements
- ~100 `no-console` - Console statements

**References:**
- `ZERO-RAW-TAILWIND-ENFORCEMENT.md`
- `DESIGN-SYSTEM-ENFORCEMENT-AUDIT.md`

---

## P2 - Medium Priority

### BACK-004: UI Style Guide Refactor

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | XL (2+ weeks) |
| **Created** | Nov 27, 2025 |
| **Scope** | 512 pages |

**Description:**  
Refactor all authenticated pages to align with GHXSTSHIP design system.

**Acceptance Criteria:**
- [ ] ATLVS pages refactored (197 pages)
- [ ] GVTEWAY pages refactored (174 pages)
- [ ] COMPVSS pages refactored (141 pages)
- [ ] All pages pass ESLint design system rules

**References:**
- `docs/design/STYLE-GUIDE-PREVIEW.jsx`

---

### BACK-005: Test Coverage Analysis

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | S (1-2 hours) |
| **Created** | Dec 4, 2025 |

**Description:**  
Analyze test coverage and identify gaps in critical paths.

**Acceptance Criteria:**
- [ ] Run `pnpm test --coverage` and document results
- [ ] Identify gaps in auth, payments, data mutations
- [ ] Add integration tests for API endpoints
- [ ] Coverage report added to CI pipeline

---

### BACK-006: API Versioning

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 4, 2025 |

**Description:**  
Implement API versioning with `/api/v1/` prefix pattern.

**Acceptance Criteria:**
- [ ] All API routes prefixed with `/api/v1/`
- [ ] Version middleware created
- [ ] API documentation updated
- [ ] Backwards compatibility maintained

---

### BACK-007: Staging Environment

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 4, 2025 |

**Description:**  
Configure staging environment for pre-production testing.

**Acceptance Criteria:**
- [ ] Staging Supabase project created
- [ ] Environment variables configured
- [ ] Staging deployment workflow added
- [ ] Database seeding scripts working

---

### BACK-008: SSO/SAML for Enterprise

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | L (1-2 weeks) |
| **Created** | Dec 4, 2025 |
| **Type** | Enterprise Feature |

**Description:**  
Implement SSO/SAML authentication for enterprise customers.

**Acceptance Criteria:**
- [ ] Supabase SSO capabilities researched
- [ ] SAML provider configuration implemented
- [ ] SSO login flow added to auth pages
- [ ] SSO management UI in settings

---

## P3 - Low Priority

### BACK-009: Detailed Permission System

| Field | Value |
|-------|-------|
| **Status** | Basic Implementation |
| **Effort** | M (3-5 days) |

**Acceptance Criteria:**
- [ ] Permission matrix defined for all resources
- [ ] Resource-level permissions implemented
- [ ] Permission caching added
- [ ] Permission management UI created

---

### BACK-010: Centralized Log Aggregation

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Effort** | M (3-5 days) |

**Acceptance Criteria:**
- [ ] Logging solution selected (Datadog/LogRocket/Axiom)
- [ ] Log shipping configured
- [ ] Dashboards and alerts set up
- [ ] Structured logging for key events

---

### BACK-011: Session Timeout Configuration

| Field | Value |
|-------|-------|
| **Status** | Using Defaults |
| **Effort** | S (1-2 hours) |

**Acceptance Criteria:**
- [ ] Session expiry configured in Supabase
- [ ] Session refresh logic in auth context
- [ ] Timeout warning UI implemented
- [ ] "Remember me" functionality added

---

### BACK-012: Rate Limiting Enforcement

| Field | Value |
|-------|-------|
| **Status** | Partial |
| **Effort** | M (3-5 days) |

**Acceptance Criteria:**
- [ ] Current implementation audited
- [ ] Rate limiting on all public endpoints
- [ ] Per-user rate limits implemented
- [ ] Rate limit headers in responses

---

### BACK-013: Vercel Cron Jobs

| Field | Value |
|-------|-------|
| **Status** | Disabled (Plan Limit) |
| **Effort** | S (1-2 hours) |
| **Blocked By** | Vercel Pro plan upgrade |

**Description:**  
Re-enable cron jobs after upgrading to Vercel Pro plan.

**Cron Jobs:**
| App | Endpoint | Schedule |
|-----|----------|----------|
| ATLVS | `/api/cron/sync-ledger` | Daily |
| ATLVS | `/api/cron/cleanup-sessions` | Daily |
| COMPVSS | `/api/cron/sync-equipment` | Daily |
| COMPVSS | `/api/cron/crew-notifications` | 8am daily |
| GVTEWAY | `/api/cron/ticket-reminders` | 9am daily |
| GVTEWAY | `/api/cron/loyalty-points` | Daily |
| GVTEWAY | `/api/cron/event-notifications` | 6am daily |

---

## Completed (Last 30 Days)

| ID | Item | Completed | Notes |
|----|------|-----------|-------|
| BACK-C01 | Workflow Audit | Dec 4, 2025 | 512 pages audited, 16 E2E specs, 8 loading files |
| BACK-C02 | Loading States | Dec 4, 2025 | Route-level loading.tsx files added |
| BACK-C03 | AI Experience Generator | Dec 3, 2025 | Core implementation complete |
| BACK-C04 | Typography Audit | Nov 27, 2025 | 1,800+ violations fixed |
| BACK-C05 | Text Color Visibility | Nov 27, 2025 | Full visibility system implemented |
| BACK-C06 | Raw Tailwind Migration | Nov 27, 2025 | Design system components adopted |
| BACK-C07 | Theme-Aware Backgrounds | Nov 27, 2025 | Semantic tokens implemented |

---

## Notes & Decisions

- **Vercel Plan:** Hobby plan limits cron jobs to 2 total. Pro plan ($20/mo/member) required for full cron support.
- **Alternative:** Consider external cron services (Upstash, Inngest) if Pro upgrade is delayed.
- **Design System:** ESLint enforcement is transitional; upgrade to errors once violations reach zero.
