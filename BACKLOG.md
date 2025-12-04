# GHXSTSHIP Platform Backlog

> Product backlog for the GHXSTSHIP platform (ATLVS, COMPVSS, GVTEWAY).  
> Follows industry-standard backlog management practices with clear ownership, sizing, and acceptance criteria.

**Last Updated:** December 4, 2025 (5:42pm EST)  
**Backlog Owner:** Engineering Team  
**Review Cadence:** Weekly

---

## Quick Stats

| Metric | Count |
|--------|-------|
| P0 (Critical) | 3 |
| P1 (High) | 5 |
| P2 (Medium) | 4 |
| P3 (Low) | 0 |
| Completed (Last 30 Days) | 21 |
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

## P0 - Critical (Must Fix Before User Onboarding)

### BACK-014: Complete TODO Implementations in API Routes

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | L (1-2 weeks) |
| **Created** | Dec 4, 2025 |
| **Count** | 30+ TODOs |

**Description:**  
Complete all TODO implementations in production API routes.

**Critical Files:**
- `apps/gvteway/src/app/api/tickets/gift/route.ts` - Gift notification email
- `apps/gvteway/src/app/api/gift-cards/route.ts` - Payment processing
- `apps/gvteway/src/app/api/wallet/route.ts` - Stripe payment/payout
- `apps/gvteway/src/app/api/payment-methods/route.ts` - Payment tokenization
- `apps/compvss/src/app/api/offer-letters/route.ts` - Email with signature
- `apps/compvss/src/app/api/chat/messages/route.ts` - Push notifications

**Acceptance Criteria:**
- [ ] All payment-related TODOs completed
- [ ] All email notification TODOs completed
- [ ] All auth context TODOs replaced with actual session

---

### BACK-015: Replace Hardcoded User/Production IDs

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 4, 2025 |
| **Count** | 15+ files |

**Description:**  
Replace all hardcoded IDs with actual auth context.

**Files Affected:**
- `apps/compvss/src/app/sops/[id]/page.tsx`
- `apps/compvss/src/app/sops/categories/page.tsx`
- `apps/compvss/src/app/credentials/types/page.tsx`
- `apps/compvss/src/app/credentials/zones/page.tsx`
- `apps/compvss/src/app/reports/daily/[id]/page.tsx`

**Acceptance Criteria:**
- [ ] All `'current-user-id'` replaced with auth context
- [ ] All `'current-production-id'` replaced with route params
- [ ] All `'current-org-id'` replaced with auth context

---

### BACK-016: Implement or Hide Stub Pages

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | L (1-2 weeks) |
| **Created** | Dec 4, 2025 |
| **Count** | 30+ pages |

**Description:**  
Implement stub pages or hide from navigation.

**Pages Showing "Coming Soon":**
- GVTEWAY: resale, will-call, promo-codes, inventory-sync, sales-reporting, contests, moderation
- COMPVSS: expenses, background-checks, crew, availability, maintenance, certifications, artists, sops, issues, equipment, logistics, travel, incidents

**Acceptance Criteria:**
- [ ] All stub pages either implemented or hidden from nav
- [ ] No "Coming Soon" visible to users

---

## P1 - High Priority (Should Fix Before Launch)

### BACK-017: Add Error Boundaries

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | S (1-2 hours) |
| **Created** | Dec 4, 2025 |
| **Current** | 3 error.tsx files |

**Acceptance Criteria:**
- [ ] Root error.tsx in each app
- [ ] Error boundaries for critical routes (auth, checkout, dashboard)

---

### BACK-018: Expand Rate Limiting Coverage

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 4, 2025 |
| **Current** | 31 of 834 routes (3.7%) |

**Acceptance Criteria:**
- [ ] All public endpoints rate limited
- [ ] Auth endpoints have strict limits
- [ ] Rate limit headers in all responses

---

### BACK-019: Replace Console Statements with Logger

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | L (1-2 weeks) |
| **Created** | Dec 4, 2025 |
| **Count** | 1,003 console statements |

**Acceptance Criteria:**
- [ ] All console.log replaced with Logger.info
- [ ] All console.error replaced with Logger.error
- [ ] Structured logging in API routes

---

### BACK-020: Add SEO Metadata to GVTEWAY

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 4, 2025 |
| **Current** | 10 pages with metadata |

**Acceptance Criteria:**
- [ ] All public GVTEWAY pages have generateMetadata
- [ ] Open Graph tags for social sharing
- [ ] Proper title/description for SEO

---

### BACK-021: Remove Mock/Dummy Data

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | M (3-5 days) |
| **Created** | Dec 4, 2025 |
| **Count** | 176 files |

**Acceptance Criteria:**
- [ ] All mock data removed or environment-gated
- [ ] No test data visible in production

---

## P2 - Medium Priority (Fix Soon After Launch)

### BACK-022: Implement Dark Mode

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | L (1-2 weeks) |
| **Created** | Dec 4, 2025 |

**Acceptance Criteria:**
- [ ] Dark mode toggle in settings
- [ ] All components support dark: variants
- [ ] System preference detection

---

### BACK-023: Accessibility Audit

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | L (1-2 weeks) |
| **Created** | Dec 4, 2025 |

**Acceptance Criteria:**
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation working
- [ ] Screen reader tested
- [ ] WCAG 2.1 AA compliance

---

### BACK-024: Internationalization (i18n)

| Field | Value |
|-------|-------|
| **Status** | Not Started |
| **Owner** | Unassigned |
| **Effort** | XL (2+ weeks) |
| **Created** | Dec 4, 2025 |

**Acceptance Criteria:**
- [ ] i18n framework implemented (next-intl)
- [ ] GVTEWAY translated to Spanish
- [ ] Language selector in UI

---

### BACK-004: UI Style Guide Refactor

| Field | Value |
|-------|-------|
| **Status** | Completed |
| **Owner** | Unassigned |
| **Effort** | XL (2+ weeks) |
| **Completed** | Dec 4, 2025 |
| **Scope** | 512 pages |

**Description:**  
All authenticated pages aligned with GHXSTSHIP design system.

**Acceptance Criteria:**
- [x] ATLVS pages refactored (197 pages)
- [x] GVTEWAY pages refactored (174 pages)
- [x] COMPVSS pages refactored (141 pages)
- [x] All pages pass ESLint design system rules (0 violations)

**References:**
- `docs/design/STYLE-GUIDE-PREVIEW.jsx`

---

## P3 - Low Priority

*No items remaining - backlog cleared*

---

## Completed (Last 30 Days)

| ID | Item | Completed | Notes |
|----|------|-----------|-------|
| BACK-001 | ExperienceGeneratorSchema | Dec 4, 2025 | Types exist, UI/API routes verified |
| BACK-002 | Navigation Phase 8 | Dec 4, 2025 | Deep linking, unified search, role filtering implemented |
| BACK-003 | Design System ESLint | Dec 4, 2025 | 0 violations, warnings are TypeScript strictness |
| BACK-004 | UI Style Guide Refactor | Dec 4, 2025 | 512 pages pass design system rules |
| BACK-005 | Test Coverage Analysis | Dec 4, 2025 | 10 unit test files, 16 E2E specs, CI coverage reporting |
| BACK-006 | API Versioning | Dec 4, 2025 | Middleware created in `packages/config/api-versioning.ts` |
| BACK-007 | Staging Environment | Dec 4, 2025 | `.env.staging.example` created |
| BACK-008 | SSO/SAML Enterprise | Dec 4, 2025 | Config + migration `0143_sso_saml_enterprise.sql` |
| BACK-009 | Permission System | Dec 4, 2025 | Full implementation in `packages/config/permissions.ts` |
| BACK-010 | Log Aggregation | Dec 4, 2025 | Logger class in `packages/config/logging.ts` |
| BACK-011 | Session Timeout | Dec 4, 2025 | SessionManager in `packages/config/session-config.ts` |
| BACK-012 | Rate Limiting | Dec 4, 2025 | Full implementation in `packages/config/rate-limiting.ts` |
| BACK-013 | Vercel Cron Jobs | Dec 4, 2025 | 7 cron jobs configured, Pro plan active |
| BACK-C01 | Workflow Audit | Dec 4, 2025 | 512 pages audited, 16 E2E specs, 8 loading files |
| BACK-C02 | Loading States | Dec 4, 2025 | Route-level loading.tsx files added |
| BACK-C03 | AI Experience Generator | Dec 3, 2025 | Core implementation complete |
| BACK-C04 | Typography Audit | Nov 27, 2025 | 1,800+ violations fixed |
| BACK-C05 | Text Color Visibility | Nov 27, 2025 | Full visibility system implemented |
| BACK-C06 | Raw Tailwind Migration | Nov 27, 2025 | Design system components adopted |
| BACK-C07 | Theme-Aware Backgrounds | Nov 27, 2025 | Semantic tokens implemented |

---

## Notes & Decisions

- **Vercel Plan:** Pro plan now active - all 7 cron jobs enabled
- **Design System:** 0 violations, remaining warnings are TypeScript strictness (not blocking)
- **Enterprise Features:** SSO/SAML infrastructure ready, needs Supabase project configuration
- **API Versioning:** Middleware ready, route migration can be done incrementally
