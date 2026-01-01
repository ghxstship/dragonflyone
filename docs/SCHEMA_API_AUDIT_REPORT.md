# CRITICAL SCHEMA-API AUDIT REPORT
**Date:** 2024-12-31
**Status:** 🔴 CRITICAL FAILURE

## Executive Summary

A comprehensive audit of the codebase reveals a **fundamental architectural failure**: API routes reference tables that do not exist in the database schema.

## Findings

| Metric | Count |
|--------|-------|
| Unique tables referenced in API routes | 1,311 |
| Tables defined in database migrations | 305 |
| Tables that match (exist in both) | 113 |
| **MISSING TABLES** | **1,006** |
| Total API route files | 2,298 |

**77% of table references in API routes point to non-existent tables.**

## Root Cause

API routes were generated/written referencing tables that were never created in Supabase migrations. This indicates:

1. **Code was written without corresponding database schema** - Routes reference tables like `events`, `tickets`, `profiles`, `venues` that don't exist
2. **No validation between API layer and database layer** - TypeScript types were not regenerated from actual schema
3. **Assumptions of completion without verification** - Previous work claimed migrations were complete but never validated against API usage

## Most Common Missing Tables (by reference count)

| Table Name | References | Actual Table |
|------------|------------|--------------|
| `events` | 115 | Should be `legend_events` |
| `tickets` | 63 | Should be `event_tickets` |
| `profiles` | 24 | Should be `platform_users` |
| `venues` | 34 | Should be `legend_places` |
| `invoices` | 52 | Exists but columns may differ |
| `purchase_orders` | 38 | Should be `finance_purchase_orders` |

## Tables That DO Exist (113 matches)

These tables are correctly referenced:
- `platform_users`
- `organizations`
- `projects`
- `legend_events`
- `legend_people`
- `legend_places`
- `legend_organizations`
- `legend_products`
- `legend_documents`
- `orders`
- `notifications`
- `assets`
- And 101 more...

## Required Remediation

### Option A: Create Missing Tables (NOT RECOMMENDED)
Creating 1,006 new tables would be:
- Massive scope creep
- Likely includes duplicate/redundant tables
- Many are variations of existing tables

### Option B: Fix API Routes to Use Correct Tables (RECOMMENDED)
1. Map incorrect table names to correct 3NF table names
2. Update all API routes to use correct table references
3. Regenerate Supabase types
4. Run full typecheck validation

### Table Name Mapping Required

| API Uses | Should Use |
|----------|------------|
| `events` | `legend_events` |
| `tickets` | `event_tickets` or `products_profile_ticket` |
| `profiles` | `platform_users` |
| `venues` | `legend_places` + `places_profile_venue` |
| `user_locations` | `people_addresses` or `entity_addresses` |
| `user_roles` | `platform_user_roles` |
| `roles` | `role_definitions` |
| `marketing_campaigns` | `social_amplification_campaigns` |
| `marketing_automations` | `automation_rules` |

## Immediate Actions Required

1. **STOP** - Do not deploy until this is resolved
2. **AUDIT** - Complete mapping of all 1,006 missing tables
3. **FIX** - Update API routes to use correct table names
4. **VALIDATE** - Run typecheck with zero tolerance
5. **PREVENT** - Add CI check to validate table references

## Prevention Measures

1. Always regenerate Supabase types after migration changes
2. Run typecheck as part of every PR
3. Add ESLint rule to validate table names against schema
4. Never assume work is complete without running full validation

---

**This audit was generated after discovering typecheck failures that revealed the scope of the problem.**
