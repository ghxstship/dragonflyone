# AI Experience Generator - Lead Magnet Strategy

## Executive Summary

Create a public-facing AI-powered Experience Generator tool that transforms a single creative concept (noun) into a complete production blueprint, then seamlessly exports it as a draft project into ATLVS. This acts as a **zero-friction lead magnet** that demonstrates ATLVS's value proposition while capturing qualified leads.

---

## Strategic Goals

1. **Lead Generation**: Capture organizers/producers at the ideation stage
2. **Value Demonstration**: Show ATLVS capabilities before signup
3. **Zero Friction Adoption**: One-click export to ATLVS account
4. **Viral Potential**: Shareable, impressive AI-generated blueprints
5. **Data Collection**: Understand market needs through generated concepts

---

## User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER JOURNEY FLOW                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. DISCOVERY                                                                │
│     └─→ User lands on /generator (public page)                              │
│     └─→ Sees hero: "Transform Any Idea Into a Production Blueprint"         │
│     └─→ Single input field: "Enter your creative concept..."                │
│                                                                              │
│  2. GENERATION (No Auth Required)                                           │
│     └─→ User enters noun (e.g., "METAMORPHOSIS")                            │
│     └─→ AI generates complete blueprint in real-time                        │
│     └─→ Progressive reveal with animations (5 Senses, XYZ, Journey)         │
│     └─→ ~30-60 seconds of engaging generation                               │
│                                                                              │
│  3. PREVIEW & EXPLORE                                                        │
│     └─→ Interactive tabs: Concept | Sensory | Spatial | Journey | Docs      │
│     └─→ Expandable sections with rich detail                                │
│     └─→ Visual representations (color palettes, timelines, org charts)      │
│     └─→ PDF export available (watermarked, limited)                         │
│                                                                              │
│  4. CONVERSION TRIGGER                                                       │
│     └─→ CTA: "Launch This Production in ATLVS"                              │
│     └─→ Shows what they'll get: Full project, all templates, team ready     │
│     └─→ Social proof: "Join 500+ producers who started here"                │
│                                                                              │
│  5. SIGNUP/LOGIN (Minimal Friction)                                          │
│     └─→ OAuth options: Google, Apple, Email magic link                      │
│     └─→ Blueprint automatically saved to their account                      │
│     └─→ Redirect to ATLVS dashboard with project pre-populated              │
│                                                                              │
│  6. ONBOARDING IN ATLVS                                                      │
│     └─→ Guided tour of their generated project                              │
│     └─→ Suggestions to customize/expand                                     │
│     └─→ Invite team members                                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Architecture

### 1. Public Page Structure

```
/apps/atlvs/src/app/generator/
├── page.tsx                    # Main generator page (public)
├── components/
│   ├── GeneratorHero.tsx       # Hero section with input
│   ├── GeneratorInput.tsx      # Creative seed input with suggestions
│   ├── GeneratorProgress.tsx   # Real-time generation progress
│   ├── BlueprintPreview.tsx    # Tabbed preview of generated content
│   ├── ConceptTab.tsx          # Name, narrative, transformation
│   ├── SensoryTab.tsx          # 5 Senses activation matrix
│   ├── SpatialTab.tsx          # XYZ foundation visualization
│   ├── JourneyTab.tsx          # URL→IRL lifecycle
│   ├── DocumentsTab.tsx        # Production docs preview
│   ├── ExportCTA.tsx           # Conversion call-to-action
│   └── ShareModal.tsx          # Social sharing options
├── hooks/
│   ├── useExperienceGenerator.ts  # AI generation hook
│   └── useExportToATLVS.ts        # Export/conversion hook
└── actions/
    ├── generate.ts             # Server action for AI generation
    └── export.ts               # Server action for ATLVS export
```

### 2. AI Generation Pipeline

```typescript
// Generation Flow
interface GenerationRequest {
  creativeSeed: string;        // The noun input
  preferences?: {
    scale?: 'intimate' | 'local' | 'regional' | 'national' | 'global';
    duration?: 'moment' | 'session' | 'day' | 'extended' | 'persistent';
    budget?: 'minimal' | 'standard' | 'premium' | 'unlimited';
  };
}

interface GeneratedBlueprint {
  // Creative Concept
  concept: {
    name: string;
    tagline: string;
    narrative: string;
    targetTransformation: string;
    visualIdentity: {
      colorPalette: string[];
      typography: string;
      moodKeywords: string[];
    };
  };
  
  // 5 Senses
  sensoryDesign: {
    sight: SenseActivation;
    sound: SenseActivation;
    touch: SenseActivation;
    taste: SenseActivation;
    smell: SenseActivation;
  };
  
  // XYZ Foundation
  spatialTemporal: {
    x: { level: 1-5; description: string; rationale: string };
    y: { level: 1-5; description: string; rationale: string };
    z: { level: 1-5; description: string; rationale: string };
    zones: Zone[];
  };
  
  // URL→IRL Journey
  guestJourney: {
    phase1_digital_pre: JourneyPhase;
    phase2_threshold_in: JourneyPhase;
    phase3_physical: JourneyPhase;
    phase4_threshold_out: JourneyPhase;
    phase5_digital_post: JourneyPhase;
  };
  
  // Production Docs (Previews)
  documents: {
    onePageOverview: string;
    orgChartPreview: OrgNode[];
    schedulePhases: SchedulePhase[];
    credentialTypes: CredentialType[];
    complianceChecklist: ChecklistItem[];
  };
  
  // Scalable Tiers
  executionTiers: {
    tier1_minimal: BudgetTier;
    tier2_enhanced: BudgetTier;
    tier3_premium: BudgetTier;
    tier4_ultimate: BudgetTier;
  };
}
```

### 3. Database Integration

When user exports to ATLVS, create records in:

```sql
-- Core production record
INSERT INTO productions (
  organization_id,
  title,
  slug,
  tagline,
  description,
  elevator_pitch,
  format,
  status,
  target_transformation,
  color_palette,
  sensory_design,
  xyz_foundation,
  url_irl_journey,
  metadata
) VALUES (...);

-- Auto-generate related records:
-- - zones (from spatial design)
-- - schedule_phases (from timeline)
-- - credential_types (from access matrix)
-- - compliance_checklists (from legal checklist)
-- - sop_categories (from operations)
-- - departments (from org chart)
-- - sponsor_tiers (from sponsorship deck)
```

### 4. API Endpoints

```typescript
// /api/generator/generate
POST /api/generator/generate
Body: { creativeSeed: string, preferences?: object }
Response: { blueprintId: string, blueprint: GeneratedBlueprint }

// /api/generator/export  
POST /api/generator/export
Body: { blueprintId: string }
Auth: Required
Response: { productionId: string, redirectUrl: string }

// /api/generator/share
POST /api/generator/share
Body: { blueprintId: string }
Response: { shareUrl: string, embedCode: string }

// /api/generator/pdf
GET /api/generator/pdf/:blueprintId
Response: PDF file (watermarked for non-users)
```

---

## UI/UX Design

### Visual Design (GHXSTSHIP Pop Art Aesthetic)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  GENERATOR PAGE LAYOUT                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  HERO SECTION (Full viewport)                                          │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  "TRANSFORM ANY IDEA INTO A                                      │  │ │
│  │  │   PRODUCTION BLUEPRINT"                                          │  │ │
│  │  │                                                                  │  │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐  │  │ │
│  │  │  │  [Enter your creative concept...]              [GENERATE]  │  │  │ │
│  │  │  └────────────────────────────────────────────────────────────┘  │  │ │
│  │  │                                                                  │  │ │
│  │  │  Try: METAMORPHOSIS • NEON • SANCTUARY • PULSE • ODYSSEY        │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  GENERATION PROGRESS (Animated, progressive reveal)                    │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  [■■■■■■■■░░░░░░░░░░░░] 40% - Designing sensory activations...   │  │ │
│  │  │                                                                  │  │ │
│  │  │  ✓ Creative concept generated                                   │  │ │
│  │  │  ✓ 5 Senses matrix complete                                     │  │ │
│  │  │  ◐ XYZ spatial-temporal mapping...                              │  │ │
│  │  │  ○ Guest journey phases                                         │  │ │
│  │  │  ○ Production documentation                                     │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  BLUEPRINT PREVIEW (Tabbed interface)                                  │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  [CONCEPT] [SENSORY] [SPATIAL] [JOURNEY] [DOCUMENTS] [BUDGET]   │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                                                                  │  │ │
│  │  │  METAMORPHOSIS: THE BECOMING                                    │  │ │
│  │  │  "Where transformation is not witnessed, but lived"             │  │ │
│  │  │                                                                  │  │ │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │  │ │
│  │  │  │ ████████    │ │ ████████    │ │ ████████    │  Color Palette │  │ │
│  │  │  │ #1A1A2E     │ │ #FF006E     │ │ #00F5D4     │                │  │ │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘                │  │ │
│  │  │                                                                  │  │ │
│  │  │  Target Transformation:                                         │  │ │
│  │  │  "Guests arrive as observers and leave as participants in      │  │ │
│  │  │   their own metamorphosis, carrying the experience as a        │  │ │
│  │  │   permanent shift in perspective."                              │  │ │
│  │  │                                                                  │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  CONVERSION CTA                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │                                                                  │  │ │
│  │  │  Ready to bring METAMORPHOSIS to life?                          │  │ │
│  │  │                                                                  │  │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐  │  │ │
│  │  │  │  [LAUNCH IN ATLVS]  ← Primary CTA (Miami Pink)             │  │  │ │
│  │  │  └────────────────────────────────────────────────────────────┘  │  │ │
│  │  │                                                                  │  │ │
│  │  │  What you'll get:                                               │  │ │
│  │  │  ✓ Full production project with all details                    │  │ │
│  │  │  ✓ 12 pre-populated document templates                         │  │ │
│  │  │  ✓ Org chart with 26 department structure                      │  │ │
│  │  │  ✓ Compliance checklists ready to execute                      │  │ │
│  │  │  ✓ Invite unlimited team members                               │  │ │
│  │  │                                                                  │  │ │
│  │  │  [Download PDF] [Share Blueprint] [Start Over]                  │  │ │
│  │  │                                                                  │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Styling (Design System Tokens)

```tsx
// Hero Input - Bold, attention-grabbing
<Input
  variant="hero"
  className="border-thick border-ink-950 shadow-xl text-h3-md"
  placeholder="Enter your creative concept..."
/>

// Generate Button - Miami Pink accent
<Button
  variant="primary"
  size="xl"
  className="bg-[#FF006E] border-thick border-ink-950 shadow-primary"
>
  GENERATE BLUEPRINT
</Button>

// Tab Navigation - Pop Art style
<Tabs variant="underline" className="border-b-thick border-ink-950">
  <Tab className="font-display uppercase tracking-wide" />
</Tabs>

// Progress Steps - Animated reveal
<ProgressStep 
  status="complete" 
  className="animate-pop-in"
/>

// Blueprint Cards - Layered depth
<Card 
  variant="elevated" 
  className="border-thick border-ink-950 shadow-xl"
/>
```

---

## AI Prompt Engineering

### System Prompt for Generation

```
You are the GHXSTSHIP Experience Generator, an expert in immersive experience design, live entertainment production, and transformative event creation.

Given a single creative seed word, generate a complete production blueprint following the Universal Immersive Experience Generator v4.0 framework.

Your output must include:

1. CREATIVE CONCEPT
- Experience name (evocative, memorable)
- Tagline (8-12 words capturing the essence)
- Core narrative (2-3 paragraphs)
- Target transformation (what guests become)
- Visual identity (colors, typography mood, keywords)

2. 5 SENSES ACTIVATION
For each sense (Sight, Sound, Touch, Taste, Smell):
- Primary activation (main sensory element)
- Secondary activations (supporting elements)
- Technical requirements
- Accessibility considerations

3. XYZ SPATIAL-TEMPORAL FOUNDATION
- X-Axis (Distance/Scale): Level 1-5 with rationale
- Y-Axis (Space/Footprint): Level 1-5 with rationale
- Z-Axis (Time/Duration): Level 1-5 with rationale
- Zone breakdown (6-10 distinct zones)

4. URL→IRL GUEST JOURNEY
For each of 5 phases:
- Key touchpoints
- Emotional state
- Actions/interactions
- Technology integration

5. PRODUCTION DOCUMENTATION PREVIEWS
- One-page overview summary
- Org chart structure (26 departments)
- Schedule phases (8 phases)
- Credential types (10 types)
- Compliance categories

6. SCALABLE EXECUTION TIERS
- Tier 1: Minimum Viable ($X budget)
- Tier 2: Enhanced ($X budget)
- Tier 3: Premium ($X budget)
- Tier 4: Ultimate Expression ($X budget)

Output as structured JSON matching the GeneratedBlueprint interface.
Be creative, specific, and production-ready.
```

---

## Conversion Optimization

### Lead Capture Points

1. **Soft Gate**: Email capture for PDF download
2. **Hard Gate**: Account creation for ATLVS export
3. **Engagement Hooks**: 
   - "Save this blueprint" (requires account)
   - "Share with team" (captures emails)
   - "Get notified when similar experiences launch"

### A/B Testing Opportunities

- Input field copy variations
- CTA button text/color
- Progress animation styles
- Preview tab order
- Social proof placement

### Analytics Events

```typescript
// Track key conversion funnel events
analytics.track('generator_page_view');
analytics.track('generator_input_focus');
analytics.track('generator_started', { creativeSeed });
analytics.track('generator_completed', { blueprintId, duration });
analytics.track('generator_tab_viewed', { tab });
analytics.track('generator_pdf_downloaded', { blueprintId });
analytics.track('generator_share_clicked', { platform });
analytics.track('generator_export_clicked', { blueprintId });
analytics.track('generator_signup_started', { blueprintId });
analytics.track('generator_export_completed', { productionId });
```

---

## Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Basic generator page with input
- [ ] AI generation endpoint (OpenAI/Anthropic)
- [ ] Simple preview display (no tabs)
- [ ] Basic PDF export (watermarked)
- [ ] Email capture for PDF

### Phase 2: Enhanced Preview (Week 3-4)
- [ ] Tabbed preview interface
- [ ] Visual representations (color palettes, charts)
- [ ] XYZ spatial visualization
- [ ] Journey timeline component
- [ ] Animated generation progress

### Phase 3: ATLVS Integration (Week 5-6)
- [ ] OAuth signup flow
- [ ] Export to ATLVS action
- [ ] Production record creation
- [ ] Related records generation
- [ ] Onboarding redirect

### Phase 4: Optimization (Week 7-8)
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Social sharing
- [ ] Embed widget
- [ ] SEO optimization

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Views | 10,000/month | Analytics |
| Generations Started | 40% of views | Event tracking |
| Generations Completed | 80% of started | Event tracking |
| PDF Downloads | 30% of completed | Event tracking |
| Signup Conversions | 15% of completed | Auth events |
| Export to ATLVS | 60% of signups | Database |
| 7-Day Retention | 40% of exports | User activity |

---

## Technical Requirements

### Dependencies
- OpenAI API or Anthropic Claude for generation
- Vercel AI SDK for streaming
- React PDF for document generation
- Framer Motion for animations
- Supabase for storage/auth

### Performance Targets
- Initial page load: < 2s
- Generation start: < 500ms
- Full generation: < 60s
- Export to ATLVS: < 3s

### Security Considerations
- Rate limiting on generation endpoint
- CAPTCHA for abuse prevention
- Blueprint expiration (24h for non-users)
- Sanitize AI outputs

---

## Competitive Advantage

This tool differentiates ATLVS by:

1. **Immediate Value**: Users get something useful before signing up
2. **Expertise Demonstration**: Shows deep domain knowledge
3. **Reduced Friction**: Pre-populated project beats blank canvas
4. **Viral Potential**: Shareable blueprints spread awareness
5. **Data Insights**: Learn what experiences people want to create

---

## Next Steps

1. Review and approve strategy
2. Create detailed technical specs
3. Design UI mockups in Figma
4. Set up AI generation pipeline
5. Build MVP components
6. Internal testing
7. Soft launch to select users
8. Iterate based on feedback
9. Public launch with marketing push
