# ExperienceGeneratorSchema Gap Analysis

## Executive Summary

The `ExperienceGeneratorSchema` is a comprehensive database schema designed for **immersive experience and live entertainment production management**. After analyzing it against the existing GHXSTSHIP migrations (127 files), I've identified key gaps, enrichment opportunities, and compatibility adjustments needed.

---

## Schema Comparison Overview

| Domain | ExperienceGeneratorSchema | Current GHXSTSHIP | Gap Status |
|--------|---------------------------|-------------------|------------|
| Organizations | Multi-tenant with org types | Basic multi-tenant | **ENRICH** |
| Productions | Full lifecycle management | Basic productions table | **MAJOR GAP** |
| Venues/Zones | Detailed zone access control | Basic venues | **ENRICH** |
| Contacts | Comprehensive contact types | Basic contacts | **ENRICH** |
| Credentials | Badge/access system | Missing | **NEW** |
| Shows/Cues | Run of show with cue types | Basic run_of_shows | **ENRICH** |
| Contracts | Full contract lifecycle | Basic contracts | **ENRICH** |
| Compliance | Permits, insurance, checklists | Basic compliance_items | **ENRICH** |
| Sponsorship | Tiers, sponsors, deliverables | Missing | **NEW** |
| Investment | Rounds, investors, instruments | Missing | **NEW** |
| SOPs | Versioned procedures | Missing | **NEW** |
| Incidents | Detailed incident reports | Basic event_incidents | **ENRICH** |
| Lost & Found | Item tracking | Missing | **NEW** |
| Expense Reports | Full expense workflow | Basic expenses | **ENRICH** |
| Daily/Wrap Reports | Production reporting | Basic show_reports | **ENRICH** |
| API Keys | Key management | Missing | **NEW** |
| Webhooks | Event webhooks | Basic webhook_events | **ENRICH** |
| Integrations | Provider integrations | Extensive integrations | **COMPATIBLE** |
| Metrics | Time-series metrics | Basic analytics | **ENRICH** |

---

## Critical Gaps (NEW Features Needed)

### 1. Credential/Badge System
**Priority: HIGH**

The ExperienceGeneratorSchema has a sophisticated credential system for access control:

```sql
-- Missing tables:
- credential_types (access levels, requirements)
- credentials (issued badges with validity)
- credential_zone_access (zone access permissions)
```

**Recommendation:** Create migration `0128_credential_badge_system.sql`

### 2. Sponsorship Management
**Priority: HIGH**

Complete sponsorship lifecycle missing:

```sql
-- Missing tables:
- sponsor_tiers (tier levels, benefits, exclusivity)
- sponsors (cash/VIK values, deliverables, activations)
```

**Recommendation:** Create migration `0129_sponsorship_system.sql`

### 3. Investment/Fundraising
**Priority: MEDIUM**

For productions requiring investment:

```sql
-- Missing tables:
- investors (type, accreditation, interests)
- investment_rounds (SAFE, convertible notes, equity)
- investments (commitments, funding status)
```

**Recommendation:** Create migration `0130_investment_fundraising_system.sql`

### 4. Standard Operating Procedures (SOPs)
**Priority: MEDIUM**

Versioned procedure documentation:

```sql
-- Missing tables:
- sop_categories (categorization)
- sops (versioned procedures with approval workflow)
- sop_steps (step-by-step instructions)
```

**Recommendation:** Create migration `0131_sop_system.sql`

### 5. Lost & Found System
**Priority: LOW**

For event operations:

```sql
-- Missing tables:
- lost_found_items (item tracking, claims, disposal)
```

**Recommendation:** Create migration `0132_lost_found_system.sql`

### 6. API Key Management
**Priority: MEDIUM**

For external integrations:

```sql
-- Missing tables:
- api_keys (hashed keys, permissions, rate limits, IP restrictions)
```

**Recommendation:** Create migration `0133_api_key_management.sql`

---

## Enrichment Opportunities (Enhance Existing)

### 1. Organizations Table Enhancement

**Current:** Basic org with slug, name, timezone
**Template adds:**
- `legal_name`, `type` (company/agency/venue/vendor/sponsor/investor)
- `tax_id`, `website`, `logo_url`, `primary_color`
- `settings JSONB`, `metadata JSONB`
- `deleted_at` for soft deletes

**Migration needed:** `0128_enrich_organizations.sql`

### 2. Productions Table Enhancement

**Current:** Basic `productions` table in `0074_production_management_system.sql`
**Template adds:**
- `tagline`, `elevator_pitch`, `genre`, `target_transformation`
- `announcement_date`, `on_sale_date`, `preview_start`
- `production_budget`, `operating_budget_weekly`
- `ticket_price_min/max`, `projected_gross`, `break_even_percentage`
- `sponsorship_target`
- `color_palette JSONB`, `sensory_design JSONB`
- `xyz_foundation JSONB`, `url_irl_journey JSONB`

**Migration needed:** `0129_enrich_productions.sql`

### 3. Venues Table Enhancement

**Current:** Basic venue info
**Template adds:**
- `total_sqft`, `loading_dock`, `parking_spaces`, `ada_accessible`
- `amenities JSONB`, `technical_specs JSONB`
- Detailed address fields

**Migration needed:** `0130_enrich_venues.sql`

### 4. Contacts Table Enhancement

**Current:** Basic contact info
**Template adds:**
- `type` enum (internal/vendor/contractor/sponsor/investor/media/artist/guest/emergency)
- `status` enum (active/inactive/pending/archived)
- `prefix`, `nickname`, `email_secondary`, `phone_secondary`
- `reports_to_id` (hierarchy)
- `emergency_contact_name/phone/relation`
- `tags TEXT[]`

**Migration needed:** `0131_enrich_contacts.sql`

### 5. Shows/Cues Enhancement

**Current:** `run_of_shows` and `run_of_show_cues` tables
**Template adds:**
- `show_number`, `type` (preview/regular/final/special/private)
- `doors_time`, `actual_start/end`
- `stage_manager_id`
- Cue types: master/lighting/sound/video/sfx/scenic/action/note
- Department-specific cue fields (audio_cue, lighting_cue, video_cue, etc.)
- `trigger_type` (time/manual/sensor/previous_cue/conditional)
- `talent TEXT[]`, `props TEXT[]`, `script_dialogue`

**Migration needed:** `0132_enrich_shows_cues.sql`

### 6. Contracts Enhancement

**Current:** Basic contracts with milestones/amendments
**Template adds:**
- `contract_types` table (templates, required fields)
- `party_a_org_id`, `party_b_org_id` (multi-party)
- `payment_schedule JSONB`
- Compliance fields: `insurance_required/verified`, `w9_required/received`, `background_check_required/passed`

**Migration needed:** `0133_enrich_contracts.sql`

### 7. Compliance Enhancement

**Current:** `compliance_items`, `compliance_requirements`, `compliance_events`
**Template adds:**
- `permits` table (permit types, issuing authority, conditions)
- `insurance_policies` table (detailed coverage, COI, endorsements, claims)
- `compliance_checklists` with `compliance_items` (checklist workflow)

**Migration needed:** `0134_enrich_compliance.sql`

### 8. Incidents Enhancement

**Current:** `event_incidents` and `safety_incidents`
**Template adds:**
- `persons_involved JSONB`, `witnesses JSONB`
- `medical_attention`, `medical_details`
- `law_enforcement_called`, `law_enforcement_report`
- `photos TEXT[]`, `videos TEXT[]`, `attachments JSONB`
- `follow_up_required/description/due/completed`
- `insurance_notified`, `insurance_claim_number`
- Review/close workflow

**Migration needed:** `0135_enrich_incidents.sql`

### 9. Expense Reports Enhancement

**Current:** Basic `expenses` table
**Template adds:**
- `expense_reports` table (report workflow with approval)
- `advance_received`
- `budget_code`, linked to tasks
- `receipt_verified`

**Migration needed:** `0136_enrich_expense_reports.sql`

### 10. Daily/Wrap Reports Enhancement

**Current:** Basic `show_reports`
**Template adds:**
- `daily_reports` (revenue breakdown, incidents, weather, action items)
- `wrap_reports` (full production wrap with financials, marketing, learnings)

**Migration needed:** `0137_enrich_production_reports.sql`

---

## ENUM Types to Add

The ExperienceGeneratorSchema uses extensive ENUMs for type safety. Current schema uses CHECK constraints. Consider adding these ENUMs:

```sql
-- Organization/Contact types
CREATE TYPE org_type_enum AS ENUM ('company', 'agency', 'venue', 'vendor', 'sponsor', 'investor');
CREATE TYPE contact_type_enum AS ENUM ('internal', 'vendor', 'contractor', 'sponsor', 'investor', 'media', 'artist', 'guest', 'emergency', 'other');

-- Production types
CREATE TYPE production_format_enum AS ENUM ('immersive', 'festival', 'activation', 'installation', 'theater', 'concert', 'conference', 'corporate', 'private', 'other');
CREATE TYPE production_status_enum AS ENUM ('draft', 'planning', 'pre_production', 'production', 'active', 'completed', 'cancelled', 'archived');

-- Venue/Zone types
CREATE TYPE venue_type_enum AS ENUM ('warehouse', 'theater', 'arena', 'stadium', 'outdoor', 'convention', 'hotel', 'restaurant', 'club', 'custom', 'other');
CREATE TYPE zone_type_enum AS ENUM ('public', 'vip', 'backstage', 'production', 'operations', 'restricted', 'loading', 'parking', 'other');

-- Credential types
CREATE TYPE credential_status_enum AS ENUM ('pending', 'active', 'suspended', 'revoked', 'expired');

-- Show/Cue types
CREATE TYPE show_status_enum AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE show_type_enum AS ENUM ('preview', 'regular', 'final', 'special', 'private');
CREATE TYPE cue_type_enum AS ENUM ('master', 'lighting', 'sound', 'video', 'sfx', 'scenic', 'action', 'note');
CREATE TYPE trigger_type_enum AS ENUM ('time', 'manual', 'sensor', 'previous_cue', 'conditional');

-- Sponsor/Investor types
CREATE TYPE sponsor_status_enum AS ENUM ('prospect', 'pitched', 'negotiating', 'confirmed', 'active', 'completed', 'declined');
CREATE TYPE investor_type_enum AS ENUM ('individual', 'institution', 'family_office', 'vc', 'angel', 'corporate', 'other');
CREATE TYPE round_type_enum AS ENUM ('pre_seed', 'seed', 'series_a', 'series_b', 'bridge', 'growth', 'other');
CREATE TYPE instrument_enum AS ENUM ('equity', 'safe', 'convertible_note', 'revenue_share', 'other');

-- Permit/Insurance types
CREATE TYPE permit_type_enum AS ENUM ('business', 'event', 'fire', 'building', 'liquor', 'food', 'music', 'noise', 'temporary_structure', 'electrical', 'pyrotechnics', 'street_closure', 'parking', 'other');
CREATE TYPE insurance_type_enum AS ENUM ('general_liability', 'workers_comp', 'employers_liability', 'liquor_liability', 'event_cancellation', 'property', 'auto', 'umbrella', 'cyber', 'dno', 'other');

-- Incident types
CREATE TYPE incident_type_enum AS ENUM ('medical', 'security', 'property', 'guest_complaint', 'injury', 'theft', 'altercation', 'technical', 'weather', 'other');
CREATE TYPE severity_enum AS ENUM ('1', '2', '3', '4', '5');

-- SOP types
CREATE TYPE sop_status_enum AS ENUM ('draft', 'review', 'approved', 'archived');
```

---

## Views to Add

The template includes useful views:

```sql
-- Daily Metrics View
CREATE VIEW daily_metrics AS ...

-- Production Summary View
CREATE VIEW production_summary AS ...

-- Active Credentials View
CREATE VIEW active_credentials AS ...

-- Upcoming Tasks View
CREATE VIEW upcoming_tasks AS ...
```

---

## Compatibility Considerations

### 1. Multi-tenant Architecture
Both schemas use `organization_id` for multi-tenancy. **Compatible.**

### 2. RLS Policies
Template uses placeholder RLS policies. Current schema has robust RLS with `org_matches()` and `role_in()` functions. **Current is superior - keep existing pattern.**

### 3. Soft Deletes
Template uses `deleted_at` columns. Current schema doesn't consistently use soft deletes. **Consider adding for key tables.**

### 4. Audit Trail
Template has `audit_logs` table. Current schema has extensive audit logging in `0085_audit_logging_compliance_system.sql`. **Compatible.**

### 5. Updated_at Triggers
Template creates triggers for all tables. Current schema has triggers in `0018_database_triggers.sql`. **Ensure new tables get triggers.**

---

## Recommended Migration Order

1. **Phase 1: Core Enrichments** (High Priority)
   - `0128_enrich_organizations.sql`
   - `0129_enrich_productions.sql`
   - `0130_enrich_venues_zones.sql`
   - `0131_enrich_contacts.sql`

2. **Phase 2: New Systems** (High Priority)
   - `0132_credential_badge_system.sql`
   - `0133_sponsorship_system.sql`

3. **Phase 3: Operational Enrichments** (Medium Priority)
   - `0134_enrich_shows_cues.sql`
   - `0135_enrich_contracts.sql`
   - `0136_enrich_compliance_permits_insurance.sql`
   - `0137_enrich_incidents.sql`

4. **Phase 4: Financial/Reporting** (Medium Priority)
   - `0138_enrich_expense_reports.sql`
   - `0139_production_reports_daily_wrap.sql`
   - `0140_investment_fundraising_system.sql`

5. **Phase 5: Operations** (Lower Priority)
   - `0141_sop_system.sql`
   - `0142_lost_found_system.sql`
   - `0143_api_key_management.sql`
   - `0144_metrics_timeseries.sql`

---

## TypeScript Type Generation

After migrations, regenerate Supabase types:

```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/supabase-types.ts
```

---

## Backend Logic Gaps

### 1. Missing RPC Functions

The template doesn't include RPCs, but based on the schema, these would be valuable:

```sql
-- Credential management
CREATE FUNCTION issue_credential(...)
CREATE FUNCTION revoke_credential(...)
CREATE FUNCTION check_zone_access(credential_id, zone_id)

-- Sponsorship
CREATE FUNCTION calculate_sponsor_deliverables_status(sponsor_id)
CREATE FUNCTION get_sponsorship_summary(production_id)

-- Production
CREATE FUNCTION get_production_dashboard(production_id)
CREATE FUNCTION calculate_break_even(production_id)

-- Reporting
CREATE FUNCTION generate_daily_report(production_id, date)
CREATE FUNCTION generate_wrap_report(production_id)
```

### 2. Missing Triggers

```sql
-- Auto-generate credential numbers
-- Auto-calculate sponsor total_value
-- Auto-update production status based on dates
-- Auto-expire credentials
```

---

## Summary

The ExperienceGeneratorSchema provides a rich template for immersive experience production management. The current GHXSTSHIP schema has strong foundations but lacks:

1. **Credential/badge access control** - Critical for production security
2. **Sponsorship management** - Essential for funded productions
3. **Investment tracking** - For productions requiring capital
4. **SOPs** - For operational consistency
5. **Enhanced production fields** - For immersive experience design

Implementing these enhancements will make GHXSTSHIP fully compatible with immersive experience production workflows while maintaining its existing strengths in crew management, safety, and integrations.
