-- 0030_production_advancing_schema.sql
-- Production Advancing Catalog schema - Global catalog with cross-platform workflow

-- Create enum for advance status
create type advance_status as enum (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'in_progress',
  'fulfilled',
  'rejected',
  'cancelled'
);

-- Global production advancing catalog (329 standardized items)
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

-- Production advance requests
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

-- Line items for each advance request
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

-- Indexes for performance
create index idx_catalog_category on production_advancing_catalog(category);
create index idx_catalog_subcategory on production_advancing_catalog(subcategory);
create index idx_catalog_item_id on production_advancing_catalog(item_id);
create index idx_catalog_item_name on production_advancing_catalog(item_name);
create index idx_catalog_enabled on production_advancing_catalog(enabled) where enabled = true;
-- Full-text search index removed - can be implemented with trigger-based tsvector column later

create index idx_advances_org on production_advances(organization_id);
create index idx_advances_project on production_advances(project_id);
create index idx_advances_status on production_advances(status);
create index idx_advances_submitter on production_advances(submitter_id);
create index idx_advances_reviewed_by on production_advances(reviewed_by) where reviewed_by is not null;
create index idx_advances_submitted_at on production_advances(submitted_at) where submitted_at is not null;

create index idx_advance_items_advance on production_advance_items(advance_id);
create index idx_advance_items_catalog on production_advance_items(catalog_item_id) where catalog_item_id is not null;

-- Trigger to update updated_at timestamp
create or replace function update_production_advancing_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger production_advancing_catalog_updated_at
  before update on production_advancing_catalog
  for each row execute function update_production_advancing_updated_at();

create trigger production_advances_updated_at
  before update on production_advances
  for each row execute function update_production_advancing_updated_at();

-- Comments for documentation
comment on table production_advancing_catalog is 'Global catalog of 329 standardized production items across 24 categories';
comment on table production_advances is 'Production advance requests submitted from COMPVSS, reviewed/approved in ATLVS';
comment on table production_advance_items is 'Line items for each production advance request with fulfillment tracking';
comment on column production_advances.team_workspace is 'Team or workspace name (categorization)';
comment on column production_advances.activation_name is 'Event activation name (categorization)';
comment on column production_advance_items.fulfillment_status is 'Track fulfillment: pending, partial, complete';
