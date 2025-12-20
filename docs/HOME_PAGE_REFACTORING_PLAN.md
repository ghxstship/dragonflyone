# Home Page Refactoring Plan
## Industry Leader Positioning + 7-Tier BYO Model

**Version**: 2.0 | **Date**: December 19, 2024 | **Status**: Ready for Implementation

---

## Executive Summary

The home page (`/apps/atlvs/src/app/page.tsx`) requires significant updates to:

1. **Position GHXSTSHIP as the indisputable industry leader** — modular, compatible, and scalable
2. **Remove V3 Expansion section** — unreleased features shouldn't be called out
3. **Align with 7-tier BYO pricing model** — replace old tier names
4. **Reinforce four verticals** — Productions, Activations, Installations, Destinations

This plan aligns the home page with the updated marketing pages:
- `/pricing` - 7-tier BYO pricing
- `/products` - Competitor replacement messaging
- `/products/compare` - Tier comparison matrix
- `/solutions` - Role-to-tier mapping
- `/demo` - Tool stack form

**See also:** `MARKETING_PAGE_CONSISTENCY_UPDATE.md` for cross-page messaging alignment.

---

## Current State Analysis

### Files Involved
| File | Lines | Purpose |
|------|-------|---------|
| `/apps/atlvs/src/app/page.tsx` | 525 | Home page component |
| `/apps/atlvs/src/data/atlvs.ts` | 3180 | Data source (includes old pricing) |

### Current Home Page Sections (9 total)

| # | Section | Lines | Data Source | Action Required |
|---|---------|-------|-------------|-----------------|
| 1 | Hero | 94-148 | `atlvsLandingHero` | ❌ **UPDATE** — Industry leader positioning |
| 2 | Four Verticals | 151-180 | `atlvsVerticals` | ✅ KEEP — Core to messaging |
| 3 | Problem Section | 183-205 | `atlvsProblemSection` | ⚠️ UPDATE — Soften, focus on solutions |
| 4 | Four Pillars | 208-236 | `atlvsPillarsSolution` | ⚠️ UPDATE — Rename "Why GHXSTSHIP" |
| 5 | Feature Grid | 239-289 | `atlvsFeatureGrid` | ✅ KEEP — Core capabilities |
| 6 | V3 Expansion | 292-373 | `atlvsV3Features` | ❌ **REMOVE** — Not live yet |
| 7 | COMPVSS Section | 376-420 | `atlvsCompvssSection` | ⚠️ UPDATE — Reference bundles |
| 8 | Social Proof | 423-441 | `atlvsSocialProof` | ✅ KEEP — Add leader framing |
| 9 | Pricing | 444-498 | `atlvsPricing` | ❌ **REPLACE** — 7-tier BYO preview |
| 10 | Final CTA | 501-521 | `atlvsLandingCta` | ❌ **UPDATE** — Modular entry points |

### Old Pricing Tiers (Current)
```
DEVIATOR → $49/mo (ATLVS only)
NAVIGATOR → $149/mo (ATLVS + COMPVSS)
AVIATOR → $399/mo (ATLVS + COMPVSS + GVTEWAY)
ENTERPRISE → Custom
```

### New 7-Tier BYO Model (Target)
```
Single Products:
  GVTEWAY → $0 + 3.5% (Ticketing only, BYO CRM/Finance/Crews)
  COMPVSS → $299/mo (Crews only, BYO CRM/Finance/Ticketing)
  ATLVS → $799/mo (Business only, BYO Crews/Ticketing)

Bundles:
  OPERATIONS → $299 + 2.5% (GVTEWAY + COMPVSS, BYO CRM/Finance)
  EXPERIENCE → $799 + 2.5% (ATLVS + GVTEWAY, BYO Crews)
  PRODUCTION → $999/mo (ATLVS + COMPVSS, BYO Ticketing) ⭐ MOST POPULAR

Full Stack:
  ENTERPRISE → $1,499 + 2.0% (All three products)
```

---

## Refactoring Plan

### Phase 1: Update Data Source (`atlvs.ts`)

#### 1.1 Replace `atlvsPricing` with new 7-tier structure

**Current** (lines 1573-1664):
- 4 tiers: DEVIATOR, NAVIGATOR, AVIATOR, ENTERPRISE
- Per-seat pricing model
- No BYO messaging

**Target**:
- 7 tiers aligned with `/pricing` page
- BYO items and competitor replacement per tier
- Value propositions per tier

```typescript
// NEW: atlvsPricingPreview (simplified for home page)
export const atlvsPricingPreview = {
  headline: "PRICING THAT DOESN'T PLAY GAMES",
  subheadline: "Seven tiers. Three products. Keep what works. Add what's missing.",
  singleProducts: [
    { id: 'gvteway', name: 'GVTEWAY', tagline: 'OWN THE DOOR', price: '$0', period: '+ 3.5%', byo: ['CRM', 'Finance', 'Crews'] },
    { id: 'compvss', name: 'COMPVSS', tagline: 'WORK THE SITE', price: '$299', period: '/month', byo: ['CRM', 'Finance', 'Ticketing'] },
    { id: 'atlvs', name: 'ATLVS', tagline: 'RUN THE SHOW', price: '$799', period: '/month', byo: ['Crews', 'Ticketing'] },
  ],
  bundles: [
    { id: 'operations', name: 'OPERATIONS', price: '$299', period: '/mo + 2.5%', includes: ['GVTEWAY', 'COMPVSS'], byo: ['CRM', 'Finance'] },
    { id: 'experience', name: 'EXPERIENCE', price: '$799', period: '/mo + 2.5%', includes: ['ATLVS', 'GVTEWAY'], byo: ['Crews'] },
    { id: 'production', name: 'PRODUCTION', price: '$999', period: '/month', includes: ['ATLVS', 'COMPVSS'], byo: ['Ticketing'], popular: true },
  ],
  enterprise: { id: 'enterprise', name: 'ENTERPRISE', price: '$1,499', period: '/mo + 2.0%', tagline: 'REPLACE EVERYTHING' },
  cta: { label: 'SEE ALL PRICING', href: '/pricing' },
  footnote: 'No per-seat charges. Unlimited users on ATLVS and COMPVSS.',
};
```

#### 1.2 Update `atlvsLandingHero` with Industry Leader Positioning

**Current** (lines 1072-1081):
```typescript
kicker: "FOR PRODUCTION PROFESSIONALS"
headline: "WARNING: TITANS AT WORK."
description: "Million-dollar builds. Impossible deadlines..."
```

**Target**:
```typescript
kicker: "THE INDUSTRY STANDARD"
headline: "THE PLATFORM FOR LIVE ENTERTAINMENT"
description: "Modular. Compatible. Scalable. Built for productions, activations, installations, and destinations of any size."
primaryCta: { label: "EXPLORE PRODUCTS", href: "/products" }
secondaryCta: { label: "SEE PRICING", href: "/pricing" }
```

**Positioning Pillars**:
- **INDUSTRY LEADER** — Not a challenger, THE standard
- **MODULAR** — Use one product or all three
- **COMPATIBLE** — Works with existing tools (BYO)
- **SCALABLE** — From popup to portfolio

#### 1.3 Update `atlvsLandingCta` with tier entry points

**Current** (lines 1667-1674):
```typescript
primaryCta: { label: "START FREE TRIAL", href: "/auth/signup" }
secondaryCta: { label: "SCHEDULE DEMO", href: "/demo" }
```

**Target**:
```typescript
headline: "NOT SURE WHERE TO START?"
subheadline: "Modular by design. Find the tier that fits your stack."
primaryCta: { label: "EXPLORE PRODUCTS", href: "/products" }
secondaryCta: { label: "SEE PRICING", href: "/pricing" }
footnote: "Productions · Activations · Installations · Destinations"
```

#### 1.4 Remove `atlvsV3Features` References

**Action**: Remove the V3 Expansion section entirely from the home page.

**Reason**: Features are not live yet. Calling out "New for 2026" on a marketing page creates confusion and sets expectations for unreleased functionality.

**Lines to Remove**: 292-373 in `page.tsx`

**Data to Deprecate**: `atlvsV3Features` export in `atlvs.ts` (or keep for internal use but remove from home page)

---

### Phase 2: Update Home Page Component (`page.tsx`)

#### 2.1 Add BYO Entry Point Section (NEW - after Hero)

Insert a new section after the Hero that helps visitors self-select:

```
┌─────────────────────────────────────────────────────────────┐
│                     WHAT DO YOU NEED?                       │
├─────────────────────────────────────────────────────────────┤
│  [JUST TICKETING]  [JUST CREWS]  [JUST BUSINESS OPS]       │
│       GVTEWAY          COMPVSS         ATLVS                │
├─────────────────────────────────────────────────────────────┤
│  Already have tools? → [SEE BUNDLES]  [COMPARE ALL TIERS]  │
└─────────────────────────────────────────────────────────────┘
```

**Location**: After line 148 (after Hero section)

#### 2.2 Refactor Pricing Section (Section 9)

**Current** (lines 444-498):
- Shows 4 old tiers in a 3-column grid
- Uses `atlvsPricing.tiers.map()`

**Target Options**:

**Option A: Simplified Preview (Recommended)**
Show a condensed view with 3 categories linking to `/pricing`:
```
┌─────────────────────────────────────────────────────────────┐
│              PRICING THAT DOESN'T PLAY GAMES                │
│    Seven tiers. Three products. Keep what works.            │
├───────────────────┬───────────────────┬─────────────────────┤
│   SINGLE PRODUCTS │      BUNDLES      │     FULL STACK      │
│   From $0/mo      │   From $299/mo    │    $1,499/mo        │
│   BYO everything  │   Fill the gaps   │   Replace all       │
│   [See Options]   │   [See Options]   │   [Go Enterprise]   │
└───────────────────┴───────────────────┴─────────────────────┘
```

**Option B: 7-Tier Grid**
Show all 7 tiers in a responsive grid (may be too crowded for home page).

**Recommendation**: Option A - Keep home page clean, drive to `/pricing` for full details.

#### 2.3 Update Final CTA Section (Section 10)

**Current** (lines 501-521):
```
H1: READY TO STOP WINGING IT?
CTA: START FREE TRIAL | SCHEDULE DEMO
```

**Target**:
```
H1: NOT SURE WHERE TO START?
Sub: Tell us what tools you use—we'll recommend the right tier.
CTA: FIND YOUR TIER | TELL US WHAT YOU USE
```

#### 2.4 Add "Replaces" Context to Four Pillars (Section 4)

**Current** (lines 208-236):
Each pillar has a `replaces` field but it's shown as a small text line.

**Target**:
Enhance the "Replaces" display with competitor logos or more prominent styling to align with `/products` page messaging.

---

### Phase 3: Add New Components (Optional Enhancements)

#### 3.1 BYO Entry Point Selector Component

Create a reusable component for the "What do you need?" section:

```typescript
// components/BYOEntrySelector.tsx
interface BYOEntrySelectorProps {
  variant: 'compact' | 'expanded';
}
```

#### 3.2 Pricing Preview Component

Create a simplified pricing preview for the home page:

```typescript
// components/PricingPreview.tsx
interface PricingPreviewProps {
  showAllTiers?: boolean;
  highlightTier?: string;
}
```

---

## Implementation Checklist

### Data Updates (`atlvs.ts`)
- [ ] Add `atlvsPricingPreview` export with 7-tier structure
- [ ] Update `atlvsLandingHero.description` with BYO messaging
- [ ] Update `atlvsLandingCta` with tier entry point CTAs
- [ ] Deprecate old `atlvsPricing` (or keep for backwards compat)

### Component Updates (`page.tsx`)
- [ ] Add BYO Entry Point section after Hero
- [ ] Replace Section 9 (Pricing) with new preview component
- [ ] Update Section 10 (Final CTA) with tier-focused messaging
- [ ] Enhance Section 4 (Four Pillars) "Replaces" display

### New Components (Optional)
- [ ] Create `BYOEntrySelector` component
- [ ] Create `PricingPreview` component

### Testing & Validation
- [ ] Verify all tier links work (`/auth/signup?plan=X`, `/contact?plan=enterprise`)
- [ ] Check responsive design (mobile, tablet, desktop)
- [ ] Validate navigation flow to `/pricing` and `/demo`
- [ ] Ensure brand voice consistency with other marketing pages

---

## Migration Strategy

### Approach: Incremental Update

1. **Step 1**: Add new data exports to `atlvs.ts` (keep old ones)
2. **Step 2**: Update `page.tsx` to use new data
3. **Step 3**: Remove deprecated data exports after validation
4. **Step 4**: Push changes and validate on staging

### Rollback Plan

If issues arise:
- Revert `page.tsx` changes
- Keep old `atlvsPricing` as fallback
- Data source changes are additive, so no rollback needed

---

## Design Considerations

### Brand Voice Alignment
- Use same headline formulas: `[VERB] THE [NOUN]`, `[THING]. [THING]. [THING].`
- BYO messaging: "Keep what works. Add what's missing."
- No hedging, direct statements

### Visual Consistency
- Use same color mapping for tiers:
  - GVTEWAY: `brand-yellow`
  - COMPVSS: `brand-cyan`
  - ATLVS: `brand-pink`
  - OPERATIONS: `purple-500`
  - EXPERIENCE: `brand-pink`
  - PRODUCTION: `brand-cyan` (with "MOST POPULAR" badge)
  - ENTERPRISE: `ink-950`

### Responsive Behavior
- Mobile: Stack cards vertically
- Tablet: 2-column grid
- Desktop: 3-column grid (pricing categories)

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Pricing page CTR from home | Unknown | +20% |
| Demo requests mentioning tools | 0% | 50%+ |
| Bounce rate on pricing section | Unknown | -15% |
| Time to first CTA click | Unknown | <30s |

---

## Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Data Updates | 30 min | None |
| Phase 2: Component Updates | 1-2 hrs | Phase 1 |
| Phase 3: New Components | 1 hr | Phase 2 (optional) |
| Testing & Validation | 30 min | Phase 2 |
| **Total** | **2-4 hrs** | |

---

## Open Questions

1. **Pricing Section Approach**: Should we show all 7 tiers or a simplified 3-category view?
   - **Recommendation**: Simplified view with link to `/pricing`

2. **Old Tier Names**: Should we keep DEVIATOR/NAVIGATOR/AVIATOR as legacy for existing users?
   - **Recommendation**: No, full migration to new naming

3. **COMPVSS Section**: Should this section be updated to reference bundle tiers?
   - **Recommendation**: Yes, mention OPERATIONS and PRODUCTION bundles

---

*Document created: December 19, 2024*
*Ready for implementation upon approval*
