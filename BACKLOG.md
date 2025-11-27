# GHXSTSHIP Platform Backlog

This document tracks incomplete, deferred, and planned features that need to be addressed.

---

## Deferred Features

### Vercel Cron Jobs (Disabled - Plan Limit)
**Status:** Temporarily disabled due to Vercel Hobby plan limit (2 crons max)
**Action Required:** Upgrade to Vercel Pro plan, then re-enable crons in vercel.json files

#### ATLVS Crons
- [ ] `/api/cron/sync-ledger` - Daily ledger synchronization (schedule: `0 0 * * *`)
- [ ] `/api/cron/cleanup-sessions` - Daily session cleanup (schedule: `0 0 * * *`)

#### COMPVSS Crons
- [ ] `/api/cron/sync-equipment` - Daily equipment sync (schedule: `0 0 * * *`)
- [ ] `/api/cron/crew-notifications` - Daily crew notifications at 8am (schedule: `0 8 * * *`)

#### GVTEWAY Crons
- [ ] `/api/cron/ticket-reminders` - Daily ticket reminders at 9am (schedule: `0 9 * * *`)
- [ ] `/api/cron/loyalty-points` - Daily loyalty points processing (schedule: `0 0 * * *`)
- [ ] `/api/cron/event-notifications` - Daily event notifications at 6am (schedule: `0 6 * * *`)

---

## Planned Features

_Add planned features here as they are identified._

---

## Technical Debt

### Typography Implementation Audit ✅ COMPLETE
**Status:** Full remediation complete
**Documentation:** See `docs/TYPOGRAPHY_AUDIT_REPORT.md`
**Identified:** November 27, 2025
**Remediated:** November 27, 2025

**Summary:** ~1,800+ typography violations were identified and 100% have been fixed via automated scripts and manual edits.

**Completed:**
- [x] Phase 1: Fix `packages/ui` components (foundation) - ~113 violations fixed
- [x] Phase 2: Fix GVTEWAY app - all violations fixed
- [x] Phase 3: Fix ATLVS and COMPVSS apps - all violations fixed
- [x] Add ESLint rule to prevent future violations (`.eslintrc.js`)

**Scripts Created:**
- `scripts/fix-typography.sh` - Initial remediation script
- `scripts/fix-typography-v2.sh` - Comprehensive remediation script
- `scripts/fix-typography-v3.sh` - Responsive breakpoint fixes
- `scripts/fix-typography-v4.sh` - Template literal fixes
- `scripts/fix-typography-final.sh` - Final cleanup pass

---

### Text Color Visibility Audit ✅ COMPLETE
**Status:** Fully implemented and audited
**Documentation:** See `docs/TEXT_COLOR_VISIBILITY.md`
**Completed:** November 27, 2025

The text color visibility system has been fully implemented across the codebase:

**Design System Foundation:**
- [x] Added `textColors` semantic tokens to `packages/ui/src/tokens.ts`
- [x] Added `textColorPalette` to `packages/config-tailwind/index.js`
- [x] Updated `Kicker` component with `colorScheme` prop
- [x] Updated `SectionHeader` component with `colorScheme` prop

**UI Component Fixes:**
- [x] Fixed `context-breadcrumb.tsx` - swapped inverted color logic
- [x] Fixed `breadcrumb.tsx` - updated separator color
- [x] Fixed `link.tsx` - updated footer variant color
- [x] Fixed `offline-indicator.tsx` - updated muted text colors
- [x] Fixed `bulk-action-bar.tsx` - updated clear button color

**App-Level Audit (All Three Apps):**
- [x] GVTEWAY: Fixed all light-background pages (`text-grey-400` → `text-grey-600`)
- [x] ATLVS: Fixed all light-background pages (`text-grey-400` → `text-grey-600`)
- [x] COMPVSS: Fixed all light-background pages (`text-grey-400` → `text-grey-600`)
- [x] Fixed `text-ink-400`/`text-ink-300` on light backgrounds → `text-ink-600`/`text-ink-700`

**Verification:**
- Zero files with light backgrounds (`bg-white`, `bg-ink-50`) using low-contrast text colors
- All remaining `text-grey-400` and `text-ink-400` instances are correctly on dark backgrounds

---

## Notes

- Vercel Hobby plan allows 2 cron jobs total across all projects
- Vercel Pro plan ($20/month per member) allows more cron jobs
- Consider consolidating cron jobs or using external cron services as alternatives
