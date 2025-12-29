# Database Normalization Plan: 3NF Migration to Legend/Saga/Chronicle

## ✅ MIGRATION COMPLETE - December 27, 2024

The database has been fully refactored to use a clean 3NF normalized structure. All legacy migrations have been archived and replaced with a consolidated, conflict-free migration set.

## Executive Summary

| Schema | Purpose | Consolidates |
|--------|---------|-------------|
| **Legend** | Entities (Nouns) | People, Places, Organizations, Products, Events, Documents |
| **Saga** | Workflows (Verbs) | Approvals, Requests, Submissions, Processes, Automations, Changes |
| **Chronicle** | Activities (Transactions) | Transactions, Timesheets, Movements, Audits, Automations, Communications |

## New Migration Structure

The database now uses **10 clean migration files** in proper dependency order:

| File | Purpose |
|------|---------|
| `0001_extensions_and_types.sql` | PostgreSQL extensions and all enum types |
| `0002_core_foundation.sql` | Organizations, platform_users, auth functions |
| `0003_legend_schema.sql` | All Legend entity tables and reference data |
| `0004_legend_profiles.sql` | People and Places profile extension tables |
| `0005_legend_profiles_part2.sql` | Organizations, Products, Events, Documents profiles |
| `0006_saga_schema.sql` | All Saga workflow tables and triggers |
| `0007_chronicle_schema.sql` | All Chronicle activity tables and functions |
| `0008_rls_policies.sql` | Row Level Security policies for all tables |
| `0009_grants.sql` | Permission grants for authenticated role |
| `0010_seed_data.sql` | Initial seed data for development |

### Legacy Migrations

All previous migrations (0001-0263) have been archived to:
- `/supabase/migrations_legacy_backup_20251227/`

---

## Current State Analysis

### 3NF Violations Identified

#### 1. **First Normal Form (1NF) Violations**
- **Repeating groups in JSONB columns**: Many tables store arrays of related data in JSONB instead of proper junction tables
- **Multi-valued attributes**: Tags, categories, and permissions often stored as arrays instead of normalized tables

#### 2. **Second Normal Form (2NF) Violations**
- **Partial dependencies**: Many tables have composite keys where non-key attributes depend on only part of the key
- **Denormalized person data**: `first_name`, `last_name`, `email`, `phone` repeated across 50+ tables instead of referencing a single person entity

#### 3. **Third Normal Form (3NF) Violations**
- **Transitive dependencies**: Address fields (city, state, country, postal_code) repeated in 30+ tables instead of referencing a location entity
- **Calculated fields stored**: Totals, counts, and aggregates stored instead of computed
- **Redundant entity definitions**: Same entity type defined multiple times with different schemas

---

## Phase 1: Legend Migration (Entities/Nouns)

### 1.1 People Consolidation

**Current State**: 50+ tables defining person-like entities

| Migrate FROM | Migrate TO | Profile Extension |
|-------------|-----------|-------------------|
| `employees` | `legend_people` | `people_profile_employee` |
| `crew_members` | `legend_people` | `people_profile_crew` |
| `artists` | `legend_people` | `people_profile_artist` |
| `vendors` (contacts) | `legend_people` | `people_profile_vendor_rep` |
| `volunteers` | `legend_people` | `people_profile_volunteer` |
| `contacts` | `legend_people` | `people_profile_contact` |
| `staff` | `legend_people` | `people_profile_employee` |
| `guests` | `legend_people` | `people_profile_contact` |
| `attendees` | `legend_people` | `people_profile_contact` |
| `candidates` | `legend_people` | `people_profile_candidate` |
| `mentors` | `legend_people` | `people_profile_mentor` |
| `influencers` | `legend_people` | `people_profile_influencer` |
| `speakers` | `legend_people` | `people_profile_speaker` |
| `performers` | `legend_people` | `people_profile_artist` |

**Tables to Deprecate** (after migration):
```
employees, crew_members, artists, volunteers, contacts, staff, guests, 
attendees, candidates, mentors, influencers, speakers, performers,
artist_profiles, crew_profiles, employee_profiles, vendor_contacts,
vip_guests, event_staff, show_crew, union_crew_assignments
```

**New Profile Tables Needed**:
```sql
-- Already exist:
people_profile_employee, people_profile_crew, people_profile_artist,
people_profile_vendor_rep, people_profile_volunteer, people_profile_contact

-- Need to create:
people_profile_candidate    -- Job candidates
people_profile_mentor       -- Mentorship program
people_profile_influencer   -- Marketing influencers
people_profile_speaker      -- Event speakers
people_profile_attendee     -- Event attendees (with ticket info)
```

### 1.2 Places Consolidation

**Current State**: 35+ tables defining location-like entities

| Migrate FROM | Migrate TO | Profile Extension |
|-------------|-----------|-------------------|
| `venues` | `legend_places` | `places_profile_venue` |
| `stages` | `legend_places` | `places_profile_stage` |
| `warehouses` | `legend_places` | `places_profile_warehouse` |
| `zones` | `legend_places` | `places_profile_zone` |
| `venue_spaces` | `legend_places` | `places_profile_space` |
| `staging_areas` | `legend_places` | `places_profile_staging` |
| `loading_docks` | `legend_places` | `places_profile_dock` |
| `parking_lots` | `legend_places` | `places_profile_parking` |
| `green_rooms` | `legend_places` | `places_profile_room` |
| `offices` | `legend_places` | `places_profile_office` |

**Tables to Deprecate**:
```
venues, stages, warehouses, zones, venue_spaces, staging_areas,
loading_docks, parking_lots, green_rooms, offices, venue_sections,
venue_zones, warehouse_zones, stage_areas, vip_zones, backstage_areas
```

**New Profile Tables Needed**:
```sql
-- Already exist:
places_profile_venue, places_profile_stage, places_profile_warehouse

-- Need to create:
places_profile_zone         -- Event zones
places_profile_space        -- Bookable spaces
places_profile_staging      -- Staging/loading areas
places_profile_dock         -- Loading docks
places_profile_parking      -- Parking facilities
places_profile_room         -- Rooms (green rooms, offices, etc.)
places_profile_office       -- Office locations
```

### 1.3 Organizations Consolidation

**Current State**: 20+ tables defining organization-like entities

| Migrate FROM | Migrate TO | Profile Extension |
|-------------|-----------|-------------------|
| `organizations` | `legend_organizations` | (base) |
| `vendors` | `legend_organizations` | `orgs_profile_vendor` |
| `clients` | `legend_organizations` | `orgs_profile_client` |
| `sponsors` | `legend_organizations` | `orgs_profile_sponsor` |
| `agencies` | `legend_organizations` | `orgs_profile_agency` |
| `labels` | `legend_organizations` | `orgs_profile_label` |
| `promoters` | `legend_organizations` | `orgs_profile_promoter` |
| `unions` | `legend_organizations` | `orgs_profile_union` |
| `subcontractors` | `legend_organizations` | `orgs_profile_subcontractor` |

**Tables to Deprecate**:
```
vendors, clients, sponsors, agencies, labels, promoters, unions,
subcontractors, vendor_profiles, client_profiles, sponsor_tiers,
agency_profiles, label_profiles, promoter_profiles
```

### 1.4 Products Consolidation

**Current State**: 40+ tables defining product/asset-like entities

| Migrate FROM | Migrate TO | Profile Extension |
|-------------|-----------|-------------------|
| `assets` | `legend_products` | `products_profile_asset` |
| `equipment` | `legend_products` | `products_profile_equipment` |
| `inventory_items` | `legend_products` | `products_profile_inventory` |
| `merchandise` | `legend_products` | `products_profile_merchandise` |
| `catalog_items` | `legend_products` | `products_profile_catalog` |
| `tickets` | `legend_products` | `products_profile_ticket` |
| `passes` | `legend_products` | `products_profile_pass` |
| `consumables` | `legend_products` | `products_profile_consumable` |

**Tables to Deprecate**:
```
assets, equipment, inventory_items, merchandise, catalog_items,
tickets, passes, consumables, asset_specifications, equipment_specs,
inventory_levels, merchandise_variants, ticket_types, pass_types
```

### 1.5 Events Consolidation

**Current State**: 30+ tables defining event-like entities

| Migrate FROM | Migrate TO | Profile Extension |
|-------------|-----------|-------------------|
| `events` | `legend_events` | `events_profile_production` |
| `shows` | `legend_events` | `events_profile_show` |
| `productions` | `legend_events` | `events_profile_production` |
| `concerts` | `legend_events` | `events_profile_concert` |
| `festivals` | `legend_events` | `events_profile_festival` |
| `tours` | `legend_events` | `events_profile_tour` |
| `rehearsals` | `legend_events` | `events_profile_rehearsal` |
| `meetings` | `legend_events` | `events_profile_meeting` |
| `load_ins` | `legend_events` | `events_profile_load` |
| `soundchecks` | `legend_events` | `events_profile_soundcheck` |

**Tables to Deprecate**:
```
events, shows, productions, concerts, festivals, tours, rehearsals,
meetings, load_ins, soundchecks, event_templates, show_templates,
production_templates, event_series, tour_dates, festival_days
```

### 1.6 Documents Consolidation

**Current State**: 25+ tables defining document-like entities

| Migrate FROM | Migrate TO | Profile Extension |
|-------------|-----------|-------------------|
| `documents` | `legend_documents` | (base) |
| `contracts` | `legend_documents` | `docs_profile_contract` |
| `invoices` | `legend_documents` | `docs_profile_invoice` |
| `purchase_orders` | `legend_documents` | `docs_profile_po` |
| `riders` | `legend_documents` | `docs_profile_rider` |
| `certificates` | `legend_documents` | `docs_profile_certificate` |
| `permits` | `legend_documents` | `docs_profile_permit` |
| `policies` | `legend_documents` | `docs_profile_policy` |
| `sops` | `legend_documents` | `docs_profile_sop` |

**Tables to Deprecate**:
```
documents, contracts, invoices, purchase_orders, riders, certificates,
permits, policies, sops, contract_templates, invoice_templates,
po_templates, rider_templates, document_versions
```

---

## Phase 2: Saga Migration (Workflows/Verbs)

### 2.1 Approval Workflows

| Migrate FROM | Migrate TO | Saga Subtype |
|-------------|-----------|--------------|
| `expense_approvals` | `saga_instances` + `saga_profile_approval` | `expense_approval` |
| `advance_approvals` | `saga_instances` + `saga_profile_approval` | `advance_approval` |
| `purchase_order_approvals` | `saga_instances` + `saga_profile_approval` | `po_approval` |
| `vendor_order_approvals` | `saga_instances` + `saga_profile_approval` | `vendor_order_approval` |
| `change_order_approvals` | `saga_instances` + `saga_profile_approval` | `change_order_approval` |
| `bid_decision_approvals` | `saga_instances` + `saga_profile_approval` | `bid_approval` |
| `walkthrough_approvals` | `saga_instances` + `saga_profile_approval` | `walkthrough_approval` |
| `selection_approvals` | `saga_instances` + `saga_profile_approval` | `selection_approval` |
| `stakeholder_approvals` | `saga_instances` + `saga_profile_approval` | `stakeholder_approval` |

**Tables to Deprecate**:
```
expense_approvals, advance_approvals, purchase_order_approvals,
vendor_order_approvals, change_order_approvals, bid_decision_approvals,
walkthrough_approvals, selection_approvals, stakeholder_approvals,
approval_stages, approval_workflows
```

### 2.2 Request Workflows

| Migrate FROM | Migrate TO | Saga Subtype |
|-------------|-----------|--------------|
| `time_off_requests` | `saga_instances` + `saga_profile_request` | `time_off` |
| `hr_time_off_requests` | `saga_instances` + `saga_profile_request` | `time_off` |
| `accessibility_requests` | `saga_instances` + `saga_profile_request` | `accessibility` |
| `hospitality_requests` | `saga_instances` + `saga_profile_request` | `hospitality` |
| `equipment_spec_requests` | `saga_instances` + `saga_profile_request` | `equipment_spec` |
| `mentor_requests` | `saga_instances` + `saga_profile_request` | `mentorship` |
| `mentorship_requests` | `saga_instances` + `saga_profile_request` | `mentorship` |
| `coi_renewal_requests` | `saga_instances` + `saga_profile_request` | `coi_renewal` |
| `data_subject_requests` | `saga_instances` + `saga_profile_request` | `data_subject` |
| `data_transfer_requests` | `saga_instances` + `saga_profile_request` | `data_transfer` |
| `compliance_document_requests` | `saga_instances` + `saga_profile_request` | `compliance_doc` |
| `transfer_requests` | `saga_instances` + `saga_profile_request` | `transfer` |
| `travel_requests` | `saga_instances` + `saga_profile_request` | `travel` |
| `service_requests` | `saga_instances` + `saga_profile_request` | `service` |
| `verification_requests` | `saga_instances` + `saga_profile_request` | `verification` |
| `vendor_onboarding_requests` | `saga_instances` + `saga_profile_request` | `vendor_onboarding` |

**Tables to Deprecate**:
```
time_off_requests, hr_time_off_requests, accessibility_requests,
hospitality_requests, equipment_spec_requests, mentor_requests,
mentorship_requests, coi_renewal_requests, data_subject_requests,
data_transfer_requests, compliance_document_requests, transfer_requests,
travel_requests, service_requests, verification_requests,
vendor_onboarding_requests
```

### 2.3 Submission Workflows

| Migrate FROM | Migrate TO | Saga Subtype |
|-------------|-----------|--------------|
| `applications` | `saga_instances` + `saga_profile_submission` | `application` |
| `bid_submissions` | `saga_instances` + `saga_profile_submission` | `bid` |
| `rfp_responses` | `saga_instances` + `saga_profile_submission` | `rfp_response` |
| `lead_form_submissions` | `saga_instances` + `saga_profile_submission` | `lead_form` |
| `ugc_submissions` | `saga_instances` + `saga_profile_submission` | `ugc` |
| `contest_entries` | `saga_instances` + `saga_profile_submission` | `contest_entry` |
| `proposals` | `saga_instances` + `saga_profile_submission` | `proposal` |

**Tables to Deprecate**:
```
applications, bid_submissions, rfp_responses, lead_form_submissions,
ugc_submissions, contest_entries, proposals, application_stages,
bid_evaluations, rfp_evaluations
```

### 2.4 Process Workflows

| Migrate FROM | Migrate TO | Saga Subtype |
|-------------|-----------|--------------|
| `onboarding_workflows` | `saga_instances` + `saga_profile_process` | `onboarding` |
| `employee_workflows` | `saga_instances` + `saga_profile_process` | `employee_lifecycle` |
| `workflows` | `saga_instances` + `saga_profile_process` | (various) |
| `workflow_executions` | `saga_instances` + `saga_profile_process` | (various) |
| `n8n_workflows` | `saga_instances` + `saga_profile_automation` | `n8n` |

**Tables to Deprecate**:
```
onboarding_workflows, employee_workflows, workflows, workflow_executions,
workflow_tasks, workflow_triggers, workflow_actions, workflow_execution_steps,
n8n_workflows, n8n_workflow_runs
```

### 2.5 Change Workflows

| Migrate FROM | Migrate TO | Saga Subtype |
|-------------|-----------|--------------|
| `change_orders` | `saga_instances` + `saga_profile_change` | `change_order` |
| `change_requests` | `saga_instances` + `saga_profile_change` | `change_request` |
| `change_order_items` | `saga_steps` | (linked to parent) |
| `amendment_requests` | `saga_instances` + `saga_profile_change` | `amendment` |

**Tables to Deprecate**:
```
change_orders, change_requests, change_order_items, amendment_requests,
change_order_approvals
```

---

## Phase 3: Chronicle Migration (Activities/Transactions)

### 3.1 Financial Transactions

| Migrate FROM | Migrate TO | Chronicle Subtype |
|-------------|-----------|-------------------|
| `transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `payment` |
| `payments` | `chronicle_entries` + `chronicle_profile_transaction` | `payment` |
| `refunds` | `chronicle_entries` + `chronicle_profile_transaction` | `refund` |
| `bank_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `bank` |
| `credit_card_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `credit_card` |
| `cashless_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `cashless` |
| `wallet_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `wallet` |
| `rfid_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `rfid` |
| `stripe_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `stripe` |
| `finance_transaction_lines` | `chronicle_entries` + `chronicle_profile_transaction` | `journal_entry` |
| `reward_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `reward` |
| `tip_transactions` | `chronicle_entries` + `chronicle_profile_transaction` | `tip` |

**Tables to Deprecate**:
```
transactions, payments, refunds, bank_transactions, credit_card_transactions,
cashless_transactions, wallet_transactions, rfid_transactions,
stripe_transactions, finance_transaction_lines, reward_transactions,
tip_transactions, payment_transactions, client_payments, vendor_payments,
contractor_payments, sponsor_payments, crew_settlements
```

### 3.2 Time Tracking

| Migrate FROM | Migrate TO | Chronicle Subtype |
|-------------|-----------|-------------------|
| `time_entries` | `chronicle_entries` + `chronicle_profile_timesheet` | `time_entry` |
| `time_clock_entries` | `chronicle_entries` + `chronicle_profile_timesheet` | `clock` |
| `timesheets` | `chronicle_entries` + `chronicle_profile_timesheet` | `timesheet` |
| `timesheet_breaks` | `chronicle_entries` + `chronicle_profile_timesheet` | `break` |
| `attendance_records` | `chronicle_entries` + `chronicle_profile_timesheet` | `attendance` |
| `clock_events` | `chronicle_entries` + `chronicle_profile_timesheet` | `clock` |

**Tables to Deprecate**:
```
time_entries, time_clock_entries, timesheets, timesheet_breaks,
attendance_records, clock_events, timesheet_periods, timesheet_activity_log,
schedule_task_time_entries
```

### 3.3 Asset/Inventory Movement

| Migrate FROM | Migrate TO | Chronicle Subtype |
|-------------|-----------|-------------------|
| `asset_checkouts` | `chronicle_entries` + `chronicle_profile_movement` | `checkout` |
| `asset_transfers` | `chronicle_entries` + `chronicle_profile_movement` | `transfer` |
| `equipment_checkouts` | `chronicle_entries` + `chronicle_profile_movement` | `checkout` |
| `equipment_returns` | `chronicle_entries` + `chronicle_profile_movement` | `return` |
| `inventory_adjustments` | `chronicle_entries` + `chronicle_profile_movement` | `adjustment` |
| `inventory_movements` | `chronicle_entries` + `chronicle_profile_movement` | `movement` |
| `asset_location_history` | `chronicle_entries` + `chronicle_profile_movement` | `location_change` |
| `asset_disposals` | `chronicle_entries` + `chronicle_profile_movement` | `disposal` |
| `asset_retirements` | `chronicle_entries` + `chronicle_profile_movement` | `retirement` |

**Tables to Deprecate**:
```
asset_checkouts, asset_transfers, equipment_checkouts, equipment_returns,
inventory_adjustments, inventory_movements, asset_location_history,
asset_disposals, asset_retirements, asset_scans, rfid_scans
```

### 3.4 Audit Trail

| Migrate FROM | Migrate TO | Chronicle Subtype |
|-------------|-----------|-------------------|
| `audit_logs` | `chronicle_entries` + `chronicle_profile_audit` | `data_change` |
| `audit_trail` | `chronicle_entries` + `chronicle_profile_audit` | `data_change` |
| `activity_logs` | `chronicle_entries` + `chronicle_profile_audit` | `activity` |
| `compliance_audit_log` | `chronicle_entries` + `chronicle_profile_audit` | `compliance` |
| `contract_audit_logs` | `chronicle_entries` + `chronicle_profile_audit` | `contract` |
| `document_audit_trail` | `chronicle_entries` + `chronicle_profile_audit` | `document` |
| `data_residency_audit` | `chronicle_entries` + `chronicle_profile_audit` | `data_residency` |
| `sso_audit_log` | `chronicle_entries` + `chronicle_profile_audit` | `sso` |
| `field_history` | `chronicle_entries` + `chronicle_profile_audit` | `field_change` |
| `legend_audit_log` | `chronicle_entries` + `chronicle_profile_audit` | `legend` |

**Tables to Deprecate**:
```
audit_logs, audit_trail, activity_logs, compliance_audit_log,
contract_audit_logs, document_audit_trail, data_residency_audit,
sso_audit_log, field_history, legend_audit_log, api_logs,
batch_operations_log, bill_activity_log, expense_activity_log,
purchase_order_activity_log, vendor_activity_log
```

### 3.5 Automation Logs

| Migrate FROM | Migrate TO | Chronicle Subtype |
|-------------|-----------|-------------------|
| `automation_logs` | `chronicle_entries` + `chronicle_profile_automation` | `automation` |
| `scheduled_jobs` (runs) | `chronicle_entries` + `chronicle_profile_automation` | `scheduled_job` |
| `cron_logs` | `chronicle_entries` + `chronicle_profile_automation` | `cron` |
| `sync_logs` | `chronicle_entries` + `chronicle_profile_automation` | `sync` |
| `webhook_deliveries` | `chronicle_entries` + `chronicle_profile_automation` | `webhook` |
| `webhook_delivery_logs` | `chronicle_entries` + `chronicle_profile_automation` | `webhook` |
| `zapier_action_logs` | `chronicle_entries` + `chronicle_profile_automation` | `zapier` |
| `erp_sync_logs` | `chronicle_entries` + `chronicle_profile_automation` | `erp_sync` |
| `crm_sync_logs` | `chronicle_entries` + `chronicle_profile_automation` | `crm_sync` |
| `aggregator_sync_logs` | `chronicle_entries` + `chronicle_profile_automation` | `aggregator_sync` |
| `cross_platform_sync_logs` | `chronicle_entries` + `chronicle_profile_automation` | `cross_platform_sync` |

**Tables to Deprecate**:
```
automation_logs, cron_logs, sync_logs, webhook_deliveries,
webhook_delivery_logs, zapier_action_logs, erp_sync_logs,
crm_sync_logs, aggregator_sync_logs, cross_platform_sync_logs,
calendar_sync_log, n8n_workflow_runs
```

### 3.6 Communication Logs

| Migrate FROM | Migrate TO | Chronicle Subtype |
|-------------|-----------|-------------------|
| `email_logs` | `chronicle_entries` + `chronicle_profile_communication` | `email` |
| `sms_logs` | `chronicle_entries` + `chronicle_profile_communication` | `sms` |
| `notification_logs` | `chronicle_entries` + `chronicle_profile_communication` | `notification` |
| `push_notifications` (sent) | `chronicle_entries` + `chronicle_profile_communication` | `push` |
| `message_history` | `chronicle_entries` + `chronicle_profile_communication` | `message` |

**Tables to Deprecate**:
```
email_logs, sms_logs, notification_logs, message_history,
email_log, notification_delivery_logs
```

---

## Phase 4: Reference Data Normalization

### 4.1 Lookup Tables to Consolidate

Many lookup/reference tables should be consolidated into the Legend reference tables:

| Current Tables | Migrate TO |
|---------------|-----------|
| `categories`, `event_categories`, `catalog_categories`, etc. | `legend_categories` |
| `tags`, `catalog_tags`, `event_tags`, etc. | `legend_tags` |
| `statuses`, `order_statuses`, `ticket_statuses`, etc. | `legend_statuses` |
| `departments`, `crew_departments`, etc. | `legend_departments` |
| `teams`, `crew_teams`, etc. | `legend_teams` |
| `positions`, `job_positions`, etc. | `legend_positions` |
| `cost_centers`, `budget_codes`, etc. | `legend_cost_centers` |

### 4.2 Address Normalization

Create a shared `addresses` table and reference it instead of repeating address fields:

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  address_type TEXT, -- 'billing', 'shipping', 'venue', 'office'
  street_address TEXT,
  street_address_2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Then reference from Legend entities:
- `legend_people.primary_address_id`
- `legend_places.address_id`
- `legend_organizations.billing_address_id`
- `legend_organizations.shipping_address_id`

---

## Phase 5: Junction Table Cleanup

### 5.1 Relationship Tables to Migrate

All entity-to-entity relationships should use `legend_relationships`:

| Current Junction Tables | Migrate TO |
|------------------------|-----------|
| `event_artists` | `legend_relationships` (event → person) |
| `event_sponsors` | `legend_relationships` (event → organization) |
| `event_staff` | `legend_relationships` (event → person) |
| `crew_assignments` | `legend_relationships` (event → person) |
| `vendor_contracts` | `legend_relationships` (organization → document) |
| `client_contacts` | `legend_relationships` (organization → person) |
| `team_members` | `legend_relationships` (team → person) |
| `project_members` | `legend_relationships` (project → person) |

---

## Migration Execution Plan

### ✅ COMPLETE: Full Schema Refactor (December 27, 2024)

The entire Supabase migration structure has been refactored to use a clean, consolidated 3NF normalized schema. All legacy migrations have been archived and replaced with 10 clean migration files.

**New Migration Files:**

| # | File | Tables Created |
|---|------|---------------|
| 1 | `0001_extensions_and_types.sql` | Extensions + all enum types |
| 2 | `0002_core_foundation.sql` | `organizations`, `platform_users`, `user_organizations`, `role_definitions`, `user_roles` + auth functions |
| 3 | `0003_legend_schema.sql` | `legend_people`, `legend_places`, `legend_organizations`, `legend_products`, `legend_events`, `legend_documents`, `addresses`, `legend_departments`, `legend_teams`, `legend_positions`, `legend_cost_centers`, `legend_categories`, `legend_tags`, `legend_relationships` |
| 4 | `0004_legend_profiles.sql` | `people_profile_employee`, `people_profile_crew`, `people_profile_artist`, `people_profile_volunteer`, `people_profile_contact`, `people_profile_candidate`, `people_profile_mentor`, `people_profile_influencer`, `people_profile_speaker`, `people_profile_attendee`, `places_profile_venue`, `places_profile_warehouse`, `places_profile_zone`, `places_profile_space`, `places_profile_staging`, `places_profile_parking`, `places_profile_office` |
| 5 | `0005_legend_profiles_part2.sql` | `orgs_profile_vendor`, `orgs_profile_sponsor`, `orgs_profile_partner`, `orgs_profile_agency`, `orgs_profile_client`, `products_profile_merchandise`, `products_profile_ticket`, `products_profile_service`, `products_profile_subscription`, `products_profile_rental`, `events_profile_conference`, `events_profile_festival`, `events_profile_workshop`, `events_profile_webinar`, `docs_profile_contract`, `docs_profile_invoice`, `docs_profile_report`, `docs_profile_template` |
| 6 | `0006_saga_schema.sql` | `saga_instances`, `saga_profile_approval`, `saga_profile_request`, `saga_profile_submission`, `saga_profile_process`, `saga_profile_automation`, `saga_profile_change`, `saga_steps`, `saga_transitions`, `saga_participants`, `saga_comments`, `saga_attachments`, `saga_templates` |
| 7 | `0007_chronicle_schema.sql` | `chronicle_entries`, `chronicle_profile_transaction`, `chronicle_profile_timesheet`, `chronicle_profile_movement`, `chronicle_profile_audit`, `chronicle_profile_automation`, `chronicle_profile_communication`, `chronicle_daily_aggregates` |
| 8 | `0008_rls_policies.sql` | RLS policies for all tables |
| 9 | `0009_grants.sql` | Permission grants for authenticated role |
| 10 | `0010_seed_data.sql` | Default organization, categories, tags, departments, positions, saga templates |

**Total Tables Created: 75+**

**All tables include:**
- [x] Primary keys with UUID
- [x] Foreign key relationships
- [x] Proper indexes
- [x] RLS policies (SELECT, INSERT, UPDATE, DELETE)
- [x] Grants to authenticated role
- [x] updated_at triggers where applicable

### Next Steps: Application Code Updates

Now that the database schema is complete, the following application updates are needed:

1. **Update TypeScript Types** - Generate new types from the schema
2. **Update React Query Hooks** - Point to new Legend/Saga/Chronicle tables
3. **Update API Routes** - Use new normalized structure
4. **Update Frontend Components** - Use new data shapes
5. **Run E2E Tests** - Verify all workflows function correctly

---

## Estimated Impact

### Tables Affected
- **~200 tables** → Migrate to Legend (entities)
- **~80 tables** → Migrate to Saga (workflows)
- **~100 tables** → Migrate to Chronicle (activities)
- **~100 tables** → Consolidate into reference tables
- **~300 tables** → Keep as-is (domain-specific, already normalized)

### Benefits
1. **Reduced table count**: ~800 → ~400 tables
2. **Consistent patterns**: All entities follow Legend pattern
3. **Unified workflows**: All workflows follow Saga pattern
4. **Complete audit trail**: All activities in Chronicle
5. **Better query performance**: Proper indexes on normalized tables
6. **Easier maintenance**: Single source of truth for each entity type
7. **Flexible extensions**: Profile tables allow type-specific data

---

## Priority Order

### High Priority (Immediate)
1. People consolidation (50+ tables → 1 + profiles)
2. Approval workflows (10+ tables → Saga)
3. Transaction logs (15+ tables → Chronicle)

### Medium Priority (Next Quarter)
1. Places consolidation (35+ tables → 1 + profiles)
2. Organizations consolidation (20+ tables → 1 + profiles)
3. Request workflows (15+ tables → Saga)

### Lower Priority (Future)
1. Products consolidation (40+ tables → 1 + profiles)
2. Events consolidation (30+ tables → 1 + profiles)
3. Documents consolidation (25+ tables → 1 + profiles)

---

## Success Metrics

- [ ] All person-like entities reference `legend_people`
- [ ] All place-like entities reference `legend_places`
- [ ] All organization-like entities reference `legend_organizations`
- [ ] All approval workflows use `saga_instances`
- [ ] All request workflows use `saga_instances`
- [ ] All financial transactions use `chronicle_entries`
- [ ] All time entries use `chronicle_entries`
- [ ] All audit logs use `chronicle_entries`
- [ ] No duplicate entity definitions
- [ ] No denormalized address fields
- [ ] No denormalized person fields
- [ ] All relationships use `legend_relationships`
