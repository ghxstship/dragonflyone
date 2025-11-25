# Production Advancing Catalog - Implementation Plan

**Version:** 1.0  
**Created:** November 24, 2025  
**Status:** Awaiting Approval

---

## Executive Summary

This plan outlines the implementation of a **Production Advancing Catalog** as a **Global Access** resource within the GHXSTSHIP platform. The catalog will contain **329 standardized production items** across **24 categories**, enabling cross-platform workflow between COMPVSS (submission/fulfillment) and ATLVS (approval/processing).

### Workflow Overview
```
┌─────────────┐     Submit      ┌─────────────┐
│   COMPVSS   │ ────────────>   │    ATLVS    │
│  (Crew Ops) │                 │  (Ops/Fin)  │
└─────────────┘                 └─────────────┘
       ▲                              │
       │                              │ Approve/Process
       │                              │
       │                              ▼
       │          ┌────────────────────────┐
       └──────────│  Push Results Back to  │
         Fulfill  │      COMPVSS           │
                  └────────────────────────┘
```

---

## 1. Database Schema

### 1.1 New Tables

#### `production_advancing_catalog`
Global catalog of all production items (read-only for users, managed by system).

```sql
create table production_advancing_catalog (
  id uuid primary key default gen_random_uuid(),
  item_id text not null unique,                    -- e.g., "TECH-1000"
  category text not null,                          -- e.g., "Technical", "Hospitality"
  subcategory text not null,                       -- e.g., "Audio", "Lighting"
  item_name text not null,                         -- e.g., "PA System"
  common_variations text[],                        -- Alternative names/types
  related_accessories text[],                      -- Complementary items
  specifications text,                             -- Key specs/notes
  standard_unit text not null,                     -- e.g., "Per Unit/Day", "Per Person"
  metadata jsonb not null default '{}'::jsonb,     -- Extensible for future needs
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_catalog_category on production_advancing_catalog(category);
create index idx_catalog_item_id on production_advancing_catalog(item_id);
create index idx_catalog_enabled on production_advancing_catalog(enabled);
```

#### `production_advances`
Individual advance requests submitted from COMPVSS.

```sql
create type advance_status as enum (
  'draft',              -- Initial state, not yet submitted
  'submitted',          -- Submitted from COMPVSS, awaiting ATLVS review
  'under_review',       -- ATLVS is reviewing
  'approved',           -- ATLVS approved, ready for procurement
  'in_progress',        -- Being fulfilled
  'fulfilled',          -- Complete
  'rejected',           -- ATLVS rejected
  'cancelled'           -- Cancelled by submitter
);

create table production_advances (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  
  -- Categorization (as per requirements)
  team_workspace text,                             -- Team/Workspace name
  activation_name text,                            -- Event activation name
  
  -- Submission details
  submitter_id uuid not null references platform_users(id) on delete set null,
  submitted_at timestamptz,
  
  -- Approval/Processing (ATLVS)
  status advance_status not null default 'draft',
  reviewed_by uuid references platform_users(id) on delete set null,
  reviewed_at timestamptz,
  reviewer_notes text,
  
  -- Fulfillment (COMPVSS)
  fulfilled_by uuid references platform_users(id) on delete set null,
  fulfilled_at timestamptz,
  fulfillment_notes text,
  
  -- Financial tracking
  estimated_cost numeric(14,2),
  actual_cost numeric(14,2),
  currency text default 'USD',
  
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_advances_org on production_advances(organization_id);
create index idx_advances_project on production_advances(project_id);
create index idx_advances_status on production_advances(status);
create index idx_advances_submitter on production_advances(submitter_id);
```

#### `production_advance_items`
Line items for each advance request.

```sql
create table production_advance_items (
  id uuid primary key default gen_random_uuid(),
  advance_id uuid not null references production_advances(id) on delete cascade,
  catalog_item_id uuid references production_advancing_catalog(id) on delete set null,
  
  -- Item details (can override catalog or be custom)
  item_name text not null,
  description text,
  quantity numeric(10,2) not null default 1,
  unit text not null,                              -- From catalog or custom
  
  -- Pricing
  unit_cost numeric(12,2),
  total_cost numeric(12,2),
  
  -- Fulfillment tracking
  quantity_fulfilled numeric(10,2) default 0,
  fulfillment_status text default 'pending',       -- pending, partial, complete
  
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_advance_items_advance on production_advance_items(advance_id);
create index idx_advance_items_catalog on production_advance_items(catalog_item_id);
```

### 1.2 Table Updates

Add to existing `automation_trigger_catalog` and `automation_action_catalog`:

```sql
-- Triggers
insert into automation_trigger_catalog (key, label, description, platform_scope)
values
  ('compvss.advance.submitted', 'Advance Submitted', 
   'Fired when a production advance is submitted from COMPVSS', 
   array['COMPVSS', 'ATLVS']),
  ('atlvs.advance.approved', 'Advance Approved', 
   'Fired when ATLVS approves an advance', 
   array['ATLVS', 'COMPVSS']),
  ('atlvs.advance.rejected', 'Advance Rejected', 
   'Fired when ATLVS rejects an advance', 
   array['ATLVS', 'COMPVSS']);

-- Actions  
insert into automation_action_catalog (key, label, description, platform_scope)
values
  ('atlvs.advance.review', 'Review Advance in ATLVS', 
   'Push notification to ATLVS for advance review', 
   array['ATLVS']),
  ('compvss.advance.notify_status', 'Notify COMPVSS of Advance Status', 
   'Update COMPVSS when advance status changes', 
   array['COMPVSS']);
```

---

## 2. Row Level Security (RLS) Policies

### 2.1 Catalog Access (Global Read)
```sql
alter table production_advancing_catalog enable row level security;

-- Anyone authenticated can view the catalog
create policy catalog_global_read on production_advancing_catalog
  for select 
  using (enabled = true);

-- Only admins can manage catalog
create policy catalog_admin_manage on production_advancing_catalog
  for all 
  using (role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'))
  with check (role_in('ATLVS_SUPER_ADMIN', 'LEGEND_SUPER_ADMIN'));
```

### 2.2 Advance Access
```sql
alter table production_advances enable row level security;

-- COMPVSS team can view/create advances for their org
create policy advances_compvss_access on production_advances
  for select
  using (
    org_matches(organization_id) 
    and role_in('COMPVSS_TEAM_MEMBER', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN')
  );

create policy advances_compvss_create on production_advances
  for insert
  with check (
    org_matches(organization_id) 
    and role_in('COMPVSS_TEAM_MEMBER', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN')
  );

-- ATLVS team can view all advances for review/approval
create policy advances_atlvs_access on production_advances
  for select
  using (
    org_matches(organization_id) 
    and role_in('ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER')
  );

-- ATLVS can update for approval/rejection
create policy advances_atlvs_update on production_advances
  for update
  using (
    org_matches(organization_id) 
    and role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER')
  )
  with check (
    org_matches(organization_id) 
    and role_in('ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 'PROCUREMENT_MANAGER')
  );
```

### 2.3 Advance Items Access
```sql
alter table production_advance_items enable row level security;

-- Access follows parent advance
create policy advance_items_access on production_advance_items
  for all
  using (
    exists (
      select 1 from production_advances 
      where id = advance_id 
      and org_matches(organization_id)
      and role_in(
        'COMPVSS_TEAM_MEMBER', 'COMPVSS_ADMIN', 'COMPVSS_SUPER_ADMIN',
        'ATLVS_TEAM_MEMBER', 'ATLVS_ADMIN', 'ATLVS_SUPER_ADMIN', 
        'PROCUREMENT_MANAGER'
      )
    )
  );
```

---

## 3. API Routes

### 3.1 COMPVSS Routes

#### `GET /api/advancing/catalog`
- **Purpose:** Fetch production advancing catalog items
- **Auth:** Required (all authenticated users)
- **Query Params:** 
  - `category` - Filter by category
  - `search` - Search item names/descriptions
  - `limit`, `offset` - Pagination

#### `GET /api/advancing`
- **Purpose:** List production advances
- **Auth:** Required (COMPVSS_TEAM_MEMBER+)
- **Query Params:**
  - `project_id` - Filter by project
  - `status` - Filter by status
  - `submitter_id` - Filter by submitter
  - `limit`, `offset` - Pagination

#### `POST /api/advancing`
- **Purpose:** Create new advance request
- **Auth:** Required (COMPVSS_TEAM_MEMBER+)
- **Body:**
  ```typescript
  {
    project_id: string;
    team_workspace: string;
    activation_name: string;
    items: Array<{
      catalog_item_id?: string;
      item_name: string;
      description?: string;
      quantity: number;
      unit: string;
      unit_cost?: number;
      notes?: string;
    }>;
    estimated_cost?: number;
  }
  ```

#### `PATCH /api/advancing/[id]`
- **Purpose:** Update advance (status, fulfillment)
- **Auth:** Required (COMPVSS_TEAM_MEMBER+)
- **Actions:** Submit, fulfill, cancel

#### `POST /api/advancing/[id]/fulfill`
- **Purpose:** Mark items as fulfilled
- **Auth:** Required (COMPVSS_ADMIN+)
- **Body:**
  ```typescript
  {
    item_id: string;
    quantity_fulfilled: number;
    notes?: string;
  }
  ```

### 3.2 ATLVS Routes

#### `GET /api/advances`
- **Purpose:** List all advances pending review
- **Auth:** Required (ATLVS_TEAM_MEMBER+)
- **Query Params:**
  - `status` - Filter by status
  - `project_id` - Filter by project
  - `limit`, `offset` - Pagination

#### `GET /api/advances/[id]`
- **Purpose:** Get advance details for review
- **Auth:** Required (ATLVS_TEAM_MEMBER+)

#### `POST /api/advances/[id]/approve`
- **Purpose:** Approve an advance request
- **Auth:** Required (ATLVS_ADMIN+ or PROCUREMENT_MANAGER)
- **Body:**
  ```typescript
  {
    reviewer_notes?: string;
    approved_cost?: number;
  }
  ```

#### `POST /api/advances/[id]/reject`
- **Purpose:** Reject an advance request
- **Auth:** Required (ATLVS_ADMIN+ or PROCUREMENT_MANAGER)
- **Body:**
  ```typescript
  {
    reviewer_notes: string;  // Required for rejection
  }
  ```

#### `POST /api/advances/[id]/process`
- **Purpose:** Mark advance as in progress
- **Auth:** Required (ATLVS_ADMIN+ or PROCUREMENT_MANAGER)

---

## 4. Cross-Platform Integration

### 4.1 Event Flow

1. **COMPVSS Submits Advance:**
   - User creates advance with items
   - Status: `draft` → `submitted`
   - Trigger: `compvss.advance.submitted`
   - Action: `atlvs.advance.review` → Notify ATLVS team

2. **ATLVS Reviews:**
   - ATLVS user views advance
   - Reviews items and costs
   - Approves or Rejects
   
3. **ATLVS Approves:**
   - Status: `submitted` → `approved`
   - Trigger: `atlvs.advance.approved`
   - Action: `compvss.advance.notify_status` → Notify COMPVSS submitter

4. **COMPVSS Fulfills:**
   - COMPVSS user marks items as fulfilled
   - Status: `approved` → `in_progress` → `fulfilled`
   - Updates quantity fulfilled per item

### 4.2 Notification System

Use existing `automation_usage_log` for tracking all events.

Create Supabase Edge Function for real-time notifications:
- `supabase/functions/advance-notifications/index.ts`
- Listens to database changes via triggers
- Sends notifications to relevant platform users

---

## 5. Data Seeding Strategy

### 5.1 Catalog Population

Create migration script to insert all 329 items:
- Parse the Live Entertainment Production Advancing Catalog
- Extract: Item ID, Category, Subcategory, Name, Variations, Accessories, Specs, Unit
- Format as SQL INSERT statements
- Include in migration: `0030_production_advancing_catalog.sql`

### 5.2 Seed Categories

24 main categories:
1. Technical
2. Production
3. Equipment
4. Site Infrastructure
5. Site Utilities
6. Site Assets
7. Site Vehicles
8. Heavy Equipment
9. Site Safety
10. Staffing
11. Security
12. Hospitality
13. Transportation
14. Travel
15. Accommodation
16. Access
17. Permits
18. Marketing
19. Printing
20. Merchandise
21. Shipping
22. Tracking
23. Analytics
24. Other

---

## 6. Frontend Components

### 6.1 COMPVSS Components

#### `/apps/compvss/src/app/advancing`
```
advancing/
├── page.tsx                          # List view of all advances
├── new/
│   └── page.tsx                      # Create new advance
├── [id]/
│   ├── page.tsx                      # View advance details
│   └── fulfill/
│       └── page.tsx                  # Fulfillment interface
└── catalog/
    └── page.tsx                      # Browse catalog
```

**Key Components:**
- `AdvancingCatalogBrowser.tsx` - Searchable catalog with categories
- `AdvanceRequestForm.tsx` - Multi-step form for creating advances
- `AdvanceRequestList.tsx` - Table/grid of submitted advances
- `AdvanceFulfillmentPanel.tsx` - Mark items as fulfilled

### 6.2 ATLVS Components

#### `/apps/atlvs/src/app/advances`
```
advances/
├── page.tsx                          # Review queue
├── [id]/
│   ├── page.tsx                      # Review detail view
│   └── review/
│       └── page.tsx                  # Approval interface
```

**Key Components:**
- `AdvanceReviewQueue.tsx` - List pending advances
- `AdvanceReviewDetail.tsx` - Detailed review view
- `AdvanceApprovalForm.tsx` - Approve/reject with notes

---

## 7. TypeScript Types

### 7.1 Catalog Types
```typescript
export interface ProductionCatalogItem {
  id: string;
  item_id: string;
  category: string;
  subcategory: string;
  item_name: string;
  common_variations: string[];
  related_accessories: string[];
  specifications: string | null;
  standard_unit: string;
  metadata: Record<string, any>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type AdvanceStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'in_progress'
  | 'fulfilled'
  | 'rejected'
  | 'cancelled';

export interface ProductionAdvance {
  id: string;
  organization_id: string;
  project_id: string | null;
  team_workspace: string | null;
  activation_name: string | null;
  submitter_id: string;
  submitted_at: string | null;
  status: AdvanceStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  fulfilled_by: string | null;
  fulfilled_at: string | null;
  fulfillment_notes: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  currency: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProductionAdvanceItem {
  id: string;
  advance_id: string;
  catalog_item_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_cost: number | null;
  total_cost: number | null;
  quantity_fulfilled: number;
  fulfillment_status: string;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests
- API route handlers
- Database queries (RLS policies)
- TypeScript utilities

### 8.2 Integration Tests
- Full workflow: Submit → Approve → Fulfill
- Cross-platform event triggers
- Notification delivery

### 8.3 E2E Tests (Playwright)
```
e2e/
├── compvss/
│   ├── advancing-submit.spec.ts
│   └── advancing-fulfill.spec.ts
└── atlvs/
    └── advancing-review.spec.ts
```

---

## 9. Implementation Phases

### Phase 1: Database & Backend (Week 1)
- [ ] Create database migration with all tables
- [ ] Seed production catalog with 329 items
- [ ] Add RLS policies
- [ ] Create automation triggers/actions
- [ ] Update TypeScript types

### Phase 2: API Routes (Week 1-2)
- [ ] COMPVSS API routes (catalog, advances)
- [ ] ATLVS API routes (review, approve)
- [ ] Cross-platform notifications
- [ ] API client methods

### Phase 3: COMPVSS Frontend (Week 2-3)
- [ ] Catalog browser
- [ ] Advance request form
- [ ] Advance list/detail views
- [ ] Fulfillment interface

### Phase 4: ATLVS Frontend (Week 3)
- [ ] Review queue
- [ ] Review detail view
- [ ] Approval/rejection interface

### Phase 5: Testing & Refinement (Week 4)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Bug fixes and polish

---

## 10. Migration Files Required

1. `0030_production_advancing_schema.sql` - Core tables
2. `0031_production_advancing_catalog_seed.sql` - 329 catalog items
3. `0032_production_advancing_automation.sql` - Automation triggers/actions
4. `0033_production_advancing_rls.sql` - RLS policies
5. `0034_production_advancing_indexes.sql` - Performance indexes

---

## 11. Success Criteria

- [ ] All 329 catalog items seeded and accessible
- [ ] COMPVSS users can create and submit advances
- [ ] ATLVS users receive notifications for new submissions
- [ ] ATLVS users can approve/reject advances with notes
- [ ] COMPVSS users receive status updates
- [ ] COMPVSS users can mark items as fulfilled
- [ ] All data properly secured with RLS
- [ ] Cross-platform events logged in automation_usage_log
- [ ] End-to-end workflow completes successfully

---

## 12. Security Considerations

1. **RLS Enforcement:** All tables have appropriate policies
2. **Audit Trail:** All actions logged via automation_usage_log
3. **Cost Controls:** Estimated vs actual cost tracking
4. **Approval Gates:** Only authorized roles can approve
5. **Data Isolation:** Organization-level isolation enforced

---

## 13. Future Enhancements

- **Budget Integration:** Link advances to project budgets
- **Vendor Management:** Auto-route to preferred vendors
- **Inventory Tracking:** Check availability before approval
- **Analytics Dashboard:** Advance trends and costs
- **Mobile App:** Submit advances from mobile
- **AI Suggestions:** Auto-suggest catalog items based on project type

---

## Approval Required

**Before proceeding with implementation, please confirm:**

1. ✅ Database schema design
2. ✅ Workflow and status transitions
3. ✅ Access control (RLS policies)
4. ✅ API route structure
5. ✅ Categorization approach (Project, Org, Team, Activation, Submitter)
6. ✅ Cross-platform integration strategy

**Once approved, implementation will begin with Phase 1.**

---

**Questions or concerns?** Please review and provide feedback before code modifications begin.
